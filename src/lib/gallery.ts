/**
 * Shared types and helpers for the `gallery` block — used by the builder editor,
 * the public renderer and the click-tracking redirect.
 */

export type GalleryLayout = "grid" | "carousel";

export interface GalleryImage {
  url: string;
  alt: string | null;
  /** Optional outbound link; clicks are tracked via /api/go/<blockId>?i=<index>. */
  link: string | null;
}

export interface GalleryMeta {
  layout: GalleryLayout;
  images: GalleryImage[];
}

export const GALLERY_MAX_IMAGES = 12;

/** Safely coerce a block's jsonb `meta` into a typed GalleryMeta. */
export function readGalleryMeta(meta: unknown): GalleryMeta {
  const m = (meta ?? {}) as Record<string, unknown>;
  const rawImages = Array.isArray(m.images) ? m.images : [];
  const images: GalleryImage[] = rawImages
    .map((it): GalleryImage | null => {
      const o = (it ?? {}) as Record<string, unknown>;
      if (typeof o.url !== "string" || !o.url) return null;
      return {
        url: o.url,
        alt: typeof o.alt === "string" && o.alt ? o.alt : null,
        link: typeof o.link === "string" && o.link ? o.link : null,
      };
    })
    .filter((x): x is GalleryImage => x !== null)
    .slice(0, GALLERY_MAX_IMAGES);

  return {
    layout: m.layout === "carousel" ? "carousel" : "grid",
    images,
  };
}
