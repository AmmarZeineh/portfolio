import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/admin-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/admin/auth";
import { getSettingsForm } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Profile & settings" };

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();
  const settings = await getSettingsForm(supabase);
  return (
    <>
      <PageHeader title="Profile & settings" description="Your details, the hero and About text, contact links and the numbers row." />
      <SettingsForm initial={settings} />
    </>
  );
}
