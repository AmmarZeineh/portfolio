import { Fragment, type CSSProperties, type ElementType } from "react";
import { hasArabic, revealWords } from "@/lib/motion/words";

type SplitTextProps = {
  text: string;
  as?: ElementType;
  /** "char" for display type; "word" for longer text and always for Arabic. */
  by?: "char" | "word";
  /** Base delay in ms before the first unit animates. */
  delay?: number;
  /** Delay between units in ms. */
  stagger?: number;
  /** Wait until scrolled into view (uses RevealObserver). */
  inView?: boolean;
  className?: string;
};

/**
 * Masked rise-in reveal, split by character or word. Pure CSS animation, so it
 * renders on the server and runs before hydration. Screen readers get the
 * whole string once; the split spans are hidden from them.
 */
export function SplitText({
  text,
  as: Tag = "span",
  by = "char",
  delay = 0,
  stagger,
  inView = false,
  className,
}: SplitTextProps) {
  const words = revealWords(text);
  // Arabic letters join, so splitting a word into characters would break the script.
  const unit = hasArabic(text) ? "word" : by;
  let index = 0;

  const style = {
    "--delay": `${delay}ms`,
    ...(stagger !== undefined && { "--stagger": `${stagger}ms` }),
  } as CSSProperties;

  return (
    <Tag
      className={className}
      // Content may fall back to English on Arabic pages; let the text pick its direction.
      dir="auto"
      style={style}
      data-reveal={inView ? "" : undefined}
      // RevealObserver may tag [data-inview] before this subtree hydrates
      suppressHydrationWarning
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, w) => (
          <Fragment key={w}>
            <span className="inline-block whitespace-nowrap">
              {unit === "word" ? (
                <span className="split-mask">
                  <span className="split-unit" style={{ "--i": index++ } as CSSProperties}>
                    {word}
                  </span>
                </span>
              ) : (
                [...word].map((char, c) => (
                  <span key={c} className="split-mask">
                    <span className="split-unit" style={{ "--i": index++ } as CSSProperties}>
                      {char}
                    </span>
                  </span>
                ))
              )}
            </span>
            {w < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
