import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CaseStudy } from "@/components/project/case-study";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { PROJECT_DETAIL_COLUMNS, parseProjectDetail } from "@/lib/data/projects";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

// Previews are per-request by nature (drafts, any id): render on demand
// instead of prerendering a shell. The public pages stay fully static.
export const instant = false;

/**
 * Admin preview of a project as the public page will show it, drafts
 * included. It reads the session, so it renders per request behind Suspense;
 * RLS only returns unpublished projects to the admin.
 */
export default function PreviewPage({ params }: PageProps<"/[locale]/preview/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <Preview params={params} />
    </Suspense>
  );
}

async function Preview({ params }: { params: PageProps<"/[locale]/preview/[id]">["params"] }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();

  const supabase = await createSessionClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/admin/login");

  const { data } = await supabase.from("projects").select(PROJECT_DETAIL_COLUMNS).eq("id", id).maybeSingle();
  if (!data) notFound();
  const project = parseProjectDetail(data);
  const t = await getDictionary(locale);

  return (
    <>
      <CaseStudy project={project} adjacent={{ previous: null, next: null }} t={t} locale={locale} />
      <div className="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-4 rounded-full border border-line bg-raised/95 px-5 py-2.5 text-sm shadow-lg backdrop-blur">
        <span>
          Preview{project.is_published ? "" : ": draft, not on the site yet"}
        </span>
        <Link href={`/admin/projects/${project.id}`} className="link-underline font-medium">
          Edit
        </Link>
      </div>
    </>
  );
}
