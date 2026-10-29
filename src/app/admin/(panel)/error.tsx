"use client";

import { Button } from "@/components/admin/ui/button";

/** Shown when an admin page fails to load (usually a slow or dropped connection to Supabase). */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center" role="alert">
      <h1 className="text-xl font-semibold">This page didn&apos;t load</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message || "Something went wrong talking to Supabase."}
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
