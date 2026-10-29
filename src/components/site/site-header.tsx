"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useScrollLock } from "@/components/motion/smooth-scroll";
import { EASE_OUT_EXPO } from "@/lib/motion/tier";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { ThemeToggle } from "./theme-toggle";

/** A home-page section (id) or, with href, its own page. */
export type NavItem = { id: string; label: string; href?: string };

type SiteHeaderProps = {
  locale: Locale;
  homeHref: string;
  name: string;
  items: NavItem[];
  labels: {
    home: string;
    primaryNav: string;
    openMenu: string;
    closeMenu: string;
    toDark: string;
    toLight: string;
    switchTo: string;
    switchLabel: string;
  };
};

/**
 * Fixed header that tucks away while scrolling down and returns on scroll up.
 * Section links are plain hash links on the home page (SmoothScroll animates
 * them) and route links elsewhere. Below md the links move into a full-screen
 * menu dialog.
 */
export function SiteHeader({ locale, homeHref, name, items, labels }: SiteHeaderProps) {
  const pathname = usePathname();
  const onHome = pathname === homeHref;
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      setHidden(y > 160 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hrefFor = (item: NavItem) => item.href ?? (onHome ? `#${item.id}` : `${homeHref}#${item.id}`);

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className={`fixed inset-x-0 top-0 z-50 transition-[translate] duration-500 ease-[var(--ease-out-expo)] ${
        hidden && !open ? "-translate-y-full" : ""
      }`}
    >
      {/* Frosted background. The blur layer always exists and only its opacity
          changes: toggling backdrop-filter itself makes Safari flash the header. */}
      <div
        aria-hidden
        className={`absolute inset-0 -z-10 border-b border-line bg-bg/75 backdrop-blur-md transition-opacity duration-500 ease-[var(--ease-out-expo)] ${
          scrolled && !open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href={homeHref} aria-label={labels.home} className="relative z-10 font-display text-xl">
          {name}
        </Link>

        <nav aria-label={labels.primaryNav} className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm">
            {items.map((item) => (
              <li key={item.id}>
                <NavLink href={hrefFor(item)} onHome={onHome && !item.href} className="link-underline py-2">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative z-10 flex items-center gap-1">
          <LanguageSwitch locale={locale} pathname={pathname} label={labels.switchTo} ariaLabel={labels.switchLabel} />
          <ThemeToggle labels={{ toDark: labels.toDark, toLight: labels.toLight }} />
          <MenuButton open={open} onToggle={() => setOpen((v) => !v)} labels={labels} />
        </div>
      </div>

      <MobileMenu
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        hrefFor={hrefFor}
        onHome={onHome}
      />
    </header>
  );
}

/** Same page in the other language; the choice is remembered for visits to "/". */
function LanguageSwitch({
  locale,
  pathname,
  label,
  ariaLabel,
}: {
  locale: Locale;
  pathname: string;
  label: string;
  ariaLabel: string;
}) {
  const target: Locale = locale === "ar" ? "en" : "ar";
  const href = `/${target}${pathname.replace(/^\/[^/]+/, "")}`;
  return (
    <Link
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={ariaLabel}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={`grid h-11 place-items-center rounded-full px-3 text-sm transition-colors hover:bg-fg/8 ${
        target === "ar" ? "font-arabic" : ""
      }`}
    >
      {label}
    </Link>
  );
}

function NavLink({
  href,
  onHome,
  className,
  onClick,
  children,
}: {
  href: string;
  onHome: boolean;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return onHome ? (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

function MenuButton({
  open,
  onToggle,
  labels,
}: {
  open: boolean;
  onToggle: () => void;
  labels: { openMenu: string; closeMenu: string };
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="mobile-menu"
      aria-label={open ? labels.closeMenu : labels.openMenu}
      className="grid size-11 place-items-center rounded-full transition-colors hover:bg-fg/8 md:hidden"
    >
      <span aria-hidden className="relative block h-3 w-6">
        <span
          className={`absolute inset-x-0 h-px bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] ${
            open ? "top-1/2 rotate-45" : "top-0"
          }`}
        />
        <span
          className={`absolute inset-x-0 h-px bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] ${
            open ? "top-1/2 -rotate-45" : "bottom-0"
          }`}
        />
      </span>
    </button>
  );
}

function MobileMenu({
  open,
  onClose,
  items,
  hrefFor,
  onHome,
}: {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  hrefFor: (item: NavItem) => string;
  onHome: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lockScroll = useScrollLock();

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;
      // Keep focus inside the menu (links + the header's close button).
      const focusables = [
        ...document.querySelectorAll<HTMLElement>("[aria-controls='mobile-menu']"),
        ...panelRef.current.querySelectorAll<HTMLElement>("a"),
      ];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      opener?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lockScroll is stable in behaviour
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-0 flex flex-col justify-end bg-bg px-[var(--gutter)] pt-[var(--header-h)] pb-12 md:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        >
          <nav>
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={item.id} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: EASE_OUT_EXPO }}
                  >
                    <NavLink
                      href={hrefFor(item)}
                      onHome={onHome && !item.href}
                      onClick={onClose}
                      className="block font-display text-3xl"
                    >
                      {item.label}
                    </NavLink>
                  </motion.div>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
