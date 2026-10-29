"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { MotionProvider } from "@/components/motion/motion-provider";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import type { Locale } from "@/i18n/config";
import { Cursor } from "./cursor";
import { LocaleProvider } from "./locale-context";

export function Providers({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <LocaleProvider locale={locale}>
      <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
        <MotionProvider>
          <SmoothScroll>
            {children}
            <RevealObserver />
            <Cursor />
          </SmoothScroll>
        </MotionProvider>
      </ThemeProvider>
    </LocaleProvider>
  );
}
