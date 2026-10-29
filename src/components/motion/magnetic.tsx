"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useMotionTier } from "./motion-provider";

type MagneticProps = {
  children: ReactNode;
  /** 0–1: how far the element follows the pointer. */
  strength?: number;
  className?: string;
};

const SPRING = { stiffness: 220, damping: 18, mass: 0.6 };

/** Pulls its child toward the pointer while hovered ("full" tier only). */
export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const tier = useMotionTier();
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);

  if (tier !== "full") {
    return <div className={className}>{children}</div>;
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}
