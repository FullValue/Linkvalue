/**
 * Username rules. The public profile lives at `/[username]`, so reserved slugs
 * must cover every top-level route segment plus brand/system words — otherwise
 * a handle could shadow an app route.
 */

/**
 * Lowercase alphanumerics with single internal hyphens — no leading, trailing,
 * or consecutive hyphens. Length (3–30) is enforced separately so it stays in
 * lockstep with the `profiles.username` CHECK constraint in the migration.
 */
export const USERNAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

export const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
  // App routes
  "login",
  "register",
  "logout",
  "signup",
  "signin",
  "sign-in",
  "sign-up",
  "dashboard",
  "api",
  "admin",
  "settings",
  "analytics",
  "appearance",
  "account",
  "auth",
  "callback",
  "onboarding",
  // System / infra
  "_next",
  "static",
  "assets",
  "public",
  "favicon",
  "robots",
  "sitemap",
  "manifest",
  "well-known",
  ".well-known",
  "cdn",
  "img",
  "images",
  "fonts",
  "media",
  "opengraph-image",
  "twitter-image",
  // Brand / marketing
  "about",
  "pricing",
  "terms",
  "privacy",
  "help",
  "support",
  "contact",
  "blog",
  "docs",
  "home",
  "explore",
  "discover",
  "app",
  "www",
  "mail",
  "status",
  "careers",
  "jobs",
  "legal",
  "security",
  // Reserved handles
  "root",
  "superuser",
  "null",
  "undefined",
  "me",
  "you",
  "user",
  "users",
  "profile",
  "profiles",
  "new",
  "edit",
  "delete",
  "create",
  "lumen",
]);

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.trim().toLowerCase());
}

/** Normalises raw input toward a valid handle (used by the signup field). */
export function normalizeUsername(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, USERNAME_MAX)
    .replace(/-+$/g, "");
}
