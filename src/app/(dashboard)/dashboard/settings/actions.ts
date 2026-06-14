"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/user";
import { updateEmailSchema, updatePasswordSchema } from "@/lib/validations/auth";

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
