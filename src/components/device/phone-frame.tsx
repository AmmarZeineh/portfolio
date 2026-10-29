import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { isUnoptimizable, mediaUrl } from "@/lib/supabase/storage";

type PhoneFrameProps = {
  /** Storage path, site path or URL of the screenshot. */
  src?: string | null;
  alt: string;
  variant?: "ios" | "android";
  /** Colored glow beneath the device (usually the project accent). */
  glow?: string;
  /** Load the screenshot eagerly at high priority (above-the-fold devices). */
  priority?: boolean;
  /** Passed to next/image; describe the rendered width of the frame. */
  sizes?: string;
  className?: string;
  /** Render custom screen content instead of an image. */
  children?: ReactNode;
};

/**
 * A realistic phone, drawn in CSS. Every measurement is in container-query
 * units (cqw) so the rim, island and radii scale with whatever width the frame
 * is given. Screen aspect matches a 1179×2556 screenshot.
 */
export function PhoneFrame({
  src,
  alt,
  variant = "ios",
  glow,
  priority = false,
  sizes = "(min-width: 1024px) 22rem, 60vw",
  className,
  children,
}: PhoneFrameProps) {
  return (
    <div
      className={`relative [container-type:inline-size] ${className ?? ""}`}
      style={glow ? ({ "--device-glow": glow } as CSSProperties) : undefined}
    >
      {glow && (
        <div
          aria-hidden
          className="absolute inset-x-[8%] top-[18%] bottom-[-4%] rounded-[30cqw] opacity-50 blur-[14cqw] transition-[background-color] duration-700"
          style={{ backgroundColor: "var(--device-glow)" }}
        />
      )}

      {/* Side buttons */}
      <span aria-hidden className="absolute top-[18%] left-[-0.9cqw] h-[6%] w-[1.2cqw] rounded-l-[1cqw] bg-[var(--device-edge)]" />
      <span aria-hidden className="absolute top-[27%] left-[-0.9cqw] h-[10%] w-[1.2cqw] rounded-l-[1cqw] bg-[var(--device-edge)]" />
      <span aria-hidden className="absolute top-[24%] right-[-0.9cqw] h-[14%] w-[1.2cqw] rounded-r-[1cqw] bg-[var(--device-edge)]" />

      {/* Body: a metallic rim around a dark bezel */}
      <div
        className="relative aspect-[1179/2556] rounded-[15cqw] p-[0.9cqw] shadow-[0_4cqw_10cqw_-2cqw_rgb(0_0_0/0.55),0_1cqw_2cqw_rgb(0_0_0/0.3)]"
        style={{
          background:
            "linear-gradient(145deg, #5b5650 0%, #2a2724 22%, #1a1816 50%, #2a2724 78%, #6a645d 100%)",
        }}
      >
        <div className="relative h-full w-full rounded-[14.2cqw] bg-[var(--device-bezel)] p-[3.2cqw]">
          <div className="relative h-full w-full overflow-hidden rounded-[11.4cqw] bg-black">
            {children ??
              (src ? (
                <Image
                  src={mediaUrl(src)}
                  alt={alt}
                  fill
                  sizes={sizes}
                  loading={priority ? "eager" : "lazy"}
                  fetchPriority={priority ? "high" : "auto"}
                  unoptimized={isUnoptimizable(src)}
                  className="object-cover object-top"
                />
              ) : (
                <div className="h-full w-full bg-raised" role="img" aria-label={alt} />
              ))}

            {/* Camera */}
            {variant === "ios" ? (
              <span aria-hidden className="absolute top-[2.4cqw] left-1/2 h-[7.8cqw] w-[27cqw] -translate-x-1/2 rounded-full bg-black" />
            ) : (
              <span aria-hidden className="absolute top-[3cqw] left-1/2 size-[5.2cqw] -translate-x-1/2 rounded-full bg-black ring-[0.6cqw] ring-neutral-900" />
            )}

            {/* Glass reflection */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(115deg,rgb(255_255_255/0.10)_0%,rgb(255_255_255/0.02)_32%,transparent_33%)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
