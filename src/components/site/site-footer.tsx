import { intlLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { BackToTop } from "./back-to-top";
import { LocalTime } from "./local-time";

export function SiteFooter({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <footer className="border-t border-line">
      <div className="container-page flex flex-col gap-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {t.person.firstName} {t.person.lastName}
        </p>
        <p>
          <LocalTime timeZone="Asia/Damascus" locale={intlLocale(locale)} template={t.footer.localTime} />
        </p>
        <div>
          <BackToTop label={t.footer.backToTop} />
        </div>
      </div>
    </footer>
  );
}
