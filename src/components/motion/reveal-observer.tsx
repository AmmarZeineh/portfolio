"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One IntersectionObserver for the whole page: marks every [data-reveal]
 * element with [data-inview] the first time it enters the viewport, which
 * un-pauses its CSS reveal animations. Re-scans on navigation.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-inview", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    const observeAll = () => {
      for (const el of document.querySelectorAll("[data-reveal]:not([data-inview])")) {
        observer.observe(el);
      }
    };
    observeAll();

    // Content streamed in later (Suspense) gets picked up too.
    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
