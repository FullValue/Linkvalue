/**
 * Returns `next` only if it is a same-origin absolute path. Rejects absolute
 * URLs, protocol-relative (`//evil`), and backslash tricks (`/\evil`) that
 * `new URL(next, base)` would otherwise resolve to a foreign origin.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!next) return fallback;
  if (next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")) {
    return next;
  }
  return fallback;
}
