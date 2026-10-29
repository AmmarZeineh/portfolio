import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/admin-shell";
import { SkillsManager } from "@/components/admin/skills-manager";
import { requireAdmin } from "@/lib/admin/auth";
import { listSkillGroups } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Skills" };

export default async function AdminSkillsPage() {
  const { supabase } = await requireAdmin();
  const groups = await listSkillGroups(supabase);
  return (
    <>
      <PageHeader title="Skills" description="Grouped skills for the Toolkit section; every skill also scrolls by in the marquee." />
      <SkillsManager groups={groups} />
    </>
  );
}
