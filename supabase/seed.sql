-- =============================================================================
-- Seed data from Ammar Zeineh's CV. Safe to re-run (upserts on fixed ids).
-- Placeholder images live in /public/placeholders and are referenced by
-- absolute path; replace them from the admin (uploads go to Storage).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Site settings
-- -----------------------------------------------------------------------------
insert into public.site_settings (id, hero_headline, hero_sub, about, location, education, languages, photo_path, email, socials, stats)
values (
  1,
  '{"en": "Mobile apps that feel *native* in every language."}',
  '{"en": "Flutter engineer building fast, considered apps — from real-time ride-hailing to Arabic-first commerce."}',
  '{"en": "I''m a Flutter developer from Damascus who cares about the details users feel but rarely notice: a booking flow that never stalls, a live map that tracks without jitter, an Arabic interface that reads as naturally as its English twin.\n\nI work with BLoC/Cubit and Clean Architecture, and I''ve shipped e-commerce, booking, LMS, B2B and real-time ride-hailing apps — with Stripe payments, Firebase and WebSockets under the hood. I''ve delivered both inside a remote company team and as a freelancer owning a product end to end."}',
  '{"en": "Damascus, Syria"}',
  '{"en": "B.Sc. Information Technology Engineering, Damascus University (2026)"}',
  '{"en": ["Arabic (native)", "English (B1–B2)"]}',
  '/placeholders/portrait.svg',
  'ammarzeineh3@gmail.com',
  '{"github": "https://github.com/AmmarZeineh", "linkedin": "https://www.linkedin.com/in/ammar-zeineh"}',
  '[
    {"value": 5, "suffix": "", "label": {"en": "Apps built end to end"}},
    {"value": 2, "suffix": "+", "label": {"en": "Years building with Flutter"}},
    {"value": 2, "suffix": "", "label": {"en": "Remote roles, in a team and freelance"}},
    {"value": 1, "suffix": "", "label": {"en": "Production app delivered for a client"}}
  ]'
)
on conflict (id) do update set
  hero_headline = excluded.hero_headline,
  hero_sub = excluded.hero_sub,
  about = excluded.about,
  location = excluded.location,
  education = excluded.education,
  languages = excluded.languages,
  photo_path = excluded.photo_path,
  email = excluded.email,
  socials = excluded.socials,
  stats = excluded.stats;

-- -----------------------------------------------------------------------------
-- Tags
-- -----------------------------------------------------------------------------
insert into public.tags (id, name, slug) values
  ('00000000-0000-4000-a000-000000000001', 'Flutter', 'flutter'),
  ('00000000-0000-4000-a000-000000000002', 'Dart', 'dart'),
  ('00000000-0000-4000-a000-000000000003', 'BLoC/Cubit', 'bloc-cubit'),
  ('00000000-0000-4000-a000-000000000004', 'Clean Architecture', 'clean-architecture'),
  ('00000000-0000-4000-a000-000000000005', 'MVVM', 'mvvm'),
  ('00000000-0000-4000-a000-000000000006', 'WebSocket', 'websocket'),
  ('00000000-0000-4000-a000-000000000007', 'Freezed', 'freezed'),
  ('00000000-0000-4000-a000-000000000008', 'REST API', 'rest-api'),
  ('00000000-0000-4000-a000-000000000009', 'Stripe', 'stripe'),
  ('00000000-0000-4000-a000-000000000010', 'Firebase', 'firebase'),
  ('00000000-0000-4000-a000-000000000011', 'Supabase', 'supabase'),
  ('00000000-0000-4000-a000-000000000012', 'FCM', 'fcm'),
  ('00000000-0000-4000-a000-000000000013', 'Arabic/RTL', 'arabic-rtl'),
  ('00000000-0000-4000-a000-000000000014', 'Dio', 'dio'),
  ('00000000-0000-4000-a000-000000000015', 'json_serializable', 'json-serializable')
on conflict (id) do update set name = excluded.name, slug = excluded.slug;

