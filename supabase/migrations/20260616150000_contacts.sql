-- ============================================================================
-- Lumen — Phase 9: content & collection blocks
--  1. Allow the `text`, `header` and `email_signup` block types.
--  2. Add the `contacts` table that email_signup forms write to.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Widen the block type constraint
-- ----------------------------------------------------------------------------
alter table public.blocks drop constraint if exists blocks_type_check;
alter table public.blocks
  add constraint blocks_type_check
  check (
    type in (
      'link', 'embed', 'social', 'app_download',
      'gallery', 'text', 'header', 'email_signup'
    )
  );

-- ----------------------------------------------------------------------------
-- 2. contacts  (collected via email_signup forms — written server-side only)
-- ----------------------------------------------------------------------------
create table public.contacts (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles (id) on delete cascade,
  source_block_id uuid references public.blocks (id) on delete set null,
  email           text check (email is null or char_length(email) <= 320),
  phone           text check (phone is null or char_length(phone) <= 40),
  created_at      timestamptz not null default now(),
  constraint contacts_has_contact check (email is not null or phone is not null)
);

comment on table public.contacts is 'Emails/phones collected by email_signup blocks. Inserted by the service role only.';

create index contacts_profile_created_idx
  on public.contacts (profile_id, created_at desc);

-- One email per profile — dedupes repeat submissions.
create unique index contacts_profile_email_uniq
  on public.contacts (profile_id, lower(email))
  where email is not null;

alter table public.contacts enable row level security;

-- Visitors submit anonymously through /api/contacts, which writes with the
-- service role (bypasses RLS). No client INSERT policy exists, so the anon/auth
-- keys can never write. Owners may read and delete their own contacts.
create policy "Owners read their own contacts"
  on public.contacts for select
  to authenticated
  using ((select auth.uid()) = profile_id);

create policy "Owners delete their own contacts"
  on public.contacts for delete
  to authenticated
  using ((select auth.uid()) = profile_id);
