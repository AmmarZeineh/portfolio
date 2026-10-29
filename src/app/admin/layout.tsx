import { Suspense, type ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "@/components/admin/ui/sonner";
import "@/styles/admin.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { colorScheme: "light dark" };

/**
 * Root layout for the admin (a separate tree from the public [locale] site:
 * own stylesheet, no smooth scroll or cursor). Everything below reads the
 * session cookie, so it all streams in behind this boundary.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="min-h-dvh font-sans">
        <Suspense fallback={<AdminLoading />}>{children}</Suspense>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}

function AdminLoading() {
  return (
    <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground" role="status">
      Loading…
    </div>
  );
}
