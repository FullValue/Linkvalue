# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Lumen** — a link-in-bio SaaS (Linktree-style). Users sign up, build a page in a
private dashboard (`/dashboard`), and get a public page at `/[username]`.
Next.js 16 (App Router, React 19), Supabase (Postgres + Auth + Storage + RLS),
Tailwind v4 + shadcn/ui, Zod, @dnd-kit, Recharts. Package manager is **pnpm**.

> The README's "Roadmap"/"Out of scope" lists are stale — QR codes and the
> App Download block now exist. Trust the code over the README for feature scope.

## Commands

```bash
pnpm dev            # dev server (Turbopack)
pnpm build          # production build
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest unit suite (run once)
pnpm test:watch     # Vitest watch mode
pnpm format         # Prettier write
```

Run a single test file: `pnpm vitest run src/lib/socials.test.ts`
Run tests matching a name: `pnpm vitest run -t "reserved"`

Tests live next to their subject as `*.test.ts` and cover pure logic only
(usernames, embeds, socials, themes, Zod validation, safe-redirect). There is
no DB/E2E harness — integration paths were verified manually against the live
project.

## Database / migrations

Migrations are SQL files in `supabase/migrations/` (filename order matters).
After schema changes, regenerate types: `pnpm db:types` → `src/lib/supabase/types.ts`.

**Do not run `pnpm db:push`/`db:reset` against the live project.** Apply
migrations to the linked Supabase project via the Management API using the token
in the keychain (no Docker, no local DB). `db:reset` is for a local stack only.

## Architecture

**Authorization = Row Level Security, not app code.** Every data access goes
through the Supabase client so PostgREST enforces RLS with the user's JWT. This
is why Prisma is deliberately not used. Three clients in `src/lib/supabase/`:
- `server.ts` — `createClient()`, anon key + request cookies, RLS-enforced.
  Use in Server Components, Route Handlers, Server Actions.
- `client.ts` — browser client.
- `admin.ts` — `createAdminClient()`, **service-role, bypasses RLS**. `server-only`.
  Use ONLY for trusted writes (analytics tracking). Never import into the browser.

**Mutations are Server Actions**, centralized in `src/app/(dashboard)/dashboard/actions.ts`.
Conventions every action follows:
- `context()` helper → `{ userId, supabase }` or null; bail with `{ error: "Not signed in" }`.
- Parse input with the matching Zod schema from `src/lib/validations/`; on failure
  return `{ fieldErrors }` (from `error.flatten()`), else `{ error }` or `{ data }`
  via the shared `Result<T>` type.
- `revalidatePath("/dashboard")` after a successful write.
- RLS scopes `.eq("id", ...)` writes to the owner — actions don't re-check ownership.

**Blocks** are a single polymorphic table discriminated by `type`
(`link` | `embed` | `social` | `app_download`). Type-specific fields live in a
`meta` jsonb column; create/update branch on `type`. When adding a block type:
add the Zod schema in `validations/blocks.ts`, a branch in
`createBlockAction`/`updateBlockAction`, a renderer in `components/profile/`, and
the editor UI in `components/builder/`.

**Builder state** lives in `components/builder/builder-context.tsx` (`useBuilder`).
It holds optimistic local state for profile + blocks: mutations update state
immediately, call the action, and **revert on error** (snapshot captured inside
the state updater, not the render closure). Appearance edits are debounced 500ms
before persisting. The same `ProfileView` component renders both the live preview
and the public page.

**Theme system** (`src/lib/themes/index.ts`): a profile stores `theme_id` (preset)
+ `custom_styles` jsonb (per-field overrides). `resolveStyles(themeId, custom)`
merges defined overrides onto the preset → a fully-specified `ResolvedStyles` the
renderer paints with. Switching theme resets `custom_styles` to `{}`.

**Routing.** `src/proxy.ts` is the Next.js 16 middleware (renamed "proxy"). It
refreshes the Supabase session and supports wildcard subdomains: when
`NEXT_PUBLIC_ROOT_DOMAIN` is set, `<handle>.root.tld` rewrites `/` → `/<handle>`
(see `tenantSubdomain` in `src/lib/usernames.ts`). The public profile is
`src/app/[username]/`. Handles must avoid `RESERVED_USERNAMES` — that set must
cover every top-level route segment or a handle could shadow an app route. The
`USERNAME_REGEX`/length rules are mirrored by a CHECK constraint in the migration;
keep them in lockstep.

**Analytics.** Click tracking goes through `/api/go/[blockId]` (records click via
admin client, then 302s to the destination); page views via `/api/track/view`.
Both dedup with short-lived `httpOnly` cookies and store counts only — no IP/PII.
The redirect route validates the destination is http(s) before redirecting
(SSRF guard); avatar URLs are likewise pinned to the user's own storage prefix.

**Env** is validated with Zod and accessed lazily via `clientEnv()` (`src/lib/env.ts`,
browser-safe) and `serverEnv()` (`src/lib/env.server.ts`, secrets). Reference
`process.env.NEXT_PUBLIC_*` by full literal name so Next inlines it.

## Conventions

- TypeScript strict; path alias `@/*` → `src/*`.
- shadcn/ui primitives in `components/ui/` (radix-ui). Add via `pnpm dlx shadcn`.
- Security headers + image remote patterns are in `next.config.ts`.
