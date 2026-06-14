"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema, usernameSchema } from "@/lib/validations/auth";
import { siteConfig } from "@/lib/site";

export type AuthState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password" | "username", string[]>>;
};

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, password, username } = parsed.data;
  const supabase = await createClient();

  // Friendly pre-check; the DB unique constraint is the real backstop.
  const { data: existing } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();
  if (existing) {
    return { fieldErrors: { username: ["This username is already taken"] } };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${siteConfig.url}/auth/confirm`,
    },
  });

  if (error) {
    if (/duplicate|unique|already (registered|exists)/i.test(error.message)) {
      return { fieldErrors: { username: ["This username is already taken"] } };
    }
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const next = String(formData.get("next") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Invalid email or password." };
  }

  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Live username availability check for the signup form. */
export async function checkUsernameAction(
  username: string,
): Promise<{ available: boolean; message: string }> {
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    return { available: false, message: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", parsed.data)
    .maybeSingle();
  return data
    ? { available: false, message: "Already taken" }
    : { available: true, message: "Available" };
}