-- -----------------------------------------------------------------------------
-- Projects
-- -----------------------------------------------------------------------------
insert into public.projects (
  id, slug, title, tagline, category, status, start_date, end_date, role, team_size, platforms,
  cover_path, overview, problem, solution, features, challenges, results, architecture,
  links, accent_color, is_featured, is_published, is_confidential, sort_order
) values
(
  '10000000-0000-4000-a000-000000000001',
  'mashena',
  '{"en": "Mashena"}',
  '{"en": "A ride-hailing platform with live driver tracking over WebSockets."}',
  'graduation', 'completed', null, null,
  '{"en": "Flutter Developer — Passenger App"}', null, '{android,ios}',
  '/placeholders/mashena-1.svg',
  '{"en": "Mashena is a ride-hailing platform built as my graduation project. I built the passenger app: requesting a ride, watching the driver approach in real time, and moving through the full trip lifecycle."}',
  '{"en": "Ride-hailing lives or dies on trust in the live map. Passengers need to see an accurate driver position and trip state the moment it changes — on unreliable mobile networks."}',
  '{"en": "A WebSocket-driven trip flow with a single source of truth per trip, modelled as explicit states in BLoC/Cubit, with immutable Freezed models and Clean Architecture boundaries so the transport layer can change without touching the UI."}',
  '{"en": ["Real-time driver tracking on a live map", "End-to-end trip flow: request, match, pickup, ride, complete", "Immutable models with Freezed + json_serializable", "Clean Architecture with MVVM presentation"]}',
  '{"en": [{"title": "Keeping the map smooth under bursty updates", "body": "Location events arrive irregularly. I buffered and interpolated positions so the marker glides instead of jumping, and kept heavy work off the UI thread."}, {"title": "Modelling the trip lifecycle", "body": "Each trip phase is an explicit Cubit state, which made illegal transitions impossible and reconnection logic straightforward."}]}',
  '{"en": "A responsive passenger experience where trip state and driver position stay in sync with the server in real time."}',
  '{"en": "Clean Architecture (data / domain / presentation), MVVM in the presentation layer, BLoC/Cubit for state, a WebSocket data source behind a repository interface."}',
  '{}',
  '#F2B45A', true, true, false, 1
),
(
  '10000000-0000-4000-a000-000000000002',
  'mwaeed',
  '{"en": "Mwaeed"}',
  '{"en": "Book local services in a few taps — and pay securely with Stripe."}',
  'academic', 'completed', null, null,
  '{"en": "Flutter Developer"}', null, '{android,ios}',
  '/placeholders/mwaeed-1.svg',
  '{"en": "Mwaeed is a service booking platform: discover a provider, pick a slot, and pay — with a complete authentication system behind it."}',
  '{"en": "Booking apps lose users in long, fragile flows: account creation, slot selection and payment each add a chance to drop off."}',
  '{"en": "A short, forgiving booking flow, a full auth system with email verification and password recovery, and Stripe payments integrated over REST APIs."}',
  '{"en": ["Guided booking flow", "Email verification and password recovery", "Stripe payments", "REST API integration"]}',
  '{"en": [{"title": "Payment state you can trust", "body": "Payment results are confirmed server-side before a booking is shown as paid, so the UI never claims success prematurely."}]}',
  '{"en": "An end-to-end booking experience from sign-up to paid appointment."}',
  '{"en": "Feature-first structure, BLoC/Cubit state management, Dio-based API layer."}',
  '{"github": "https://github.com/AmmarZeineh/mwaeed"}',
  '#8FD8B8', true, true, false, 2
),
(
  '10000000-0000-4000-a000-000000000003',
  'swift-ecommerce',
  '{"en": "Swift E-Commerce"}',
  '{"en": "The merchant-side app of a dual-marketplace platform, fully in Arabic."}',
  'freelance', 'completed', '2024-01-01', '2024-12-31',
  '{"en": "Freelance Flutter Developer"}', null, '{android,ios}',
  '/placeholders/swift-1.svg',
  '{"en": "Swift is a dual-marketplace e-commerce platform. As a freelancer I delivered the full merchant-side app, letting sellers run their store from their phone."}',
  '{"en": "Merchants needed to manage products, stock and incoming orders on the go, in an interface that feels native to Arabic speakers."}',
  '{"en": "A complete merchant app on a Supabase backend with product, inventory and order management, push notifications through FCM, and a fully Arabic/RTL interface."}',
  '{"en": ["Product and inventory management", "Order management", "FCM push notifications", "Fully Arabic/RTL UI", "Supabase backend"]}',
  '{"en": [{"title": "RTL done properly", "body": "Directional layouts, icons and gestures were mirrored deliberately rather than flipped wholesale, so numbers, prices and media still read correctly."}]}',
  '{"en": "A production merchant app delivered end to end as a freelancer."}',
  '{"en": "BLoC/Cubit state management over a Supabase data layer, with FCM for real-time order notifications."}',
  '{}',
  '#FF8D6B', false, true, false, 3
),
(
  '10000000-0000-4000-a000-000000000004',
  'coursecraft',
  '{"en": "CourseCraft"}',
  '{"en": "A learning management system with automated grading and live chat."}',
  'academic', 'completed', null, null,
  '{"en": "Flutter Developer"}', null, '{android,ios}',
  '/placeholders/coursecraft-1.svg',
  '{"en": "CourseCraft is a learning management system covering courses, enrollment, quizzes and submissions — with real-time chat between students and instructors."}',
  '{"en": "Students and instructors need one place to learn, get assessed and talk, without waiting on manual grading."}',
  '{"en": "Course and enrollment flows, quizzes and submissions with automated grading, and real-time chat built on Firebase."}',
  '{"en": ["Courses and enrollment", "Quizzes and submissions", "Automated grading", "Real-time chat with Firebase"]}',
  '{"en": []}',
  '{"en": ""}',
  '{"en": ""}',
  '{"github": "https://github.com/AmmarZeineh/coursecraft"}',
  '#B7A3FF', false, true, false, 4
),
(
  '10000000-0000-4000-a000-000000000005',
  'pharmacist-app',
  '{"en": "Pharmacist App"}',
  '{"en": "A B2B ordering platform connecting pharmacies and suppliers."}',
  'academic', 'completed', null, null,
  '{"en": "Flutter Developer"}', null, '{android,ios}',
  '/placeholders/pharmacist-1.svg',
  '{"en": "A B2B platform where pharmacies browse supplier catalogues and place orders, and suppliers fulfil them — each with their own role-based experience."}',
  '{"en": "Pharmacy ordering is often done by phone, with no live view of what is actually in stock."}',
  '{"en": "Product browsing and filtering with an inventory-aware UI, role-based authentication, and cart, checkout and order flows for both pharmacy and supplier roles."}',
  '{"en": ["Product browsing and filtering", "Inventory-aware UI", "Role-based authentication", "Cart, checkout and orders across two roles"]}',
  '{"en": []}',
  '{"en": ""}',
  '{"en": ""}',
  '{"github": "https://github.com/AmmarZeineh/pharmacist-app"}',
  '#6ED3DF', false, true, false, 5
)
on conflict (id) do update set
  slug = excluded.slug, title = excluded.title, tagline = excluded.tagline,
  category = excluded.category, status = excluded.status,
  start_date = excluded.start_date, end_date = excluded.end_date,
  role = excluded.role, team_size = excluded.team_size, platforms = excluded.platforms,
  cover_path = excluded.cover_path, overview = excluded.overview, problem = excluded.problem,
  solution = excluded.solution, features = excluded.features, challenges = excluded.challenges,
  results = excluded.results, architecture = excluded.architecture, links = excluded.links,
  accent_color = excluded.accent_color, is_featured = excluded.is_featured,
  is_published = excluded.is_published, is_confidential = excluded.is_confidential,
  sort_order = excluded.sort_order;

