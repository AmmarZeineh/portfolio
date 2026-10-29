"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";

type ThemeToggleProps = { labels: { toDark: string; toLight: string } };

/**
 * A crescent that fills into a full disc: the moon's own phases stand in for
 * the switch between night and day.
 */
export function ThemeToggle({ labels }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // next-themes only knows the theme after mount; render a stable shell before.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- standard next-themes mount guard
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme !== "light";
  const label = isDark ? labels.toLight : labels.toDark;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className="group relative grid size-11 place-items-center rounded-full text-fg transition-colors hover:bg-fg/8"
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        <defs>
          <mask id="theme-toggle-mask">
            <rect width="24" height="24" fill="white" />
            <motion.circle
              r="8"
              fill="black"
              initial={false}
              animate={isDark ? { cx: 17, cy: 7 } : { cx: 30, cy: -6 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
            />
          </mask>
        </defs>
        <motion.circle
          cx="12"
          cy="12"
          fill="currentColor"
          mask="url(#theme-toggle-mask)"
          initial={false}
          animate={{ r: isDark ? 8 : 5.5 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
        />
        <motion.g
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: isDark ? 0 : 1, rotate: isDark ? -45 : 0, scale: isDark ? 0.6 : 1 }}
          style={{ originX: "12px", originY: "12px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line key={deg} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${deg} 12 12)`} />
          ))}
        </motion.g>
      </svg>
    </button>
  );
}
