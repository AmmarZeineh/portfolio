import { Magnetic } from "@/components/motion/magnetic";
import { SplitText } from "@/components/motion/split-text";
import { Button } from "@/components/ui-kit/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { localePath } from "@/i18n/format";
import type { SiteSettings, Socials } from "@/lib/data/schemas";

const SOCIAL_LABELS: Record<keyof Socials, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  x: "X",
};

export function ContactCta({ t, locale, settings }: { t: Dictionary; locale: Locale; settings: SiteSettings }) {
  const socials = (Object.keys(SOCIAL_LABELS) as (keyof Socials)[]).flatMap((key) => {
    const href = settings.socials[key];
    return href ? [{ key, href, label: SOCIAL_LABELS[key] }] : [];
  });

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative isolate overflow-hidden border-t border-line section-space"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/2 left-1/2 -z-10 aspect-square w-[min(120vw,80rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
      />
      <div className="container-page">
        <h2 id="contact-title" className="font-display text-3xl md:text-[clamp(3.5rem,1rem+7vw,9rem)] md:leading-[0.92]">
          <SplitText text={t.contact.lineOne} by="word" inView stagger={60} className="block" />
          <SplitText text={t.contact.lineTwo} by="word" inView delay={240} stagger={60} className="block text-muted" />
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-2 md:items-end">
          <p className="max-w-[44ch] text-lg text-muted">{t.contact.body}</p>

          <div className="flex flex-col gap-6 md:items-end">
            <Magnetic className="inline-block">
              <Button href={localePath(locale, "/contact")}>{t.contact.startProject}</Button>
            </Magnetic>
            {settings.email && (
              <p className="text-sm text-muted">
                {t.contact.orEmail}{" "}
                <a href={`mailto:${settings.email}`} className="link-underline text-fg">
                  {settings.email}
                </a>
              </p>
            )}
            {socials.length > 0 && (
              <ul className="flex flex-wrap gap-6 text-sm">
                {socials.map((social) => (
                  <li key={social.key}>
                    <a href={social.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
