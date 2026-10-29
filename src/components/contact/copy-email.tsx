"use client";

import { useState } from "react";

/** The email as a mailto link, plus a button that copies it (handy on desktops without a mail app). */
export function CopyEmail({ email, labels }: { email: string; labels: { copy: string; copied: string } }) {
  const [copied, setCopied] = useState(false);

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <a href={`mailto:${email}`} className="link-underline">
        {email}
      </a>
      <button
        type="button"
        className="text-sm text-muted transition-colors hover:text-fg"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            // Clipboard can be blocked; the mailto link still works.
          }
        }}
      >
        <span aria-live="polite">{copied ? labels.copied : labels.copy}</span>
      </button>
    </span>
  );
}
