import { intlLocale, type Locale } from "./config";

/** Prefixes a site path with the locale: localePath("en", "/projects") → "/en/projects". */
export function localePath(locale: Locale, path = ""): string {
  return `/${locale}${path}`;
}

/** Fills {placeholders} in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** "2024-01-01" → "Jan 2024". Dates are parsed as UTC so they never shift a month. */
export function formatMonth(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

export function formatMonthRange(
  start: string,
  end: string | null,
  locale: Locale,
  presentLabel: string,
): string {
  return `${formatMonth(start, locale)} – ${end ? formatMonth(end, locale) : presentLabel}`;
}
