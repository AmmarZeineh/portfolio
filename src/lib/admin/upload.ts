"use client";

import { createBrowserSupabase } from "@/lib/supabase/client";

export type UploadedImage = { path: string; width: number; height: number };

const MAX_EDGE = 2400;

/**
 * Downscales an image so its longest edge is at most 2400px and re-encodes it
 * as WebP in the browser, before it ever leaves the device. Browsers that
 * can't encode WebP (canvas falls back to PNG) get a high-quality JPEG instead.
 */
async function compress(file: File): Promise<{ blob: Blob; width: number; height: number; ext: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser can't process images.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const encode = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  const webp = await encode("image/webp", 0.86);
  if (webp?.type === "image/webp") return { blob: webp, width, height, ext: "webp" };
  const jpeg = await encode("image/jpeg", 0.88);
  if (!jpeg) throw new Error("Couldn't encode the image.");
  return { blob: jpeg, width, height, ext: "jpg" };
}

/** Compresses and uploads an image to the `media` bucket under `folder/`. */
export async function uploadImage(file: File, folder: string): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} isn't an image.`);
  // SVGs are already tiny and would lose their sharpness as a bitmap.
  const isSvg = file.type === "image/svg+xml";
  const { blob, width, height, ext } = isSvg
    ? { blob: file, width: 1179, height: 2556, ext: "svg" }
    : await compress(file);

  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await createBrowserSupabase()
    .storage.from("media")
    .upload(path, blob, { contentType: blob.type || file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return { path, width, height };
}

/** Uploads a file as-is (videos to `media`, the CV to `cv`). */
export async function uploadFile(file: File, bucket: "media" | "cv", folder: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await createBrowserSupabase()
    .storage.from(bucket)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message);
  return path;
}
