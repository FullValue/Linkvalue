"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/user";
import {
  linkBlockSchema,
  embedBlockSchema,
  socialBlockSchema,
} from "@/lib/validations/blocks";
import { profileSchema } from "@/lib/validations/profile";
import { detectEmbed } from "@/lib/embeds";
import { SOCIAL_MAP } from "@/lib/socials";
import type { Block, BlockType, Database } from "@/lib/supabase/types";

type BlockInsert = Database["public"]["Tables"]["blocks"]["Insert"];
type BlockUpdate = Database["public"]["Tables"]["blocks"]["Update"];

export type Result<T = undefined> = {
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

async function context() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  return { userId: user.id, supabase };
}

async function nextPosition(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string,
): Promise<number> {
  const { data } = await supabase
    .from("blocks")
    .select("position")
    .eq("profile_id", profileId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.position ?? -1) + 1;
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                     */
/* -------------------------------------------------------------------------- */

export async function updateProfileAction(values: unknown): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { error: "Not signed in" };

  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name?.trim() || null,
      bio: parsed.data.bio?.trim() || null,
    })
    .eq("id", ctx.userId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

export async function setAvatarAction(url: string | null): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { error: "Not signed in" };

  const { error } = await ctx.supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", ctx.userId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

/* -------------------------------------------------------------------------- */
/* Blocks                                                                      */
/* -------------------------------------------------------------------------- */

export async function createBlockAction(
  type: BlockType,
  values: unknown,
): Promise<Result<Block>> {
  const ctx = await context();
  if (!ctx) return { error: "Not signed in" };

  let insert: BlockInsert;

  if (type === "link") {
    const p = linkBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    insert = {
      profile_id: ctx.userId,
      type,
      title: p.data.title,
      url: p.data.url,
      icon: p.data.icon || null,
      meta: {},
    };
  } else if (type === "embed") {
    const p = embedBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    const embed = detectEmbed(p.data.url);
    if (!embed) {
      return { fieldErrors: { url: ["Only YouTube and Spotify links are supported"] } };
    }
    insert = {
      profile_id: ctx.userId,
      type,
      title:
        p.data.title?.trim() || (embed.provider === "youtube" ? "YouTube" : "Spotify"),
      url: p.data.url,
      meta: { provider: embed.provider },
    };
  } else {
    const p = socialBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    insert = {
      profile_id: ctx.userId,
      type,
      title: SOCIAL_MAP[p.data.platform].label,
      url: p.data.url,
      meta: { platform: p.data.platform },
    };
  }

  insert.position = await nextPosition(ctx.supabase, ctx.userId);

  const { data, error } = await ctx.supabase
    .from("blocks")
    .insert(insert)
    .select("*")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { data };
}

export async function updateBlockAction(
  id: string,
  type: BlockType,
  values: unknown,
): Promise<Result<Block>> {
  const ctx = await context();
  if (!ctx) return { error: "Not signed in" };

  let patch: BlockUpdate;

  if (type === "link") {
    const p = linkBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    patch = { title: p.data.title, url: p.data.url, icon: p.data.icon || null };
  } else if (type === "embed") {
    const p = embedBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    const embed = detectEmbed(p.data.url);
    if (!embed) {
      return { fieldErrors: { url: ["Only YouTube and Spotify links are supported"] } };
    }
    patch = {
      url: p.data.url,
      title:
        p.data.title?.trim() || (embed.provider === "youtube" ? "YouTube" : "Spotify"),
      meta: { provider: embed.provider },
    };
  } else {
    const p = socialBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    patch = {
      url: p.data.url,
      title: SOCIAL_MAP[p.data.platform].label,
      meta: { platform: p.data.platform },
    };
  }

  const { data, error } = await ctx.supabase
    .from("blocks")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { data };
}

export async function toggleBlockAction(id: string, isActive: boolean): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { error: "Not signed in" };

  const { error } = await ctx.supabase
    .from("blocks")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

export async function deleteBlockAction(id: string): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { error: "Not signed in" };

  const { error } = await ctx.supabase.from("blocks").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

export async function reorderBlocksAction(ids: string[]): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { error: "Not signed in" };

  // RLS scopes each update to the owner's rows.
  const results = await Promise.all(
    ids.map((id, index) =>
      ctx.supabase.from("blocks").update({ position: index }).eq("id", id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath("/dashboard");
  return {};
}
