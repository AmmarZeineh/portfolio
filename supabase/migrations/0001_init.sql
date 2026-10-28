-- =============================================================================
-- Portfolio schema: content tables, RLS, storage buckets.
-- Translatable text is stored as jsonb: {"en": "...", "ar": "..."}.
-- Translatable lists are stored as jsonb: {"en": ["..."], "ar": ["..."]}.
-- Run in the Supabase SQL editor or with `supabase db push`.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type project_category as enum ('company', 'freelance', 'graduation', 'academic');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum ('completed', 'in_progress');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- Admin identity
-- -----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Projects
-- -----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title jsonb not null default '{"en": ""}'::jsonb,
  tagline jsonb not null default '{"en": ""}'::jsonb,
  category project_category not null,
  status project_status not null default 'completed',
  start_date date,
  end_date date,
  role jsonb not null default '{"en": ""}'::jsonb,
  team_size smallint check (team_size is null or team_size > 0),
  platforms text[] not null default '{}'
    check (platforms <@ array['android', 'ios', 'web']::text[]),
  cover_path text,
  video_url text,
  video_path text,
  overview jsonb not null default '{"en": ""}'::jsonb,
  problem jsonb not null default '{"en": ""}'::jsonb,
  solution jsonb not null default '{"en": ""}'::jsonb,
  features jsonb not null default '{"en": []}'::jsonb,
  -- {"en": [{"title": "...", "body": "..."}], "ar": [...]}
  challenges jsonb not null default '{"en": []}'::jsonb,
  results jsonb not null default '{"en": ""}'::jsonb,
  architecture jsonb not null default '{"en": ""}'::jsonb,
  -- {"github", "play_store", "app_store", "demo", "case_study", "figma"}
  links jsonb not null default '{}'::jsonb,
  accent_color text not null default '#7FB2FF' check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  is_featured boolean not null default false,
  is_published boolean not null default false,
  is_confidential boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_published_order_idx
  on public.projects (is_published, sort_order);

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  path text not null,
  caption jsonb not null default '{"en": ""}'::jsonb,
  alt jsonb not null default '{"en": ""}'::jsonb,
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_images_project_idx
  on public.project_images (project_id, sort_order);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create table if not exists public.project_tags (
  project_id uuid not null references public.projects (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (project_id, tag_id)
);

-- -----------------------------------------------------------------------------
-- Experience
-- -----------------------------------------------------------------------------
create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role jsonb not null default '{"en": ""}'::jsonb,
  location jsonb not null default '{"en": ""}'::jsonb,
  employment_type jsonb not null default '{"en": ""}'::jsonb,
  start_date date not null,
  end_date date,
  description jsonb not null default '{"en": ""}'::jsonb,
  highlights jsonb not null default '{"en": []}'::jsonb,
  is_confidential boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists experience_updated_at on public.experience;
create trigger experience_updated_at
  before update on public.experience
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Skills
-- -----------------------------------------------------------------------------
create table if not exists public.skill_groups (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null default '{"en": ""}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.skill_groups (id) on delete cascade,
  name text not null,
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists skills_group_idx on public.skills (group_id, sort_order);

-- -----------------------------------------------------------------------------
-- Site settings (single row, id = 1)
-- -----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  hero_headline jsonb not null default '{"en": ""}'::jsonb,
  hero_sub jsonb not null default '{"en": ""}'::jsonb,
  about jsonb not null default '{"en": ""}'::jsonb,
  location jsonb not null default '{"en": ""}'::jsonb,
  education jsonb not null default '{"en": ""}'::jsonb,
  languages jsonb not null default '{"en": []}'::jsonb,
  photo_path text,
  cv_path text,
  email text,
  -- {"github", "linkedin", "whatsapp", ...}
  socials jsonb not null default '{}'::jsonb,
  -- [{"value": 5, "suffix": "+", "label": {"en": "...", "ar": "..."}}]
  stats jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Contact messages
-- -----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  message text not null check (char_length(message) between 1 and 5000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);

-- =============================================================================
-- Row Level Security
-- Public (anon + authenticated non-admin): read published content only.
-- Admin: full access.
-- =============================================================================
alter table public.admin_users enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.tags enable row level security;
alter table public.project_tags enable row level security;
alter table public.experience enable row level security;
alter table public.skill_groups enable row level security;
alter table public.skills enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;

-- admin_users: admin can see itself; nobody writes through the API.
drop policy if exists "admin reads admin_users" on public.admin_users;
create policy "admin reads admin_users" on public.admin_users
  for select using (public.is_admin());

-- projects
drop policy if exists "public reads published projects" on public.projects;
create policy "public reads published projects" on public.projects
  for select using (is_published or public.is_admin());

drop policy if exists "admin writes projects" on public.projects;
create policy "admin writes projects" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

-- project_images
drop policy if exists "public reads images of published projects" on public.project_images;
create policy "public reads images of published projects" on public.project_images
  for select using (
    public.is_admin() or exists (
      select 1 from public.projects p
      where p.id = project_id and p.is_published
    )
  );

drop policy if exists "admin writes project_images" on public.project_images;
create policy "admin writes project_images" on public.project_images
  for all using (public.is_admin()) with check (public.is_admin());

-- tags
drop policy if exists "public reads tags" on public.tags;
create policy "public reads tags" on public.tags for select using (true);

drop policy if exists "admin writes tags" on public.tags;
create policy "admin writes tags" on public.tags
  for all using (public.is_admin()) with check (public.is_admin());

-- project_tags
drop policy if exists "public reads tags of published projects" on public.project_tags;
create policy "public reads tags of published projects" on public.project_tags
  for select using (
    public.is_admin() or exists (
      select 1 from public.projects p
      where p.id = project_id and p.is_published
    )
  );

drop policy if exists "admin writes project_tags" on public.project_tags;
create policy "admin writes project_tags" on public.project_tags
  for all using (public.is_admin()) with check (public.is_admin());

-- experience, skill_groups, skills, site_settings: public read, admin write
drop policy if exists "public reads experience" on public.experience;
create policy "public reads experience" on public.experience for select using (true);
drop policy if exists "admin writes experience" on public.experience;
create policy "admin writes experience" on public.experience
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public reads skill_groups" on public.skill_groups;
create policy "public reads skill_groups" on public.skill_groups for select using (true);
drop policy if exists "admin writes skill_groups" on public.skill_groups;
create policy "admin writes skill_groups" on public.skill_groups
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public reads skills" on public.skills;
create policy "public reads skills" on public.skills for select using (true);
drop policy if exists "admin writes skills" on public.skills;
create policy "admin writes skills" on public.skills
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public reads site_settings" on public.site_settings;
create policy "public reads site_settings" on public.site_settings for select using (true);
drop policy if exists "admin writes site_settings" on public.site_settings;
create policy "admin writes site_settings" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- contact_messages: anyone may insert (validated server-side + DB checks),
-- only admin reads/updates/deletes.
drop policy if exists "anyone sends contact message" on public.contact_messages;
create policy "anyone sends contact message" on public.contact_messages
  for insert with check (is_read = false);

drop policy if exists "admin reads contact messages" on public.contact_messages;
create policy "admin reads contact messages" on public.contact_messages
  for select using (public.is_admin());

drop policy if exists "admin updates contact messages" on public.contact_messages;
create policy "admin updates contact messages" on public.contact_messages
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin deletes contact messages" on public.contact_messages;
create policy "admin deletes contact messages" on public.contact_messages
  for delete using (public.is_admin());

-- =============================================================================
-- Storage
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 52428800,
    array['image/webp', 'image/png', 'image/jpeg', 'image/avif', 'image/svg+xml', 'video/mp4', 'video/webm']),
  ('cv', 'cv', true, 10485760, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public reads portfolio buckets" on storage.objects;
create policy "public reads portfolio buckets" on storage.objects
  for select using (bucket_id in ('media', 'cv'));

drop policy if exists "admin inserts portfolio buckets" on storage.objects;
create policy "admin inserts portfolio buckets" on storage.objects
  for insert with check (bucket_id in ('media', 'cv') and public.is_admin());

drop policy if exists "admin updates portfolio buckets" on storage.objects;
create policy "admin updates portfolio buckets" on storage.objects
  for update using (bucket_id in ('media', 'cv') and public.is_admin());

drop policy if exists "admin deletes portfolio buckets" on storage.objects;
create policy "admin deletes portfolio buckets" on storage.objects
  for delete using (bucket_id in ('media', 'cv') and public.is_admin());
