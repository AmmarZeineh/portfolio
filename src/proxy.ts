import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { DEFAULT_LOCALE, ENABLED_LOCALES, LOCALE_COOKIE, type Locale } from "@/i18n/config";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminSession(request);
  return localeRedirect(request);
}

/**
 * Redirects locale-less public paths to a locale ("/" → "/en" or "/ar"):
 * the language the visitor last switched to, else their browser's preference.
 */
function localeRedirect(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = ENABLED_LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const enabled = ENABLED_LOCALES.find((locale) => locale === saved);
  if (enabled) return enabled;

  // First language in Accept-Language order that we serve ("ar-SY,ar;q=0.9,en;q=0.8" → "ar").
  const accepted = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => {
      const [tag = "", q] = part.trim().split(";q=");
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  const match = accepted.find((a) => a.q > 0 && ENABLED_LOCALES.some((locale) => locale === a.lang));
  return ENABLED_LOCALES.find((locale) => locale === match?.lang) ?? DEFAULT_LOCALE;
}

/**
 * Keeps the Supabase session fresh on admin routes (refreshed tokens are
 * written back as cookies) and sends signed-out visitors to the login page.
 * Whether the user is actually an admin is checked in the pages and actions
 * (requireAdmin) and enforced by RLS; this is only the first, cheap gate.
 */
async function adminSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });

  // Verifies (and if needed refreshes) the session; local JWT check when possible.
  const { data } = await supabase.auth.getClaims();

  const isLogin = request.nextUrl.pathname === "/admin/login";
  if (!data?.claims?.sub && !isLogin) {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.search = "";
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  // Skip Next internals, API routes and files with an extension.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
