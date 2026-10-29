import { NotFoundView } from "@/components/site/not-found-view";
import { LOCALES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

/**
 * 404 for anything under a locale (unknown project slugs included). Next
 * passes not-found no params, so both languages' copy goes to the client
 * view, which picks one from the layout's locale.
 */
export default async function NotFound() {
  const entries = await Promise.all(
    LOCALES.map(async (locale) => {
      const t = await getDictionary(locale);
      return [locale, { ...t.notFound, name: `${t.person.firstName} ${t.person.lastName}` }] as const;
    }),
  );
  return <NotFoundView copy={Object.fromEntries(entries) as Record<Locale, (typeof entries)[number][1]>} />;
}
