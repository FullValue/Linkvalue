-- ============================================================================
-- Lumen — defense-in-depth for avatar_url
-- The OG renderer fetches avatar_url server-side, so a foreign URL written via
-- direct PostgREST would be an SSRF sink. Pin it to a Supabase Storage object
-- inside the owner's own avatars/<id>/ folder (or null). The app layer
-- (setAvatarAction) enforces the exact project host on top of this.
-- ============================================================================
alter table public.profiles
  add constraint profiles_avatar_url_safe check (
    avatar_url is null
    or avatar_url ~ (
      '^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/avatars/'
      || id::text
      || '/'
    )
  );
