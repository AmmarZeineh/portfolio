/** Cache tags shared by cached reads and admin revalidation. */
export const CACHE_TAGS = {
  projects: "projects",
  project: (slug: string) => `project:${slug}`,
  tags: "tags",
  experience: "experience",
  skills: "skills",
  settings: "settings",
} as const;
