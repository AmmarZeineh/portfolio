"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { serverEnv, siteUrl } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import { contactSchema, type ContactErrorKey, type ContactValues } from "./schema";

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; fields: Partial<Record<"name" | "email" | "message", ContactErrorKey>> }
  | { ok: false; reason: "rateLimited" | "failed" };

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MIN_FILL_MS = 3000;

// Best-effort per-IP limit. In-memory, so it resets on deploy and isn't shared
// across serverless instances; together with the honeypot and the timing check
// it stops casual spam without a third-party service.
const recent = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(ip, hits);
    return true;
  }
  hits.push(now);
  recent.set(ip, hits);
  return false;
}

export async function sendContactMessage(input: ContactValues): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Partial<Record<"name" | "email" | "message", ContactErrorKey>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "name" || key === "email" || key === "message") fields[key] ??= issue.message as ContactErrorKey;
    }
    return { ok: false, reason: "invalid", fields };
  }
  const { name, email, message, website, startedAt } = parsed.data;

  // Bots: pretend it worked so they don't adapt.
  if (website || Date.now() - startedAt < MIN_FILL_MS) return { ok: true };

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) return { ok: false, reason: "rateLimited" };

  const { error } = await createPublicClient().from("contact_messages").insert({ name, email, message });
  if (error) {
    console.error("contact: insert failed", error.message);
    return { ok: false, reason: "failed" };
  }

  // The message is saved; notifications go out after the response.
  after(() => notify({ name, email, message }));
  return { ok: true };
}

type Message = { name: string; email: string; message: string };

/** Sends every configured notification; one failing doesn't stop the other. */
async function notify(msg: Message) {
  await Promise.allSettled([notifyTelegram(msg), notifyEmail(msg)]);
}

const TELEGRAM_LIMIT = 4096;

/** Optional phone push via a Telegram bot (Bot API over HTTP, no SDK). Skipped when not configured. */
async function notifyTelegram({ name, email, message }: Message) {
  const env = serverEnv();
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;

  const footer = `\n\n— ${name} <${email}>\n${siteUrl()}/admin/messages`;
  const header = "New portfolio message\n\n";
  const room = TELEGRAM_LIMIT - header.length - footer.length;
  const body = message.length > room ? `${message.slice(0, room - 1)}…` : message;

  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Plain text (no parse_mode) so visitor input can't break formatting.
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: header + body + footer, link_preview_options: { is_disabled: true } }),
  });
  if (!response.ok) console.error("contact: telegram notification failed", response.status, await response.text());
}

/** Optional email via Resend's HTTP API (no SDK needed). Skipped when not configured. */
async function notifyEmail({ name, email, message }: Message) {
  const env = serverEnv();
  if (!env.RESEND_API_KEY || !env.CONTACT_NOTIFY_EMAIL) return;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to: [env.CONTACT_NOTIFY_EMAIL],
      reply_to: email,
      subject: `New message from ${name}`,
      text: `${message}\n\n— ${name} <${email}>\n\nReply to this email to answer, or read it in the admin under Messages.`,
    }),
  });
  if (!response.ok) console.error("contact: email notification failed", response.status, await response.text());
}
