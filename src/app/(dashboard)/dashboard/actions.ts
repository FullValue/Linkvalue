"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/user";
import { clientEnv } from "@/lib/env";
import {
  linkBlockSchema,
  embedBlockSchema,
  socialBlockSchema,
  appDownloadBlockSchema,
  galleryBlockSchema,
  textBlockSchema,
  headerBlockSchema,
  emailSignupBlockSchema,
} from "@/lib/validations/blocks";
import { profileSchema } from "@/lib/validations/profile";
import { appearanceSchema } from "@/lib/validations/appearance";
import { detectEmbed } from "@/lib/embeds";
import { SOCIAL_MAP } from "@/lib/socials";
import { isOwnMediaUrl } from "@/lib/storage";
import { isHeaderLayout } from "@/lib/themes";
import type { Block, BlockType, Database, Json } from "@/lib/supabase/types";

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

/**
 * Validate gallery input and build its `meta`. Each image URL must live in the
 * owner's own media/<uid>/ Storage folder — the only place the uploader writes —
 * so a gallery can't be turned into an arbitrary off-site image embed.
 */
function buildGalleryMeta(
  values: unknown,
  userId: string,
): { meta: Json } | { fieldErrors: Record<string, string[] | undefined> } {
  const p = galleryBlockSchema.safeParse(values);
  if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };

  const supabaseUrl = clientEnv().NEXT_PUBLIC_SUPABASE_URL;
  if (p.data.images.some((im) => !isOwnMediaUrl(im.url, supabaseUrl, userId))) {
    return { fieldErrors: { images: ["Images must be uploaded here"] } };
  }

  return {
    meta: {
      layout: p.data.layout,
      images: p.data.images.map((im) => ({
        url: im.url,
        alt: im.alt ?? null,
        link: im.link ?? null,
      })),
    },
  };
}

