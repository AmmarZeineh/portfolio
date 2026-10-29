"use client";

import { useRef, type ReactNode } from "react";
import { useMotionTier } from "@/components/motion/motion-provider";
import { gsap, useGsap } from "@/lib/motion/gsap";

/**
 * Horizontal project showcase. On the "full" tier the section pins and
 * vertical scroll drives the track sideways; elsewhere it is a native,
 * swipeable scroll-snap row. Panels are passed in as server-rendered children.
 */
export function ShowcaseTrack({ children, label }: { children: ReactNode; label: string }) {
  const tier = useMotionTier();
  const pinned = tier === "full";
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useGsap(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!pinned || !section || !track) return;

      const direction = getComputedStyle(section).direction === "rtl" ? 1 : -1;
      const distance = () => Math.max(0, track.scrollWidth - section.clientWidth);

      gsap.to(track, {
        x: () => direction * distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progressRef.current?.style.setProperty("scale", `${self.progress} 1`);
          },
        },
      });
    },
    [pinned],
    sectionRef,
  );

  return (
    <div ref={sectionRef} className={pinned ? "relative h-svh overflow-hidden" : "relative"}>
      <div
        ref={trackRef}
        role="list"
        aria-label={label}
        data-pinned={pinned || undefined}
        className={
          pinned
            ? "group/track flex h-full w-max items-stretch pt-[var(--header-h)] pb-16"
            : "group/track flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-6 [scrollbar-width:none]"
        }
      >
        {children}
      </div>

      {pinned && (
        <div aria-hidden className="absolute inset-x-[var(--gutter)] bottom-8 h-px bg-line">
          <div ref={progressRef} className="h-full origin-[0_50%] bg-fg rtl:origin-[100%_50%]" style={{ scale: "0 1" }} />
        </div>
      )}
    </div>
  );
}
