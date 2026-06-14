import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Page-view beacon. Fired once per page load by the public page. A short-lived
 * per-profile cookie keeps one human visitor from inflating views on refresh.
 * No IP or PII is stored — just a count.
 */
export async function POST(request: NextRequest) {
  let username: unknown;
  try {
    ({ username } = await request.json());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (typeof username !== "string" || !username) {
    return new NextResponse(null, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  const res = new NextResponse(null, { status: 204 });
  if (!profile) return res;

  const cookieName = `lk_v_${profile.id}`;
  if (!request.cookies.get(cookieName)) {
    await admin.from("page_views").insert({ profile_id: profile.id });
    res.cookies.set(cookieName, "1", {
      maxAge: 1800,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return res;
}
