import { describe, it, expect } from "vitest";
import { detectEmbed } from "@/lib/embeds";

describe("detectEmbed — YouTube", () => {
  it("parses a watch URL into a nocookie embed + id", () => {
    const e = detectEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(e?.embedUrl).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(e?.id).toBe("dQw4w9WgXcQ");
  });
  it("parses youtu.be short links", () => {
    expect(detectEmbed("https://youtu.be/dQw4w9WgXcQ")?.provider).toBe("youtube");
  });
  it("parses /shorts URLs", () => {
    expect(detectEmbed("https://youtube.com/shorts/abc123")?.embedUrl).toContain(
      "/embed/abc123",
    );
  });
});

describe("detectEmbed — Spotify", () => {
  it("parses a track URL", () => {
    expect(detectEmbed("https://open.spotify.com/track/abc123")?.embedUrl).toBe(
      "https://open.spotify.com/embed/track/abc123",
    );
  });
  it("parses a playlist URL", () => {
    expect(detectEmbed("https://open.spotify.com/playlist/xyz")?.provider).toBe(
      "spotify",
    );
  });
});

describe("detectEmbed — unsupported", () => {
  it("returns null for non-embeddable URLs", () => {
    expect(detectEmbed("https://example.com")).toBeNull();
    expect(detectEmbed("not a url")).toBeNull();
    expect(detectEmbed("https://vimeo.com/123")).toBeNull();
  });
});
