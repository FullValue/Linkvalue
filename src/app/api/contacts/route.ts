import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { contactSubmitSchema } from "@/lib/validations/blocks";

/**
 * Public contact submission from an email_signup block. Visitors are anonymous,
 * so writes go through the service-role client (RLS denies all client inserts).
 * Anti-spam: a honeypot field plus a short per-block cookie throttle.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields. Pretend success so we don't tip them off.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const username = body.username;
  const blockId = body.blockId;
  if (typeof username !== "string" || typeof blockId !== "string") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const parsed = contactSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 422 },
    );
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // The block must be a live email_signup belonging to this profile.
  const { data: block } = await admin
    .from("blocks")
    .select("id, type, profile_id, is_active")
    .eq("id", blockId)
    .maybeSingle();
  if (
    !block ||
    block.profile_id !== profile.id ||
    block.type !== "email_signup" ||
    !block.is_active
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Throttle repeat submissions from the same browser for this form.
  const cookieName = `lk_sub_${block.id}`;
  if (request.cookies.get(cookieName)) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await admin.from("contacts").insert({
    profile_id: profile.id,
    source_block_id: block.id,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone ?? null,
  });

  // 23505 = unique violation (already subscribed) — treat as success.
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Could not save — please try again" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, "1", {
    maxAge: 600,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
