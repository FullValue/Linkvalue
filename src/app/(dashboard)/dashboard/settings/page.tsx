import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth/user";
import { UpdateUsernameForm } from "@/components/account/update-username-form";
import { UpdateEmailForm } from "@/components/account/update-email-form";
import { UpdatePasswordForm } from "@/components/account/update-password-form";
import { DeleteAccount } from "@/components/account/delete-account";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user || !profile) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-5">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Manage your account and security.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <UpdateUsernameForm currentUsername={profile.username} />
        <UpdateEmailForm currentEmail={user.email ?? ""} />
        <UpdatePasswordForm />
        <DeleteAccount username={profile.username} />
      </div>
    </main>
  );
}
