/**
 * How much motion a device gets:
 * - full:    smooth scroll, cursor, tilt, scroll storytelling
 * - minimal: touch / low-end / save-data. Native scroll, light reveals, no cursor or tilt
 * - reduced: prefers-reduced-motion. Opacity fades only
 */
export type MotionTier = "full" | "minimal" | "reduced";

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

export function detectMotionTier(): MotionTier {
  if (typeof window === "undefined") return "minimal";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced";

  const nav = navigator as NavigatorHints;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const lowCpu = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;
  const saveData = nav.connection?.saveData === true;

  return coarsePointer || lowCpu || lowMemory || saveData ? "minimal" : "full";
}

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1] as const;
