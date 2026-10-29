import { z } from "zod";
import { PLATFORMS, PROJECT_CATEGORIES } from "@/lib/data/schemas";

// Form schemas for the admin. The same schema validates in the browser (React
// Hook Form) and again inside each server action, so the client is never trusted.
// Lists are arrays of objects ({ value }) because that's what useFieldArray needs.

const trimmed = z.string().trim();

/** { en, ar } with English required when `required` is set. */
const bilingual = (required = false, max = 20_000) =>
  z.object({
    en: required ? trimmed.min(1, "Required").max(max) : trimmed.max(max).default(""),
    ar: trimmed.max(max).default(""),
  });

const listItem = z.object({ value: trimmed.min(1, "Required").max(500) });
const bilingualList = z.object({ en: z.array(listItem).default([]), ar: z.array(listItem).default([]) });

const challenge = z.object({ title: trimmed.min(1, "Required").max(200), body: trimmed.min(1, "Required").max(4000) });

const optionalUrl = z.union([z.literal(""), z.url("Enter a full URL, starting with https://")]).default("");
const optionalDate = z.union([z.literal(""), z.iso.date("Use the date picker")]).default("");

export const slugSchema = trimmed
  .min(1, "Required")
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers and single hyphens only");

export const imageFormSchema = z.object({
  id: z.string().optional(),
  path: z.string().min(1),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  caption: bilingual(false, 300),
  alt: bilingual(false, 300),
});
export type ImageFormValues = z.infer<typeof imageFormSchema>;

export const projectFormSchema = z
  .object({
    slug: slugSchema,
    title: bilingual(true, 120),
    tagline: bilingual(false, 300),
    category: z.enum(PROJECT_CATEGORIES),
    status: z.enum(["completed", "in_progress"]),
    start_date: optionalDate,
    end_date: optionalDate,
    role: bilingual(false, 200),
    team_size: z.union([z.literal(""), z.coerce.number().int().min(1).max(500)]).default(""),
    platforms: z.array(z.enum(PLATFORMS)).default([]),
    accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #7FB2FF"),
    is_featured: z.boolean(),
    is_published: z.boolean(),
    is_confidential: z.boolean(),
    overview: bilingual(),
    problem: bilingual(),
    solution: bilingual(),
    architecture: bilingual(),
    results: bilingual(),
    features: bilingualList,
    challenges: z.object({ en: z.array(challenge).default([]), ar: z.array(challenge).default([]) }),
    links: z.object({
      github: optionalUrl,
      play_store: optionalUrl,
      app_store: optionalUrl,
      demo: optionalUrl,
      case_study: optionalUrl,
      figma: optionalUrl,
    }),
    video_url: optionalUrl,
    video_path: z.string().nullable(),
    cover_path: z.string().nullable(),
    tag_ids: z.array(z.string()).default([]),
    images: z.array(imageFormSchema).default([]),
  })
  .refine((v) => !v.start_date || !v.end_date || v.start_date <= v.end_date, {
    path: ["end_date"],
    message: "Ends before it starts",
  });
export type ProjectFormValues = z.input<typeof projectFormSchema>;
export type ProjectFormOutput = z.output<typeof projectFormSchema>;

export const experienceFormSchema = z
  .object({
    company: trimmed.min(1, "Required").max(120),
    role: bilingual(true, 120),
    location: bilingual(false, 120),
    employment_type: bilingual(false, 60),
    start_date: z.iso.date("Required"),
    end_date: optionalDate,
    description: bilingual(false, 2000),
    highlights: bilingualList,
    is_confidential: z.boolean(),
  })
  .refine((v) => !v.end_date || v.start_date <= v.end_date, { path: ["end_date"], message: "Ends before it starts" });
export type ExperienceFormValues = z.input<typeof experienceFormSchema>;

export const skillGroupFormSchema = z.object({
  name: bilingual(true, 60),
  skills: z.array(z.object({ id: z.string().optional(), value: trimmed.min(1, "Required").max(60) })).default([]),
});
export type SkillGroupFormValues = z.input<typeof skillGroupFormSchema>;

export const settingsFormSchema = z.object({
  role: bilingual(true, 120),
  hero_headline: bilingual(true, 200),
  hero_sub: bilingual(false, 400),
  about: bilingual(false, 6000),
  location: bilingual(false, 120),
  education: bilingual(false, 300),
  languages: bilingualList,
  email: z.union([z.literal(""), z.email("Enter a valid email")]).default(""),
  socials: z.object({
    github: optionalUrl,
    linkedin: optionalUrl,
    whatsapp: optionalUrl,
    x: optionalUrl,
  }),
  photo_path: z.string().nullable(),
  cv_path: z.string().nullable(),
  stats: z
    .array(
      z.object({
        value: z.coerce.number().min(0).max(1_000_000),
        suffix: trimmed.max(4).default(""),
        label: bilingual(true, 80),
      }),
    )
    .max(6),
});
export type SettingsFormValues = z.input<typeof settingsFormSchema>;

export const tagCreateSchema = z.object({ name: trimmed.min(1, "Required").max(40) });

// z.guid() (not z.uuid()) so the seed's hand-written ids validate too.
export const idListSchema = z.array(z.guid()).max(500);

// -----------------------------------------------------------------------------
// Helpers to move between stored shapes and form shapes
// -----------------------------------------------------------------------------
export const toListItems = (values: string[] | undefined) => (values ?? []).map((value) => ({ value }));
export const fromListItems = (items: { value: string }[]) => items.map((item) => item.value);

/** Stored jsonb { en, ar? } — drops an empty Arabic value so the site falls back to English. */
export function toStoredText(value: { en: string; ar: string }) {
  return value.ar ? { en: value.en, ar: value.ar } : { en: value.en };
}

export function toStoredList(value: { en: { value: string }[]; ar: { value: string }[] }) {
  const ar = fromListItems(value.ar);
  return ar.length ? { en: fromListItems(value.en), ar } : { en: fromListItems(value.en) };
}

/** Turns "My App!" into "my-app". */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
