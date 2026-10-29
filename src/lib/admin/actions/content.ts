"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/data/cache-tags";
import { requireAdmin } from "../auth";
import { removeUnreferencedMedia } from "../media";
import { fail, invalid, ok, type ActionResult } from "../result";
import {
  experienceFormSchema,
  idListSchema,
  settingsFormSchema,
  skillGroupFormSchema,
  toStoredList,
  toStoredText,
  type ExperienceFormValues,
  type SettingsFormValues,
  type SkillGroupFormValues,
} from "../schemas";

// -----------------------------------------------------------------------------
// Experience
// -----------------------------------------------------------------------------
export async function saveExperience(id: string | null, input: ExperienceFormValues): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  const parsed = experienceFormSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const v = parsed.data;

  const row = {
    company: v.company,
    role: toStoredText(v.role),
    location: toStoredText(v.location),
    employment_type: toStoredText(v.employment_type),
    start_date: v.start_date,
    end_date: v.end_date || null,
    description: toStoredText(v.description),
    highlights: toStoredList(v.highlights),
    is_confidential: v.is_confidential,
  };

  if (id) {
    const { error } = await supabase.from("experience").update(row).eq("id", id);
    if (error) return fail(error.message);
    updateTag(CACHE_TAGS.experience);
    return ok({ id });
  }

  const { data: last } = await supabase.from("experience").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const { data, error } = await supabase
    .from("experience")
    .insert({ ...row, sort_order: (last?.[0]?.sort_order ?? 0) + 1 })
    .select("id")
    .single();
  if (error || !data) return fail(error?.message ?? "Couldn't add the role.");
  updateTag(CACHE_TAGS.experience);
  return ok({ id: data.id });
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("experience").delete().eq("id", id);
  if (error) return fail(error.message);
  updateTag(CACHE_TAGS.experience);
  return ok(undefined);
}

export async function reorderExperience(ids: string[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = idListSchema.safeParse(ids);
  if (!parsed.success) return fail("Invalid order.");
  const results = await Promise.all(
    parsed.data.map((id, i) => supabase.from("experience").update({ sort_order: i + 1 }).eq("id", id)),
  );
  const error = results.find((r) => r.error)?.error;
  if (error) return fail(error.message);
  updateTag(CACHE_TAGS.experience);
  return ok(undefined);
}

// -----------------------------------------------------------------------------
// Skills
// -----------------------------------------------------------------------------
export async function saveSkillGroup(id: string | null, input: SkillGroupFormValues): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  const parsed = skillGroupFormSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const v = parsed.data;

  let groupId = id;
  if (groupId) {
    const { error } = await supabase.from("skill_groups").update({ name: toStoredText(v.name) }).eq("id", groupId);
    if (error) return fail(error.message);
  } else {
    const { data: last } = await supabase.from("skill_groups").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    const { data, error } = await supabase
      .from("skill_groups")
      .insert({ name: toStoredText(v.name), sort_order: (last?.[0]?.sort_order ?? 0) + 1 })
      .select("id")
      .single();
    if (error || !data) return fail(error?.message ?? "Couldn't add the group.");
    groupId = data.id;
  }

  // Skills are a simple ordered list of names: replace them wholesale.
  await supabase.from("skills").delete().eq("group_id", groupId);
  if (v.skills.length) {
    const { error } = await supabase
      .from("skills")
      .insert(v.skills.map((skill, i) => ({ group_id: groupId, name: skill.value, sort_order: i + 1 })));
    if (error) return fail(error.message);
  }

  updateTag(CACHE_TAGS.skills);
  return ok({ id: groupId });
}

export async function deleteSkillGroup(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("skill_groups").delete().eq("id", id);
  if (error) return fail(error.message);
  updateTag(CACHE_TAGS.skills);
  return ok(undefined);
}

export async function reorderSkillGroups(ids: string[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = idListSchema.safeParse(ids);
  if (!parsed.success) return fail("Invalid order.");
  const results = await Promise.all(
    parsed.data.map((id, i) => supabase.from("skill_groups").update({ sort_order: i + 1 }).eq("id", id)),
  );
  const error = results.find((r) => r.error)?.error;
  if (error) return fail(error.message);
  updateTag(CACHE_TAGS.skills);
  return ok(undefined);
}

// -----------------------------------------------------------------------------
// Site settings
// -----------------------------------------------------------------------------
export async function saveSettings(input: SettingsFormValues): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = settingsFormSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const v = parsed.data;

  const { data: previous } = await supabase.from("site_settings").select("photo_path, cv_path").eq("id", 1).maybeSingle();

  const { error } = await supabase
    .from("site_settings")
    .update({
      role: toStoredText(v.role),
      hero_headline: toStoredText(v.hero_headline),
      hero_sub: toStoredText(v.hero_sub),
      about: toStoredText(v.about),
      location: toStoredText(v.location),
      education: toStoredText(v.education),
      languages: toStoredList(v.languages),
      email: v.email || null,
      socials: Object.fromEntries(Object.entries(v.socials).filter(([, url]) => url)),
      photo_path: v.photo_path,
      cv_path: v.cv_path,
      stats: v.stats.map((stat) => ({ value: stat.value, suffix: stat.suffix, label: toStoredText(stat.label) })),
    })
    .eq("id", 1);

  if (error?.message.includes("role")) {
    return fail("Run supabase/migrations/0002_settings_role.sql in the Supabase SQL editor first, then save again.");
  }
  if (error) return fail(error.message);

  if (previous?.photo_path !== v.photo_path) await removeUnreferencedMedia(supabase, [previous?.photo_path]);
  if (previous?.cv_path && previous.cv_path !== v.cv_path && !previous.cv_path.startsWith("/")) {
    await supabase.storage.from("cv").remove([previous.cv_path]);
  }

  updateTag(CACHE_TAGS.settings);
  return ok(undefined);
}

// -----------------------------------------------------------------------------
// Messages
// -----------------------------------------------------------------------------
export async function setMessageRead(id: string, isRead: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
  return error ? fail(error.message) : ok(undefined);
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  return error ? fail(error.message) : ok(undefined);
}
