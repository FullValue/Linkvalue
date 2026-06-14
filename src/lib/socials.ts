export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "x"
  | "youtube"
  | "facebook"
  | "linkedin"
  | "github"
  | "spotify"
  | "twitch"
  | "threads"
  | "pinterest"
  | "discord"
  | "telegram"
  | "whatsapp"
  | "snapchat"
  | "reddit"
  | "email"
  | "website";

export interface SocialMeta {
  key: SocialPlatform;
  label: string;
  placeholder: string;
}

export const SOCIAL_PLATFORMS: readonly SocialMeta[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/you" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@you" },
  { key: "x", label: "X", placeholder: "https://x.com/you" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@you" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/you" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/you" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/you" },
  { key: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/artist/…" },
  { key: "twitch", label: "Twitch", placeholder: "https://twitch.tv/you" },
  { key: "threads", label: "Threads", placeholder: "https://threads.net/@you" },
  { key: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/you" },
  { key: "discord", label: "Discord", placeholder: "https://discord.gg/invite" },
  { key: "telegram", label: "Telegram", placeholder: "https://t.me/you" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/15551234567" },
  { key: "snapchat", label: "Snapchat", placeholder: "https://snapchat.com/add/you" },
  { key: "reddit", label: "Reddit", placeholder: "https://reddit.com/user/you" },
  { key: "email", label: "Email", placeholder: "you@example.com" },
  { key: "website", label: "Website", placeholder: "https://yoursite.com" },
] as const;

export const SOCIAL_MAP = Object.fromEntries(
  SOCIAL_PLATFORMS.map((s) => [s.key, s]),
) as Record<SocialPlatform, SocialMeta>;

export function isSocialPlatform(value: string): value is SocialPlatform {
  return value in SOCIAL_MAP;
}

/** Build a safe href for a social value (emails become mailto:, bare hosts get https). */
export function socialHref(platform: SocialPlatform, value: string): string {
  const v = value.trim();
  if (platform === "email") {
    return v.toLowerCase().startsWith("mailto:") ? v : `mailto:${v}`;
  }
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}
