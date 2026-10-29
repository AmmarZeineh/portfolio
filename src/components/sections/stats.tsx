import { Counter } from "@/components/motion/counter";
import { intlLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { pick, type Stat } from "@/lib/data/schemas";

export function Stats({ t, locale, stats }: { t: Dictionary; locale: Locale; stats: Stat[] }) {
  if (stats.length === 0) return null;

  return (
    <section aria-labelledby="stats-title" className="container-page pb-[var(--section-space)]">
      <h2 id="stats-title" className="sr-only">
        {t.stats.title}
      </h2>
      <dl className="grid grid-cols-2 border-t border-line md:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex flex-col-reverse gap-3 border-b border-line py-8 pe-4 md:border-b-0 md:not-first:border-s md:not-first:ps-8"
          >
            <dt className="max-w-[18ch] text-sm text-muted">{pick(stat.label, locale)}</dt>
            <dd className="font-display text-3xl">
              <Counter value={stat.value} suffix={stat.suffix} locale={intlLocale(locale)} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
