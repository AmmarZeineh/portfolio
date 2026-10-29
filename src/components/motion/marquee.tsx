import type { CSSProperties, ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  /** Seconds for one full loop. */
  duration?: number;
  reverse?: boolean;
  /** Accessible label; the visual loop is hidden from screen readers. */
  label?: string;
  className?: string;
};

/**
 * Infinite CSS marquee: the content is rendered twice and the track slides by
 * half its width. Pauses on hover/focus; stops entirely under reduced motion.
 * Direction flips automatically in RTL.
 */
export function Marquee({ children, duration = 40, reverse = false, label, className }: MarqueeProps) {
  const style = {
    "--marquee-duration": `${duration}s`,
  } as CSSProperties;

  return (
    <div
      className={`group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] ${className ?? ""}`}
      style={style}
      role={label ? "region" : undefined}
      aria-label={label}
    >
      <div
        className={`flex w-max shrink-0 animate-marquee group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none rtl:[--marquee-dir:-1] ${
          reverse ? "[animation-direction:reverse]" : ""
        }`}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
