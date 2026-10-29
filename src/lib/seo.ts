import type { Metadata } from "next";
import { DEFAULT_LOCALE, ENABLED_LOCALES, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

/**
 * Per-page metadata: title, description, canonical URL and the matching Open
 * Graph / Twitter text. Child openGraph objects replace the layout's, so the
 * shared fields are repeated here. Images come from opengraph-image files.
 */
export function pageMetadata({
  t,
  locale,
  path,
  title,
  description,
  type = "website",
}: {
  t: Dictionary;
  locale: Locale;
  /** Path after the locale, e.g. "/projects". */
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
}): Metadata {
  const name = `${t.person.firstName} ${t.person.lastName}`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}${path}`, languages: languageAlternates(path) },
    openGraph: {
      type,
      siteName: name,
      locale: locale === "ar" ? "ar_SY" : "en_US",
      url: `/${locale}${path}`,
      title: `${title} — ${name}`,
      description,
    },
    twitter: { card: "summary_large_image", title: `${title} — ${name}`, description },
  };
}

/** hreflang links for a path in every locale, with English as the default. */
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(ENABLED_LOCALES.map((l) => [l, `/${l}${path}`])),
    "x-default": `/${DEFAULT_LOCALE}${path}`,
  };
}

/** Serializes JSON-LD for a <script> tag, escaping "<" so content can't close the tag. */
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
