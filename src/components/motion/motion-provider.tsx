"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { detectMotionTier, type MotionTier } from "@/lib/motion/tier";

const MotionTierContext = createContext<MotionTier>("minimal");

/**
 * Detects the motion tier once on the client and re-evaluates when the
 * reduced-motion or pointer preference changes. Starts at "minimal" so the
 * server render and first paint never include heavy effects.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<MotionTier>("minimal");

  useEffect(() => {
    const update = () => setTier(detectMotionTier());
    update();
    const queries = ["(prefers-reduced-motion: reduce)", "(pointer: coarse)"].map((q) =>
      window.matchMedia(q),
    );
    for (const mq of queries) mq.addEventListener("change", update);
    return () => {
      for (const mq of queries) mq.removeEventListener("change", update);
    };
  }, []);

  return (
    <MotionTierContext.Provider value={tier}>
      <MotionConfig reducedMotion={tier === "reduced" ? "always" : "never"}>
        {children}
      </MotionConfig>
    </MotionTierContext.Provider>
  );
}

export function useMotionTier(): MotionTier {
  return useContext(MotionTierContext);
}
