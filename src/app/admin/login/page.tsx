import type { Metadata } from "next";
import { connection } from "next/server";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  await connection();
  const { error } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <p className="text-sm text-muted-foreground">Ammar Zeineh</p>
        <h1 className="mt-1 text-2xl font-semibold">Sign in to the admin</h1>
        {error === "not-admin" && (
          <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm" role="alert">
            You’re signed in, but this account isn’t an admin. Sign in with the admin account, or add this user to
            the admin_users table in Supabase.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
