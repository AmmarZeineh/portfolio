"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";
import { useMotionTier } from "./motion-provider";

type CounterProps = {
  value: number;
  suffix?: string;
  locale?: string;
  duration?: number;
  className?: string;
};

/**
 * Counts up from zero when scrolled into view. The final value is server
 * rendered, so the number is correct without JS and for screen readers.
 */
export function Counter({ value, suffix = "", locale = "en", duration = 1.8, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const tier = useMotionTier();
  const format = (n: number) => `${new Intl.NumberFormat(locale).format(Math.round(n))}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || tier === "reduced") return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        el.textContent = format(latest);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- format derives from props listed
  }, [inView, tier, value, suffix, locale, duration]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format(value)}
    </span>
  );
}
