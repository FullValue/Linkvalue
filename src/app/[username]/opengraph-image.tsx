import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/profile-data";
import { resolveStyles, type CustomStyles } from "@/lib/themes";
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

  const styles = resolveStyles(
    profile?.theme_id ?? "noir",
    (profile?.custom_styles ?? {}) as CustomStyles,
  );
  const background =
    styles.background.type === "gradient"
      ? `linear-gradient(${styles.background.angle}deg, ${styles.background.from}, ${styles.background.to})`
      : styles.background.color;

  const name = profile?.display_name?.trim() || `@${profile?.username ?? "lumen"}`;
  const bio = profile?.bio?.trim() || siteConfig.tagline;
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
