import { test, expect } from "vitest";
import { appDownloadBlockSchema } from "./blocks";

const base = {
  display_mode: "auto" as const,
  badge_variant: "black" as const,
  layout: "stack" as const,
};

test("accepts a single valid App Store link", () => {
  const r = appDownloadBlockSchema.safeParse({
    ...base,
    heading: "Get the app",
    ios_url: "https://apps.apple.com/app/id123",
    android_url: "",
  });
  expect(r.success).toBe(true);
  if (r.success) {
    expect(r.data.ios_url).toBe("https://apps.apple.com/app/id123");
    expect(r.data.android_url).toBeUndefined();
  }
});

// Regression: Zod v4 runs every refinement, so the host check must not let
// `new URL("")` throw — a thrown refine would abort safeParse (infinite spinner).
test("empty fields return a field error instead of throwing", () => {
  const r = appDownloadBlockSchema.safeParse({ ...base, ios_url: "", android_url: "" });
  expect(r.success).toBe(false);
});

test("rejects a non-store URL with a field error", () => {
  const r = appDownloadBlockSchema.safeParse({
    ...base,
    ios_url: "https://example.com",
    android_url: "",
  });
  expect(r.success).toBe(false);
});

test("accepts a valid Google Play link", () => {
  const r = appDownloadBlockSchema.safeParse({
    ...base,
    ios_url: "",
    android_url: "https://play.google.com/store/apps/details?id=com.x",
  });
  expect(r.success).toBe(true);
});
