-- ============================================================================
-- Lumen — Phase 10: advanced customization
-- Header layout + banner image become first-class profile columns (they're
-- structural, not part of the theme blob). The richer wallpaper config and the
-- new button axes live inside the existing profiles.custom_styles jsonb, so no
-- schema change is needed for those.
-- ============================================================================

alter table public.profiles
  add column if not exists header_layout text not null default 'classic'
    check (header_layout in ('classic', 'hero', 'banner', 'cutout', 'shape'));

alter table public.profiles
  add column if not exists banner_url text;

-- Pin banner_url to an object in the owner's own media/<id>/ folder (or null) —
-- same SSRF/defense-in-depth treatment as avatar_url.
alter table public.profiles drop constraint if exists profiles_banner_url_safe;
alter table public.profiles
  add constraint profiles_banner_url_safe check (
    banner_url is null
    or banner_url ~ (
      '^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/media/'
      || id::text
      || '/'
    )
  );
