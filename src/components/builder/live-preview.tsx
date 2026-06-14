"use client";

import { useBuilder } from "./builder-context";
import { ProfileView } from "@/components/profile/profile-view";

export function LivePreview() {
  const { profile, blocks, styles } = useBuilder();

  return (
    <div className="relative mx-auto w-[300px]">
      <div className="bg-brand/10 absolute -inset-6 -z-10 rounded-[3rem] blur-3xl" />
      <div className="relative rounded-[2.6rem] border border-white/10 bg-black/40 p-2.5 shadow-2xl shadow-black/50 backdrop-blur">
        <div className="absolute top-4 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/70" />
        <div className="h-[600px] [scrollbar-width:none] overflow-x-hidden overflow-y-auto rounded-[2.1rem] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <ProfileView profile={profile} blocks={blocks} styles={styles} mode="preview" />
        </div>
      </div>
    </div>
  );
}
