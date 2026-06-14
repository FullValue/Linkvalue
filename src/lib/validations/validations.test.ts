import { describe, it, expect } from "vitest";
import { signUpSchema, usernameSchema } from "@/lib/validations/auth";
import {
  linkBlockSchema,
  embedBlockSchema,
  socialBlockSchema,
} from "@/lib/validations/blocks";
import { customStylesSchema } from "@/lib/validations/appearance";

describe("usernameSchema", () => {
  it("rejects reserved handles", () => {
    expect(usernameSchema.safeParse("admin").success).toBe(false);
  });
  it("lowercases input", () => {
    const r = usernameSchema.safeParse("YaNis");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("yanis");
  });
  it("rejects too-short handles", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("accepts a valid signup", () => {
    expect(
      signUpSchema.safeParse({
        email: "a@b.com",
        password: "password1",
        username: "valid-name",
      }).success,
    ).toBe(true);
  });
  it("rejects a short password", () => {
    expect(
      signUpSchema.safeParse({
        email: "a@b.com",
        password: "short",
        username: "valid",
      }).success,
    ).toBe(false);
  });
});

describe("block schemas", () => {
  it("link requires a title and a valid URL", () => {
    expect(linkBlockSchema.safeParse({ title: "T", url: "https://x.com" }).success).toBe(
      true,
    );
    expect(linkBlockSchema.safeParse({ title: "", url: "https://x.com" }).success).toBe(
      false,
    );
    expect(linkBlockSchema.safeParse({ title: "T", url: "nope" }).success).toBe(false);
  });
  it("rejects non-http(s) URL schemes (XSS guard)", () => {
    expect(
      linkBlockSchema.safeParse({ title: "T", url: "javascript:alert(1)" }).success,
    ).toBe(false);
  });
  it("embed requires a valid URL", () => {
    expect(embedBlockSchema.safeParse({ url: "https://youtu.be/x" }).success).toBe(true);
    expect(embedBlockSchema.safeParse({ url: "" }).success).toBe(false);
  });
  it("social validates the platform enum", () => {
    expect(socialBlockSchema.safeParse({ platform: "instagram", url: "x" }).success).toBe(
      true,
    );
    expect(socialBlockSchema.safeParse({ platform: "myspace", url: "x" }).success).toBe(
      false,
    );
  });
});

describe("customStylesSchema", () => {
  it("accepts valid hex colours and a gradient", () => {
    expect(
      customStylesSchema.safeParse({
        textColor: "#fff",
        background: { type: "gradient", from: "#000000", to: "#ffffff", angle: 160 },
      }).success,
    ).toBe(true);
  });
  it("rejects non-hex colours", () => {
    expect(customStylesSchema.safeParse({ textColor: "red" }).success).toBe(false);
  });
  it("rejects unknown keys (strict)", () => {
    expect(customStylesSchema.safeParse({ evil: "1" }).success).toBe(false);
  });
});
