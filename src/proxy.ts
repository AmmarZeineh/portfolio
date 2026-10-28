import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, ENABLED_LOCALES } from "@/i18n/config";

/** Redirects locale-less public paths to the default locale ("/" → "/en"). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = ENABLED_LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes, admin, and files with an extension.
  matcher: ["/((?!_next|api|admin|.*\\..*).*)"],
};
