import type { ReactNode } from "react";

/** One chapter of a case study: the heading holds its column while the text scrolls. */
export function CaseSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="container-page grid gap-6 py-[clamp(3rem,2rem+4vw,6rem)] md:grid-cols-12 md:gap-8">
      <h2 id={id} className="font-display text-2xl md:sticky md:top-[calc(var(--header-h)+2rem)] md:col-span-4 md:self-start">
        {title}
      </h2>
      <div className="md:col-span-8">{children}</div>
    </section>
  );
}
