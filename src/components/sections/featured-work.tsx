import { ViewTransition } from "react";
import Link from "next/link";
import { PhoneFrame } from "@/components/device/phone-frame";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill, localePath } from "@/i18n/format";
import { projectDeviceTransition, projectDeviceVariant, projectYears } from "@/lib/data/project-display";
import { pick, type ProjectSummary } from "@/lib/data/schemas";
import { ShowcaseTrack } from "./showcase-track";

type FeaturedWorkProps = {
  t: Dictionary;
  locale: Locale;
  projects: ProjectSummary[];
  totalCount: number;
};

// Panel styles switch on the track's data-pinned flag (set by ShowcaseTrack),
// so the same server-rendered markup serves the pinned and swipeable layouts.
const PINNED = {
  panel:
    "group-data-[pinned]/track:grid group-data-[pinned]/track:h-full group-data-[pinned]/track:w-auto group-data-[pinned]/track:grid-cols-[auto_minmax(0,32rem)] group-data-[pinned]/track:items-center group-data-[pinned]/track:gap-[5vw] group-data-[pinned]/track:rounded-none group-data-[pinned]/track:bg-transparent group-data-[pinned]/track:p-0 group-data-[pinned]/track:ps-[var(--gutter)] group-data-[pinned]/track:pe-[14vw]",
  device: "group-data-[pinned]/track:mx-0 group-data-[pinned]/track:w-[calc(min(64svh,42rem)*0.4613)]",
  title: "group-data-[pinned]/track:text-[clamp(3rem,1rem+5vw,7rem)]",
};

export function FeaturedWork({ t, locale, projects, totalCount }: FeaturedWorkProps) {
  return (
    <section id="work" aria-labelledby="work-title" className="pt-[var(--section-space)]">
      <div className="container-page flex items-end justify-between gap-6 pb-12">
        <h2 id="work-title" className="font-display text-3xl">
          {t.work.title}
        </h2>
        <Link href={localePath(locale, "/projects")} className="link-underline shrink-0 pb-2 text-sm">
          {t.work.allProjects}
        </Link>
      </div>

      <ShowcaseTrack label={t.work.title}>
        {projects.map((project) => {
          const title = pick(project.title, locale);
          const meta = [t.work.categories[project.category], projectYears(project)].filter(Boolean).join(t.listSeparator);
          return (
            <article
              key={project.id}
              role="listitem"
              aria-labelledby={`work-${project.slug}`}
              data-cursor="view"
              data-cursor-label={t.work.cursor}
              className={`relative flex w-[84vw] shrink-0 snap-start flex-col gap-8 rounded-[2rem] bg-raised p-6 sm:w-[60vw] sm:p-10 ${PINNED.panel}`}
            >
              <div className={`mx-auto w-[min(52vw,14rem)] ${PINNED.device}`}>
                <ViewTransition name={projectDeviceTransition(project.slug)} share="device" default="none">
                  <PhoneFrame
                    src={project.cover_path}
                    alt={title}
                    glow={project.accent_color}
                    variant={projectDeviceVariant(project)}
                    sizes="(min-width: 768px) 20rem, 52vw"
                  />
                </ViewTransition>
              </div>

              <div className="min-w-0">
                <p className="text-sm text-muted">{meta}</p>
                <h3 id={`work-${project.slug}`} className={`mt-3 font-display text-3xl ${PINNED.title}`}>
                  {title}
                </h3>
                <p className="mt-4 max-w-[36ch] text-lg text-muted">{pick(project.tagline, locale)}</p>
                {project.tags.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2 text-sm">
                    {project.tags.slice(0, 5).map((tag) => (
                      <li key={tag.id} className="rounded-full border border-line px-3 py-1">
                        {tag.name}
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href={localePath(locale, `/projects/${project.slug}`)}
                  prefetch
                  className="link-underline mt-8 inline-block font-medium after:absolute after:inset-0 after:rounded-[inherit] after:content-['']"
                >
                  {t.work.viewProject}
                  <span className="sr-only">: {title}</span>
                </Link>
              </div>
            </article>
          );
        })}

        <div
          role="listitem"
          className="flex w-[70vw] shrink-0 snap-start items-center justify-center sm:w-[40vw] group-data-[pinned]/track:h-full group-data-[pinned]/track:w-[min(60vw,48rem)]"
        >
          <Link
            href={localePath(locale, "/projects")}
            className="link-underline font-display text-2xl"
            data-cursor="view"
            data-cursor-label={t.work.cursor}
          >
            {fill(t.work.seeAll, { count: totalCount })}
          </Link>
        </div>
      </ShowcaseTrack>
    </section>
  );
}
