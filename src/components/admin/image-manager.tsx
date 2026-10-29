"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ImagePlusIcon, Loader2Icon, StarIcon, Trash2Icon } from "lucide-react";
import type { ProjectFormValues } from "@/lib/admin/schemas";
import { uploadImage } from "@/lib/admin/upload";
import { isUnoptimizable, mediaUrl } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import { MoveButtons } from "./fields";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

/**
 * Gallery editor: drop or pick several images (compressed to WebP in the
 * browser and uploaded straight to Storage), reorder them, write captions and
 * alt text in both languages, and choose which one is the cover.
 */
export function ImageManager({ folder }: { folder: string }) {
  const { control, register, getValues, setValue } = useFormContext<ProjectFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "images", keyName: "key" });
  const cover = useWatch({ control, name: "cover_path" });
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const addFiles = async (files: FileList | File[]) => {
    const list = [...files].filter((file) => file.type.startsWith("image/"));
    if (list.length === 0) return;
    setUploading((n) => n + list.length);
    await Promise.all(
      list.map(async (file) => {
        try {
          const uploaded = await uploadImage(file, folder);
          append({ ...uploaded, caption: { en: "", ar: "" }, alt: { en: "", ar: "" } });
          if (!getValues("cover_path")) setValue("cover_path", uploaded.path, { shouldDirty: true });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : `Couldn't upload ${file.name}`);
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  };

  const removeAt = (index: number) => {
    const path = fields[index]?.path;
    remove(index);
    if (path && path === cover) {
      const next = fields.find((_, i) => i !== index)?.path ?? null;
      setValue("cover_path", next, { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors",
          dragOver && "border-brand bg-brand/5",
        )}
      >
        <ImagePlusIcon className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm">Drop screenshots here, or</p>
        <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
          Choose images
        </Button>
        <p className="text-xs text-muted-foreground">Converted to WebP and resized to 2400px before upload.</p>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {uploading > 0 && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
            <Loader2Icon className="size-3.5 animate-spin" /> Uploading {uploading}…
          </p>
        )}
      </div>

      {fields.length > 0 && (
        <ul className="space-y-3">
          {fields.map((field, i) => {
            const isCover = field.path === cover;
            return (
              <li key={field.key} className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row">
                <div className="relative h-40 w-[74px] shrink-0 self-center overflow-hidden rounded-lg bg-muted sm:self-start">
                  <Image
                    src={mediaUrl(field.path)}
                    alt=""
                    fill
                    sizes="74px"
                    unoptimized={isUnoptimizable(field.path)}
                    className="object-cover object-top"
                  />
                  {isCover && (
                    <span className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-center text-[10px] text-white">Cover</span>
                  )}
                </div>
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <Input placeholder="Caption (English)" aria-label={`Image ${i + 1} caption, English`} {...register(`images.${i}.caption.en`)} />
                  <Input dir="rtl" placeholder="Caption (Arabic)" aria-label={`Image ${i + 1} caption, Arabic`} {...register(`images.${i}.caption.ar`)} />
                  <Input placeholder="Alt text: what the screen shows" aria-label={`Image ${i + 1} alt text, English`} {...register(`images.${i}.alt.en`)} />
                  <Input dir="rtl" placeholder="Alt text (Arabic)" aria-label={`Image ${i + 1} alt text, Arabic`} {...register(`images.${i}.alt.ar`)} />
                </div>
                <div className="flex items-center justify-end gap-1 sm:flex-col sm:justify-start">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-pressed={isCover}
                    aria-label={`Use image ${i + 1} as the cover`}
                    title="Use as cover"
                    onClick={() => setValue("cover_path", field.path, { shouldDirty: true })}
                  >
                    <StarIcon className={cn(isCover && "fill-amber-400 text-amber-400")} />
                  </Button>
                  <MoveButtons index={i} count={fields.length} onMove={move} label="Image" />
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove image ${i + 1}`} onClick={() => removeAt(i)}>
                    <Trash2Icon />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
