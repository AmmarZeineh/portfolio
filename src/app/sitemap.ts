import type { MetadataRoute } from "next";
import { ENABLED_LOCALES } from "@/i18n/config";
import { getProjects } from "@/lib/data/projects";
import { siteUrl } from "@/lib/env";

type Entry = Omit<MetadataRoute.Sitemap[number], "url"> & { path: string };

/**
 * Every public page in every enabled locale, each listing its translations
 * (hreflang). Drafts never appear (getProjects is published-only).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const projects = await getProjects();

  const pages: Entry[] = [
    { path: "", changeFrequency: "monthly", priority: 1 },
    { path: "/projects", changeFrequency: "monthly", priority: 0.8 },
    ...projects.map((project): Entry => ({
      path: `/projects/${project.slug}`,
      changeFrequency: "yearly",
      priority: project.is_featured ? 0.8 : 0.6,
    })),
    { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  ];

  return ENABLED_LOCALES.flatMap((locale) =>
    pages.map(({ path, ...entry }) => ({
      ...entry,
      url: `${base}/${locale}${path}`,
      alternates: {
        languages: Object.fromEntries(ENABLED_LOCALES.map((l) => [l, `${base}/${l}${path}`])),
      },
    })),
  );
}
