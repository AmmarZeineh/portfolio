import { z } from "zod";

// Public vars are inlined at build time, so each one must be referenced
// explicitly (process.env[name] would not be replaced in client bundles).
const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});
export type PublicEnv = z.infer<typeof publicSchema>;

let cachedPublicEnv: PublicEnv | undefined;

/** Validated public env. Throws a readable error if .env.local is incomplete. */
export function publicEnv(): PublicEnv {
  cachedPublicEnv ??= publicSchema.parse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return cachedPublicEnv;
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().optional(),
  CONTACT_NOTIFY_EMAIL: z.email().optional(),
  CONTACT_FROM_EMAIL: z.string().optional(),
});

/** Server-only variables. Call from server code only. */
export function serverEnv() {
  return serverSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
    RESEND_API_KEY: process.env.RESEND_API_KEY || undefined,
    CONTACT_NOTIFY_EMAIL: process.env.CONTACT_NOTIFY_EMAIL || undefined,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL || undefined,
  });
}
