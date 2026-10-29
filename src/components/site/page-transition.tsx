import { ViewTransition, type ReactNode } from "react";

/**
 * Wraps a page so route changes crossfade it (outgoing page lifts away, the
 * new one settles in). Put it in each page, not a layout: layouts persist
 * across navigations, so their enter/exit never fire. Shared elements such as
 * a project's phone morph on top of this via their own named transitions.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
