import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact/contact-form";
import { CopyEmail } from "@/components/contact/copy-email";
import { SplitText } from "@/components/motion/split-text";
import { LocalTime } from "@/components/site/local-time";
import { PageTransition } from "@/components/site/page-transition";
import { intlLocale, isLocale } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { getDictionary } from "@/i18n/get-dictionary";
import { getSiteSettings } from "@/lib/data/content";
import { pick, type Socials } from "@/lib/data/schemas";
import { pageMetadata } from "@/lib/seo";
import { cvDownloadUrl } from "@/lib/supabase/storage";

const SOCIAL_LABELS: Record<keyof Socials, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  whatsapp: "WhatsApp",
  x: "X",
};

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return pageMetadata({ t, locale, path: "/contact", title: t.contactPage.metaTitle, description: t.contactPage.metaDescription });
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [t, settings] = await Promise.all([getDictionary(locale), getSiteSettings()]);
  const location = pick(settings.location, locale);

  const socials = (Object.keys(SOCIAL_LABELS) as (keyof Socials)[]).flatMap((key) => {
    const href = settings.socials[key];
    return href ? [{ key, href, label: SOCIAL_LABELS[key] }] : [];
  });

  return (
    <PageTransition>
      <div className="relative isolate overflow-x-clip">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/3 start-[-20%] -z-10 aspect-square w-[min(120vw,64rem)] rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
        />
        <div className="container-page grid gap-16 pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[var(--section-space)] md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <h1 className="type-display">
              <SplitText text={t.contactPage.title} by="word" stagger={80} />
            </h1>
            <p className="mt-8 max-w-[34ch] text-lg text-muted">{t.contactPage.intro}</p>

            <div className="mt-14 space-y-6 border-t border-line pt-8">
              <p className="text-sm text-muted">{t.contactPage.direct}</p>
              {settings.email && (
                <p className="text-lg">
                  <CopyEmail email={settings.email} labels={{ copy: t.contactPage.copyEmail, copied: t.contactPage.copied }} />
                </p>
              )}
              {socials.length > 0 && (
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {socials.map((social) => (
                    <li key={social.key}>
                      <a href={social.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {settings.cv_path && (
                <p>
                  <a href={cvDownloadUrl(settings.cv_path)} className="link-underline">
                    {t.contactPage.downloadCv}
                  </a>
                </p>
              )}
              {location && (
                <p className="text-sm text-muted">
                  {fill(t.contactPage.basedIn, { location })}{" "}
                  <LocalTime timeZone="Asia/Damascus" locale={intlLocale(locale)} template={t.contactPage.localTime} />
                </p>
              )}
            </div>
          </div>

          <div className="md:col-span-6 md:col-start-7 md:pt-4">
            <ContactForm labels={t.contactPage} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
