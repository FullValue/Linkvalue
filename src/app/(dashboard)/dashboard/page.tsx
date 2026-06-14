import type { Metadata } from "next";
import { Hammer } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Builder" };

// Phase 1 placeholder — the drag-and-drop builder lands in Phase 2.
export default function BuilderPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5">
      <EmptyState
        icon={Hammer}
        title="Your builder is almost here"
        description="Account and dashboard shell are ready. Block editing, drag-and-drop and the live preview arrive in the next step."
      />
    </main>
  );
}
