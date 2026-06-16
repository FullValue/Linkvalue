import { ArrowUpRight } from "lucide-react";
import type { Block } from "@/lib/supabase/types";
import {
  isHeaderLayout,
  type BackgroundStyle,
  type ButtonRadius,
  type ButtonShadow,
  type HeaderLayout,
  type ResolvedStyles,
} from "@/lib/themes";
import { FONT_STACK } from "@/lib/font-stack";
import { detectEmbed } from "@/lib/embeds";
import { socialHref, type SocialPlatform } from "@/lib/socials";
import { readAppDownloadMeta, type Device } from "@/lib/app-download";
import { readGalleryMeta } from "@/lib/gallery";
import { readTextMeta, readEmailSignupMeta } from "@/lib/block-content";
import { cn } from "@/lib/utils";
import { SocialIcon } from "@/components/icons/social-icon";
import { YouTubeEmbed } from "@/components/profile/youtube-embed";
import { TikTokEmbed } from "@/components/profile/tiktok-embed";
import { AppDownloadBlock } from "@/components/profile/app-download-block";
import { ImageGalleryBlock } from "@/components/profile/image-gallery-block";
import { EmailSignupBlock } from "@/components/profile/email-signup-block";
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
  /** Header arrangement (profiles.header_layout). */
  headerLayout?: string;
  /** Banner image (profiles.banner_url) — used by hero/banner layouts. */
  bannerUrl?: string | null;
}

const byPosition = (a: Block, b: Block) => a.position - b.position;

