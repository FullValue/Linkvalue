import { ArrowUpRight } from "lucide-react";
import type { Block } from "@/lib/supabase/types";
import type { ResolvedStyles } from "@/lib/themes";
import { FONT_STACK } from "@/lib/font-stack";
import { detectEmbed } from "@/lib/embeds";
import { socialHref, type SocialPlatform } from "@/lib/socials";
import { readAppDownloadMeta, type Device } from "@/lib/app-download";
import { readGalleryMeta } from "@/lib/gallery";
import { SocialIcon } from "@/components/icons/social-icon";
import { YouTubeEmbed } from "@/components/profile/youtube-embed";
import { TikTokEmbed } from "@/components/profile/tiktok-embed";
import { AppDownloadBlock } from "@/components/profile/app-download-block";
import { ImageGalleryBlock } from "@/components/profile/image-gallery-block";
import { siteConfig } from "@/lib/site";

export interface ProfileViewProfile {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

type Mode = "live" | "preview";

interface ProfileViewProps {
  profile: ProfileViewProfile;
  blocks: Block[];
  styles: ResolvedStyles;
  mode?: Mode;
  /** Maps a link/embed block to its href (e.g. a tracking redirect). */
  hrefFor?: (block: Block) => string;
  /** Visitor device (server-detected from UA) for app-download auto mode. */
  viewerDevice?: Device;
}

const byPosition = (a: Block, b: Block) => a.position - b.position;

export function ProfileView({
  profile,
  blocks,
  styles,
  mode = "live",
  hrefFor,
  viewerDevice = "desktop",
}: ProfileViewProps) {
  const active = blocks.filter((b) => b.is_active);
  const socials = active.filter((b) => b.type === "social").sort(byPosition);
  const content = active
    .filter(
      (b) =>
        b.type === "link" ||
        b.type === "embed" ||
        b.type === "app_download" ||
        b.type === "gallery",
    )
    .sort(byPosition);

  const background =
    styles.background.type === "gradient"
      ? `linear-gradient(${styles.background.angle}deg, ${styles.background.from}, ${styles.background.to})`
      : styles.background.color;

  const displayName = profile.display_name?.trim() || `@${profile.username}`;
  const initial = displayName.replace(/^@/, "").charAt(0).toUpperCase() || "·";

  return (
    <div
      className="flex min-h-full w-full flex-col items-center px-5 py-12"
      style={{
        background,
        color: styles.textColor,
        fontFamily: FONT_STACK[styles.font],
      }}
    >
      <div className="flex w-full max-w-md flex-1 flex-col items-center">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={displayName}
            width={96}
            height={96}
            decoding="async"
            fetchPriority="high"
            className="size-24 rounded-full object-cover"
            style={{ boxShadow: "0 0 0 3px rgba(255,255,255,0.12)" }}
          />
        ) : (
          <div
            className="grid size-24 place-items-center rounded-full text-3xl font-semibold"
            style={{ background: styles.buttonColor, color: styles.buttonTextColor }}
          >
            {initial}
          </div>
        )}

        <h1 className="mt-4 text-center text-xl font-semibold tracking-tight">
          {displayName}
        </h1>
        {profile.bio?.trim() ? (
          <p
            className="mt-1.5 max-w-xs text-center text-sm leading-relaxed text-pretty"
            style={{ color: styles.mutedTextColor }}
          >
            {profile.bio}
          </p>
        ) : null}

