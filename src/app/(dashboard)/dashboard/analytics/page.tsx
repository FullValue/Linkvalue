import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Eye, MousePointerClick, TrendingUp, BarChart3 } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/analytics/stat-card";
import { ClicksChart } from "@/components/analytics/clicks-chart";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const [views, clicks, perLink] = await Promise.all([
    supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profile.id),
    supabase
      .from("clicks")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profile.id),
    supabase.rpc("link_click_counts"),
  ]);

  const totalViews = views.count ?? 0;
  const totalClicks = clicks.count ?? 0;
  const links = perLink.data ?? [];
  const perView = totalViews > 0 ? (totalClicks / totalViews).toFixed(2) : "0.00";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Analytics</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Measured server-side. No cookies follow your visitors around.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Eye} label="Page views" value={totalViews} />
        <StatCard icon={MousePointerClick} label="Link clicks" value={totalClicks} />
        <StatCard
          icon={TrendingUp}
          label="Clicks per view"
          value={perView}
          hint="Across all links"
        />
      </div>

      <section className="bg-card mt-8 rounded-2xl border p-5">
        <h2 className="font-heading mb-4 text-sm font-semibold tracking-tight">
          Top links
        </h2>
        {links.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No clicks yet"
            description="Share your page — once people start clicking, your top links rank here."
            className="py-12"
          />
        ) : (
          <ClicksChart data={links} />
        )}
      </section>
    </main>
  );
}
