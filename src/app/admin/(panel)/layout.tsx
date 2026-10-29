import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";
import { countUnread } from "@/lib/admin/queries";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const unread = await countUnread(supabase);

  return (
    <AdminShell email={user.email ?? ""} unread={unread}>
      {children}
    </AdminShell>
  );
}
