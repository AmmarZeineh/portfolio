import { notFound } from "next/navigation";

/** Any unmatched URL under a locale renders that locale's not-found page (with the site chrome). */
export default function CatchAll() {
  notFound();
}
