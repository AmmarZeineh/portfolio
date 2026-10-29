"use client";

import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

export type LightboxSlide = {
  src: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
};

/** Full-screen screenshot viewer. Loaded on demand from ScreensCarousel. */
export default function GalleryLightbox({
  slides,
  index,
  onClose,
  onView,
}: {
  slides: LightboxSlide[];
  index: number;
  onClose: () => void;
  onView: (index: number) => void;
}) {
  return (
    <Lightbox
      open
      close={onClose}
      index={index}
      on={{ view: ({ index: current }) => onView(current) }}
      plugins={[Captions, Zoom]}
      captions={{ descriptionTextAlign: "center" }}
      slides={slides.map((slide) => ({
        src: slide.src,
        alt: slide.alt,
        width: slide.width,
        height: slide.height,
        description: slide.caption || undefined,
      }))}
      styles={{ container: { backgroundColor: "#070606" } }}
      controller={{ closeOnBackdropClick: true }}
    />
  );
}
