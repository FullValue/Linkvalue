# Lumen

A premium **link-in-bio SaaS** (Linktree-style). Each user signs up, builds their
page in a private dashboard, and gets a public page at `/[username]`.

> **Status:** Phase 0 (foundation) complete. Built phase-by-phase — see the
> [Roadmap](#roadmap).

---

## Stack

| Concern        | Choice                                                                |
| -------------- | --------------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router) + TypeScript (strict)                         |
| Styling        | Tailwind CSS v4 + shadcn/ui (radix-nova)                              |
| Backend / Auth | Supabase (Postgres + Auth + Storage + Row Level Security)             |
| Data access    | `@supabase/ssr` (see [decision](#why-the-supabase-client-not-prisma)) |
| Validation     | Zod                                                                   |
| Drag & drop    | @dnd-kit                                                              |
| Charts         | Recharts                                                              |
| Deploy target  | Vercel                                                                |

### Why the Supabase client (not Prisma)?

Row Level Security is the backbone of this app's authorization. The Supabase
client routes every query through PostgREST with the user's JWT, so **RLS is
enforced automatically**. Prisma connects to Postgres directly and bypasses RLS,
which would force us to re-implement authorization in application code. Going
Supabase-native keeps RLS as the single source of truth, removes serverless
connection-pooler setup, and lets us generate types straight from the schema.

---

## Getting started

### 1. Prerequisites

- Node 20+ and [pnpm](https://pnpm.io)
- A [Supabase](https://supabase.com) project
- The [Supabase CLI](https://supabase.com/docs/guides/cli) (bundled as a dev dep)

### 2. Install

```bash
pnpm install
```

### 3. Environment

Copy the example and fill it in (values come from **Supabase → Project Settings
→ API**):

```bash
cp .env.example .env.local
```

| Variable                        | Where to find it                 | Exposed to browser |
| ------------------------------- | -------------------------------- | ------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project URL                      | ✅ yes             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | API keys → `anon` `public`       | ✅ yes             |
| `SUPABASE_SERVICE_ROLE_KEY`     | API keys → `service_role` secret | ❌ **never**       |
| `NEXT_PUBLIC_SITE_URL`          | Your deployed URL (or localhost) | ✅ yes             |

### 4. Database

Link the project and push the schema (creates tables, RLS policies, and the
`avatars` storage bucket):

```bash
pnpm supabase login                                  # one-time, opens a browser
pnpm supabase link --project-ref <your-project-ref>  # prompts for DB password
pnpm db:push                                          # applies supabase/migrations
pnpm db:types                                         # regenerate typed schema
```

> Prefer the GUI? Paste `supabase/migrations/*_init.sql` into the Supabase
> **SQL Editor** and run it — it's idempotent-friendly and self-contained.

### 5. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Script           | Does                                   |
| ---------------- | -------------------------------------- |
| `pnpm dev`       | Start the dev server (Turbopack)       |
| `pnpm build`     | Production build                       |
| `pnpm start`     | Serve the production build             |
| `pnpm lint`      | ESLint                                 |
| `pnpm typecheck` | `tsc --noEmit`                         |
| `pnpm format`    | Prettier write                         |
| `pnpm db:push`   | Apply migrations to the linked project |
| `pnpm db:types`  | Regenerate `src/lib/supabase/types.ts` |
| `pnpm db:reset`  | Reset the database to migrations       |

---

## Project structure

```
src/
  app/
    page.tsx                 # marketing landing (Noir Luminous)
    layout.tsx               # fonts, providers, metadata
    globals.css              # design tokens + utilities
  components/
    ui/                      # shadcn primitives
    brand/                   # logo / wordmark
    marketing/               # landing-only pieces
  lib/
    supabase/                # browser / server / admin clients + types
    validations/             # Zod schemas (frontier validation)
    themes/                  # public-page theme + style system
    usernames.ts             # reserved slugs + handle rules
    env.ts · env.server.ts   # validated environment
    site.ts                  # product branding (single source of truth)
  middleware.ts              # session refresh + route protection
supabase/
  migrations/                # SQL schema + RLS + storage policies
  config.toml
```

---

## Data model

- **profiles** — `id` (= auth user), `username` (unique), `display_name`, `bio`,
  `avatar_url`, `theme_id`, `custom_styles` (jsonb), timestamps
- **blocks** — `id`, `profile_id`, `type` (`link` | `embed` | `social`), `title`,
  `url`, `icon`, `position`, `is_active`, `meta` (jsonb), timestamps
- **clicks** — `id`, `block_id`, `profile_id`, `created_at`
- **page_views** — `id`, `profile_id`, `created_at`

**RLS in one line:** profiles + active blocks are world-readable (public pages);
users only mutate their own rows; analytics rows are written server-side via the
service role and read back only by their owner.

---

## Deploy (Vercel)

1. Import the repo into Vercel (pnpm + Next.js auto-detected).
2. Add the four environment variables from the table above
   (set `NEXT_PUBLIC_SITE_URL` to the production URL).
3. Deploy. Migrations are applied via the Supabase CLI, not at build time.

---

## Roadmap

- **Phase 0** — Foundation: setup, Supabase, schema + RLS, design system ✅
- **Phase 1** — Auth & accounts (email/password, unique username)
- **Phase 2** — Builder: block CRUD, drag & drop, profile + live preview
- **Phase 3** — Visual customization (themes + fine-grained styles)
- **Phase 4** — Public page `/[username]` (SSR, embeds, Open Graph)
- **Phase 5** — Analytics (clicks + views)
- **Phase 6** — Polish, tests, deployment

**Out of scope (by design, architecture stays extensible):** payments, QR codes,
traffic sources, time-series charts, social OAuth, multi-page profiles.
