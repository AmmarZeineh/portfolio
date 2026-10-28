import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS } from "./cache-tags";
import {
  experienceSchema,
  siteSettingsSchema,
  skillGroupSchema,
  type Experience,
  type SiteSettings,
  type SkillGroup,
} from "./schemas";

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(CACHE_TAGS.settings);
  cacheLife("max");

  const { data, error } = await createPublicClient()
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) throw new Error(`getSiteSettings: ${error.message}`);
  return siteSettingsSchema.parse(data);
}

export async function getExperience(): Promise<Experience[]> {
  "use cache";
  cacheTag(CACHE_TAGS.experience);
  cacheLife("max");

  const { data, error } = await createPublicClient()
    .from("experience")
    .select("*")
    .order("sort_order");

  if (error) throw new Error(`getExperience: ${error.message}`);
  return z.array(experienceSchema).parse(data);
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  "use cache";
  cacheTag(CACHE_TAGS.skills);
  cacheLife("max");

  const { data, error } = await createPublicClient()
    .from("skill_groups")
    .select("id, name, sort_order, skills ( id, name, icon, sort_order )")
    .order("sort_order");

  if (error) throw new Error(`getSkillGroups: ${error.message}`);
  return z.array(skillGroupSchema).parse(
    data.map((group) => ({
      ...group,
      skills: group.skills.toSorted((a, b) => a.sort_order - b.sort_order),
    })),
  );
}
