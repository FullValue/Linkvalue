export type EmbedProvider = "youtube" | "spotify" | "tiktok";

export interface EmbedInfo {
  provider: EmbedProvider;
  /** Provider-specific id (YouTube video id / Spotify resource id / TikTok video id). */
  id: string;
  embedUrl: string;
  /** Suggested aspect ratio for the iframe wrapper. */
  aspect: "video" | "audio" | "vertical";
}

/**
 * Detect a supported embed (YouTube / Spotify / TikTok) from a pasted URL and
 * return the sandboxed embed URL. Returns null for anything unsupported.
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
        id: m[2],
        embedUrl: `https://open.spotify.com/embed/${m[1]}/${m[2]}`,
        aspect: "audio",
      };
    }
  }

  // TikTok — only the canonical /@user/video/<id> (and /video/<id>) forms carry
  // the numeric id we need for the player. Short links (vm./vt.tiktok.com, /t/…)
  // require a redirect lookup we don't do server-side, so they fall through.
  if (host === "tiktok.com" || host === "m.tiktok.com") {
    const m = url.pathname.match(/\/video\/(\d+)/);
    if (m) {
      return {
        provider: "tiktok",
        id: m[1],
        embedUrl: `https://www.tiktok.com/player/v1/${m[1]}`,
        aspect: "vertical",
      };
    }
  }

  return null;
}

function yt(id: string): EmbedInfo {
  return {
    provider: "youtube",
    id,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    aspect: "video",
  };
}

export function isEmbeddable(url: string): boolean {
  return detectEmbed(url) !== null;
}
