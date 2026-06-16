/**
 * Single source of truth for product-level branding and absolute URLs.
 *
 * `name` is a placeholder brand — rename it here once and it propagates to
 * metadata, the marketing page, and emails.
 */
export const siteConfig = {
  name: "Lumen",
  tagline: "One link for everything you make.",
  description:
    "Lumen is the link-in-bio that actually looks like you. Build a premium page in minutes, customise every pixel, and track what your audience clicks.",
  // Used for canonical URLs, Open Graph, and copy-to-clipboard public links.
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000",
  // When set (e.g. "lumen.app"), public pages live at `<handle>.lumen.app`.
  // Requires a wildcard domain (`*.lumen.app`) on the host. When unset, we
  // fall back to path-based URLs (`<site>/handle`) — works on *.vercel.app
  // and localhost, where wildcard subdomains aren't available.
  rootDomain:
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "") ||
    null,
} as const;

export type SiteConfig = typeof siteConfig;

/** Absolute, shareable URL of a user's public page (subdomain or path based). */
export function profileUrl(username: string): string {
  if (siteConfig.rootDomain) return `https://${username}.${siteConfig.rootDomain}`;
  return `${siteConfig.url}/${username}`;
}

/** Same target, trimmed of its scheme — for compact in-UI display. */
export function profileDisplayUrl(username: string): string {
  return profileUrl(username).replace(/^https?:\/\//, "");
}

/** Host prefix shown before the handle field (e.g. signup preview). */
export function profileHostHint(): { before: string; after: string } {
  if (siteConfig.rootDomain) return { before: "", after: `.${siteConfig.rootDomain}` };
  return { before: `${siteConfig.url.replace(/^https?:\/\//, "")}/`, after: "" };
}