-- Gallery placeholders (3 screens per project)
delete from public.project_images where project_id in (
  '10000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000004',
  '10000000-0000-4000-a000-000000000005'
);

insert into public.project_images (project_id, path, caption, alt, width, height, sort_order)
select p.id,
       '/placeholders/' || p.prefix || '-' || n || '.svg',
       jsonb_build_object('en', 'Screen ' || n),
       jsonb_build_object('en', p.name || ' app screen ' || n),
       1179, 2556, n
from (values
  ('10000000-0000-4000-a000-000000000001'::uuid, 'mashena', 'Mashena'),
  ('10000000-0000-4000-a000-000000000002'::uuid, 'mwaeed', 'Mwaeed'),
  ('10000000-0000-4000-a000-000000000003'::uuid, 'swift', 'Swift'),
  ('10000000-0000-4000-a000-000000000004'::uuid, 'coursecraft', 'CourseCraft'),
  ('10000000-0000-4000-a000-000000000005'::uuid, 'pharmacist', 'Pharmacist')
) as p(id, prefix, name)
cross join generate_series(1, 3) as n;

-- Project ↔ tag links
delete from public.project_tags where project_id in (
  '10000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000004',
  '10000000-0000-4000-a000-000000000005'
);

insert into public.project_tags (project_id, tag_id, sort_order)
select p.project_id::uuid, t.id, p.ord
from (values
  ('10000000-0000-4000-a000-000000000001', 'flutter', 0),
  ('10000000-0000-4000-a000-000000000001', 'websocket', 1),
  ('10000000-0000-4000-a000-000000000001', 'bloc-cubit', 2),
  ('10000000-0000-4000-a000-000000000001', 'clean-architecture', 3),
  ('10000000-0000-4000-a000-000000000001', 'mvvm', 4),
  ('10000000-0000-4000-a000-000000000001', 'freezed', 5),
  ('10000000-0000-4000-a000-000000000001', 'json-serializable', 6),
  ('10000000-0000-4000-a000-000000000002', 'flutter', 0),
  ('10000000-0000-4000-a000-000000000002', 'stripe', 1),
  ('10000000-0000-4000-a000-000000000002', 'rest-api', 2),
  ('10000000-0000-4000-a000-000000000002', 'bloc-cubit', 3),
  ('10000000-0000-4000-a000-000000000002', 'dio', 4),
  ('10000000-0000-4000-a000-000000000003', 'flutter', 0),
  ('10000000-0000-4000-a000-000000000003', 'supabase', 1),
  ('10000000-0000-4000-a000-000000000003', 'bloc-cubit', 2),
  ('10000000-0000-4000-a000-000000000003', 'fcm', 3),
  ('10000000-0000-4000-a000-000000000003', 'arabic-rtl', 4),
  ('10000000-0000-4000-a000-000000000004', 'flutter', 0),
  ('10000000-0000-4000-a000-000000000004', 'firebase', 1),
  ('10000000-0000-4000-a000-000000000004', 'bloc-cubit', 2),
  ('10000000-0000-4000-a000-000000000005', 'flutter', 0),
  ('10000000-0000-4000-a000-000000000005', 'rest-api', 1),
  ('10000000-0000-4000-a000-000000000005', 'bloc-cubit', 2)
) as p(project_id, tag_slug, ord)
join public.tags t on t.slug = p.tag_slug;

