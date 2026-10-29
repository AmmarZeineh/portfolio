import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import { requireAdmin } from "@/lib/admin/auth";
import { getProjectForm, listTags } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [project, tags] = await Promise.all([getProjectForm(supabase, id), listTags(supabase)]);
  if (!project) notFound();
  return <ProjectForm key={id} id={id} initial={project} tags={tags} />;
}
