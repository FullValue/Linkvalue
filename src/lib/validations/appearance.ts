import { z } from "zod";
import { THEMES } from "@/lib/themes";

const hex = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid colour");

const imageUrl = z
  .url()
  .max(2048)
  .refine((u) => /^https?:\/\//i.test(u), "Invalid image URL");

const background = z.discriminatedUnion("type", [
  z.object({ type: z.literal("solid"), color: hex }),
  z.object({
    type: z.literal("gradient"),
    from: hex,
    to: hex,
    angle: z.number().min(0).max(360),
  }),
  z.object({ type: z.literal("image"), url: imageUrl, dim: z.number().min(0).max(0.85) }),
  z.object({
    type: z.literal("pattern"),
    preset: z.enum(["dots", "grid", "stripes"]),
    color: hex,
    bg: hex,
  }),
  z.object({ type: z.literal("blur"), from: hex, to: hex, base: hex }),
]);

export const customStylesSchema = z
  .object({
    background: background.optional(),
    buttonColor: hex.optional(),
    buttonTextColor: hex.optional(),
    textColor: hex.optional(),
    mutedTextColor: hex.optional(),
    font: z.enum(["inter", "fraunces", "space-grotesk", "geist-mono"]).optional(),
    // Legacy single-axis control, kept so older profiles still validate.
    buttonShape: z.enum(["rounded", "pill", "square", "outline"]).optional(),
    buttonStyle: z.enum(["solid", "glass", "outline"]).optional(),
    buttonRadius: z.enum(["square", "round", "rounder", "full"]).optional(),
    buttonShadow: z.enum(["none", "soft", "strong", "hard"]).optional(),
  })
  .strict();

export const appearanceSchema = z.object({
  themeId: z.string().refine((v) => THEMES.some((t) => t.id === v), "Unknown theme"),
  customStyles: customStylesSchema,
});