-- -----------------------------------------------------------------------------
-- Experience
-- -----------------------------------------------------------------------------
insert into public.experience (id, company, role, location, employment_type, start_date, end_date, description, highlights, is_confidential, sort_order)
values
(
  '20000000-0000-4000-a000-000000000001',
  'V3 Bilisim',
  '{"en": "Flutter Developer"}',
  '{"en": "Remote · Türkiye"}',
  '{"en": "Full-time"}',
  '2026-06-01', '2026-09-30',
  '{"en": "Worked in a remote team on a Flutter app for buying and selling stocks."}',
  '{"en": ["Contributed to the KYC flow: ID document and photo identity verification", "Automatic data extraction from identity documents"]}',
  true, 1
),
(
  '20000000-0000-4000-a000-000000000002',
  'Swift E-Commerce Platform',
  '{"en": "Flutter Developer"}',
  '{"en": "Remote"}',
  '{"en": "Freelance"}',
  '2024-01-01', '2024-12-31',
  '{"en": "Delivered the full merchant-side app for a dual-marketplace e-commerce platform."}',
  '{"en": ["Supabase backend with product, inventory and order management", "BLoC/Cubit state management", "FCM push notifications", "Fully Arabic/RTL interface"]}',
  false, 2
)
on conflict (id) do update set
  company = excluded.company, role = excluded.role, location = excluded.location,
  employment_type = excluded.employment_type, start_date = excluded.start_date,
  end_date = excluded.end_date, description = excluded.description,
  highlights = excluded.highlights, is_confidential = excluded.is_confidential,
  sort_order = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- Skills
