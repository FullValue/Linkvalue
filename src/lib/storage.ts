/**
 * Storage conventions shared by the client uploaders and the server actions
 * that validate persisted URLs.
 *
 * - `avatars`  — one object per user at avatars/<uid>/avatar (see AvatarUploader).
 * - `media`    — gallery images, banners and wallpapers at media/<uid>/<uuid>.<ext>.
 *
 * Both buckets are public and folder-scoped to the owner by Storage RLS, so a
 * legitimately-uploaded object always lives under media/<uid>/. The server
 * actions re-check this prefix before persisting a URL (defense in depth).
 */
export const MEDIA_BUCKET = "media";

/** Public-URL prefix for a user's own media folder. */
export function mediaFolderPrefix(supabaseUrl: string, userId: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${userId}/`;
}

/** True when `url` is a public object inside the user's own media folder. */
export function isOwnMediaUrl(
  url: string,
  supabaseUrl: string,
  userId: string,
): boolean {
  return url.startsWith(mediaFolderPrefix(supabaseUrl, userId));
}
