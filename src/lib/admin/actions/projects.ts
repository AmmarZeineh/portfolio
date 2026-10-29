"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/data/cache-tags";
import { requireAdmin, type AdminContext } from "../auth";
import { removeUnreferencedMedia } from "../media";
import { fail, invalid, isUniqueViolation, ok, type ActionResult } from "../result";
import {
  idListSchema,
  projectFormSchema,
  slugify,
  tagCreateSchema,
  toStoredList,
  toStoredText,
  type ProjectFormValues,
} from "../schemas";

function revalidateProjects(...slugs: (string | null | undefined)[]) {
  updateTag(CACHE_TAGS.projects);
  updateTag(CACHE_TAGS.tags);
  for (const slug of new Set(slugs)) if (slug) updateTag(CACHE_TAGS.project(slug));
}

async function nextSortOrder(supabase: AdminContext["supabase"]) {
  const { data } = await supabase.from("projects").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  return (data?.[0]?.sort_order ?? 0) + 1;
}

/** Creates (id = null) or updates a project, its tags and its gallery in one save. */
export async function saveProject(id: string | null, input: ProjectFormValues): Promise<ActionResult<{ id: string; slug: string }>> {
  const { supabase } = await requireAdmin();
  const parsed = projectFormSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const v = parsed.data;

  const row = {
    slug: v.slug,
    title: toStoredText(v.title),
    tagline: toStoredText(v.tagline),
    category: v.category,
    status: v.status,
    start_date: v.start_date || null,
    end_date: v.end_date || null,
    role: toStoredText(v.role),
    team_size: v.team_size === "" ? null : v.team_size,
    platforms: v.platforms,
    accent_color: v.accent_color.toUpperCase(),
    is_featured: v.is_featured,
    is_published: v.is_published,
    is_confidential: v.is_confidential,
    overview: toStoredText(v.overview),
    problem: toStoredText(v.problem),
    solution: toStoredText(v.solution),
    architecture: toStoredText(v.architecture),
    results: toStoredText(v.results),
    features: toStoredList(v.features),
    challenges: v.challenges.ar.length ? v.challenges : { en: v.challenges.en },
    // Empty links are dropped so the site only renders the ones that exist.
    links: Object.fromEntries(Object.entries(v.links).filter(([, url]) => url)),
    video_url: v.video_url || null,
    video_path: v.video_path,
    cover_path: v.cover_path,
  };

  let previous: { slug: string; cover_path: string | null; video_path: string | null } | null = null;
  let projectId = id;

  if (id) {
    const { data } = await supabase.from("projects").select("slug, cover_path, video_path").eq("id", id).maybeSingle();
    if (!data) return fail("This project no longer exists.");
    previous = data;
    const { error } = await supabase.from("projects").update(row).eq("id", id);
    if (isUniqueViolation(error)) return fail("That slug is taken.", { slug: "Another project already uses this slug" });
    if (error) return fail(error.message);
  } else {
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...row, sort_order: await nextSortOrder(supabase) })
      .select("id")
      .single();
    if (isUniqueViolation(error)) return fail("That slug is taken.", { slug: "Another project already uses this slug" });
    if (error || !data) return fail(error?.message ?? "Couldn't create the project.");
    projectId = data.id;
  }
  if (!projectId) return fail("Couldn't save the project.");

  // Tags: replace the set, keeping the chosen order.
  await supabase.from("project_tags").delete().eq("project_id", projectId);
  if (v.tag_ids.length) {
    const { error } = await supabase
      .from("project_tags")
      .insert(v.tag_ids.map((tag_id, i) => ({ project_id: projectId, tag_id, sort_order: i })));
    if (error) return fail(`Saved, but tags failed: ${error.message}`);
  }

  // Gallery: delete removed rows, update kept ones, insert new ones (array order = sort order).
  const { data: existing } = await supabase.from("project_images").select("id, path").eq("project_id", projectId);
  const keep = new Set(v.images.flatMap((image) => (image.id ? [image.id] : [])));
  const removed = (existing ?? []).filter((image) => !keep.has(image.id));
  if (removed.length) {
    await supabase.from("project_images").delete().in("id", removed.map((image) => image.id));
  }
  const results = await Promise.all(
    v.images.map((image, i) => {
      const fields = {
        path: image.path,
        width: image.width,
        height: image.height,
        caption: toStoredText(image.caption),
        alt: toStoredText(image.alt),
        sort_order: i + 1,
      };
      return image.id
        ? supabase.from("project_images").update(fields).eq("id", image.id)
        : supabase.from("project_images").insert({ ...fields, project_id: projectId });
    }),
  );
  const imageError = results.find((result) => result.error)?.error;
  if (imageError) return fail(`Saved, but some images failed: ${imageError.message}`);

  await removeUnreferencedMedia(supabase, [
    ...removed.map((image) => image.path),
    previous?.cover_path !== row.cover_path ? previous?.cover_path : null,
    previous?.video_path !== row.video_path ? previous?.video_path : null,
  ]);

  revalidateProjects(previous?.slug, row.slug);
  return ok({ id: projectId, slug: row.slug });
}

