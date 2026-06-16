"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/storage";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Uploads images to the public `media` bucket under media/<uid>/<uuid>.<ext> and
 * returns the public URL. Shared by the gallery editor and the banner/wallpaper
 * uploaders. Storage RLS confines writes to the user's own folder.
 */
export function useMediaUpload(userId: string) {
  const [uploading, setUploading] = useState(false);

  async function upload(file: File): Promise<string | null> {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return null;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be under 5 MB");
      return null;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext =
        (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") ||
        "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) {
        toast.error(error.message);
        return null;
      }
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading };
}
