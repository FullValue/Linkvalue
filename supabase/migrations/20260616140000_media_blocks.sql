-- ============================================================================
-- Lumen — Phase 8: media blocks
-- Adds the `gallery` block type and a public `media` storage bucket used for
-- gallery images, banners and wallpapers. Like avatars, objects are folder-
-- scoped to their owner (media/<uid>/<file>) by Storage RLS.
-- ============================================================================

-- Allow the new polymorphic block type (constraint is re-created from scratch).
alter table public.blocks drop constraint if exists blocks_type_check;
alter table public.blocks
  add constraint blocks_type_check
  check (type in ('link', 'embed', 'social', 'app_download', 'gallery'));

-- ----------------------------------------------------------------------------
-- Storage — media bucket
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Media is publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "Users upload their own media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users update their own media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users delete their own media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
