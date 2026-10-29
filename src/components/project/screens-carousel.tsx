"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PhoneFrame } from "@/components/device/phone-frame";
import { useScrollLock } from "@/components/motion/smooth-scroll";
import type { LightboxSlide } from "./gallery-lightbox";

const GalleryLightbox = dynamic(() => import("./gallery-lightbox"), { ssr: false });

type ScreensCarouselProps = {
  slides: LightboxSlide[];
  variant: "ios" | "android";
  labels: { expand: string; zoom: string; previous: string; next: string };
};

/**
 * Every screenshot in its own phone, in a swipeable scroll-snap row with
 * arrow buttons for pointer users. Selecting a phone opens the lightbox.
 */
export function ScreensCarousel({ slides, variant, labels }: ScreensCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const lockScroll = useScrollLock();

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const rtl = getComputedStyle(track).direction === "rtl";
    track.scrollBy({ left: direction * (rtl ? -1 : 1) * track.clientWidth * 0.8, behavior: "smooth" });
  };

  const show = (index: number | null) => {
    setOpen(index);
    lockScroll(index !== null);
  };

  return (
    <div>
      <div className="container-page mb-6 flex justify-end gap-2">
        <ArrowButton label={labels.previous} onClick={() => scrollBy(-1)} flip />
        <ArrowButton label={labels.next} onClick={() => scrollBy(1)} />
      </div>

      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-[clamp(1rem,3vw,3rem)] overflow-x-auto px-[var(--gutter)] pt-4 pb-10 [scrollbar-width:none]"
      >
        {slides.map((slide, i) => (
          <li key={slide.src} className="w-[min(58vw,17rem)] shrink-0 snap-start">
            <button
              type="button"
              onClick={() => show(i)}
              aria-label={labels.expand.replace("{index}", String(i + 1)).replace("{total}", String(slides.length))}
              data-cursor="view"
              data-cursor-label={labels.zoom}
              className="block w-full rounded-[15cqw] transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-2"
            >
              <PhoneFrame src={slide.src} alt={slide.alt} variant={variant} sizes="(min-width: 768px) 17rem, 58vw" />
            </button>
            {slide.caption && <p className="mt-4 text-center text-sm text-muted">{slide.caption}</p>}
          </li>
        ))}
      </ul>

      {open !== null && (
        <GalleryLightbox slides={slides} index={open} onClose={() => show(null)} onView={setOpen} />
      )}
    </div>
  );
}

function ArrowButton({ label, onClick, flip = false }: { label: string; onClick: () => void; flip?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-12 place-items-center rounded-full border border-line transition-colors hover:border-fg/60"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={`size-5 ${flip ? "-scale-x-100 rtl:scale-x-100" : "rtl:-scale-x-100"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
