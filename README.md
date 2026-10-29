# Ammar Zeineh — Portfolio

Personal portfolio of Ammar Zeineh, Flutter / Mobile Engineer in Damascus.
Bilingual (English + Arabic, right-to-left), dark-first "Nocturne" design,
with a private admin for editing every piece of content.

- **Public site:** `/en`, `/ar` — home, projects, case studies, contact, CV download.
- **Admin:** `/admin` — projects, experience, skills, site settings, messages.

## Stack

| Package | Why it's here |
| --- | --- |
| `next` 16 (App Router, Cache Components) | Rendering, routing, caching, OG images, sitemap |
| `react` 19 | UI, `<ViewTransition>` page transitions |
| `tailwindcss` 4 | Styling; design tokens live in `src/styles/globals.css` |
| `motion` | Component animation: cursor, magnetic buttons, filters, menus, sortable lists |
| `gsap` (+ ScrollTrigger) | Scroll-driven work: pinned horizontal showcase, timeline line |
| `lenis` | Smooth scrolling, driven from GSAP's ticker |
| `next-themes` | Dark / light toggle without a flash |
| `@supabase/supabase-js`, `@supabase/ssr` | Database, auth (admin), storage (images, CV) |
| `zod` | One schema per form, shared by the browser and the server action |
| `react-hook-form`, `@hookform/resolvers` | Admin and contact forms |
| `react-markdown`, `remark-gfm` | Case-study sections written in Markdown (raw HTML is never rendered) |
| `yet-another-react-lightbox` | Accessible screenshot gallery |
| `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tw-animate-css`, `sonner` | shadcn/ui components and toasts — admin only |
| `server-only` | Fails the build if server code is imported into the browser |
| `@playwright/test` (dev) | Browser checks during development |

Email (Resend) and phone notifications (Telegram) use plain `fetch`; there's no SDK for either.

## Run it locally

Requirements: Node 20+, pnpm, and a Supabase project.

```bash
pnpm install
cp .env.example .env.local   # then fill it in (see below)
pnpm dev                     # http://localhost:3000
```

### Environment variables

| Variable | Required | What it's for |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Public URL, no trailing slash. Used for canonical links, sitemap, share images |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Same page. Safe in the browser; Row Level Security protects the data |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Maintenance scripts only. Never used by the running site |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | no | Phone notification for each contact message |
| `RESEND_API_KEY`, `CONTACT_NOTIFY_EMAIL`, `CONTACT_FROM_EMAIL` | no | Email notification for each contact message |

`.env.local` is git-ignored. Never commit real keys.

### Database setup (once per Supabase project)

1. In the Supabase **SQL editor**, run in order:
   1. `supabase/migrations/0001_init.sql` — tables, Row Level Security, storage buckets.
   2. `supabase/migrations/0002_settings_role.sql` — the editable role line.
   3. `supabase/seed.sql` — starting content from the CV (safe to re-run).
2. **Authentication → Sign In / Providers:** turn off "Allow new users to sign up".
3. **Authentication → Users → Add user:** create your admin login (email + password).
4. Make that user an admin (SQL editor), using the user's UUID from the Users list:
   ```sql
   insert into public.admin_users (user_id) values ('YOUR-USER-UUID');
   ```
5. Sign in at `/admin/login`.

`seed.sql` contains English content only; add Arabic in the admin (each field has EN and AR side by side). Empty Arabic fields fall back to English.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build / serve it |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Generates route types, then `tsc --noEmit` |
| `pnpm check` | lint + typecheck + build — run before every deploy |
| `pnpm placeholders` | Regenerates the placeholder phone screens in `public/placeholders` |

## Deploy (Vercel + Supabase)

1. Push the repo to GitHub and import it in Vercel (framework preset: Next.js; build command `pnpm build`).
2. In **Vercel → Settings → Environment Variables**, add everything from `.env.local`.
   Set `NEXT_PUBLIC_SITE_URL` to the production domain (e.g. `https://ammarzeineh.com`).
3. In **Supabase → Authentication → URL Configuration**, set the Site URL to the same domain.
4. Deploy. After adding a custom domain, redeploy so the sitemap and share images use it.

Content edits in the admin go live straight away (each save refreshes the cached pages that use it); no redeploy needed.

## How things fit together

```
src/
  app/
    [locale]/        public site (en, ar): pages, metadata, OG images, 404
    admin/           admin (own root layout, English only)
    sitemap.ts, robots.ts
  components/
    sections/        home page sections
    project/         case-study page parts
    motion/          reusable animation primitives
    site/            header, footer, preloader, cursor, language & theme switches
    admin/           admin forms and lists (+ shadcn/ui in admin/ui)
  i18n/              dictionaries (en.ts, ar.ts), locale config, formatting
  lib/
    data/            cached, typed queries ("use cache" + tags)
    admin/           server actions, schemas, auth check
    contact/         contact form schema + action (spam checks, notifications)
  proxy.ts           locale redirect for "/", admin session refresh
supabase/            migrations + seed
```

- **Languages:** UI strings live in `src/i18n/dictionaries`; content is stored as `{ en, ar }` JSON in each column. `/` redirects to the visitor's saved choice, else their browser language.
- **Caching:** public pages are prerendered and cached; admin actions call `updateTag` so edits appear immediately.
- **Security:** RLS lets visitors read published content and insert contact messages only; all writes require a row in `admin_users`. The admin is also checked on the server in every page and action.
- **Motion:** respects `prefers-reduced-motion` (fades only, no smooth scroll, no rotation) and drops the heavier effects on touch or low-end devices.

## Quality targets

Measured on the production build (Lighthouse 12, mobile, DevTools throttling):
Performance 93–95, Accessibility 100, Best Practices 100, SEO 100 on every public page;
desktop Performance 97–98. Layout shift is effectively zero.
