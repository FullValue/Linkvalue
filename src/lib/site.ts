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
} as const;

export type SiteConfig = typeof siteConfig;
