"use client";

import { BuilderProvider, type BuilderProfile } from "./builder-context";
import { ProfileEditor } from "./profile-editor";
import { BlockList } from "./block-list";
import { SocialEditor } from "./social-editor";
import { LivePreview } from "./live-preview";
import type { Block } from "@/lib/supabase/types";

export function Builder({
  userId,
  profile,
  blocks,
}: {
  userId: string;
  profile: BuilderProfile;
  blocks: Block[];
}) {
  return (
    <BuilderProvider userId={userId} initialProfile={profile} initialBlocks={blocks}>
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-5 lg:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <ProfileEditor userId={userId} />
          <BlockList />
          <SocialEditor />
        </div>
        <aside className="row-start-1 lg:sticky lg:top-24 lg:row-auto lg:self-start">
          <LivePreview />
        </aside>
      </div>
    </BuilderProvider>
  );
}
