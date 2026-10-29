import { DEFAULT_LOCALE } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getProject, getProjects } from "@/lib/data/projects";
import { pick } from "@/lib/data/schemas";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Project case study by Ammar Zeineh";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

/**
 * One share card per project, tinted with the project's accent color. Always
 * English: Satori can't shape right-to-left Arabic text.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = DEFAULT_LOCALE;
  const [t, project] = await Promise.all([getDictionary(locale), getProject(slug)]);
  if (!project) {
    return ogCard({ kicker: `${t.person.firstName} ${t.person.lastName}`, title: t.projects.title });
  }
  return ogCard({
    kicker: `${t.person.firstName} ${t.person.lastName}, ${t.work.categories[project.category]}`,
    title: pick(project.title, locale),
    subtitle: pick(project.tagline, locale),
    accent: project.accent_color,
  });
}
