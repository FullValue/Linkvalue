-- ============================================================================
-- Lumen — Phase 0 hardening
--  1. Enforce reserved usernames at the database (the real trust boundary).
--  2. Create the profile atomically when an auth user signs up.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Reserved usernames — authoritative DB check
--
-- The anon key is public, so an authenticated user could call PostgREST
-- directly and claim a route-shadowing handle (admin, api, login, dashboard…).
-- This list MUST stay in lockstep with src/lib/usernames.ts.
-- ----------------------------------------------------------------------------
create or replace function public.is_reserved_username(name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select lower(name) = any (array[
    -- app routes
    'login','register','logout','signup','signin','sign-in','sign-up',
    'dashboard','api','admin','settings','analytics','appearance',
    'account','auth','callback','onboarding',
    -- system / infra
    '_next','static','assets','public','favicon','robots','sitemap',
    'manifest','well-known','.well-known','cdn','img','images','fonts',
    'media','opengraph-image','twitter-image',
    -- brand / marketing
    'about','pricing','terms','privacy','help','support','contact',
    'blog','docs','home','explore','discover','app','www','mail',
    'status','careers','jobs','legal','security',
    -- reserved handles
    'root','superuser','null','undefined','me','you','user','users',
    'profile','profiles','new','edit','delete','create','lumen'
  ]::text[]);
$$;

alter table public.profiles
  add constraint profiles_username_not_reserved
  check (not public.is_reserved_username(username));

-- ----------------------------------------------------------------------------
-- 2. Profile creation on signup
--
-- The signup form collects the username and passes it via
-- supabase.auth.signUp({ options: { data: { username } } }). This trigger
-- creates the matching profile row atomically: a taken/reserved/invalid handle
-- makes the whole signup fail (no orphaned auth user, no race window).
-- Falls back to a derived handle for users created without one (e.g. via the
-- dashboard) so admin-created accounts don't break.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      nullif(lower(new.raw_user_meta_data ->> 'username'), ''),
      'user-' || substr(new.id::text, 1, 8)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
