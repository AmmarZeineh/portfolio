"use client";

import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Runs GSAP setup inside a gsap.context scoped to `scope`, and reverts every
 * tween and ScrollTrigger it created on cleanup or when deps change.
 */
export function useGsap(
  setup: (ctx: gsap.Context) => void,
  deps: DependencyList,
  scope?: RefObject<Element | null>,
) {
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context((self) => setup(self), scope?.current ?? undefined);
    return () => ctx.revert();
  }, deps);
}
