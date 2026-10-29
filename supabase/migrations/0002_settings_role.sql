-- =============================================================================
-- Your professional title ("Flutter / Mobile Engineer") becomes editable from
-- the admin instead of living in the code. Safe to re-run.
-- =============================================================================
alter table public.site_settings
  add column if not exists role jsonb not null default '{"en": ""}'::jsonb;

update public.site_settings
set role = '{"en": "Flutter / Mobile Engineer"}'::jsonb
where id = 1 and coalesce(role->>'en', '') = '';
