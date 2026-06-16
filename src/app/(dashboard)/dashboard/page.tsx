import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import { Builder } from "@/components/builder/builder";
import type { CustomStyles } from "@/lib/themes";

export const metadata: Metadata = { title: "Builder" };

export default async function BuilderPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: blocks } = await supabase
    .from("blocks")
    .select("*")
    .eq("profile_id", profile.id)
    .order("position", { ascending: true });

  return (
    <Builder
      userId={profile.id}
      profile={{
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        theme_id: profile.theme_id,
        custom_styles: (profile.custom_styles ?? {}) as CustomStyles,
        header_layout: profile.header_layout,
        banner_url: profile.banner_url,
      }}
      blocks={blocks ?? []}
    />
  );
}
