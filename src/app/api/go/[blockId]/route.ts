import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Click-tracking redirect. The public page points link buttons here; we record
 * the click server-side (service role) then 302 to the real destination.
 * A short-lived per-block cookie prevents refresh/double-click inflation.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> },
) {
  const { blockId } = await params;
  const admin = createAdminClient();

  const { data: block } = await admin
    .from("blocks")
    .select("id, url, type, meta, profile_id, is_active")
    .eq("id", blockId)
    .maybeSingle();

  const home = new URL("/", request.url);
  if (!block || !block.is_active) {
    return NextResponse.redirect(home, 302);
  }

  // App-download blocks carry two store URLs in `meta`; the public page tells
  // us which one was clicked via ?store=. Everything else uses block.url.
  let target: string | null | undefined = block.url;
  let clickMeta: Record<string, string> = {};
  if (block.type === "app_download") {
    const store = request.nextUrl.searchParams.get("store");
    const m = (block.meta ?? {}) as { ios_url?: string; android_url?: string };
    if (store === "ios") target = m.ios_url;
    else if (store === "android") target = m.android_url;
    else target = null;
    if (store === "ios" || store === "android") clickMeta = { store };
  }

  if (!target) {
    return NextResponse.redirect(home, 302);
  }

  // Self-defending: only ever redirect to an http(s) destination.
  let dest: URL;
  try {
    dest = new URL(target);
  } catch {
    return NextResponse.redirect(home, 302);
  }
  if (dest.protocol !== "http:" && dest.protocol !== "https:") {
    return NextResponse.redirect(home, 302);
  }

  const res = NextResponse.redirect(dest.toString(), 302);

  // Per-store cookie so iOS and Android clicks are counted independently.
  const cookieName = `lk_c_${block.id}${clickMeta.store ? `_${clickMeta.store}` : ""}`;
  if (!request.cookies.get(cookieName)) {
    await admin
      .from("clicks")
      .insert({ block_id: block.id, profile_id: block.profile_id, meta: clickMeta });
    res.cookies.set(cookieName, "1", {
      maxAge: 1800,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return res;
}
