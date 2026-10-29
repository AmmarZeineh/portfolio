"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CopyIcon, EyeIcon, MoreHorizontalIcon, PencilIcon, SearchIcon, StarIcon, Trash2Icon } from "lucide-react";
import {
  deleteProject,
  duplicateProject,
  reorderProjects,
  setProjectFlag,
} from "@/lib/admin/actions/projects";
import type { AdminProjectRow } from "@/lib/admin/queries";
import { isUnoptimizable, mediaUrl } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-button";
import { SortableList } from "./sortable-list";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { useAction } from "./use-action";

const CATEGORY: Record<string, string> = {
  company: "Company",
  freelance: "Freelance",
  graduation: "Graduation",
  academic: "Academic",
};

export function ProjectsList({ projects }: { projects: AdminProjectRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { run } = useAction();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? projects.filter((p) => `${p.title} ${p.slug} ${p.category}`.toLowerCase().includes(q)) : projects;
  }, [projects, query]);

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="font-medium">No projects yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Add your first project to show it on the site.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/projects/new">New project</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects"
          aria-label="Search projects"
          className="ps-9"
        />
      </div>
      {query && <p className="text-xs text-muted-foreground">Clear the search to reorder.</p>}

      <SortableList
        items={filtered}
        disabled={Boolean(query)}
        itemLabel={(p) => p.title}
        onCommit={(next) => run(() => reorderProjects(next.map((p) => p.id)), "Order saved")}
        renderItem={(project) => (
          <>
            <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
              {project.cover_path && (
                <Image
                  src={mediaUrl(project.cover_path)}
                  alt=""
                  fill
                  sizes="40px"
                  unoptimized={isUnoptimizable(project.cover_path)}
                  className="object-cover object-top"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/projects/${project.id}`} className="block truncate font-medium hover:underline">
                {project.title || "Untitled"}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                /{project.slug} · {CATEGORY[project.category]}
              </p>
            </div>
            {!project.is_published && <Badge variant="secondary" className="hidden sm:inline-flex">Draft</Badge>}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-pressed={project.is_featured}
              aria-label={project.is_featured ? `Remove ${project.title} from featured` : `Feature ${project.title} on the home page`}
              title="Featured on the home page"
              onClick={() =>
                run(
                  () => setProjectFlag(project.id, "is_featured", !project.is_featured),
                  project.is_featured ? "Removed from featured" : "Featured on the home page",
                )
              }
            >
              <StarIcon className={cn(project.is_featured && "fill-amber-400 text-amber-400")} />
            </Button>
            <Switch
              checked={project.is_published}
              aria-label={`Published: ${project.title}`}
              title={project.is_published ? "Published" : "Draft"}
              onCheckedChange={(checked) =>
                run(() => setProjectFlag(project.id, "is_published", checked), checked ? "Published" : "Moved to drafts")
              }
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${project.title}`}>
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/projects/${project.id}`}>
                    <PencilIcon /> Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`/en/preview/${project.id}`} target="_blank" rel="noopener">
                    <EyeIcon /> Preview
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    run(() => duplicateProject(project.id), "Duplicated as a draft", (data) =>
                      router.push(`/admin/projects/${data.id}`),
                    )
                  }
                >
                  <CopyIcon /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <ConfirmDialog
                  title={`Delete ${project.title}?`}
                  description="The project and its screenshots are removed from the site. This can't be undone."
                  onConfirm={() => run(() => deleteProject(project.id), "Project deleted")}
                  trigger={
                    <DropdownMenuItem variant="destructive" onSelect={(event) => event.preventDefault()}>
                      <Trash2Icon /> Delete
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      />
    </div>
  );
}
