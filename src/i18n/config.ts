export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

/** Locales currently routed. */
export const ENABLED_LOCALES: readonly Locale[] = LOCALES;
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (ENABLED_LOCALES as readonly string[]).includes(value);
}

/** BCP 47 tag for Intl formatting. Arabic keeps Latin digits to match the display type. */
export function intlLocale(locale: Locale): string {
  return locale === "ar" ? "ar-SY-u-nu-latn" : "en-GB";
}

/** Cookie remembering the visitor's language choice (read by the proxy on "/"). */
export const LOCALE_COOKIE = "locale";

export function localeDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
