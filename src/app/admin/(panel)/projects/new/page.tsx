import type { Metadata } from "next";
import { ProjectForm } from "@/components/admin/project-form";
import { requireAdmin } from "@/lib/admin/auth";
import { emptyProjectForm, listTags } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const { supabase } = await requireAdmin();
  const tags = await listTags(supabase);
  return <ProjectForm id={null} initial={emptyProjectForm()} tags={tags} />;
}
