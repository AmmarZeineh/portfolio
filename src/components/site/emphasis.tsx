import { Fragment } from "react";

/**
 * Renders admin-entered text where *words in asterisks* become <em>, so the
 * hero headline can carry an italic accent without storing HTML.
 */
export function Emphasis({ text }: { text: string }) {
  const parts = text.split(/\*([^*]+)\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>,
  );
}

/** The same text with the asterisks removed (for metadata and screen readers). */
export function stripEmphasis(text: string): string {
  return text.replace(/\*([^*]+)\*/g, "$1");
}
