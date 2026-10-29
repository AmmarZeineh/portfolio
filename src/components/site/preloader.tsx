"use client";

import { useEffect } from "react";

export const PRELOADER_KEY = "az-preloaded";

/**
 * Runs before first paint (inlined in <head>): turns the preloader on for the
 * first page view of a session, unless the visitor prefers reduced motion.
 * Falls back to switching itself off after 4s if hydration never happens.
 */
export const preloaderScript = `try{var d=document.documentElement;if(!sessionStorage.getItem("${PRELOADER_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.preloader="on";setTimeout(function(){delete d.dataset.preloader},4000)}}catch(e){}`;

/**
 * A phone outline draws itself, the monogram settles in, then the curtain
 * lifts. The page underneath is already rendered; its reveal animations are
 * paused until the curtain starts to move. Pure CSS; this component only
 * advances the state and remembers that the session has seen it.
 */
export function Preloader({ monogram, label }: { monogram: string; label: string }) {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.preloader !== "on") return;
    try {
      sessionStorage.setItem(PRELOADER_KEY, "1");
    } catch {
      // Storage can be unavailable (private mode); the preloader just shows again.
    }
    const lift = window.setTimeout(() => (root.dataset.preloader = "leaving"), 1400);
    const done = window.setTimeout(() => delete root.dataset.preloader, 2300);
    return () => {
      window.clearTimeout(lift);
      window.clearTimeout(done);
    };
  }, []);

  return (
    <div className="preloader" aria-hidden>
      <div className="grid justify-items-center gap-6">
        <svg viewBox="0 0 60 124" className="h-[min(28vh,12rem)] w-auto text-fg" fill="none">
          <rect
            className="preloader-outline"
            x="1"
            y="1"
            width="58"
            height="122"
            rx="10"
            stroke="currentColor"
            strokeWidth="1.2"
            pathLength={1}
          />
          <rect className="preloader-mark" x="22" y="6" width="16" height="4" rx="2" fill="currentColor" />
          <text
            className="preloader-mark"
            x="30"
            y="68"
            textAnchor="middle"
            fill="currentColor"
            style={{ font: "italic 400 18px var(--font-display)" }}
          >
            {monogram}
          </text>
        </svg>
        <p className="preloader-mark text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}
