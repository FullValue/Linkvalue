import { describe, it, expect } from "vitest";
import { getTheme, resolveStyles, THEMES, DEFAULT_THEME_ID } from "@/lib/themes";

describe("themes", () => {
  it("ships 6 presets including the default", () => {
    expect(THEMES.length).toBe(6);
    expect(THEMES.some((t) => t.id === DEFAULT_THEME_ID)).toBe(true);
  });

  it("getTheme falls back to the first preset for unknown ids", () => {
    expect(getTheme("does-not-exist").id).toBe(THEMES[0].id);
    expect(getTheme(null).id).toBe(THEMES[0].id);
  });

  it("resolveStyles merges overrides over the preset", () => {
    const r = resolveStyles("noir", { textColor: "#ff0000", buttonShape: "pill" });
    expect(r.textColor).toBe("#ff0000");
    expect(r.buttonShape).toBe("pill");
    expect(r.font).toBe(getTheme("noir").styles.font);
  });

  it("ignores undefined overrides", () => {
    const base = getTheme("noir").styles;
    const r = resolveStyles("noir", { textColor: undefined });
    expect(r.textColor).toBe(base.textColor);
  });
});
