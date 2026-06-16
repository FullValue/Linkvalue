/**
 * Theme + style system for public profile pages.
 *
 * A profile stores a `theme_id` (a preset below) and a `custom_styles` JSON blob
 * with per-field overrides. `resolveStyles()` merges overrides on top of the
 * preset to produce a fully-specified style set the public renderer consumes.
 *
 * The header layout (`header_layout`) and banner image (`banner_url`) live as
 * their own profile columns — they're structural, not part of the theme blob.
 */

export type FontKey = "inter" | "fraunces" | "space-grotesk" | "geist-mono";

/** Legacy single-axis button control (pre-Phase 10). Still read for back-compat. */
export type ButtonShape = "rounded" | "pill" | "square" | "outline";

/** Phase 10 button axes — style, corner radius and shadow are independent. */
export type ButtonStyle = "solid" | "glass" | "outline";
export type ButtonRadius = "square" | "round" | "rounder" | "full";
export type ButtonShadow = "none" | "soft" | "strong" | "hard";

export type PatternPreset = "dots" | "grid" | "stripes";

/** Page wallpaper. `solid`/`gradient` are the originals; the rest are Phase 10. */
export type BackgroundStyle =
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; to: string; angle: number }
  | { type: "image"; url: string; dim: number }
  | { type: "pattern"; preset: PatternPreset; color: string; bg: string }
  | { type: "blur"; from: string; to: string; base: string };

/** Public profile header arrangement. Stored on `profiles.header_layout`. */
export type HeaderLayout = "classic" | "hero" | "banner" | "cutout" | "shape";

export const HEADER_LAYOUTS: readonly { id: HeaderLayout; name: string }[] = [
  { id: "classic", name: "Classic" },
  { id: "hero", name: "Hero" },
  { id: "banner", name: "Banner" },
  { id: "cutout", name: "Cutout" },
  { id: "shape", name: "Shape" },
] as const;

export const DEFAULT_HEADER_LAYOUT: HeaderLayout = "classic";

export function isHeaderLayout(v: unknown): v is HeaderLayout {
  return HEADER_LAYOUTS.some((l) => l.id === v);
}

export interface CustomStyles {
  background?: BackgroundStyle;
  buttonColor?: string;
  buttonTextColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  font?: FontKey;
  /** @deprecated superseded by buttonStyle/buttonRadius/buttonShadow. */
  buttonShape?: ButtonShape;
  buttonStyle?: ButtonStyle;
  buttonRadius?: ButtonRadius;
  buttonShadow?: ButtonShadow;
}

/** Every field present — what the renderer actually paints with. */
export type ResolvedStyles = Required<CustomStyles>;

export interface Theme {
  id: string;
  name: string;
  description: string;
  /** Small swatch used in the dashboard theme picker. */
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
      buttonStyle: "solid",
      buttonRadius: "round",
      buttonShadow: "soft",
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
      buttonStyle: "solid",
      buttonRadius: "square",
      buttonShadow: "soft",
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
      buttonStyle: "solid",
      buttonRadius: "full",
      buttonShadow: "soft",
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
      buttonStyle: "solid",
      buttonRadius: "round",
      buttonShadow: "strong",
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
      buttonStyle: "solid",
      buttonRadius: "round",
      buttonShadow: "soft",
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
      buttonStyle: "solid",
      buttonRadius: "square",
      buttonShadow: "none",
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

/** Maps the legacy single-axis shape onto the new style/radius axes. */
function shapeToAxes(shape: ButtonShape): {
  style: ButtonStyle;
  radius: ButtonRadius;
} {
  switch (shape) {
    case "pill":
      return { style: "solid", radius: "full" };
    case "square":
      return { style: "solid", radius: "square" };
    case "outline":
      return { style: "outline", radius: "round" };
    default:
      return { style: "solid", radius: "round" };
  }
}

export function resolveStyles(
  themeId: string | null | undefined,
  custom: CustomStyles | null | undefined,
): ResolvedStyles {
  const base = getTheme(themeId).styles;
  const c = definedOnly(custom ?? {});
  const merged: ResolvedStyles = { ...base, ...c };

  // Back-compat: a profile customised before Phase 10 only stored `buttonShape`.
  // Derive the new axes from it so its look is preserved.
  if (
    c.buttonShape &&
    c.buttonStyle === undefined &&
    c.buttonRadius === undefined &&
    c.buttonShadow === undefined
  ) {
    const axes = shapeToAxes(c.buttonShape);
    merged.buttonStyle = axes.style;
    merged.buttonRadius = axes.radius;
  }

  return merged;
}
