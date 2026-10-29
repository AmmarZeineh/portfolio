"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { PhoneFrame } from "@/components/device/phone-frame";
import { useMotionTier } from "@/components/motion/motion-provider";
import { Parallax } from "@/components/motion/parallax";
import { Tilt } from "@/components/motion/tilt";
import { isUnoptimizable, mediaUrl } from "@/lib/supabase/storage";

export type HeroScreen = {
  slug: string;
  href: string;
  title: string;
  src: string;
  alt: string;
  accent: string;
};

type HeroDeviceProps = {
  screens: HeroScreen[];
  labels: { open: string; show: string };
  className?: string;
};

const INTERVAL_MS = 3800;

/**
 * The hero phone cycles through featured projects' screens. The dots below are
 * both indicator and control: choosing one stops the rotation for good, and
 * hovering or focusing the device pauses it. Static under reduced motion.
 * Cycling waits for the visitor's first interaction, so the first screen stays
 * the page's Largest Contentful Paint instead of each new screen replacing it.
 */
export function HeroDevice({ screens, labels, className }: HeroDeviceProps) {
  const tier = useMotionTier();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    const events = ["pointermove", "pointerdown", "scroll", "keydown", "touchstart"] as const;
    const engage = () => {
      setEngaged(true);
      for (const event of events) window.removeEventListener(event, engage);
    };
    for (const event of events) window.addEventListener(event, engage, { passive: true });
    return () => {
      for (const event of events) window.removeEventListener(event, engage);
    };
  }, []);

  const cycling = engaged && tier !== "reduced" && !paused && !stopped && screens.length > 1;

  useEffect(() => {
    if (!cycling) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % screens.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [cycling, screens.length]);

  const active = screens[index];
  if (!active) return null;

  return (
    <div
      className={className}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="rise-unit" style={{ "--delay": "250ms" } as CSSProperties}>
        <Parallax speed={12} rotate={5}>
          <Tilt max={10} className="rounded-[15cqw]">
            <Link
              href={active.href}
              data-cursor="view"
              data-cursor-label={labels.open}
              aria-label={`${labels.open}: ${active.title}`}
              className="block rounded-[15cqw]"
            >
              <PhoneFrame alt="" glow={active.accent}>
                {screens.map((screen, i) => (
                  <Image
                    key={screen.slug}
                    src={mediaUrl(screen.src)}
                    alt={i === index ? screen.alt : ""}
                    aria-hidden={i !== index}
                    fill
                    sizes="(min-width: 768px) 17rem, 60vw"
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    unoptimized={isUnoptimizable(screen.src)}
                    className={`object-cover object-top transition-[opacity,scale] duration-1000 ease-[var(--ease-out-expo)] ${
                      i === index ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                    }`}
                  />
                ))}
              </PhoneFrame>
            </Link>
          </Tilt>
        </Parallax>
      </div>

      {screens.length > 1 && (
        <div className="fade-unit mt-8 flex items-center justify-center gap-4" style={{ "--delay": "900ms" } as CSSProperties}>
          <p className="min-w-0 truncate text-sm text-muted">
            {active.title}
          </p>
          <ul className="flex items-center">
            {screens.map((screen, i) => (
              <li key={screen.slug}>
                <button
                  type="button"
                  aria-label={labels.show.replace("{project}", screen.title)}
                  aria-pressed={i === index}
                  onClick={() => {
                    setIndex(i);
                    setStopped(true);
                  }}
                  className="group grid size-6 place-items-center"
                >
                  <span
                    aria-hidden
                    className={`block h-1.5 rounded-full transition-[width,background-color] duration-500 ease-[var(--ease-out-expo)] ${
                      i === index ? "w-5 bg-fg" : "w-1.5 bg-fg/30 group-hover:bg-fg/60"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
