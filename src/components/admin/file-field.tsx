"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileIcon, Loader2Icon, UploadIcon, XIcon } from "lucide-react";
import { uploadFile, uploadImage } from "@/lib/admin/upload";
import { mediaUrl, type StorageBucket } from "@/lib/supabase/storage";
import { Button } from "./ui/button";

/**
 * One uploaded file (portrait, CV, walkthrough video): shows what's there,
 * replaces or removes it. Images are compressed like gallery screenshots.
 */
export function FileField({
  label,
  hint,
  value,
  onChange,
  accept,
  bucket,
  folder,
  kind,
}: {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (path: string | null) => void;
  accept: string;
  bucket: StorageBucket;
  folder: string;
  kind: "image" | "file";
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const path = kind === "image" ? (await uploadImage(file, folder)).path : await uploadFile(file, bucket, folder);
      onChange(path);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const url = value ? mediaUrl(value, bucket) : null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
        {url && kind === "image" ? (
          // Plain img: an admin thumbnail doesn't need the optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-16 w-16 rounded-md object-cover" />
        ) : (
          <FileIcon className="size-5 text-muted-foreground" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          {url ? (
            <a href={url} target="_blank" rel="noopener" className="block truncate text-sm underline-offset-4 hover:underline">
              {value?.split("/").pop()}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing uploaded</p>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Loader2Icon className="animate-spin" /> : <UploadIcon />} {value ? "Replace" : "Upload"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(null)} aria-label={`Remove ${label.toLowerCase()}`}>
            <XIcon />
          </Button>
        )}
        <input
          ref={input}
          type="file"
          accept={accept}
          className="sr-only"
          tabIndex={-1}
          aria-label={label}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