/** Normalize parsed email_signup input into its stored `meta` shape. */
function emailSignupMeta(d: {
  heading?: string;
  description?: string;
  fields: "email" | "email_phone";
  button_label?: string;
  success_message?: string;
}): Json {
  return {
    heading: d.heading?.trim() || null,
    description: d.description?.trim() || null,
    fields: d.fields,
    button_label: d.button_label?.trim() || null,
    success_message: d.success_message?.trim() || null,
  };
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

  // Only this project's storage, under the user's own avatars/<id>/ folder.
  // Prevents an SSRF/foreign URL being persisted into avatar_url, which is
  // fetched server-side by the OG renderer. The DB has a matching CHECK.
  if (url !== null) {
    const prefix = `${clientEnv().NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${ctx.userId}/`;
    if (!url.startsWith(prefix)) return { error: "Invalid avatar URL" };
  }

  const { error } = await ctx.supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", ctx.userId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

export async function saveAppearanceAction(
  themeId: string,
  customStyles: unknown,
): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { error: "Not signed in" };

  const parsed = appearanceSchema.safeParse({ themeId, customStyles });
  if (!parsed.success) return { error: "Invalid appearance settings" };

  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      theme_id: parsed.data.themeId,
      custom_styles: parsed.data.customStyles as unknown as Json,
    })
    .eq("id", ctx.userId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

export async function setHeaderLayoutAction(layout: string): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { error: "Not signed in" };
  if (!isHeaderLayout(layout)) return { error: "Invalid layout" };

  const { error } = await ctx.supabase
    .from("profiles")
    .update({ header_layout: layout })
    .eq("id", ctx.userId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return {};
}

export async function setBannerAction(url: string | null): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { error: "Not signed in" };

  // Only the user's own media/<id>/ objects (or null). Mirrors setAvatarAction.
  if (url !== null) {
    const supabaseUrl = clientEnv().NEXT_PUBLIC_SUPABASE_URL;
    if (!isOwnMediaUrl(url, supabaseUrl, ctx.userId)) {
      return { error: "Invalid banner URL" };
    }
  }

  const { error } = await ctx.supabase
    .from("profiles")
    .update({ banner_url: url })
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
      return {
        fieldErrors: { url: ["Only YouTube, Spotify and TikTok links are supported"] },
      };
    }
    insert = {
      profile_id: ctx.userId,
      type,
      title:
        p.data.title?.trim() ||
        (embed.provider === "youtube"
          ? "YouTube"
          : embed.provider === "tiktok"
            ? "TikTok"
            : "Spotify"),
      url: p.data.url,
      meta: { provider: embed.provider },
    };
  } else if (type === "social") {
    const p = socialBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    insert = {
      profile_id: ctx.userId,
      type,
      title: SOCIAL_MAP[p.data.platform].label,
      url: p.data.url,
      meta: { platform: p.data.platform },
    };
  } else if (type === "app_download") {
    const p = appDownloadBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    insert = {
      profile_id: ctx.userId,
      type,
      title: p.data.heading?.trim() || null,
      url: null,
      meta: {
        ios_url: p.data.ios_url ?? null,
        android_url: p.data.android_url ?? null,
        display_mode: p.data.display_mode,
        badge_variant: p.data.badge_variant,
        layout: p.data.layout,
        heading: p.data.heading?.trim() || null,
      },
    };
  } else if (type === "gallery") {
    const built = buildGalleryMeta(values, ctx.userId);
    if ("fieldErrors" in built) return { fieldErrors: built.fieldErrors };
    insert = { profile_id: ctx.userId, type, title: null, url: null, meta: built.meta };
  } else if (type === "text") {
    const p = textBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    insert = {
      profile_id: ctx.userId,
      type,
      title: p.data.heading?.trim() || null,
      url: null,
      meta: { body: p.data.body?.trim() || null },
    };
  } else if (type === "header") {
    const p = headerBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    insert = { profile_id: ctx.userId, type, title: p.data.title, url: null, meta: {} };
  } else if (type === "email_signup") {
    const p = emailSignupBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    insert = {
      profile_id: ctx.userId,
      type,
      title: p.data.heading?.trim() || null,
      url: null,
      meta: emailSignupMeta(p.data),
    };
  } else {
    return { error: "Unsupported block type" };
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
      return {
        fieldErrors: { url: ["Only YouTube, Spotify and TikTok links are supported"] },
      };
    }
    patch = {
      url: p.data.url,
      title:
        p.data.title?.trim() ||
        (embed.provider === "youtube"
          ? "YouTube"
          : embed.provider === "tiktok"
            ? "TikTok"
            : "Spotify"),
      meta: { provider: embed.provider },
    };
  } else if (type === "social") {
    const p = socialBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    patch = {
      url: p.data.url,
      title: SOCIAL_MAP[p.data.platform].label,
      meta: { platform: p.data.platform },
    };
  } else if (type === "app_download") {
    const p = appDownloadBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    patch = {
      url: null,
      title: p.data.heading?.trim() || null,
      meta: {
        ios_url: p.data.ios_url ?? null,
        android_url: p.data.android_url ?? null,
        display_mode: p.data.display_mode,
        badge_variant: p.data.badge_variant,
        layout: p.data.layout,
        heading: p.data.heading?.trim() || null,
      },
    };
  } else if (type === "gallery") {
    const built = buildGalleryMeta(values, ctx.userId);
    if ("fieldErrors" in built) return { fieldErrors: built.fieldErrors };
    patch = { url: null, title: null, meta: built.meta };
  } else if (type === "text") {
    const p = textBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    patch = {
      url: null,
      title: p.data.heading?.trim() || null,
      meta: { body: p.data.body?.trim() || null },
    };
  } else if (type === "header") {
    const p = headerBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    patch = { url: null, title: p.data.title, meta: {} };
  } else if (type === "email_signup") {
    const p = emailSignupBlockSchema.safeParse(values);
    if (!p.success) return { fieldErrors: p.error.flatten().fieldErrors };
    patch = { url: null, title: p.data.heading?.trim() || null, meta: emailSignupMeta(p.data) };
  } else {
    return { error: "Unsupported block type" };
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
