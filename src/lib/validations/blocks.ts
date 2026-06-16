import { z } from "zod";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/socials";
import { GALLERY_MAX_IMAGES } from "@/lib/gallery";

const urlField = z
  .url("Enter a valid URL (including https://)")
  .max(2048)
  .refine((u) => /^https?:\/\//i.test(u), "URL must start with http:// or https://");

/** Optional outbound link: empty → undefined, otherwise must be http(s). */
const optionalLinkField = z
  .string()
  .trim()
  .max(2048)
  .refine((u) => u === "" || /^https?:\/\//i.test(u), "Link must start with http:// or https://")
  .transform((u) => (u === "" ? undefined : u))
  .optional();

export const linkBlockSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  url: urlField,
  icon: z.string().trim().max(40).optional(),
});

export const embedBlockSchema = z.object({
  url: urlField,
  title: z.string().trim().max(120).optional(),
});

const socialKeys = SOCIAL_PLATFORMS.map((s) => s.key) as [
  SocialPlatform,
  ...SocialPlatform[],
];

export const socialBlockSchema = z.object({
  platform: z.enum(socialKeys),
  url: z
    .string()
    .trim()
    .min(1, "Required")
    .max(2048)
    .refine((u) => !/^\s*(javascript|data|vbscript):/i.test(u), "Unsupported URL"),
});

/**
 * App-store URL fields: optional, but host-checked to the right store.
 * NOTE: Zod v4 runs all refinements regardless of earlier failures, so the
 * host check must tolerate empty/invalid input (never let `new URL` throw —
 * a thrown refine aborts safeParse instead of returning a field error).
 */
const hostMatches = (u: string, re: RegExp): boolean => {
  try {
    return re.test(new URL(u).hostname);
  } catch {
    return false;
  }
};

const storeUrlField = (re: RegExp, message: string) =>
  z
    .string()
    .trim()
    .max(2048)
    .refine((u) => u === "" || /^https?:\/\//i.test(u), "URL must start with http:// or https://")
    .refine((u) => u === "" || hostMatches(u, re), message)
    .transform((u) => (u === "" ? undefined : u))
    .optional();

const appStoreUrl = storeUrlField(
  /(^|\.)apps\.apple\.com$|(^|\.)itunes\.apple\.com$/i,
  "Enter a valid App Store link (apps.apple.com)",
);

const playStoreUrl = storeUrlField(
  /(^|\.)play\.google\.com$/i,
  "Enter a valid Google Play link (play.google.com)",
);

export const appDownloadBlockSchema = z
  .object({
    heading: z.string().trim().max(120).optional(),
    ios_url: appStoreUrl,
    android_url: playStoreUrl,
    display_mode: z.enum(["auto", "both"]).default("auto"),
    badge_variant: z.enum(["black", "white"]).default("black"),
    layout: z.enum(["stack", "row"]).default("stack"),
  })
  .refine((v) => Boolean(v.ios_url || v.android_url), {
    message: "Add at least one store link",
    path: ["ios_url"],
  });

/* -------------------------------------------------------------------------- */
/* Gallery                                                                     */
/* -------------------------------------------------------------------------- */

export const galleryImageSchema = z.object({
  // Uploaded objects always have a Supabase Storage URL; the action additionally
  // pins each one to the owner's own media/<uid>/ folder.
  url: urlField,
  alt: z.string().trim().max(120).optional(),
  link: optionalLinkField,
});

export const galleryBlockSchema = z.object({
  layout: z.enum(["grid", "carousel"]).default("grid"),
  images: z
    .array(galleryImageSchema)
    .min(1, "Add at least one image")
    .max(GALLERY_MAX_IMAGES, `Up to ${GALLERY_MAX_IMAGES} images`),
});

/* -------------------------------------------------------------------------- */
/* Text & Header                                                               */
/* -------------------------------------------------------------------------- */

export const textBlockSchema = z
  .object({
    heading: z.string().trim().max(120).optional(),
    body: z.string().trim().max(2000).optional(),
  })
  .refine((v) => Boolean(v.heading?.trim() || v.body?.trim()), {
    message: "Add a heading or some text",
    path: ["body"],
  });

export const headerBlockSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(80),
});

/* -------------------------------------------------------------------------- */
/* Email / SMS signup                                                          */
/* -------------------------------------------------------------------------- */

export const emailSignupBlockSchema = z.object({
  heading: z.string().trim().max(120).optional(),
  description: z.string().trim().max(300).optional(),
  fields: z.enum(["email", "email_phone"]).default("email"),
  button_label: z.string().trim().max(40).optional(),
  success_message: z.string().trim().max(160).optional(),
});

/** Public submission from an email_signup form on a profile page. */
export const contactSubmitSchema = z.object({
  email: z.email("Enter a valid email").max(320),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((p) => p === "" || /^[+()\d][\d\s().-]{4,}$/.test(p), "Enter a valid phone number")
    .transform((p) => (p === "" ? undefined : p))
    .optional(),
});

export const blockTypeSchema = z.enum([
  "link",
  "embed",
  "social",
  "app_download",
  "gallery",
  "text",
  "header",
  "email_signup",
]);

export type LinkBlockInput = z.infer<typeof linkBlockSchema>;
export type EmbedBlockInput = z.infer<typeof embedBlockSchema>;
export type SocialBlockInput = z.infer<typeof socialBlockSchema>;
export type AppDownloadBlockInput = z.infer<typeof appDownloadBlockSchema>;
export type GalleryBlockInput = z.infer<typeof galleryBlockSchema>;
export type TextBlockInput = z.infer<typeof textBlockSchema>;
export type HeaderBlockInput = z.infer<typeof headerBlockSchema>;
export type EmailSignupBlockInput = z.infer<typeof emailSignupBlockSchema>;
