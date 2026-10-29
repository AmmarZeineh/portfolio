"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/**
 * The page's locale for client components that can't get it from params,
 * such as not-found (Next passes it no params).
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}
