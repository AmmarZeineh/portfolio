"use client";

import { useEffect, useRef, type CSSProperties, type ElementType } from "react";
import { revealWords } from "@/lib/motion/words";

type LineRevealProps = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Delay between lines in ms. */
  stagger?: number;
};

/**
 * Reveals a paragraph line by line as it scrolls into view. Words are measured
 * after layout and grouped into visual lines (re-measured on resize), then each
 * word gets its line index so the CSS reveal staggers per line, not per word.
 */
export function LineReveal({ text, as: Tag = "p", className, stagger = 90 }: LineRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const words = revealWords(text);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const assignLines = () => {
      const units = root.querySelectorAll<HTMLElement>("[data-word]");
      let line = -1;
      let lastTop = Number.NEGATIVE_INFINITY;
      for (const unit of units) {
        const top = unit.offsetTop;
        if (top > lastTop + 2) {
          line += 1;
          lastTop = top;
        }
        unit.style.setProperty("--i", String(line));
      }
      root.setAttribute("data-measured", "");
    };

    assignLines();
    const resize = new ResizeObserver(assignLines);
    resize.observe(root);
    return () => resize.disconnect();
  }, [text]);

  return (
    <Tag
      ref={ref}
      className={className}
      // Content may fall back to English on Arabic pages; let the text pick its direction.
      dir="auto"
      data-reveal=""
      // RevealObserver may tag [data-inview] before this subtree hydrates
      suppressHydrationWarning
      style={{ "--stagger": `${stagger}ms` } as CSSProperties}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={i}>
            <span className="split-mask">
              <span data-word className="split-unit">
                {word}
              </span>
            </span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </span>
    </Tag>
  );
}
