-- ============================================================================
-- Lumen — analytics helpers
-- Per-link click counts for the authenticated owner. SECURITY INVOKER so RLS
-- on clicks/blocks applies: a user only ever sees their own aggregates.
-- ============================================================================
create or replace function public.link_click_counts()
returns table (block_id uuid, title text, url text, type text, clicks bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select c.block_id, b.title, b.url, b.type, count(*)::bigint as clicks
  from public.clicks c
  join public.blocks b on b.id = c.block_id
  where c.profile_id = (select auth.uid())
  group by c.block_id, b.title, b.url, b.type
  order by clicks desc;
$$;
