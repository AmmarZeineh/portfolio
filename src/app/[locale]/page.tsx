import { getExperience, getSiteSettings, getSkillGroups } from "@/lib/data/content";
import { getProjects } from "@/lib/data/projects";

// Temporary Phase 1 page: verifies env + Supabase + seed. Replaced in Phase 3.

type Check = { label: string; ok: boolean; detail: string };

async function check(label: string, run: () => Promise<string>): Promise<Check> {
  try {
    return { label, ok: true, detail: await run() };
  } catch (error) {
    return { label, ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

export default async function SetupStatusPage() {
  const checks = await Promise.all([
    check("Site settings", async () => (await getSiteSettings()).email ?? "no email set"),
    check("Published projects", async () => {
      const projects = await getProjects();
      return `${projects.length}: ${projects.map((p) => p.title.en).join(", ")}`;
    }),
    check("Experience", async () => `${(await getExperience()).length} entries`),
    check("Skill groups", async () => `${(await getSkillGroups()).length} groups`),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <p className="text-sm tracking-widest text-muted uppercase">Phase 1 · Setup check</p>
      <h1 className="font-display mt-4 text-6xl leading-none">
        Ammar <em className="text-accent">Zeineh</em>
      </h1>
      <ul className="mt-12 space-y-4">
        {checks.map((c) => (
          <li key={c.label} className="rounded-2xl bg-surface p-5">
            <p className="font-medium">
              <span aria-hidden>{c.ok ? "✓" : "✗"}</span> {c.label}
              <span className="sr-only">{c.ok ? " passed" : " failed"}</span>
            </p>
            <p className={`mt-1 text-sm ${c.ok ? "text-muted" : "text-red-300"}`}>{c.detail}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
