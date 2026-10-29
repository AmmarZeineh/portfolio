import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/admin-shell";
import { ExperienceManager } from "@/components/admin/experience-manager";
import { requireAdmin } from "@/lib/admin/auth";
import { listExperience } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Experience" };

export default async function AdminExperiencePage() {
  const { supabase } = await requireAdmin();
  const rows = await listExperience(supabase);
  return (
    <>
      <PageHeader title="Experience" description="Roles on the home page timeline. Drag to set the order." />
      <ExperienceManager rows={rows} />
    </>
  );
}
