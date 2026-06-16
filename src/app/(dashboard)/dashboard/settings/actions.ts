"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/user";
import {
  updateEmailSchema,
  updatePasswordSchema,
  usernameSchema,
} from "@/lib/validations/auth";

export type SettingsState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateEmailAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  if (!(await getCurrentUser())) return { error: "Not signed in" };
  const parsed = updateEmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email: parsed.data.email });
  if (error) return { error: error.message };
  return { success: "Email updated." };
}

export async function updatePasswordAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  if (!(await getCurrentUser())) return { error: "Not signed in" };
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: error.message };
  return { success: "Password updated." };
}

export async function updateUsernameAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not signed in" };

  const parsed = usernameSchema.safeParse(formData.get("username"));
  if (!parsed.success) {
    return { fieldErrors: { username: parsed.error.issues.map((i) => i.message) } };
  }
  const username = parsed.data;
  const supabase = await createClient();

  // Friendly pre-check; the DB unique constraint is the real backstop.
  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (taken && taken.id !== user.id) {
    return { fieldErrors: { username: ["This handle is already taken"] } };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", user.id);
  if (error) {
    if (/duplicate|unique/i.test(error.message)) {
      return { fieldErrors: { username: ["This handle is already taken"] } };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { success: "Handle updated. Your old link no longer works." };
}

export async function deleteAccountAction() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Service role required to delete an auth user. FK cascades remove the
  // profile, blocks and analytics rows.
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(user.id);

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
