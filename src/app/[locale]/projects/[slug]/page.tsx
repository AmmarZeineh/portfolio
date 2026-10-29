import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/project/case-study";
import { PageTransition } from "@/components/site/page-transition";
import { ENABLED_LOCALES, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getAdjacentProjects, getProject, getProjects } from "@/lib/data/projects";
import { pick } from "@/lib/data/schemas";
import { siteUrl } from "@/lib/env";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { mediaUrl } from "@/lib/supabase/storage";

export async function generateStaticParams() {
  const projects = await getProjects();
  return ENABLED_LOCALES.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const [t, project] = await Promise.all([getDictionary(locale), getProject(slug)]);
  if (!project) return {};
  return pageMetadata({
    t,
    locale,
    path: `/projects/${slug}`,
    title: pick(project.title, locale),
    description: pick(project.tagline, locale),
    type: "article",
  });
}

/**
 * The route's shared shell is just the transition wrapper; everything that
 * depends on the slug renders inside Suspense. Project links prefetch with
 * prefetch={true}, so that part is usually ready before the click and the
 * fallback is rarely seen.
 */
export default function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  return (
    <PageTransition>
      <Suspense fallback={<div className="min-h-svh" />}>
        <ProjectView params={params} />
      </Suspense>
    </PageTransition>
  );
}

async function ProjectView({ params }: Pick<PageProps<"/[locale]/projects/[slug]">, "params">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const [t, project, adjacent] = await Promise.all([
    getDictionary(locale),
    getProject(slug),
    getAdjacentProjects(slug),
  ]);
  if (!project) notFound();

  const base = siteUrl();
  const structured = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: pick(project.title, locale),
    description: pick(project.tagline, locale),
    url: `${base}/${locale}/projects/${project.slug}`,
    applicationCategory: "MobileApplication",
    operatingSystem: project.platforms.map((p) => ({ android: "Android", ios: "iOS", web: "Web" })[p]).join(", "),
    ...(project.cover_path && { image: new URL(mediaUrl(project.cover_path), base).href }),
    ...(project.start_date && { dateCreated: project.start_date }),
    keywords: project.tags.map((tag) => tag.name).join(", "),
    author: { "@type": "Person", "@id": `${base}/#person`, name: `${t.person.firstName} ${t.person.lastName}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <CaseStudy project={project} adjacent={adjacent} t={t} locale={locale} />
    </>
  );
}
