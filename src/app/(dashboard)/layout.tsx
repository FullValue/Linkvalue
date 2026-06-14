import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/user";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col">
      <DashboardNav
        username={profile.username}
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
