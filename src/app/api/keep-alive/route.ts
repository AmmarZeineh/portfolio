import { connection, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Called once a day by Vercel Cron (vercel.json). Supabase pauses free
 * projects after a week without database activity, and cached pages don't
 * reach the database, so this makes one tiny read to keep it awake.
 * When CRON_SECRET is set, Vercel sends it as a bearer token and other
 * callers are refused.
 */
export async function GET(request: Request) {
  await connection();

  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { error } = await createPublicClient().from("site_settings").select("id").limit(1);
  if (error) {
    console.error("keep-alive: query failed", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
