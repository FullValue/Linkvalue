import { z } from "zod";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/socials";

const urlField = z
  .url("Enter a valid URL (including https://)")
  .max(2048)
  .refine((u) => /^https?:\/\//i.test(u), "URL must start with http:// or https://");

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

export const blockTypeSchema = z.enum(["link", "embed", "social"]);

export type LinkBlockInput = z.infer<typeof linkBlockSchema>;
export type EmbedBlockInput = z.infer<typeof embedBlockSchema>;
export type SocialBlockInput = z.infer<typeof socialBlockSchema>;
