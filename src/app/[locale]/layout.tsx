import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope, Noto_Kufi_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { Grain } from "@/components/site/grain";
import { Preloader, preloaderScript } from "@/components/site/preloader";
import { Providers } from "@/components/site/providers";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ENABLED_LOCALES, isLocale, localeDir } from "@/i18n/config";
import { localePath } from "@/i18n/format";
import { siteUrl } from "@/lib/env";
import { languageAlternates } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import "@/styles/globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

// Arabic glyphs; Latin text keeps Manrope / Instrument Serif via the font stack.
// Its variable is only set on Arabic pages, so English pages never download it.
const kufi = Noto_Kufi_Arabic({
  variable: "--font-kufi",
  subsets: ["arabic"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0a09" },
    { media: "(prefers-color-scheme: light)", color: "#f2eee6" },
  ],
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  const name = `${t.person.firstName} ${t.person.lastName}`;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t.meta.title, template: `%s — ${name}` },
    description: t.meta.description,
    applicationName: name,
    authors: [{ name }],
    creator: name,
    alternates: { canonical: `/${locale}`, languages: languageAlternates("") },
    openGraph: {
      type: "website",
      siteName: name,
      locale: locale === "ar" ? "ar_SY" : "en_US",
      title: t.meta.title,
      description: t.meta.description,
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description },
    robots: { index: true, follow: true },
  };
}

export function generateStaticParams() {
  return ENABLED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={localeDir(locale)}
      data-theme="dark"
      className={`${manrope.variable} ${instrument.variable} ${locale === "ar" ? kufi.variable : ""} antialiased`}
      // next-themes rewrites data-theme before hydration
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preloaderScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <a
          href="#main"
          className="fixed top-3 start-3 z-[200] -translate-y-24 rounded-full bg-fg px-5 py-3 text-bg focus:translate-y-0"
        >
          {t.a11y.skipToContent}
        </a>
        <Providers locale={locale}>
          <SiteHeader
            locale={locale}
            homeHref={localePath(locale)}
            name={`${t.person.firstName} ${t.person.lastName}`}
            items={[
              { id: "work", label: t.nav.work },
              { id: "about", label: t.nav.about },
              { id: "experience", label: t.nav.experience },
              { id: "contact", label: t.nav.contact, href: localePath(locale, "/contact") },
            ]}
            labels={{
              home: t.a11y.home,
              primaryNav: t.a11y.primaryNav,
              openMenu: t.a11y.openMenu,
              closeMenu: t.a11y.closeMenu,
              toDark: t.a11y.themeToDark,
              toLight: t.a11y.themeToLight,
              switchTo: t.language.switchTo,
              switchLabel: t.language.switchLabel,
            }}
          />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter t={t} locale={locale} />
        </Providers>
        <Preloader
          monogram={`${t.person.firstName[0] ?? ""}${t.person.lastName[0] ?? ""}`}
          label={`${t.person.firstName} ${t.person.lastName}`}
        />
        <Grain />
      </body>
    </html>
  );
}
