import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Block, Profile } from "@/lib/supabase/types";

/**
 * Public profile + its active blocks, by username. Memoized per request so
 * generateMetadata and the page share a single query. RLS allows anonymous
 * reads of profiles and active blocks.
 */
export const getPublicProfile = cache(
  async (username: string): Promise<{ profile: Profile; blocks: Block[] } | null> => {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username.toLowerCase())
      .maybeSingle();

    if (!profile) return null;

    const { data: blocks } = await supabase
      .from("blocks")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("position", { ascending: true });

    return { profile, blocks: blocks ?? [] };
  },
);
