import "server-only";
import type { AdminContext } from "./auth";

/** Placeholders ("/placeholders/…") and external URLs aren't Storage objects. */
export const isStoragePath = (path: string | null | undefined): path is string =>
  Boolean(path) && !path!.startsWith("/") && !/^https?:\/\//.test(path!);

/**
 * Deletes Storage objects that nothing points at any more. Duplicated projects
 * share image files, so a path is only removed once no row references it.
 * Best effort: a failure leaves an orphaned file, never a broken page.
 */
export async function removeUnreferencedMedia(supabase: AdminContext["supabase"], paths: (string | null | undefined)[]) {
  const candidates = [...new Set(paths.filter(isStoragePath))];
  if (candidates.length === 0) return;

  const [images, covers, videos, settings] = await Promise.all([
    supabase.from("project_images").select("path").in("path", candidates),
    supabase.from("projects").select("cover_path").in("cover_path", candidates),
    supabase.from("projects").select("video_path").in("video_path", candidates),
    supabase.from("site_settings").select("photo_path").in("photo_path", candidates),
  ]);
  const used = new Set([
    ...(images.data ?? []).map((r) => r.path),
    ...(covers.data ?? []).map((r) => r.cover_path),
    ...(videos.data ?? []).map((r) => r.video_path),
    ...(settings.data ?? []).map((r) => r.photo_path),
  ]);

  const orphans = candidates.filter((path) => !used.has(path));
  if (orphans.length) await supabase.storage.from("media").remove(orphans);
}
