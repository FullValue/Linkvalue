import { describe, it, expect } from "vitest";
import { USERNAME_REGEX, isReservedUsername, normalizeUsername } from "@/lib/usernames";

describe("USERNAME_REGEX", () => {
  it("accepts valid handles", () => {
    for (const u of ["abc", "a-b-c", "user123", "a1", "yanis"]) {
      expect(USERNAME_REGEX.test(u)).toBe(true);
    }
  });

  it("rejects edge/consecutive hyphens and invalid characters", () => {
    for (const u of ["-abc", "abc-", "a--b", "Abc", "a_b", "a b", "a.b", ""]) {
      expect(USERNAME_REGEX.test(u)).toBe(false);
    }
  });
});

describe("isReservedUsername", () => {
  it("flags app routes and brand words", () => {
    for (const u of ["admin", "login", "dashboard", "api", "lumen", "settings"]) {
      expect(isReservedUsername(u)).toBe(true);
    }
  });

  it("allows ordinary handles", () => {
    expect(isReservedUsername("yanis")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isReservedUsername("ADMIN")).toBe(true);
  });
});

describe("normalizeUsername", () => {
  it("lowercases, strips invalid chars, collapses + trims hyphens", () => {
    expect(normalizeUsername("  Yanis EL_Yassiri!! ")).toBe("yaniselyassiri");
    expect(normalizeUsername("a--b__c")).toBe("a-bc");
    expect(normalizeUsername("-hello-")).toBe("hello");
  });
});
