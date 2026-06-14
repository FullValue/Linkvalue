import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5">
      <EmptyState
        icon={BarChart3}
        title="Analytics"
        description="Total views, total clicks and your top links — measured server-side. Lands in a later step."
      />
    </main>
  );
}
