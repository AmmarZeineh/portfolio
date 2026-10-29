import { ViewTransition, type CSSProperties } from "react";
import Link from "next/link";
import { PhoneFrame } from "@/components/device/phone-frame";
import { Tilt } from "@/components/motion/tilt";

export type ProjectCardData = {
  id: string;
  slug: string;
  href: string;
  title: string;
  tagline: string;
  category: string;
  /** "Freelance, 2024", already localized. */
  meta: string;
  tags: { slug: string; name: string }[];
  cover: string | null;
  accent: string;
  variant: "ios" | "android";
  transitionName: string;
};

/**
 * A stage tinted with the project's accent, with the phone rising out of its
 * lower edge. The phone climbs a little on hover and morphs into the case
 * study's hero device on navigation.
 */
export function ProjectCard({
  project,
  cursorLabel,
  eager = false,
}: {
  project: ProjectCardData;
  cursorLabel: string;
  eager?: boolean;
}) {
  const { meta } = project;

  return (
    <article className="group/card" data-cursor="view" data-cursor-label={cursorLabel}>
      <Tilt max={6} className="rounded-[2rem]">
        {/* Duplicate of the title link for pointer users; hidden from keyboard and screen readers. */}
        <Link
          href={project.href}
          prefetch
          tabIndex={-1}
          aria-hidden
          className="relative block aspect-[4/5] overflow-hidden rounded-[2rem] bg-raised"
          style={{ "--card-accent": project.accent } as CSSProperties}
        >
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-3/4 bg-[radial-gradient(60%_70%_at_50%_100%,color-mix(in_oklab,var(--card-accent)_38%,transparent),transparent)] opacity-70 transition-opacity duration-700 group-hover/card:opacity-100"
          />
          <div className="absolute inset-x-0 top-[14%] mx-auto w-[46%] translate-y-[6%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/card:translate-y-0 motion-reduce:transition-none">
            <ViewTransition name={project.transitionName} share="device" default="none">
              <PhoneFrame
                src={project.cover}
                alt=""
                variant={project.variant}
                priority={eager}
                sizes="(min-width: 768px) 18vw, 42vw"
              />
            </ViewTransition>
          </div>
        </Link>
      </Tilt>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl">
          <Link href={project.href} prefetch className="link-underline">
            {project.title}
          </Link>
        </h2>
        <p className="shrink-0 text-sm text-muted">{meta}</p>
      </div>
      <p className="mt-2 max-w-[44ch] text-muted">{project.tagline}</p>
    </article>
  );
}
