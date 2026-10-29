// Mirrors the output of `supabase gen types typescript` for
// supabase/migrations (0001_init.sql, 0002_settings_role.sql). Regenerate (or update by hand) whenever
// the schema changes. jsonb columns are `Json` here and parsed with Zod in
// src/lib/data so the rest of the app works with precise domain types.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = { created_at: string };

export type ProjectCategory = "company" | "freelance" | "graduation" | "academic";
export type ProjectStatus = "completed" | "in_progress";

type ProjectRow = Timestamps & {
  id: string;
  slug: string;
  title: Json;
  tagline: Json;
  category: ProjectCategory;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  role: Json;
  team_size: number | null;
  platforms: string[];
  cover_path: string | null;
  video_url: string | null;
  video_path: string | null;
  overview: Json;
  problem: Json;
  solution: Json;
  features: Json;
  challenges: Json;
  results: Json;
  architecture: Json;
  links: Json;
  accent_color: string;
  is_featured: boolean;
  is_published: boolean;
  is_confidential: boolean;
  sort_order: number;
  updated_at: string;
};

type ProjectImageRow = Timestamps & {
  id: string;
  project_id: string;
  path: string;
  caption: Json;
  alt: Json;
  width: number | null;
  height: number | null;
  sort_order: number;
};

type TagRow = Timestamps & { id: string; name: string; slug: string };

type ProjectTagRow = { project_id: string; tag_id: string; sort_order: number };

type ExperienceRow = Timestamps & {
  id: string;
  company: string;
  role: Json;
  location: Json;
  employment_type: Json;
  start_date: string;
  end_date: string | null;
  description: Json;
  highlights: Json;
  is_confidential: boolean;
  sort_order: number;
  updated_at: string;
};

type SkillGroupRow = Timestamps & { id: string; name: Json; sort_order: number };

type SkillRow = Timestamps & {
  id: string;
  group_id: string;
  name: string;
  icon: string | null;
  sort_order: number;
};

type SiteSettingsRow = {
  id: number;
  role: Json;
  hero_headline: Json;
  hero_sub: Json;
  about: Json;
  location: Json;
  education: Json;
  languages: Json;
  photo_path: string | null;
  cv_path: string | null;
  email: string | null;
  socials: Json;
  stats: Json;
  updated_at: string;
};

type ContactMessageRow = Timestamps & {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
};

type AdminUserRow = Timestamps & { user_id: string };

/** Columns with a database default become optional on insert. */
type Insertable<Row, Required extends keyof Row> = Pick<Row, Required> &
  Partial<Omit<Row, Required>>;

type Table<Row, Required extends keyof Row, Relationships extends unknown[] = []> = {
  Row: Row;
  Insert: Insertable<Row, Required>;
  Update: Partial<Row>;
  Relationships: Relationships;
};

export type Database = {
  public: {
    Tables: {
      admin_users: Table<AdminUserRow, "user_id">;
      projects: Table<ProjectRow, "slug" | "category">;
      project_images: Table<
        ProjectImageRow,
        "project_id" | "path",
        [
          {
            foreignKeyName: "project_images_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ]
      >;
      tags: Table<TagRow, "name" | "slug">;
      project_tags: Table<
        ProjectTagRow,
        "project_id" | "tag_id",
        [
          {
            foreignKeyName: "project_tags_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ]
      >;
      experience: Table<ExperienceRow, "company" | "start_date">;
      skill_groups: Table<SkillGroupRow, never>;
      skills: Table<
        SkillRow,
        "group_id" | "name",
        [
          {
            foreignKeyName: "skills_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "skill_groups";
            referencedColumns: ["id"];
          },
        ]
      >;
      site_settings: Table<SiteSettingsRow, never>;
      contact_messages: Table<ContactMessageRow, "name" | "email" | "message">;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      project_category: ProjectCategory;
      project_status: ProjectStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
