import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/profile-data";
import { ProfileView } from "@/components/profile/profile-view";
import { resolveStyles, type CustomStyles } from "@/lib/themes";
import { themeFontVars } from "@/lib/fonts";
import { siteConfig } from "@/lib/site";

type Params = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) return { title: "Not found", robots: { index: false } };

  const { profile } = data;
  const title = profile.display_name?.trim() || `@${profile.username}`;
  const description = profile.bio?.trim() || `${title} — all their links in one place.`;
  const url = `${siteConfig.url}/${profile.username}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      siteName: siteConfig.name,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicProfilePage({ params }: Params) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) notFound();

  const { profile, blocks } = data;
  const styles = resolveStyles(
    profile.theme_id,
    (profile.custom_styles ?? {}) as CustomStyles,
  );

  return (
    <main className={`min-h-dvh ${themeFontVars}`}>
      <ProfileView profile={profile} blocks={blocks} styles={styles} mode="live" />
    </main>
  );
}
