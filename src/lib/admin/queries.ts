import "server-only";
import { z } from "zod";
import {
  localizedChallenges,
  localizedList,
  localizedText,
  projectLinks,
  socialsSchema,
  statSchema,
} from "@/lib/data/schemas";
import type { AdminContext } from "./auth";
import { toListItems, type ExperienceFormValues, type ProjectFormValues, type SettingsFormValues } from "./schemas";

type Supabase = AdminContext["supabase"];

// Reads for the admin go through the signed-in session, so RLS shows drafts too.
// Stored jsonb is parsed with the same Zod schemas the public site uses.

const both = (value: unknown) => {
  const text = localizedText.parse(value ?? {});
  return { en: text.en, ar: text.ar ?? "" };
};
const bothList = (value: unknown) => {
  const list = localizedList.parse(value ?? {});
  return { en: toListItems(list.en), ar: toListItems(list.ar) };
};

export async function listProjects(supabase: Supabase) {
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title, category, is_published, is_featured, cover_path, updated_at")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data.map((row) => ({ ...row, title: localizedText.parse(row.title).en }));
}
export type AdminProjectRow = Awaited<ReturnType<typeof listProjects>>[number];

export async function listTags(supabase: Supabase) {
  const { data, error } = await supabase.from("tags").select("id, name, slug").order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function getProjectForm(supabase: Supabase, id: string): Promise<ProjectFormValues | null> {
  const [{ data: p }, { data: tags }, { data: images }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("project_tags").select("tag_id, sort_order").eq("project_id", id).order("sort_order"),
    supabase.from("project_images").select("*").eq("project_id", id).order("sort_order"),
  ]);
  if (!p) return null;

  const challenges = localizedChallenges.parse(p.challenges ?? {});
  const links = projectLinks.parse(p.links ?? {});

  return {
    slug: p.slug,
    title: both(p.title),
    tagline: both(p.tagline),
    category: p.category,
    status: p.status,
    start_date: p.start_date ?? "",
    end_date: p.end_date ?? "",
    role: both(p.role),
    team_size: p.team_size ?? "",
    platforms: z.array(z.enum(["android", "ios", "web"])).catch([]).parse(p.platforms),
    accent_color: p.accent_color,
    is_featured: p.is_featured,
    is_published: p.is_published,
    is_confidential: p.is_confidential,
    overview: both(p.overview),
    problem: both(p.problem),
    solution: both(p.solution),
    architecture: both(p.architecture),
    results: both(p.results),
    features: bothList(p.features),
    challenges: { en: challenges.en, ar: challenges.ar ?? [] },
    links: {
      github: links.github ?? "",
      play_store: links.play_store ?? "",
      app_store: links.app_store ?? "",
      demo: links.demo ?? "",
      case_study: links.case_study ?? "",
      figma: links.figma ?? "",
    },
    video_url: p.video_url ?? "",
    video_path: p.video_path,
    cover_path: p.cover_path,
    tag_ids: (tags ?? []).map((t) => t.tag_id),
    images: (images ?? []).map((img) => ({
      id: img.id,
      path: img.path,
      width: img.width,
      height: img.height,
      caption: both(img.caption),
      alt: both(img.alt),
    })),
  };
}

export const emptyProjectForm = (): ProjectFormValues => ({
  slug: "",
  title: { en: "", ar: "" },
  tagline: { en: "", ar: "" },
  category: "freelance",
  status: "completed",
  start_date: "",
  end_date: "",
  role: { en: "", ar: "" },
  team_size: "",
  platforms: ["android", "ios"],
  accent_color: "#7FB2FF",
  is_featured: false,
  is_published: false,
  is_confidential: false,
  overview: { en: "", ar: "" },
  problem: { en: "", ar: "" },
  solution: { en: "", ar: "" },
  architecture: { en: "", ar: "" },
  results: { en: "", ar: "" },
  features: { en: [], ar: [] },
  challenges: { en: [], ar: [] },
  links: { github: "", play_store: "", app_store: "", demo: "", case_study: "", figma: "" },
  video_url: "",
  video_path: null,
  cover_path: null,
  tag_ids: [],
  images: [],
});

export async function listExperience(supabase: Supabase) {
  const { data, error } = await supabase.from("experience").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data.map((row) => ({
    id: row.id,
    summary: `${localizedText.parse(row.role).en}, ${row.company}`,
    dates: `${row.start_date.slice(0, 7)} – ${row.end_date?.slice(0, 7) ?? "present"}`,
    form: {
      company: row.company,
      role: both(row.role),
      location: both(row.location),
      employment_type: both(row.employment_type),
      start_date: row.start_date,
      end_date: row.end_date ?? "",
      description: both(row.description),
      highlights: bothList(row.highlights),
      is_confidential: row.is_confidential,
    } satisfies ExperienceFormValues,
  }));
}
export type AdminExperienceRow = Awaited<ReturnType<typeof listExperience>>[number];

export async function listSkillGroups(supabase: Supabase) {
  const { data, error } = await supabase
    .from("skill_groups")
    .select("id, name, sort_order, skills ( id, name, sort_order )")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data.map((group) => ({
    id: group.id,
    form: {
      name: both(group.name),
      skills: group.skills.toSorted((a, b) => a.sort_order - b.sort_order).map((s) => ({ id: s.id, value: s.name })),
    },
  }));
}
export type AdminSkillGroupRow = Awaited<ReturnType<typeof listSkillGroups>>[number];

export async function getSettingsForm(supabase: Supabase): Promise<SettingsFormValues> {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  if (error) throw new Error(error.message);
  const socials = socialsSchema.parse(data.socials ?? {});
  const stats = z.array(statSchema).catch([]).parse(data.stats);
  return {
    role: both(data.role),
    hero_headline: both(data.hero_headline),
    hero_sub: both(data.hero_sub),
    about: both(data.about),
    location: both(data.location),
    education: both(data.education),
    languages: bothList(data.languages),
    email: data.email ?? "",
    socials: {
      github: socials.github ?? "",
      linkedin: socials.linkedin ?? "",
      whatsapp: socials.whatsapp ?? "",
      x: socials.x ?? "",
    },
    photo_path: data.photo_path,
    cv_path: data.cv_path,
    stats: stats.map((s) => ({ value: s.value, suffix: s.suffix, label: both(s.label) })),
  };
}

export async function listMessages(supabase: Supabase) {
  const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function countUnread(supabase: Supabase) {
  const { count } = await supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false);
  return count ?? 0;
}
