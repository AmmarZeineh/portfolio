import Image from "next/image";
import { LineReveal } from "@/components/motion/line-reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/parallax";
import { Button } from "@/components/ui-kit/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { pick, type SiteSettings } from "@/lib/data/schemas";
import { cvDownloadUrl, isUnoptimizable, mediaUrl } from "@/lib/supabase/storage";

/** Portrait stays put (sticky) while the story scrolls past it on wide screens. */
export function About({ t, locale, settings }: { t: Dictionary; locale: Locale; settings: SiteSettings }) {
  const paragraphs = pick(settings.about, locale).split(/\n{2,}/).filter(Boolean);
  const languages = pick(settings.languages, locale);
  const facts = [
    { label: t.about.basedIn, value: pick(settings.location, locale) },
    { label: t.about.education, value: pick(settings.education, locale) },
    { label: t.about.languages, value: languages.join(t.listSeparator) },
  ].filter((fact) => fact.value);

  return (
    <section id="about" aria-labelledby="about-title" className="container-page section-space">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        {settings.photo_path && (
          <div className="md:col-span-4">
            <div className="md:sticky md:top-[calc(var(--header-h)+2rem)]">
              <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] bg-raised">
                <Parallax speed={14} className="absolute inset-x-0 -top-[8%] h-[116%]">
                  <Image
                    src={mediaUrl(settings.photo_path)}
                    alt={t.about.portraitAlt}
                    fill
                    sizes="(min-width: 768px) 24rem, 90vw"
                    unoptimized={isUnoptimizable(settings.photo_path)}
                    className="object-cover"
                  />
                </Parallax>
              </div>
            </div>
          </div>
        )}

        <div className="md:col-span-7 md:col-start-6">
          <h2 id="about-title" className="font-display text-3xl">
            {t.about.title}
          </h2>

          <div className="mt-10 space-y-6">
            {paragraphs.map((paragraph, i) => (
              <LineReveal
                key={i}
                text={paragraph}
                className={i === 0 ? "max-w-[34ch] text-xl" : "max-w-[60ch] text-lg text-muted"}
              />
            ))}
          </div>

          <dl className="mt-14 grid gap-8 border-t border-line pt-8 sm:grid-cols-3">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-sm text-muted">{fact.label}</dt>
                <dd className="mt-1">{fact.value}</dd>
              </div>
            ))}
          </dl>

          {settings.cv_path && (
            <Magnetic className="mt-10 inline-block">
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
          )}
        </div>
      </div>
    </section>
  );
}
