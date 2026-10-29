import type { CSSProperties } from "react";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitText } from "@/components/motion/split-text";
import { Emphasis } from "@/components/site/emphasis";
import { Button } from "@/components/ui-kit/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { pick, type SiteSettings } from "@/lib/data/schemas";
import { cvDownloadUrl } from "@/lib/supabase/storage";
import { HeroDevice, type HeroScreen } from "./hero-device";

type HeroProps = {
  t: Dictionary;
  locale: Locale;
  settings: SiteSettings;
  screens: HeroScreen[];
};

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/**
 * The name flanks the phone: first name at the reading start, last name at the
 * end, the device standing between them. Below md everything stacks and the
 * phone sits under the name.
 */
export function Hero({ t, locale, settings, screens }: HeroProps) {
  const headline = pick(settings.hero_headline, locale);
  const sub = pick(settings.hero_sub, locale);
  const location = pick(settings.location, locale);
  const role = pick(settings.role, locale) || t.person.role;

  return (
    <section className="relative isolate flex min-h-svh flex-col overflow-x-clip pt-[calc(var(--header-h)+1.5rem)] pb-10 md:pb-14">
      {/* Ambient accent glow behind the device */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[10%] left-1/2 -z-10 aspect-square w-[min(90vw,48rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
      />

      <div className="container-page relative flex flex-1 flex-col">
        <h1 className="type-display">
          <SplitText text={t.person.firstName} className="block" />
          <SplitText text={t.person.lastName} className="block text-end" delay={160} />
        </h1>

        <p
          className="fade-unit mt-4 text-sm text-muted md:absolute md:top-2 md:end-[var(--gutter)] md:mt-0 md:text-end"
          style={delay(500)}
        >
          <span className="text-fg">{role}</span>
          <br />
          {location}
        </p>

        <HeroDevice
          screens={screens}
          labels={{ open: t.hero.openProject, show: t.hero.showScreen }}
          className="relative z-10 mx-auto mt-10 w-[min(58vw,15rem)] md:absolute md:top-0 md:left-1/2 md:mt-0 md:w-[min(19vw,17rem)] md:-translate-x-1/2"
        />

        <div className="mt-14 grid gap-10 md:mt-auto md:grid-cols-[1fr_min(19vw,17rem)_1fr] md:items-end md:gap-12 md:pt-16">
          <p className="fade-unit max-w-[18ch] font-display text-2xl" style={delay(700)}>
            <Emphasis text={headline} />
          </p>

          <div className="fade-unit space-y-6 md:col-start-3 md:justify-self-end" style={delay(850)}>
            <p className="max-w-[36ch] text-muted">{sub}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Magnetic className="inline-block">
                <Button href="#work">{t.hero.seeWork}</Button>
              </Magnetic>
              {settings.cv_path ? (
                <Magnetic className="inline-block">
                  <Button
                    href={cvDownloadUrl(settings.cv_path)}
                    variant="outline"
                    target="_blank"
                    rel="noopener"
                    prefetch={false}
                  >
                    {t.about.downloadCv}
                  </Button>
                </Magnetic>
              ) : (
                <Magnetic className="inline-block">
                  <Button href="#contact" variant="outline">
                    {t.hero.getInTouch}
                  </Button>
                </Magnetic>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
