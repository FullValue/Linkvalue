import { z } from "zod";
import { THEMES } from "@/lib/themes";

const hex = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid colour");

const background = z.discriminatedUnion("type", [
  z.object({ type: z.literal("solid"), color: hex }),
  z.object({
    type: z.literal("gradient"),
    from: hex,
    to: hex,
    angle: z.number().min(0).max(360),
  }),
]);

export const customStylesSchema = z
  .object({
    background: background.optional(),
    buttonColor: hex.optional(),
    buttonTextColor: hex.optional(),
    textColor: hex.optional(),
    mutedTextColor: hex.optional(),
    font: z.enum(["inter", "fraunces", "space-grotesk", "geist-mono"]).optional(),
    buttonShape: z.enum(["rounded", "pill", "square", "outline"]).optional(),
  })
  .strict();

export const appearanceSchema = z.object({
  themeId: z.string().refine((v) => THEMES.some((t) => t.id === v), "Unknown theme"),
  customStyles: customStylesSchema,
});
