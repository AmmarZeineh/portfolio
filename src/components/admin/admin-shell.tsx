"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseIcon, ExternalLinkIcon, InboxIcon, LayersIcon, LogOutIcon, SettingsIcon, SparklesIcon } from "lucide-react";
import { signOut } from "@/lib/admin/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const NAV = [
  { href: "/admin/projects", label: "Projects", icon: LayersIcon },
  { href: "/admin/experience", label: "Experience", icon: BriefcaseIcon },
  { href: "/admin/skills", label: "Skills", icon: SparklesIcon },
  { href: "/admin/settings", label: "Profile & settings", icon: SettingsIcon },
  { href: "/admin/messages", label: "Messages", icon: InboxIcon },
];

/** Sidebar on desktop; a scrollable tab bar on phones. */
export function AdminShell({ email, unread, children }: { email: string; unread: number; children: ReactNode }) {
  const pathname = usePathname();

  const links = NAV.map(({ href, label, icon: Icon }) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
          active ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        )}
      >
        <Icon className="size-4" aria-hidden />
        {label}
        {href === "/admin/messages" && unread > 0 && (
          <span className="ms-auto rounded-full bg-brand px-1.5 text-xs font-medium text-white" aria-label={`${unread} unread`}>
            {unread}
          </span>
        )}
      </Link>
    );
  });

  return (
    <div className="md:grid md:min-h-dvh md:grid-cols-[15rem_1fr]">
      <aside className="sticky top-0 z-20 border-b bg-sidebar md:h-dvh md:border-e md:border-b-0">
        <div className="flex items-center justify-between gap-2 px-4 py-3 md:block md:px-5 md:py-6">
          <Link href="/admin/projects" className="font-semibold">
            Portfolio admin
          </Link>
          <div className="flex md:hidden">
            <Button asChild variant="ghost" size="sm">
              <a href="/en" target="_blank" rel="noopener">
                View site <ExternalLinkIcon />
              </a>
            </Button>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
                <LogOutIcon />
              </Button>
            </form>
          </div>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:px-3">
          {links}
        </nav>
        <div className="hidden space-y-1 px-3 md:absolute md:inset-x-0 md:bottom-0 md:block md:pb-5">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <a href="/en" target="_blank" rel="noopener">
              <ExternalLinkIcon /> View site
            </a>
          </Button>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
              <LogOutIcon /> Sign out
            </Button>
          </form>
          <p className="truncate px-3 pt-2 text-xs text-muted-foreground">{email}</p>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-10 md:py-10">{children}</main>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-prose text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
