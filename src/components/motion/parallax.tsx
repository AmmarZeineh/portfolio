"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGsap } from "@/lib/motion/gsap";
import { useMotionTier } from "./motion-provider";

type ParallaxProps = {
  children: ReactNode;
  /** Total travel as a percentage of the element's height (+ moves slower than scroll). */
  speed?: number;
  /** Optional rotation (deg) across the same scroll range, for floating devices. */
  rotate?: number;
  className?: string;
};

/** Scroll-scrubbed parallax via GSAP ScrollTrigger ("full" tier only). */
export function Parallax({ children, speed = 20, rotate = 0, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tier = useMotionTier();

  useGsap(
    () => {
      if (tier !== "full" || !ref.current) return;
      gsap.fromTo(
        ref.current,
        { yPercent: -speed / 2, rotate: -rotate / 2 },
        {
          yPercent: speed / 2,
          rotate: rotate / 2,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    [tier, speed, rotate],
    ref,
  );

  return (
    <div ref={ref} className={className} style={{ willChange: tier === "full" ? "transform" : undefined }}>
      {children}
    </div>
  );
}
