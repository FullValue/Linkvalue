/**
 * Theme + style system for public profile pages.
 *
 * A profile stores a `theme_id` (a preset below) and a `custom_styles` JSON blob
 * with per-field overrides. `resolveStyles()` merges overrides on top of the
 * preset to produce a fully-specified style set the public renderer consumes.
 *
 * Phase 0 ships the type system + the default `noir` preset and one light preset
 * so the resolver is exercised end-to-end. Phase 3 fills out the full 4–6 set
 * and the dashboard controls.
 */

export type FontKey = "inter" | "fraunces" | "space-grotesk" | "geist-mono";

export type ButtonShape = "rounded" | "pill" | "square" | "outline";

export type BackgroundStyle =
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; to: string; angle: number };

export interface CustomStyles {
  background?: BackgroundStyle;
  buttonColor?: string;
  buttonTextColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  font?: FontKey;
  buttonShape?: ButtonShape;
}

/** Every field present — what the renderer actually paints with. */
export type ResolvedStyles = Required<CustomStyles>;

export interface Theme {
  id: string;
  name: string;
  description: string;
  /** Small swatch used in the dashboard theme picker (Phase 3). */
  swatch: readonly [string, string, string];
  styles: ResolvedStyles;
}

export const FONT_LABELS: Record<FontKey, string> = {
  inter: "Inter",
  fraunces: "Fraunces",
  "space-grotesk": "Space Grotesk",
  "geist-mono": "Geist Mono",
};

export const THEMES: readonly Theme[] = [
  {
    id: "noir",
    name: "Noir",
    description: "Near-black canvas with an electric violet glow.",
    swatch: ["#0a0a0b", "#7c5cff", "#ededed"],
    styles: {
      background: { type: "gradient", from: "#0a0a0b", to: "#171026", angle: 165 },
      buttonColor: "#17171c",
      buttonTextColor: "#ededed",
      textColor: "#f4f4f5",
      mutedTextColor: "#a1a1aa",
      font: "inter",
      buttonShape: "rounded",
    },
  },
  {
    id: "ivory",
    name: "Ivory",
    description: "Warm paper with crisp ink — calm and editorial.",
    swatch: ["#faf8f4", "#1a1a18", "#c2410c"],
    styles: {
      background: { type: "solid", color: "#faf8f4" },
      buttonColor: "#ffffff",
      buttonTextColor: "#1a1a18",
      textColor: "#1a1a18",
      mutedTextColor: "#6b6b66",
      font: "fraunces",
      buttonShape: "square",
    },
  },
  {
    id: "dawn",
    name: "Dawn",
    description: "Soft peach-to-lavender gradient with rounded buttons.",
    swatch: ["#fde7d3", "#e7d9ff", "#2a2440"],
    styles: {
      background: { type: "gradient", from: "#fde7d3", to: "#e7d9ff", angle: 160 },
      buttonColor: "#ffffff",
      buttonTextColor: "#2a2440",
      textColor: "#2a2440",
      mutedTextColor: "#6b6480",
      font: "inter",
      buttonShape: "pill",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Vivid coral-to-magenta with bold geometric type.",
    swatch: ["#ff6a3d", "#b5179e", "#ffffff"],
    styles: {
      background: { type: "gradient", from: "#ff6a3d", to: "#b5179e", angle: 155 },
      buttonColor: "#ffffff",
      buttonTextColor: "#3a1145",
      textColor: "#ffffff",
      mutedTextColor: "#ffe0f0",
      font: "space-grotesk",
      buttonShape: "rounded",
    },
  },
  {
    id: "mint",
    name: "Mint",
    description: "Fresh, airy green with calm contrast.",
    swatch: ["#eafaf1", "#0f3d2e", "#10b981"],
    styles: {
      background: { type: "solid", color: "#eafaf1" },
      buttonColor: "#ffffff",
      buttonTextColor: "#0f3d2e",
      textColor: "#0f3d2e",
      mutedTextColor: "#4b7163",
      font: "inter",
      buttonShape: "rounded",
    },
  },
  {
    id: "carbon",
    name: "Carbon",
    description: "High-contrast monospace minimalism.",
    swatch: ["#0b0b0d", "#ffffff", "#8a8a93"],
    styles: {
      background: { type: "solid", color: "#0b0b0d" },
      buttonColor: "#ffffff",
      buttonTextColor: "#0b0b0d",
      textColor: "#f4f4f5",
      mutedTextColor: "#8a8a93",
      font: "geist-mono",
      buttonShape: "square",
    },
  },
] as const;

export const DEFAULT_THEME_ID = "noir";

export function getTheme(themeId: string | null | undefined): Theme {
  return THEMES.find((t) => t.id === themeId) ?? THEMES[0];
}

/** Drops `undefined` keys so they don't clobber preset defaults during merge. */
function definedOnly<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

export function resolveStyles(
  themeId: string | null | undefined,
  custom: CustomStyles | null | undefined,
): ResolvedStyles {
  const base = getTheme(themeId).styles;
  return { ...base, ...definedOnly(custom ?? {}) };
}
