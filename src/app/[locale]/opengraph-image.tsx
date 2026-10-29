import { DEFAULT_LOCALE } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Ammar Zeineh, Flutter / Mobile Engineer";
export const size = OG_SIZE;
export const contentType = "image/png";

// Share cards are always English: the image renderer (Satori) can't shape
// right-to-left Arabic text, so the Arabic pages share the English card.
export default async function Image() {
  const t = await getDictionary(DEFAULT_LOCALE);
  return ogCard({
    kicker: t.person.role,
    title: `${t.person.firstName} ${t.person.lastName}`,
    subtitle: t.meta.description,
  });
}
