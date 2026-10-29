import type { ProjectSummary } from "./schemas";

/** "2024", "2023–2024", or null when the project has no dates. */
export function projectYears(project: Pick<ProjectSummary, "start_date" | "end_date">): string | null {
  if (!project.start_date) return null;
  const start = project.start_date.slice(0, 4);
  const end = project.end_date?.slice(0, 4);
  return end && end !== start ? `${start}–${end}` : start;
}

/** view-transition-name shared by a project's phone across the list, home and detail pages. */
export function projectDeviceTransition(slug: string): string {
  return `project-device-${slug}`;
}

/** Alternates device styles across projects, but keeps each project's phone the same everywhere. */
export function projectDeviceVariant(project: Pick<ProjectSummary, "sort_order">): "ios" | "android" {
  return project.sort_order % 2 === 0 ? "android" : "ios";
}
