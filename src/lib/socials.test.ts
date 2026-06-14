import { describe, it, expect } from "vitest";
import { socialHref } from "@/lib/socials";

describe("socialHref", () => {
  it("turns an email into a mailto link", () => {
    expect(socialHref("email", "me@example.com")).toBe("mailto:me@example.com");
  });
  it("keeps an existing mailto", () => {
    expect(socialHref("email", "mailto:me@example.com")).toBe("mailto:me@example.com");
  });
  it("prefixes https on a bare host", () => {
    expect(socialHref("instagram", "instagram.com/me")).toBe("https://instagram.com/me");
  });
  it("leaves an explicit protocol untouched", () => {
    expect(socialHref("website", "http://example.com")).toBe("http://example.com");
  });
});
