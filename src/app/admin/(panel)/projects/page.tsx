import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { PageHeader } from "@/components/admin/admin-shell";
import { ProjectsList } from "@/components/admin/projects-list";
import { Button } from "@/components/admin/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { listProjects } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  const { supabase } = await requireAdmin();
  const projects = await listProjects(supabase);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Drag to set the order they appear on the site. Starred projects lead the home page showcase."
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">
              <PlusIcon /> New project
            </Link>
          </Button>
        }
      />
      <ProjectsList projects={projects} />
    </>
  );
}