/* -------------------------------------------------------------------------- */
/* Style helpers                                                               */
/* -------------------------------------------------------------------------- */

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Wallpaper → container style + the dim-overlay opacity (image only). */
function wallpaper(bg: BackgroundStyle): {
  style: React.CSSProperties;
  overlay: number;
} {
  switch (bg.type) {
    case "solid":
      return { style: { background: bg.color }, overlay: 0 };
    case "gradient":
      return {
        style: { background: `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})` },
        overlay: 0,
      };
    case "image":
      return {
        style: {
          backgroundColor: "#000",
          backgroundImage: `url("${bg.url}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        },
        overlay: bg.dim,
      };
    case "pattern": {
      const c = bg.color;
      const image =
        bg.preset === "dots"
          ? `radial-gradient(${c} 1.5px, transparent 1.6px)`
          : bg.preset === "grid"
            ? `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`
            : `repeating-linear-gradient(45deg, ${c} 0, ${c} 2px, transparent 2px, transparent 12px)`;
      const size =
        bg.preset === "dots" ? "18px 18px" : bg.preset === "grid" ? "24px 24px" : undefined;
      return {
        style: { backgroundColor: bg.bg, backgroundImage: image, backgroundSize: size },
        overlay: 0,
      };
    }
    case "blur":
      return {
        style: {
          backgroundColor: bg.base,
          backgroundImage: `radial-gradient(60% 55% at 18% 20%, ${hexToRgba(
            bg.from,
            0.85,
          )}, transparent 60%), radial-gradient(55% 50% at 82% 78%, ${hexToRgba(
            bg.to,
            0.85,
          )}, transparent 60%)`,
        },
        overlay: 0,
      };
  }
}

const RADIUS_PX: Record<ButtonRadius, number> = {
  square: 6,
  round: 14,
  rounder: 22,
  full: 999,
};

function shadowCss(shadow: ButtonShadow): string | undefined {
  switch (shadow) {
    case "soft":
      return "0 2px 10px rgba(0,0,0,0.12)";
    case "strong":
      return "0 10px 28px rgba(0,0,0,0.22)";
    case "hard":
      return "4px 4px 0 rgba(0,0,0,0.85)";
    default:
      return undefined;
  }
}

function buttonStyle(styles: ResolvedStyles): React.CSSProperties {
  const borderRadius = RADIUS_PX[styles.buttonRadius];
  const boxShadow = shadowCss(styles.buttonShadow);

  if (styles.buttonStyle === "outline") {
    return {
      background: "transparent",
      color: styles.textColor,
      border: `1.5px solid ${styles.textColor}`,
      borderRadius,
      boxShadow,
    };
  }
  if (styles.buttonStyle === "glass") {
    return {
      background: hexToRgba(styles.buttonColor, 0.18),
      color: styles.buttonTextColor,
      border: `1px solid ${hexToRgba(styles.buttonTextColor, 0.25)}`,
      borderRadius,
      boxShadow,
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    };
  }
  return {
    background: styles.buttonColor,
    color: styles.buttonTextColor,
    border: "1.5px solid transparent",
    borderRadius,
    boxShadow,
  };
}

/* -------------------------------------------------------------------------- */
/* View                                                                        */
/* -------------------------------------------------------------------------- */

export function ProfileView({
  profile,
  blocks,
  styles,
  mode = "live",
  hrefFor,
  viewerDevice = "desktop",
  headerLayout,
  bannerUrl,
}: ProfileViewProps) {
  const active = blocks.filter((b) => b.is_active);
  const socials = active.filter((b) => b.type === "social").sort(byPosition);
  const content = active.filter((b) => b.type !== "social").sort(byPosition);

  const layout: HeaderLayout = isHeaderLayout(headerLayout) ? headerLayout : "classic";
  const wp = wallpaper(styles.background);

  const displayName = profile.display_name?.trim() || `@${profile.username}`;
  const initial = displayName.replace(/^@/, "").charAt(0).toUpperCase() || "·";

  return (
    <div
      className="relative flex min-h-full w-full flex-col items-center px-5 py-12"
      style={{ ...wp.style, color: styles.textColor, fontFamily: FONT_STACK[styles.font] }}
    >
      {wp.overlay > 0 ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `rgba(0,0,0,${wp.overlay})` }}
        />
      ) : null}

      <div className="relative z-10 flex w-full max-w-md flex-1 flex-col items-center">
        <ProfileHeader
          layout={layout}
          avatarUrl={profile.avatar_url}
          bannerUrl={bannerUrl ?? null}
          displayName={displayName}
          initial={initial}
          bio={profile.bio}
          styles={styles}
        />

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
            if (block.type === "header") {
              return <HeaderBlock key={block.id} title={block.title} styles={styles} />;
            }
            if (block.type === "text") {
              return (
                <TextBlock
                  key={block.id}
                  heading={block.title}
                  body={readTextMeta(block.meta).body}
                  styles={styles}
                />
              );
            }
            if (block.type === "email_signup") {
              return (
                <EmailSignupBlock
                  key={block.id}
                  blockId={block.id}
                  username={profile.username}
                  meta={readEmailSignupMeta(block.meta)}
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

/* -------------------------------------------------------------------------- */
/* Header layouts                                                              */
/* -------------------------------------------------------------------------- */

function Avatar({
  url,
  alt,
  initial,
  styles,
  className,
  style,
}: {
  url: string | null;
  alt: string;
  initial: string;
  styles: ResolvedStyles;
  className: string;
  style?: React.CSSProperties;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        decoding="async"
        fetchPriority="high"
        className={cn("object-cover", className)}
        style={style}
      />
    );
  }
  return (
    <div
      className={cn("grid place-items-center text-3xl font-semibold", className)}
      style={{ background: styles.buttonColor, color: styles.buttonTextColor, ...style }}
    >
      {initial}
    </div>
  );
}

function NameAndBio({
  displayName,
  bio,
  styles,
  className,
}: {
  displayName: string;
  bio: string | null;
  styles: ResolvedStyles;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <h1 className="text-center text-xl font-semibold tracking-tight">{displayName}</h1>
      {bio?.trim() ? (
        <p
          className="mt-1.5 max-w-xs text-center text-sm leading-relaxed text-pretty"
          style={{ color: styles.mutedTextColor }}
        >
          {bio}
        </p>
      ) : null}
    </div>
  );
}

function ProfileHeader({
  layout,
  avatarUrl,
  bannerUrl,
  displayName,
  initial,
  bio,
  styles,
}: {
  layout: HeaderLayout;
  avatarUrl: string | null;
  bannerUrl: string | null;
  displayName: string;
  initial: string;
  bio: string | null;
  styles: ResolvedStyles;
}) {
  const ring = { boxShadow: "0 0 0 3px rgba(255,255,255,0.12)" };
  const tint = `linear-gradient(135deg, ${styles.buttonColor}, ${hexToRgba(styles.textColor, 0.25)})`;

  if (layout === "hero") {
    const heroUrl = bannerUrl ?? avatarUrl;
    return (
      <div className="w-full">
        {heroUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroUrl}
            alt={displayName}
            decoding="async"
            fetchPriority="high"
            className="aspect-[5/4] w-full rounded-3xl object-cover"
          />
        ) : (
          <div
            className="grid aspect-[5/4] w-full place-items-center rounded-3xl text-6xl font-semibold"
            style={{ background: tint, color: styles.buttonTextColor }}
          >
            {initial}
          </div>
        )}
        <NameAndBio
          displayName={displayName}
          bio={bio}
          styles={styles}
          className="mt-4"
        />
      </div>
    );
  }

  if (layout === "banner") {
    return (
      <div className="w-full">
        <div className="relative w-full">
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerUrl}
              alt=""
              decoding="async"
              className="h-28 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="h-28 w-full rounded-2xl" style={{ background: tint }} />
          )}
          <div className="absolute -bottom-9 left-1/2 -translate-x-1/2">
            <Avatar
              url={avatarUrl}
              alt={displayName}
              initial={initial}
              styles={styles}
              className="size-[72px] rounded-full text-2xl"
              style={ring}
            />
          </div>
        </div>
        <NameAndBio
          displayName={displayName}
          bio={bio}
          styles={styles}
          className="mt-12"
        />
      </div>
    );
  }

  if (layout === "cutout") {
    return (
      <div className="flex w-full flex-col items-center">
        <Avatar
          url={avatarUrl}
          alt={displayName}
          initial={initial}
          styles={styles}
          className="size-28 rounded-[28%] text-4xl"
          style={{ filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.28))" }}
        />
        <NameAndBio
          displayName={displayName}
          bio={bio}
          styles={styles}
          className="mt-4"
        />
      </div>
    );
  }

  if (layout === "shape") {
    return (
      <div className="flex w-full flex-col items-center">
        <Avatar
          url={avatarUrl}
          alt={displayName}
          initial={initial}
          styles={styles}
          className="size-28 text-4xl"
          style={{ borderRadius: "42% 58% 63% 37% / 41% 44% 56% 59%" }}
        />
        <NameAndBio
          displayName={displayName}
          bio={bio}
          styles={styles}
          className="mt-4"
        />
      </div>
    );
  }

  // classic
  return (
    <div className="flex w-full flex-col items-center">
      <Avatar
        url={avatarUrl}
        alt={displayName}
        initial={initial}
        styles={styles}
        className="size-24 rounded-full"
        style={avatarUrl ? ring : undefined}
      />
      <NameAndBio displayName={displayName} bio={bio} styles={styles} className="mt-4" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Blocks                                                                      */
/* -------------------------------------------------------------------------- */

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

function HeaderBlock({
  title,
  styles,
}: {
  title: string | null;
  styles: ResolvedStyles;
}) {
  if (!title?.trim()) return null;
  return (
    <h2
      className="mt-2 border-b pb-1.5 text-left text-sm font-semibold tracking-wide uppercase first:mt-0"
      style={{ color: styles.textColor, borderColor: `${styles.mutedTextColor}40` }}
    >
      {title}
    </h2>
  );
}

function TextBlock({
  heading,
  body,
  styles,
}: {
  heading: string | null;
  body: string | null;
  styles: ResolvedStyles;
}) {
  if (!heading?.trim() && !body?.trim()) return null;
  return (
    <div className="flex flex-col gap-1 text-center">
      {heading?.trim() ? (
        <p className="text-base font-semibold" style={{ color: styles.textColor }}>
          {heading}
        </p>
      ) : null}
      {body?.trim() ? (
        <p
          className="text-sm leading-relaxed whitespace-pre-line"
          style={{ color: styles.mutedTextColor }}
        >
          {body}
        </p>
      ) : null}
    </div>
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
