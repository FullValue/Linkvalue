"use client";

import { useState } from "react";
import { useBuilder } from "./builder-context";
import { AvatarUploader } from "./avatar-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileEditor({ userId }: { userId: string }) {
  const { profile, saveProfile, setProfileLocal } = useBuilder();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");

  function persist() {
    saveProfile({ display_name: displayName, bio });
  }

  return (
    <section className="bg-card rounded-2xl border p-5">
      <h2 className="font-heading mb-4 text-sm font-semibold tracking-tight">Profile</h2>
      <div className="flex gap-4">
        <AvatarUploader userId={userId} />
        <div className="flex-1 space-y-3">
          <div className="grid gap-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              maxLength={60}
              placeholder="Your name"
              onChange={(e) => {
                setDisplayName(e.target.value);
                setProfileLocal({ display_name: e.target.value || null });
              }}
              onBlur={persist}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              maxLength={200}
              rows={3}
              placeholder="A short line about you"
              className="resize-none"
              onChange={(e) => {
                setBio(e.target.value);
                setProfileLocal({ bio: e.target.value || null });
              }}
              onBlur={persist}
            />
            <p className="text-muted-foreground text-right text-xs">{bio.length}/200</p>
          </div>
        </div>
      </div>
    </section>
  );
}
