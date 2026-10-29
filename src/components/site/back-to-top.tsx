"use client";

import { useScrollTo } from "@/components/motion/smooth-scroll";

export function BackToTop({ label }: { label: string }) {
  const scrollTo = useScrollTo();
  return (
    <button
      type="button"
      className="link-underline"
      onClick={() => {
        scrollTo(0);
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
    >
      {label}
    </button>
  );
}
