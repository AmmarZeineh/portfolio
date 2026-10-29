import { PhoneFrame } from "@/components/device/phone-frame";
import { mediaUrl } from "@/lib/supabase/storage";

type ProjectVideoProps = {
  title: string;
  videoPath: string | null;
  videoUrl: string | null;
  variant: "ios" | "android";
};

/** YouTube/Vimeo id from a share or watch URL, if it is one. */
function embedUrl(url: string): string | null {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}?rel=0`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/**
 * An uploaded or direct video file plays inside a phone (screen recordings are
 * portrait); YouTube and Vimeo links embed at 16:9.
 */
export function ProjectVideo({ title, videoPath, videoUrl, variant }: ProjectVideoProps) {
  const embed = videoUrl ? embedUrl(videoUrl) : null;

  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-[2rem] bg-raised" data-cursor="hide">
        <iframe
          src={embed}
          title={title}
          className="size-full"
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  const file = videoPath ? mediaUrl(videoPath) : videoUrl;
  if (!file) return null;

  return (
    <div className="mx-auto w-[min(70vw,20rem)]" data-cursor="hide">
      <PhoneFrame alt={title} variant={variant}>
        <video src={file} controls playsInline preload="metadata" className="size-full object-cover" aria-label={title} />
      </PhoneFrame>
    </div>
  );
}