-- -----------------------------------------------------------------------------
insert into public.skill_groups (id, name, sort_order) values
  ('30000000-0000-4000-a000-000000000001', '{"en": "Mobile"}', 1),
  ('30000000-0000-4000-a000-000000000002', '{"en": "Architecture"}', 2),
  ('30000000-0000-4000-a000-000000000003', '{"en": "API & Backend"}', 3),
  ('30000000-0000-4000-a000-000000000004', '{"en": "Libraries"}', 4),
  ('30000000-0000-4000-a000-000000000005', '{"en": "Tools"}', 5)
on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;

delete from public.skills where group_id in (
  '30000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000002',
  '30000000-0000-4000-a000-000000000003', '30000000-0000-4000-a000-000000000004',
  '30000000-0000-4000-a000-000000000005'
);

insert into public.skills (group_id, name, sort_order)
select g::uuid, s, ord
from (values
  ('30000000-0000-4000-a000-000000000001', 'Flutter', 1),
  ('30000000-0000-4000-a000-000000000001', 'Dart', 2),
  ('30000000-0000-4000-a000-000000000001', 'Responsive UI', 3),
  ('30000000-0000-4000-a000-000000000001', 'Adaptive Layouts', 4),
  ('30000000-0000-4000-a000-000000000001', 'Localization', 5),
  ('30000000-0000-4000-a000-000000000001', 'Arabic/RTL', 6),
  ('30000000-0000-4000-a000-000000000002', 'BLoC', 1),
  ('30000000-0000-4000-a000-000000000002', 'Cubit', 2),
  ('30000000-0000-4000-a000-000000000002', 'Riverpod', 3),
  ('30000000-0000-4000-a000-000000000002', 'Clean Architecture', 4),
  ('30000000-0000-4000-a000-000000000002', 'MVVM', 5),
  ('30000000-0000-4000-a000-000000000003', 'REST APIs', 1),
  ('30000000-0000-4000-a000-000000000003', 'Dio', 2),
  ('30000000-0000-4000-a000-000000000003', 'Firebase', 3),
  ('30000000-0000-4000-a000-000000000003', 'FCM', 4),
  ('30000000-0000-4000-a000-000000000003', 'Supabase', 5),
  ('30000000-0000-4000-a000-000000000003', 'Stripe', 6),
  ('30000000-0000-4000-a000-000000000004', 'GoRouter', 1),
  ('30000000-0000-4000-a000-000000000004', 'Freezed', 2),
  ('30000000-0000-4000-a000-000000000004', 'json_serializable', 3),
  ('30000000-0000-4000-a000-000000000005', 'Git', 1),
  ('30000000-0000-4000-a000-000000000005', 'GitHub', 2),
  ('30000000-0000-4000-a000-000000000005', 'Postman', 3)
) as v(g, s, ord);

-- -----------------------------------------------------------------------------
-- Admin: grant admin to the account with this email (create it first in
-- Supabase → Authentication → Users). Inserts nothing if it doesn't exist yet.
-- -----------------------------------------------------------------------------
insert into public.admin_users (user_id)
select id from auth.users where email = 'ammarzeineh3@gmail.com'
on conflict (user_id) do nothing;
