import { ViewTransition, type CSSProperties } from "react";
import Link from "next/link";
import { PhoneFrame } from "@/components/device/phone-frame";
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/parallax";
import { SplitText } from "@/components/motion/split-text";
import { Button } from "@/components/ui-kit/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill, localePath } from "@/i18n/format";
import { projectDeviceTransition, projectDeviceVariant, projectYears } from "@/lib/data/project-display";
import { pick, type Project, type ProjectLinkKey, type ProjectSummary } from "@/lib/data/schemas";
import { mediaUrl } from "@/lib/supabase/storage";
import { CaseSection } from "./case-section";
import { Markdown } from "./markdown";
import { ProjectVideo } from "./project-video";
import { ScreensCarousel } from "./screens-carousel";

const LINK_ORDER: ProjectLinkKey[] = ["demo", "play_store", "app_store", "github", "figma", "case_study"];

type CaseStudyProps = {
  project: Project;
  adjacent: { previous: ProjectSummary | null; next: ProjectSummary | null };
  t: Dictionary;
  locale: Locale;
};

/** A project's full case study. Rendered by the public page and the admin preview. */
export function CaseStudy({ project, adjacent, t, locale }: CaseStudyProps) {
  const title = pick(project.title, locale);
  const variant = projectDeviceVariant(project);
  const heroScreen = project.cover_path ?? project.images[0]?.path ?? null;
  const features = pick(project.features, locale);
  const challenges = pick(project.challenges, locale);
  const sections = [
    { id: "overview", title: t.project.overview, body: pick(project.overview, locale) },
    { id: "problem", title: t.project.problem, body: pick(project.problem, locale) },
    { id: "solution", title: t.project.solution, body: pick(project.solution, locale) },
  ].filter((section) => section.body.trim());
  const closing = [
    { id: "architecture", title: t.project.architecture, body: pick(project.architecture, locale) },
    { id: "results", title: t.project.results, body: pick(project.results, locale) },
  ].filter((section) => section.body.trim());

  const facts = [
    { label: t.project.role, value: pick(project.role, locale) },
    { label: t.project.year, value: projectYears(project) },
    {
      label: t.project.platforms,
      value: project.platforms.map((p) => t.project.platformNames[p]).join(t.listSeparator),
    },
    {
      label: t.project.team,
      value:
        project.team_size === null
          ? null
          : project.team_size <= 1
            ? t.project.solo
            : fill(t.project.teamOf, { count: project.team_size }),
    },
    { label: t.project.status, value: t.project.statuses[project.status] },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  const links = LINK_ORDER.flatMap((key) => {
    const href = project.links[key];
    return href ? [{ key, href, label: t.project.links[key] }] : [];
  });

  const slides = project.images.map((image) => ({
    src: mediaUrl(image.path),
    alt: pick(image.alt, locale) || title,
    caption: pick(image.caption, locale),
    width: image.width ?? undefined,
    height: image.height ?? undefined,
  }));

  return (
    <article className="project-theme" style={{ "--project-accent": project.accent_color } as CSSProperties}>
      {/* Hero */}
      <header className="relative isolate overflow-x-clip pt-[calc(var(--header-h)+clamp(2rem,6vw,5rem))]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/4 end-[-10%] -z-10 aspect-square w-[min(110vw,60rem)] rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
        />
        <div className="container-page grid gap-12 md:grid-cols-12 md:items-center md:gap-8">
          <div className="md:col-span-7">
            <Link href={localePath(locale, "/projects")} className="link-underline text-sm text-muted">
              {t.project.backToProjects}
            </Link>
            <p className="mt-10 text-sm text-muted">
              {[t.work.categories[project.category], projectYears(project)].filter(Boolean).join(t.listSeparator)}
            </p>
            <h1 className="mt-3 font-display text-[clamp(3.25rem,1rem+8vw,10rem)] leading-[0.9] tracking-[-0.02em]">
              <SplitText text={title} by={title.length > 14 ? "word" : "char"} />
            </h1>
            <p className="fade-unit mt-8 max-w-[30ch] text-xl" style={{ "--delay": "450ms" } as CSSProperties}>
              {pick(project.tagline, locale)}
            </p>
            {links.length > 0 && (
              <div className="fade-unit mt-10 flex flex-wrap gap-3" style={{ "--delay": "600ms" } as CSSProperties}>
                {links.map((link, i) => (
                  <Magnetic key={link.key} className="inline-block">
                    <Button
                      href={link.href}
                      variant={i === 0 ? "solid" : "outline"}
                      target="_blank"
                      rel="noopener noreferrer"
                      prefetch={false}
                    >
                      {link.label}
                    </Button>
                  </Magnetic>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-5">
            <Parallax speed={10} rotate={4} className="mx-auto w-[min(62vw,19rem)]">
              <ViewTransition name={projectDeviceTransition(project.slug)} share="device" default="none">
                <PhoneFrame
                  src={heroScreen}
                  alt={slides[0]?.alt ?? title}
                  variant={variant}
                  glow={project.accent_color}
                  priority
                  sizes="(min-width: 768px) 19rem, 62vw"
                />
              </ViewTransition>
            </Parallax>
          </div>
        </div>

        {facts.length > 0 && (
          <div className="container-page mt-[clamp(3rem,8vw,7rem)]">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-line py-8 md:grid-cols-5">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-sm text-muted">{fact.label}</dt>
                  <dd className="mt-1">{fact.value}</dd>
                </div>
              ))}
            </dl>
            {project.tags.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2 text-sm" aria-label={t.projects.technology}>
                {project.tags.map((tag) => (
                  <li key={tag.id} className="rounded-full border border-line px-3 py-1">
                    {tag.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </header>

      {project.is_confidential && (
        <p className="container-page mt-12 text-sm text-muted italic">{t.project.confidential}</p>
      )}

      {sections.map((section) => (
        <CaseSection key={section.id} id={section.id} title={section.title}>
          <Markdown>{section.body}</Markdown>
        </CaseSection>
      ))}

      {slides.length > 0 && (
        <section aria-labelledby="screens" className="py-[clamp(3rem,2rem+4vw,6rem)]">
          <h2 id="screens" className="container-page font-display text-2xl">
            {t.project.screens}
          </h2>
          <div className="-mt-12">
            <ScreensCarousel
              slides={slides}
              variant={variant}
              labels={{
                expand: t.project.expand,
                zoom: t.project.zoom,
                previous: t.project.scrollPrevious,
                next: t.project.scrollNext,
              }}
            />
          </div>
        </section>
      )}

      {features.length > 0 && (
        <CaseSection id="features" title={t.project.features}>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="border-t border-line py-4 text-lg">
                {feature}
              </li>
            ))}
          </ul>
        </CaseSection>
      )}

      {challenges.length > 0 && (
        <CaseSection id="challenges" title={t.project.challenges}>
          <div className="space-y-10">
            {challenges.map((challenge) => (
              <div key={challenge.title}>
                <h3 className="font-display text-xl">{challenge.title}</h3>
                <p className="mt-3 max-w-[62ch] text-lg text-muted">{challenge.body}</p>
              </div>
            ))}
          </div>
        </CaseSection>
      )}

      {(project.video_path || project.video_url) && (
        <CaseSection id="video" title={t.project.video}>
          <ProjectVideo
            title={`${title}: ${t.project.video}`}
            videoPath={project.video_path}
            videoUrl={project.video_url}
            variant={variant}
          />
        </CaseSection>
      )}

      {closing.map((section) => (
        <CaseSection key={section.id} id={section.id} title={section.title}>
          <Markdown>{section.body}</Markdown>
        </CaseSection>
      ))}

      {/* Previous / next */}
      {adjacent.previous && adjacent.next && (
        <nav aria-label={t.projects.title} className="mt-[clamp(3rem,2rem+4vw,6rem)] border-t border-line">
          <div className="container-page grid sm:grid-cols-2">
            {[
              { project: adjacent.previous, label: t.project.previous, align: "" },
              { project: adjacent.next, label: t.project.next, align: "sm:text-end sm:border-s sm:ps-8" },
            ].map(({ project: other, label, align }) => (
              <Link
                key={label}
                href={localePath(locale, `/projects/${other.slug}`)}
                prefetch
                className={`group/adj block border-b border-line py-10 sm:border-b-0 sm:py-16 ${align}`}
                data-cursor="view"
                data-cursor-label={t.work.cursor}
              >
                <span className="text-sm text-muted">{label}</span>
                <span className="mt-3 block font-display text-3xl transition-colors duration-500 group-hover/adj:text-accent">
                  {pick(other.title, locale)}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </article>
  );
}
