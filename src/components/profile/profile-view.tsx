import { ArrowUpRight, Play } from "lucide-react";
import type { Block } from "@/lib/supabase/types";
import type { ResolvedStyles } from "@/lib/themes";
import { FONT_STACK } from "@/lib/font-stack";
import { detectEmbed } from "@/lib/embeds";
import { socialHref, type SocialPlatform } from "@/lib/socials";
import { SocialIcon } from "@/components/icons/social-icon";
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
}

const byPosition = (a: Block, b: Block) => a.position - b.position;

export function ProfileView({
  profile,
  blocks,
  styles,
  mode = "live",
  hrefFor,
}: ProfileViewProps) {
  const active = blocks.filter((b) => b.is_active);
  const socials = active.filter((b) => b.type === "social").sort(byPosition);
  const content = active
    .filter((b) => b.type === "link" || b.type === "embed")
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
          {content.map((block) =>
            block.type === "embed" ? (
              <EmbedBlock
                key={block.id}
                block={block}
                styles={styles}
                mode={mode}
                href={hrefFor?.(block) ?? block.url ?? "#"}
              />
            ) : (
              <LinkButton
                key={block.id}
                block={block}
                styles={styles}
                mode={mode}
                href={hrefFor?.(block) ?? block.url ?? "#"}
              />
            ),
          )}
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

  if (mode === "preview") {
    return (
      <div className="lk-button w-full overflow-hidden" style={buttonStyle(styles)}>
        <div className="flex items-center gap-3 px-5 py-3.5">
          <Play className="size-4 shrink-0" />
          <span className="truncate text-sm font-medium">
            {block.title?.trim() ||
              (embed.provider === "youtube" ? "YouTube video" : "Spotify")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden"
      style={{ borderRadius: 16, background: "rgba(0,0,0,0.2)" }}
    >
      {embed.provider === "youtube" ? (
        <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
          <iframe
            src={embed.embedUrl}
            title={block.title || "YouTube video"}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        </div>
      ) : (
        <iframe
          src={embed.embedUrl}
          title={block.title || "Spotify"}
          loading="lazy"
          allow="encrypted-media"
          className="w-full border-0"
          style={{ height: 152 }}
        />
      )}
    </div>
  );
}
