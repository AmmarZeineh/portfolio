import { publicEnv } from "@/lib/env";

export type StorageBucket = "media" | "cv";

/**
 * Resolves a stored media path to a URL.
 * - Absolute URLs and site-relative paths ("/placeholders/x.svg") pass through.
 * - Anything else is a Storage object key in the given bucket.
 */
export function mediaUrl(path: string, bucket: StorageBucket = "media"): string {
  if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
  const base = publicEnv().NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

/** Local SVG placeholders bypass the image optimizer. */
export function isUnoptimizable(path: string): boolean {
  return path.endsWith(".svg");
}

/** CV link that downloads with a readable filename instead of the stored key. */
export function cvDownloadUrl(path: string): string {
  const url = mediaUrl(path, "cv");
  return url.includes("/storage/v1/object/public/") ? `${url}?download=Ammar-Zeineh-CV.pdf` : url;
}
