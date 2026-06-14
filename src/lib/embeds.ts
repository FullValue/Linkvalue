export type EmbedProvider = "youtube" | "spotify";

export interface EmbedInfo {
  provider: EmbedProvider;
  embedUrl: string;
  /** Suggested aspect ratio for the iframe wrapper. */
  aspect: "video" | "audio";
}

/**
 * Detect a supported embed (YouTube / Spotify) from a pasted URL and return the
 * sandboxed embed URL. Returns null for anything unsupported.
 */
export function detectEmbed(rawUrl: string): EmbedInfo | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  // YouTube
  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com"
  ) {
    const v = url.searchParams.get("v");
    if (v) return yt(v);
    const m = url.pathname.match(/\/(?:shorts|embed|live)\/([\w-]+)/);
    if (m) return yt(m[1]);
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    if (id) return yt(id);
  }

  // Spotify
  if (host === "open.spotify.com") {
    const m = url.pathname.match(
      /\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/,
    );
    if (m) {
      return {
        provider: "spotify",
        embedUrl: `https://open.spotify.com/embed/${m[1]}/${m[2]}`,
        aspect: "audio",
      };
    }
  }

  return null;
}

function yt(id: string): EmbedInfo {
  return {
    provider: "youtube",
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    aspect: "video",
  };
}

export function isEmbeddable(url: string): boolean {
  return detectEmbed(url) !== null;
}
