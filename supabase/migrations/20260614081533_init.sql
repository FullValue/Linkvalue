-- ============================================================================
-- Lumen — initial schema
-- profiles · blocks · clicks · page_views  + Row Level Security + avatars bucket
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------

-- Keeps `updated_at` honest on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles  (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text not null unique
                  check (
                    char_length(username) between 3 and 30
                    and username ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
                  ),
  display_name  text check (display_name is null or char_length(display_name) <= 60),
  bio           text check (bio is null or char_length(bio) <= 200),
  avatar_url    text,
  theme_id      text not null default 'noir',
  custom_styles jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is 'Public link-in-bio profile, one row per auth user.';
comment on column public.profiles.username is 'Unique handle, lowercase, used at /[username]. Reserved words enforced in app.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- blocks  (ordered content on a profile)
-- ----------------------------------------------------------------------------
create table public.blocks (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  type        text not null check (type in ('link', 'embed', 'social')),
  title       text check (title is null or char_length(title) <= 120),
  url         text check (url is null or char_length(url) <= 2048),
  icon        text,
  position    integer not null default 0,
  is_active   boolean not null default true,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.blocks is 'Links, embeds and social rows shown on a profile, ordered by position.';

create index blocks_profile_position_idx
  on public.blocks (profile_id, position);

create trigger blocks_set_updated_at
  before update on public.blocks
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- clicks  (one row per link click — written server-side only)
-- ----------------------------------------------------------------------------
create table public.clicks (
  id          uuid primary key default gen_random_uuid(),
  block_id    uuid not null references public.blocks (id) on delete cascade,
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index clicks_profile_created_idx on public.clicks (profile_id, created_at desc);
create index clicks_block_idx on public.clicks (block_id);

-- ----------------------------------------------------------------------------
-- page_views  (one row per page view — written server-side only)
-- ----------------------------------------------------------------------------
create table public.page_views (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index page_views_profile_created_idx
  on public.page_views (profile_id, created_at desc);

-- ============================================================================
-- Row Level Security
--
-- Reads:  profiles + active blocks are world-readable (public pages).
-- Writes: a user only mutates their own rows.
-- Analytics (clicks/page_views) are written exclusively by the service role
--   (RLS denies all client writes); owners read their own aggregates.
-- ============================================================================

alter table public.profiles   enable row level security;
alter table public.blocks     enable row level security;
alter table public.clicks     enable row level security;
alter table public.page_views enable row level security;

-- profiles -------------------------------------------------------------------
create policy "Profiles are publicly readable"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users delete their own profile"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

-- blocks ---------------------------------------------------------------------
create policy "Active blocks are public; owners see all their blocks"
  on public.blocks for select
  to anon, authenticated
  using (is_active or (select auth.uid()) = profile_id);

create policy "Users insert their own blocks"
  on public.blocks for insert
  to authenticated
  with check ((select auth.uid()) = profile_id);

create policy "Users update their own blocks"
  on public.blocks for update
  to authenticated
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

create policy "Users delete their own blocks"
  on public.blocks for delete
  to authenticated
  using ((select auth.uid()) = profile_id);

-- clicks ---------------------------------------------------------------------
-- No INSERT/UPDATE/DELETE policy: only the service role (which bypasses RLS)
-- writes clicks. Owners may read their own.
create policy "Owners read their own clicks"
  on public.clicks for select
  to authenticated
  using ((select auth.uid()) = profile_id);

-- page_views -----------------------------------------------------------------
create policy "Owners read their own page views"
  on public.page_views for select
  to authenticated
  using ((select auth.uid()) = profile_id);

-- ============================================================================
-- Storage — avatars bucket
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Public read (also served via CDN on a public bucket).
create policy "Avatar images are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

-- Users may only write within their own folder: avatars/<uid>/<file>.
create policy "Users upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
