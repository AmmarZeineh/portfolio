export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

/** Locales currently routed. Arabic is switched on in Phase 7. */
export const ENABLED_LOCALES: readonly Locale[] = ["en"];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (ENABLED_LOCALES as readonly string[]).includes(value);
}

export function localeDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