export async function setProjectFlag(
  id: string,
  flag: "is_published" | "is_featured",
  value: boolean,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const patch = flag === "is_published" ? { is_published: value } : { is_featured: value };
  const { data, error } = await supabase.from("projects").update(patch).eq("id", id).select("slug").single();
  if (error) return fail(error.message);
  revalidateProjects(data.slug);
  return ok(undefined);
}

export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = idListSchema.safeParse(ids);
  if (!parsed.success) return fail("Invalid order.");
  const results = await Promise.all(
    parsed.data.map((id, i) => supabase.from("projects").update({ sort_order: i + 1 }).eq("id", id)),
  );
  const error = results.find((r) => r.error)?.error;
  if (error) return fail(error.message);
  revalidateProjects();
  return ok(undefined);
}

/** Copies a project as an unpublished draft (sharing the same image files). */
export async function duplicateProject(id: string): Promise<ActionResult<{ id: string }>> {
  const { supabase } = await requireAdmin();
  const { data: source } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!source) return fail("This project no longer exists.");

  const { id: _id, created_at: _created, updated_at: _updated, ...fields } = source;
  const title = (source.title ?? {}) as { en?: string; ar?: string };

  let copyId: string | null = null;
  for (let attempt = 1; attempt <= 20 && !copyId; attempt++) {
    const slug = `${source.slug}-copy${attempt > 1 ? `-${attempt}` : ""}`.slice(0, 80);
    const { data, error } = await supabase
      .from("projects")
      .insert({
        ...fields,
        slug,
        title: { ...title, en: `${title.en ?? ""} (copy)` },
        is_published: false,
        is_featured: false,
        sort_order: await nextSortOrder(supabase),
      })
      .select("id")
      .single();
    if (data) copyId = data.id;
    else if (!isUniqueViolation(error)) return fail(error?.message ?? "Couldn't duplicate.");
  }
  if (!copyId) return fail("Couldn't find a free slug for the copy.");

  const [{ data: tags }, { data: images }] = await Promise.all([
    supabase.from("project_tags").select("tag_id, sort_order").eq("project_id", id),
    supabase.from("project_images").select("path, caption, alt, width, height, sort_order").eq("project_id", id),
  ]);
  if (tags?.length) await supabase.from("project_tags").insert(tags.map((t) => ({ ...t, project_id: copyId })));
  if (images?.length) await supabase.from("project_images").insert(images.map((img) => ({ ...img, project_id: copyId })));

  revalidateProjects();
  return ok({ id: copyId });
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const [{ data: project }, { data: images }] = await Promise.all([
    supabase.from("projects").select("slug, cover_path, video_path").eq("id", id).maybeSingle(),
    supabase.from("project_images").select("path").eq("project_id", id),
  ]);
  if (!project) return fail("This project no longer exists.");

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return fail(error.message);

  await removeUnreferencedMedia(supabase, [project.cover_path, project.video_path, ...(images ?? []).map((i) => i.path)]);
  revalidateProjects(project.slug);
  return ok(undefined);
}

export async function createTag(name: string): Promise<ActionResult<{ id: string; name: string; slug: string }>> {
  const { supabase } = await requireAdmin();
  const parsed = tagCreateSchema.safeParse({ name });
  if (!parsed.success) return invalid(parsed.error);

  const slug = slugify(parsed.data.name);
  if (!slug) return fail("Use at least one letter or number.");

  // Reuse an existing tag with the same slug ("Flutter" vs "flutter").
  const { data: existing } = await supabase.from("tags").select("id, name, slug").eq("slug", slug).maybeSingle();
  if (existing) return ok(existing);

  const { data, error } = await supabase.from("tags").insert({ name: parsed.data.name, slug }).select("id, name, slug").single();
  if (error || !data) return fail(error?.message ?? "Couldn't create the tag.");
  updateTag(CACHE_TAGS.tags);
  return ok(data);
}
