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
    .select("id, url, profile_id, is_active")
    .eq("id", blockId)
    .maybeSingle();

  const home = new URL("/", request.url);
  if (!block || !block.url || !block.is_active) {
    return NextResponse.redirect(home, 302);
  }

  const res = NextResponse.redirect(block.url, 302);

  const cookieName = `lk_c_${block.id}`;
  if (!request.cookies.get(cookieName)) {
    await admin
      .from("clicks")
      .insert({ block_id: block.id, profile_id: block.profile_id });
    res.cookies.set(cookieName, "1", {
      maxAge: 1800,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return res;
}
