-- ============================================================================
-- Lumen — Phase 7: App Download block
-- Adds the `app_download` block type and per-click platform metadata so we can
-- distinguish App Store vs Google Play clicks in analytics.
-- ============================================================================

-- Allow the new polymorphic block type. The original constraint is an inline
-- column check, auto-named `blocks_type_check`.
alter table public.blocks drop constraint if exists blocks_type_check;
alter table public.blocks
  add constraint blocks_type_check
  check (type in ('link', 'embed', 'social', 'app_download'));

-- Per-click metadata. For app_download clicks we store { "store": "ios" | "android" };
-- existing link/embed clicks keep the default empty object. Written server-side
-- only (service role) — RLS on clicks already blocks all client writes.
alter table public.clicks
  add column if not exists meta jsonb not null default '{}'::jsonb;
