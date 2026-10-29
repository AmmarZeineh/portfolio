"use client";

import { PhoneFrame } from "@/components/device/phone-frame";
import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui-kit/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { localePath } from "@/i18n/format";
import { useLocale } from "./locale-context";

type Copy = Dictionary["notFound"] & { name: string };

/** A phone with nothing on its screen but an empty-state wireframe, still loading. */
export function NotFoundView({ copy }: { copy: Record<Locale, Copy> }) {
  const locale = useLocale();
  const t = copy[locale];

  return (
    <div className="container-page grid min-h-svh items-center gap-12 pt-[calc(var(--header-h)+3rem)] pb-16 md:grid-cols-12 md:gap-8">
      <title>{`${t.title} — ${t.name}`}</title>
      <div className="md:col-span-7">
        <p className="font-display text-[clamp(6rem,3rem+14vw,16rem)] leading-[0.8] text-muted/40" aria-hidden>
          404
        </p>
        <h1 className="mt-6 max-w-[16ch] font-display text-3xl">{t.title}</h1>
        <p className="mt-6 max-w-[40ch] text-lg text-muted">{t.body}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Magnetic className="inline-block">
            <Button href={localePath(locale)}>{t.home}</Button>
          </Magnetic>
          <Magnetic className="inline-block">
            <Button href={localePath(locale, "/projects")} variant="outline">
              {t.projects}
            </Button>
          </Magnetic>
        </div>
      </div>

      <div className="mx-auto w-[min(56vw,16rem)] md:col-span-5">
        <PhoneFrame alt="" glow="var(--accent)">
          <div aria-hidden className="flex size-full flex-col gap-[6cqw] bg-raised p-[8cqw] pt-[22cqw]">
            <span className="h-[4cqw] w-1/2 animate-pulse rounded-full bg-fg/15" />
            <span className="aspect-[4/3] w-full animate-pulse rounded-[6cqw] bg-fg/10" />
            {[0, 1, 2].map((row) => (
              <span key={row} className="flex items-center gap-[4cqw]">
                <span className="size-[12cqw] shrink-0 animate-pulse rounded-[3cqw] bg-fg/10" />
                <span className="h-[3.5cqw] flex-1 animate-pulse rounded-full bg-fg/10" />
              </span>
            ))}
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
}
