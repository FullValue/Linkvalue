import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/profile-data";
import { resolveStyles } from "@/lib/themes";
import { customStylesSchema } from "@/lib/validations/appearance";
import { siteConfig } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${siteConfig.name} profile`;

const host = siteConfig.url.replace(/^https?:\/\//, "");

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  const profile = data?.profile;

  const parsedStyles = customStylesSchema.safeParse(profile?.custom_styles ?? {});
  const styles = resolveStyles(
    profile?.theme_id ?? "noir",
    parsedStyles.success ? parsedStyles.data : {},
  );
  // The OG card is rendered server-side and can't load arbitrary wallpaper
  // images/patterns, so fall back to a representative flat colour for those.
  const bg = styles.background;
  const background =
    bg.type === "gradient"
      ? `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`
      : bg.type === "solid"
        ? bg.color
        : bg.type === "blur"
          ? `linear-gradient(150deg, ${bg.from}, ${bg.to})`
          : bg.type === "pattern"
            ? bg.bg
            : "#0a0a0b";

  const rawName = profile?.display_name?.trim() || `@${profile?.username ?? "lumen"}`;
  const name = rawName.length > 40 ? `${rawName.slice(0, 39)}…` : rawName;
  const rawBio = profile?.bio?.trim() || siteConfig.tagline;
  const bio = rawBio.length > 120 ? `${rawBio.slice(0, 119)}…` : rawBio;
  const initial = name.replace(/^@/, "").charAt(0).toUpperCase();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background,
        color: styles.textColor,
        fontFamily: "sans-serif",
        padding: 80,
        position: "relative",
      }}
    >
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          width={150}
          height={150}
          style={{ borderRadius: 999, objectFit: "cover" }}
          alt=""
        />
      ) : (
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 999,
            background: styles.buttonColor,
            color: styles.buttonTextColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 72,
            fontWeight: 700,
          }}
        >
          {initial}
        </div>
      )}

      <div style={{ marginTop: 40, fontSize: 66, fontWeight: 700, display: "flex" }}>
        {name}
      </div>
      <div
        style={{
          marginTop: 18,
          fontSize: 30,
          opacity: 0.82,
          maxWidth: 820,
          textAlign: "center",
          display: "flex",
        }}
      >
        {bio}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 50,
          fontSize: 24,
          opacity: 0.6,
          display: "flex",
        }}
      >
        {host}/{profile?.username ?? ""}
      </div>
    </div>,
    { ...size },
  );
}
