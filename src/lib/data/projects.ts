import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS } from "./cache-tags";
import {
  projectSchema,
  projectSummarySchema,
  tagSchema,
  type Project,
  type ProjectSummary,
  type Tag,
} from "./schemas";

const SUMMARY_COLUMNS = `
  id, slug, title, tagline, category, status, start_date, end_date, platforms,
  cover_path, accent_color, is_featured, is_confidential, sort_order,
  project_tags ( sort_order, tags ( id, name, slug ) )
`;

const DETAIL_COLUMNS = `
  *,
  project_tags ( sort_order, tags ( id, name, slug ) ),
  project_images ( id, path, caption, alt, width, height, sort_order )
`;

const joinedTags = z
  .array(z.object({ sort_order: z.number(), tags: tagSchema.nullable() }))
  .transform((rows) =>
    rows
      .toSorted((a, b) => a.sort_order - b.sort_order)
      .flatMap((row) => (row.tags ? [row.tags] : [])),
  );

/** Normalizes Supabase's nested join shape into the domain shape. */
function normalize(row: Record<string, unknown>) {
  const { project_tags, project_images, ...rest } = row;
  const images = Array.isArray(project_images)
    ? (project_images as { sort_order: number }[]).toSorted(
        (a, b) => a.sort_order - b.sort_order,
      )
    : [];
  return { ...rest, tags: joinedTags.parse(project_tags ?? []), images };
}

export async function getProjects(): Promise<ProjectSummary[]> {
  "use cache";
  cacheTag(CACHE_TAGS.projects);
  cacheLife("max");

  const { data, error } = await createPublicClient()
    .from("projects")
    .select(SUMMARY_COLUMNS)
    .eq("is_published", true)
    .order("sort_order");

  if (error) throw new Error(`getProjects: ${error.message}`);
  return z.array(projectSummarySchema).parse(data.map(normalize));
}

export async function getFeaturedProjects(): Promise<ProjectSummary[]> {
  const projects = await getProjects();
  return projects.filter((p) => p.is_featured);
}

/** Columns and parsing for one project with tags and gallery (also used by the admin preview). */
export const PROJECT_DETAIL_COLUMNS = DETAIL_COLUMNS;
export function parseProjectDetail(row: Record<string, unknown>): Project {
  return projectSchema.parse(normalize(row));
}

export async function getProject(slug: string): Promise<Project | null> {
  "use cache";
  cacheTag(CACHE_TAGS.projects, CACHE_TAGS.project(slug));
  cacheLife("max");

  const { data, error } = await createPublicClient()
    .from("projects")
    .select(DETAIL_COLUMNS)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(`getProject(${slug}): ${error.message}`);
  return data ? projectSchema.parse(normalize(data)) : null;
}

/** Previous/next published projects, wrapping around. */
export async function getAdjacentProjects(slug: string) {
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1 || projects.length < 2) return { previous: null, next: null };
  const at = (i: number) => projects[(i + projects.length) % projects.length] ?? null;
  return { previous: at(index - 1), next: at(index + 1) };
}

/** Tags used by at least one published project (for filters). */
export async function getUsedTags(): Promise<Tag[]> {
  const projects = await getProjects();
  const bySlug = new Map<string, Tag>();
  for (const project of projects) {
    for (const tag of project.tags) bySlug.set(tag.slug, tag);
  }
  return [...bySlug.values()].toSorted((a, b) => a.name.localeCompare(b.name));
}