        {socials.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            {socials.map((b) => {
              const platform = ((b.meta as { platform?: SocialPlatform } | null)
                ?.platform ?? "website") as SocialPlatform;
              const icon = <SocialIcon platform={platform} className="size-5" />;
              if (mode === "preview") {
                return (
                  <span key={b.id} className="opacity-80">
                    {icon}
                  </span>
                );
              }
              return (
                <a
                  key={b.id}
                  href={socialHref(platform, b.url ?? "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform}
                  className="opacity-70 transition-opacity hover:opacity-100"
                >
                  {icon}
                </a>
              );
            })}
          </div>
        ) : null}

        <div className="mt-6 flex w-full flex-col gap-3">
          {content.map((block) => {
            if (block.type === "embed") {
              return (
                <EmbedBlock
                  key={block.id}
                  block={block}
                  styles={styles}
                  mode={mode}
                  href={hrefFor?.(block) ?? block.url ?? "#"}
                />
              );
            }
            if (block.type === "app_download") {
              return (
                <AppDownloadBlock
                  key={block.id}
                  blockId={block.id}
                  meta={readAppDownloadMeta(block.meta)}
                  device={viewerDevice}
                  mode={mode}
                  styles={styles}
                />
              );
            }
            if (block.type === "gallery") {
              return (
                <ImageGalleryBlock
                  key={block.id}
                  blockId={block.id}
                  meta={readGalleryMeta(block.meta)}
                  mode={mode}
                  styles={styles}
                />
              );
            }
            return (
              <LinkButton
                key={block.id}
                block={block}
                styles={styles}
                mode={mode}
                href={hrefFor?.(block) ?? block.url ?? "#"}
              />
            );
          })}
        </div>

        <a
          href={siteConfig.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-10 text-xs font-medium tracking-wide opacity-70 transition-opacity hover:opacity-100"
          style={{ color: styles.mutedTextColor }}
        >
          {mode === "preview" ? `${siteConfig.name}` : `Made with ${siteConfig.name}`}
        </a>
      </div>
    </div>
  );
}

function buttonStyle(styles: ResolvedStyles): React.CSSProperties {
  const borderRadius =
    styles.buttonShape === "pill" ? 999 : styles.buttonShape === "square" ? 8 : 16;
  if (styles.buttonShape === "outline") {
    return {
      background: "transparent",
      color: styles.textColor,
      border: `1.5px solid ${styles.textColor}`,
      borderRadius,
    };
  }
  return {
    background: styles.buttonColor,
    color: styles.buttonTextColor,
    border: "1.5px solid transparent",
    borderRadius,
  };
}

function LinkButton({
  block,
  styles,
  mode,
  href,
}: {
  block: Block;
  styles: ResolvedStyles;
  mode: Mode;
  href: string;
}) {
  const inner = (
    <span className="grid w-full grid-cols-[1.5rem_1fr_1.5rem] items-center gap-2">
      <span className="text-base leading-none">{block.icon || ""}</span>
      <span className="truncate text-center text-[15px] font-medium">{block.title}</span>
      {mode === "preview" ? (
        <span />
      ) : (
        <ArrowUpRight className="size-4 justify-self-end opacity-50" />
      )}
    </span>
  );
  const className = "lk-button flex w-full items-center px-5 py-3.5";
  const style = buttonStyle(styles);

  if (mode === "preview") {
    return (
      <div className={className} style={style}>
        {inner}
      </div>
    );
  }
  return (
    <a className={className} style={style} href={href} rel="noopener noreferrer">
      {inner}
    </a>
  );
}

function EmbedBlock({
  block,
  styles,
  mode,
  href,
}: {
  block: Block;
  styles: ResolvedStyles;
  mode: Mode;
  href: string;
}) {
  const embed = block.url ? detectEmbed(block.url) : null;

  if (!embed) {
    // Unsupported URL — fall back to a tracked link.
    return <LinkButton block={block} styles={styles} mode={mode} href={href} />;
  }

  // YouTube: show the thumbnail, load the player only on click (preview + live).
  if (embed.provider === "youtube") {
    return <YouTubeEmbed id={embed.id} title={block.title} embedUrl={embed.embedUrl} />;
  }

  // TikTok: branded facade, loads the vertical player only on click.
  if (embed.provider === "tiktok") {
    return <TikTokEmbed title={block.title} embedUrl={embed.embedUrl} />;
  }

  // Spotify: compact player (already shows cover art + play control).
  return (
    <iframe
      src={embed.embedUrl}
      title={block.title || "Spotify"}
      loading="lazy"
      allow="encrypted-media"
      className="w-full rounded-2xl border-0"
      style={{ height: 152 }}
    />
  );
}
