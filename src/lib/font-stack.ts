import type { FontKey } from "@/lib/themes";

/**
 * CSS font-family stack for each selectable theme font. Kept free of `next/font`
 * so it can be imported by client components (the live preview) safely.
 * The CSS variables are provided by `themeFontVars` (src/lib/fonts.ts) plus the
 * root layout's Inter / Geist Mono variables.
 */
export const FONT_STACK: Record<FontKey, string> = {
  inter: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  fraunces: "var(--font-fraunces), Georgia, 'Times New Roman', serif",
  "space-grotesk": "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif",
  "geist-mono": "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace",
};
