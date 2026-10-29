import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SplitText } from "@/components/motion/split-text";
import type { ProjectCardData } from "@/components/projects/project-card";
import { ProjectGrid } from "@/components/projects/project-grid";
import { PageTransition } from "@/components/site/page-transition";
import { isLocale } from "@/i18n/config";
import { localePath } from "@/i18n/format";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo";
import { getProjects, getUsedTags } from "@/lib/data/projects";
import { projectDeviceTransition, projectDeviceVariant, projectYears } from "@/lib/data/project-display";
import { PROJECT_CATEGORIES, pick } from "@/lib/data/schemas";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return pageMetadata({ t, locale, path: "/projects", title: t.projects.title, description: t.projects.intro });
}

export default async function ProjectsPage({ params }: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, projects, tags] = await Promise.all([getDictionary(locale), getProjects(), getUsedTags()]);

  const cards: ProjectCardData[] = projects.map((project) => ({
    id: project.id,
    slug: project.slug,
    href: localePath(locale, `/projects/${project.slug}`),
    title: pick(project.title, locale),
    tagline: pick(project.tagline, locale),
    category: project.category,
    meta: [t.work.categories[project.category], projectYears(project)].filter(Boolean).join(t.listSeparator),
    tags: project.tags.map(({ slug, name }) => ({ slug, name })),
    cover: project.cover_path,
    accent: project.accent_color,
    variant: projectDeviceVariant(project),
    transitionName: projectDeviceTransition(project.slug),
  }));

  // Only offer filters that match at least one project.
  const categories = PROJECT_CATEGORIES.filter((c) => projects.some((p) => p.category === c)).map((c) => ({
    value: c,
    label: t.work.categories[c],
  }));

  return (
    <PageTransition>
      <div className="container-page pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[var(--section-space)]">
        <header className="mb-14 grid gap-6 md:grid-cols-12 md:items-end">
          <h1 className="type-display md:col-span-8">
            <SplitText text={t.projects.title} />
          </h1>
          <p className="fade-unit max-w-[34ch] text-lg text-muted md:col-span-4 md:justify-self-end" style={{ "--delay": "400ms" } as CSSProperties}>
            {t.projects.intro}
          </p>
        </header>

        <ProjectGrid
          projects={cards}
          categories={categories}
          tags={tags.map((tag) => ({ value: tag.slug, label: tag.name }))}
          labels={{
            filters: t.projects.filtersLabel,
            type: t.projects.type,
            technology: t.projects.technology,
            all: t.projects.all,
            count: t.projects.count,
            countOne: t.projects.countOne,
            empty: t.projects.empty,
            clear: t.projects.clear,
            cursor: t.work.cursor,
          }}
        />
      </div>
    </PageTransition>
  );
}
