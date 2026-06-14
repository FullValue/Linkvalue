import { describe, it, expect } from "vitest";
import { safeNextPath } from "@/lib/safe-redirect";

describe("safeNextPath", () => {
  it("allows same-origin absolute paths", () => {
    expect(safeNextPath("/dashboard/settings")).toBe("/dashboard/settings");
  });
  it("rejects absolute URLs", () => {
    expect(safeNextPath("https://evil.com")).toBe("/dashboard");
  });
  it("rejects protocol-relative URLs", () => {
    expect(safeNextPath("//evil.com")).toBe("/dashboard");
  });
  it("rejects backslash tricks", () => {
    expect(safeNextPath("/\\evil.com")).toBe("/dashboard");
  });
  it("falls back for empty input", () => {
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath("")).toBe("/dashboard");
  });
  it("honours a custom fallback", () => {
    expect(safeNextPath(null, "/login")).toBe("/login");
  });
});
