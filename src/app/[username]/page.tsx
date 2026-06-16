import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getPublicProfile } from "@/lib/profile-data";
import { detectDevice } from "@/lib/app-download";
import { ProfileView } from "@/components/profile/profile-view";
import { PageViewTracker } from "@/components/profile/page-view-tracker";
import { resolveStyles } from "@/lib/themes";
import { customStylesSchema } from "@/lib/validations/appearance";
import { themeFontVars } from "@/lib/fonts";
import { profileUrl, siteConfig } from "@/lib/site";

type Params = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) return { title: "Not found", robots: { index: false } };

  const { profile } = data;
  const title = profile.display_name?.trim() || `@${profile.username}`;
  const description = profile.bio?.trim() || `${title} — all their links in one place.`;
  const url = profileUrl(profile.username);

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
  // Re-validate stored styles at render: a direct PostgREST write could put
  // arbitrary values in custom_styles; only known hex/enum fields are honoured.
  const parsedStyles = customStylesSchema.safeParse(profile.custom_styles ?? {});
  const styles = resolveStyles(
    profile.theme_id,
    parsedStyles.success ? parsedStyles.data : {},
  );

  const viewerDevice = detectDevice((await headers()).get("user-agent"));

  return (
    <main className={`min-h-dvh ${themeFontVars}`}>
      <ProfileView
        profile={profile}
        blocks={blocks}
        styles={styles}
        mode="live"
        hrefFor={(block) => `/api/go/${block.id}`}
        viewerDevice={viewerDevice}
        headerLayout={profile.header_layout}
        bannerUrl={profile.banner_url}
      />
      <PageViewTracker username={profile.username} />
    </main>
  );
}
