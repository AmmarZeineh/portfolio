import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatMonthRange } from "@/i18n/format";
import { pick, type Experience } from "@/lib/data/schemas";
import { TimelineLine } from "./timeline-line";

export function ExperienceTimeline({
  t,
  locale,
  experience,
}: {
  t: Dictionary;
  locale: Locale;
  experience: Experience[];
}) {
  if (experience.length === 0) return null;

  return (
    <section id="experience" aria-labelledby="experience-title" className="container-page section-space">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <h2 id="experience-title" className="font-display text-3xl md:col-span-4">
          {t.experience.title}
        </h2>

        <div className="relative md:col-span-8">
          <TimelineLine className="absolute top-2 bottom-2 start-[0.3125rem]" />
          <ol className="space-y-16">
            {experience.map((item) => {
              const highlights = pick(item.highlights, locale);
              const description = pick(item.description, locale);
              return (
                <li key={item.id} className="relative ps-10 sm:ps-14">
                  <span
                    aria-hidden
                    className="absolute top-2 start-0 size-[0.6875rem] rounded-full border border-accent bg-bg"
                  />
                  <p className="text-sm text-muted">
                    {formatMonthRange(item.start_date, item.end_date, locale, t.experience.present)}
                  </p>
                  <h3 className="mt-2 font-display text-2xl">
                    {pick(item.role, locale)}, {item.company}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {[pick(item.employment_type, locale), pick(item.location, locale)]
                      .filter(Boolean)
                      .join(t.listSeparator)}
                  </p>
                  {description && <p className="mt-5 max-w-[60ch]">{description}</p>}
                  {highlights.length > 0 && (
                    <ul className="mt-5 max-w-[60ch] space-y-2 text-muted">
                      {highlights.map((highlight) => (
                        <li key={highlight} className="relative ps-5">
                          <span aria-hidden className="absolute top-[0.8em] start-0 h-px w-2.5 bg-current" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}
                  {item.is_confidential && (
                    <p className="mt-5 text-sm text-muted italic">{t.experience.confidential}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
