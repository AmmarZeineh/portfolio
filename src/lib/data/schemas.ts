import { z } from "zod";
import type { Locale } from "@/i18n/config";

// ---------------------------------------------------------------------------
// Localized values ({"en": ..., "ar": ...}); Arabic falls back to English.
// ---------------------------------------------------------------------------
export const localizedText = z
  .object({ en: z.string().default(""), ar: z.string().optional() })
  .catch({ en: "" });
export type LocalizedText = z.infer<typeof localizedText>;

export const localizedList = z
  .object({ en: z.array(z.string()).default([]), ar: z.array(z.string()).optional() })
  .catch({ en: [] });
export type LocalizedList = z.infer<typeof localizedList>;

const challenge = z.object({ title: z.string(), body: z.string() });
export type Challenge = z.infer<typeof challenge>;

export const localizedChallenges = z
  .object({ en: z.array(challenge).default([]), ar: z.array(challenge).optional() })
  .catch({ en: [] });
export type LocalizedChallenges = z.infer<typeof localizedChallenges>;

/** Picks the locale's value, falling back to English when it's empty. */
export function pick<T extends string | unknown[]>(
  value: { en: T; ar?: T },
  locale: Locale,
): T {
  const localized = value[locale];
  return localized !== undefined && localized.length > 0 ? localized : value.en;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export const PROJECT_CATEGORIES = ["company", "freelance", "graduation", "academic"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const PLATFORMS = ["android", "ios", "web"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const projectLinks = z
  .object({
    github: z.string().optional(),
    play_store: z.string().optional(),
    app_store: z.string().optional(),
    demo: z.string().optional(),
    case_study: z.string().optional(),
    figma: z.string().optional(),
  })
  .catch({});
export type ProjectLinks = z.infer<typeof projectLinks>;
export type ProjectLinkKey = keyof ProjectLinks;

export const tagSchema = z.object({ id: z.string(), name: z.string(), slug: z.string() });
export type Tag = z.infer<typeof tagSchema>;

export const projectImageSchema = z.object({
  id: z.string(),
  path: z.string(),
  caption: localizedText,
  alt: localizedText,
  width: z.number().nullable(),
  height: z.number().nullable(),
  sort_order: z.number(),
});
export type ProjectImage = z.infer<typeof projectImageSchema>;

/** Fields needed for cards and lists. */
export const projectSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: localizedText,
  tagline: localizedText,
  category: z.enum(PROJECT_CATEGORIES),
  status: z.enum(["completed", "in_progress"]),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  platforms: z.array(z.enum(PLATFORMS)).catch([]),
  cover_path: z.string().nullable(),
  accent_color: z.string(),
  is_featured: z.boolean(),
  is_confidential: z.boolean(),
  sort_order: z.number(),
  tags: z.array(tagSchema),
});
export type ProjectSummary = z.infer<typeof projectSummarySchema>;

export const projectSchema = projectSummarySchema.extend({
  role: localizedText,
  team_size: z.number().nullable(),
  video_url: z.string().nullable(),
  video_path: z.string().nullable(),
  overview: localizedText,
  problem: localizedText,
  solution: localizedText,
  features: localizedList,
  challenges: localizedChallenges,
  results: localizedText,
  architecture: localizedText,
  links: projectLinks,
  is_published: z.boolean(),
  images: z.array(projectImageSchema),
  updated_at: z.string(),
});
export type Project = z.infer<typeof projectSchema>;

// ---------------------------------------------------------------------------
// Experience & skills
// ---------------------------------------------------------------------------
export const experienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: localizedText,
  location: localizedText,
  employment_type: localizedText,
  start_date: z.string(),
  end_date: z.string().nullable(),
  description: localizedText,
  highlights: localizedList,
  is_confidential: z.boolean(),
  sort_order: z.number(),
});
export type Experience = z.infer<typeof experienceSchema>;

export const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  sort_order: z.number(),
});
export type Skill = z.infer<typeof skillSchema>;

export const skillGroupSchema = z.object({
  id: z.string(),
  name: localizedText,
  sort_order: z.number(),
  skills: z.array(skillSchema),
});
export type SkillGroup = z.infer<typeof skillGroupSchema>;

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------
export const socialsSchema = z
  .object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    whatsapp: z.string().optional(),
    x: z.string().optional(),
  })
  .catch({});
export type Socials = z.infer<typeof socialsSchema>;

export const statSchema = z.object({
  value: z.number(),
  suffix: z.string().default(""),
  label: localizedText,
});
export type Stat = z.infer<typeof statSchema>;

export const siteSettingsSchema = z.object({
  hero_headline: localizedText,
  hero_sub: localizedText,
  about: localizedText,
  location: localizedText,
  education: localizedText,
  languages: localizedList,
  photo_path: z.string().nullable(),
  cv_path: z.string().nullable(),
  email: z.string().nullable(),
  socials: socialsSchema,
  stats: z.array(statSchema).catch([]),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
