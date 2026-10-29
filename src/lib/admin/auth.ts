import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * The admin Data Access Layer gate. Every admin page and server action calls
 * this first: it verifies the session and that the user is listed in
 * admin_users (RLS only shows that row to the admin themself). Row Level
 * Security enforces the same rule in the database, so this is a second lock.
 *
 * - connection() makes this always run on the real request, never in a
 *   prerender pass that could be aborted halfway.
 * - getClaims() verifies the session token locally (projects with asymmetric
 *   signing keys) instead of a round trip to Supabase Auth on every page.
 * - A failed query is an error, not "you're not an admin": a slow network
 *   shouldn't send the real admin back to the login page.
 */
export async function requireAdmin() {
  await connection();
  const supabase = await createSessionClient();

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/admin/login");

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", claims.sub)
    .maybeSingle();
  if (error) throw new Error(`Couldn't verify admin access (${error.message}). Reload to try again.`);
  if (!admin) redirect("/admin/login?error=not-admin");

  return { supabase, user: { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null } };
}

export type AdminContext = Awaited<ReturnType<typeof requireAdmin>>;
