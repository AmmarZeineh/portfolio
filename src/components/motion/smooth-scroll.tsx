"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useMotionTier } from "./motion-provider";

const LenisContext = createContext<RefObject<Lenis | null>>({ current: null });

/**
 * Lenis smooth scrolling on the "full" tier only, driven by GSAP's ticker so
 * ScrollTrigger and Lenis share one animation frame.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const tier = useMotionTier();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (tier !== "full") return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = lenis;

    // Same-page hash links glide instead of jumping. Capture phase, so this
    // runs before next/link, which then sees defaultPrevented and stands down.
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href*='#']") : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { duration: 1.4, force: true });
      history.pushState(history.state, "", url.hash);
    };
    window.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("click", onClick, true);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [tier]);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}

/** Scroll to an element or offset, smoothly when Lenis is active. */
export function useScrollTo() {
  const lenisRef = useContext(LenisContext);
  return (target: string | HTMLElement | number) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.4 });
      return;
    }
    if (typeof target === "number") {
      window.scrollTo({ top: target });
    } else {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      el?.scrollIntoView();
    }
  };
}

/** Pause/resume page scrolling (e.g. while a lightbox or menu is open). */
export function useScrollLock() {
  const lenisRef = useContext(LenisContext);
  return (locked: boolean) => {
    const lenis = lenisRef.current;
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    }
    document.documentElement.style.overflow = locked ? "hidden" : "";
  };
}
