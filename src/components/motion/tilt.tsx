"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useMotionTier } from "./motion-provider";

type TiltProps = {
  children: ReactNode;
  /** Maximum rotation in degrees. */
  max?: number;
  /** Soft light that follows the pointer across the surface. */
  glare?: boolean;
  className?: string;
};

const SPRING = { stiffness: 160, damping: 20, mass: 0.5 };

/** 3D tilt toward the pointer ("full" tier only). */
export function Tilt({ children, max = 10, glare = true, className }: TiltProps) {
  const tier = useMotionTier();
  const ref = useRef<HTMLDivElement>(null);
  // Pointer position within the element, 0–1 on each axis.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), SPRING);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), SPRING);
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.16), transparent 55%)`;

  if (tier !== "full") {
    return <div className={className}>{children}</div>;
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div className={className} style={{ perspective: "1200px" }}>
      <motion.div
        ref={ref}
        className="relative h-full w-full"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerMove={onPointerMove}
        onPointerLeave={reset}
      >
        {children}
        {glare && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light"
            style={{ background: glareBg }}
          />
        )}
      </motion.div>
    </div>
  );
}
