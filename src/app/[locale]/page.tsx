import { notFound } from "next/navigation";
import { About } from "@/components/sections/about";
import { ContactCta } from "@/components/sections/contact-cta";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { FeaturedWork } from "@/components/sections/featured-work";
import { Hero } from "@/components/sections/hero";
import type { HeroScreen } from "@/components/sections/hero-device";
import { Skills } from "@/components/sections/skills";
import { Stats } from "@/components/sections/stats";
import { PageTransition } from "@/components/site/page-transition";
import { isLocale } from "@/i18n/config";
import { localePath } from "@/i18n/format";
import { getDictionary } from "@/i18n/get-dictionary";
import { getExperience, getSiteSettings, getSkillGroups } from "@/lib/data/content";
import { getProjects } from "@/lib/data/projects";
import { pick, type ProjectSummary } from "@/lib/data/schemas";
import { siteUrl } from "@/lib/env";
import { jsonLd } from "@/lib/seo";
import { mediaUrl } from "@/lib/supabase/storage";

/** The showcase needs some length to scroll: featured first, topped up to three. */
const SHOWCASE_MIN = 3;

function showcaseProjects(projects: ProjectSummary[]): ProjectSummary[] {
  const featured = projects.filter((p) => p.is_featured);
  if (featured.length >= SHOWCASE_MIN) return featured;
  const rest = projects.filter((p) => !p.is_featured);
  return [...featured, ...rest.slice(0, SHOWCASE_MIN - featured.length)];
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [t, settings, projects, experience, skillGroups] = await Promise.all([
    getDictionary(locale),
    getSiteSettings(),
    getProjects(),
    getExperience(),
    getSkillGroups(),
  ]);

  const showcase = showcaseProjects(projects);
  const heroScreens: HeroScreen[] = showcase.flatMap((project) =>
    project.cover_path
      ? [
          {
            slug: project.slug,
            href: localePath(locale, `/projects/${project.slug}`),
            title: pick(project.title, locale),
            src: project.cover_path,
            alt: pick(project.tagline, locale),
            accent: project.accent_color,
          },
        ]
      : [],
  );

  const base = siteUrl();
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${base}/#person`,
    name: `${t.person.firstName} ${t.person.lastName}`,
    jobTitle: pick(settings.role, locale) || t.person.role,
    description: pick(settings.hero_sub, locale) || t.meta.description,
    url: `${base}/${locale}`,
    ...(settings.email && { email: `mailto:${settings.email}` }),
    ...(settings.photo_path && { image: new URL(mediaUrl(settings.photo_path), base).href }),
    address: { "@type": "PostalAddress", addressLocality: "Damascus", addressCountry: "SY" },
    knowsLanguage: pick(settings.languages, locale),
    knowsAbout: skillGroups.flatMap((group) => group.skills.map((skill) => skill.name)),
    sameAs: Object.values(settings.socials).filter(Boolean),
  };

  return (
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(person) }} />
      <Hero t={t} locale={locale} settings={settings} screens={heroScreens} />
      <About t={t} locale={locale} settings={settings} />
      <FeaturedWork t={t} locale={locale} projects={showcase} totalCount={projects.length} />
      <ExperienceTimeline t={t} locale={locale} experience={experience} />
      <Skills t={t} locale={locale} groups={skillGroups} />
      <Stats t={t} locale={locale} stats={settings.stats} />
      <ContactCta t={t} locale={locale} settings={settings} />
    </PageTransition>
  );
}
