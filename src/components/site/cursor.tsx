"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useMotionTier } from "@/components/motion/motion-provider";

/**
 * Cursor states, chosen from the nearest element under the pointer:
 * - [data-cursor="view"]  → large accent disc with a label ("View" by default)
 * - [data-cursor="image"] → medium ring that inverts what's beneath it
 * - a, button, [role=button], label, input → ring around the target
 * - [data-cursor="hide"]  → hidden (e.g. over the native video controls)
 * Override the label with data-cursor-label.
 */
type CursorState = "default" | "link" | "view" | "image" | "hide";

const SIZES: Record<CursorState, number> = {
  default: 10,
  link: 44,
  view: 96,
  image: 64,
  hide: 0,
};

const INTERACTIVE = "a, button, [role='button'], label, input, textarea, select, summary";

export function Cursor() {
  const tier = useMotionTier();
  const [state, setState] = useState<CursorState>("default");
  const [label, setLabel] = useState("View");
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  const active = tier === "full";
  const pathname = usePathname();

  // The element under the pointer is gone after a navigation; start fresh.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setState("default");
  }

  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    root.dataset.cursor = "on";

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);

      const target = event.target instanceof Element ? event.target : null;
      const tagged = target?.closest<HTMLElement>("[data-cursor]");
      const mode = tagged?.dataset.cursor;
      if (mode === "view" || mode === "image" || mode === "hide") {
        setState(mode);
        setLabel(tagged?.dataset.cursorLabel ?? "View");
      } else if (target?.closest(INTERACTIVE)) {
        setState("link");
      } else {
        setState("default");
      }
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      delete root.dataset.cursor;
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [active, x, y]);

  if (!active) return null;

  const size = SIZES[state];

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[10000]"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${
          state === "view"
            ? "bg-accent text-accent-ink"
            : state === "image"
              ? "border border-white bg-white mix-blend-difference"
              : state === "link"
                ? "border border-fg/60 bg-transparent"
                : "bg-fg"
        }`}
        animate={{ width: size, height: size, opacity: visible && state !== "hide" ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <AnimatePresence>
          {state === "view" && (
            <motion.span
              key="label"
              className="text-sm font-medium"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
