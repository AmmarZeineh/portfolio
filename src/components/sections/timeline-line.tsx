"use client";

import { useRef } from "react";
import { useMotionTier } from "@/components/motion/motion-provider";
import { gsap, useGsap } from "@/lib/motion/gsap";

/**
 * The timeline's spine: a hairline track with an accent line drawn over it as
 * the list scrolls through the viewport. Fully drawn on lighter tiers.
 */
export function TimelineLine({ className }: { className?: string }) {
  const tier = useMotionTier();
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGsap(
    () => {
      const track = ref.current;
      const line = lineRef.current;
      if (tier !== "full" || !track || !line) return;
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: track.parentElement ?? track,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.4,
          },
        },
      );
    },
    [tier],
    ref,
  );

  return (
    <div ref={ref} aria-hidden className={`w-px bg-line ${className ?? ""}`}>
      <div ref={lineRef} className="h-full w-full origin-top bg-accent" />
    </div>
  );
}
