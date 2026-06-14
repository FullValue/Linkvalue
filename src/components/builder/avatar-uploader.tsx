"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useBuilder } from "./builder-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MAX_BYTES = 3 * 1024 * 1024;

export function AvatarUploader({ userId }: { userId: string }) {
  const { profile, setAvatar } = useBuilder();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const initial = (profile.display_name || profile.username).charAt(0).toUpperCase();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be under 3 MB");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const path = `${userId}/avatar`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await setAvatar(`${data.publicUrl}?v=${Date.now()}`);
    toast.success("Avatar updated");
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function removeAvatar() {
    const supabase = createClient();
    await supabase.storage.from("avatars").remove([`${userId}/avatar`]);
    await setAvatar(null);
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group focus-visible:ring-ring relative block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        aria-label="Upload avatar"
      >
        <Avatar className="size-20 border">
          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" /> : null}
          <AvatarFallback className="bg-secondary text-xl font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 grid place-items-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="size-5 animate-spin text-white" />
          ) : (
            <Camera className="size-5 text-white" />
          )}
        </span>
      </button>

      {profile.avatar_url && !uploading ? (
        <button
          type="button"
          onClick={removeAvatar}
          className="bg-background hover:bg-secondary absolute -top-1 -right-1 grid size-6 place-items-center rounded-full border shadow-sm"
          aria-label="Remove avatar"
        >
          <X className="size-3.5" />
        </button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}
