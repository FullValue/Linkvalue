/**
 * Shared types and helpers for the `app_download` block — used by the builder
 * editor, the public renderer and the click-tracking redirect.
 */

export type StoreKey = "ios" | "android";
export type Device = "ios" | "android" | "desktop";

export type BadgeLayout = "stack" | "row";

export interface AppDownloadMeta {
  ios_url: string | null;
  android_url: string | null;
  display_mode: "auto" | "both";
  badge_variant: "black" | "white";
  layout: BadgeLayout;
  heading: string | null;
}

/** Safely coerce a block's jsonb `meta` into a typed AppDownloadMeta. */
export function readAppDownloadMeta(meta: unknown): AppDownloadMeta {
  const m = (meta ?? {}) as Record<string, unknown>;
  return {
    ios_url: typeof m.ios_url === "string" ? m.ios_url : null,
    android_url: typeof m.android_url === "string" ? m.android_url : null,
    display_mode: m.display_mode === "both" ? "both" : "auto",
    badge_variant: m.badge_variant === "white" ? "white" : "black",
    layout: m.layout === "row" ? "row" : "stack",
    heading: typeof m.heading === "string" ? m.heading : null,
  };
}

/**
 * Classify a visitor from a User-Agent string. Used server-side (request UA)
 * for the first paint and client-side (navigator.userAgent) as a correction.
 * iPadOS 13+ masquerades as macOS, so it falls through to "desktop" (which
 * shows both badges) — acceptable and avoids hiding the Android option.
 */
export function detectDevice(ua: string | null | undefined): Device {
  if (!ua) return "desktop";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

/**
 * Decide which store badges to show given the config and the viewer's device.
 * Returns the ordered list of stores to render.
 */
export function badgesToShow(meta: AppDownloadMeta, device: Device): StoreKey[] {
  const has: Record<StoreKey, boolean> = {
    ios: Boolean(meta.ios_url),
    android: Boolean(meta.android_url),
  };
  const available = (["ios", "android"] as StoreKey[]).filter((s) => has[s]);
  if (available.length <= 1 || meta.display_mode === "both") return available;

  // Auto mode with both available: prioritise the visitor's platform.
  if (device === "ios") return ["ios"];
  if (device === "android") return ["android"];
  return available; // desktop / unknown → both
}
