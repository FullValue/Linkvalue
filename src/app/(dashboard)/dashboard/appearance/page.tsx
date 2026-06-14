import type { Metadata } from "next";
import { Palette } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = { title: "Appearance" };

export default function AppearancePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5">
      <EmptyState
        icon={Palette}
        title="Themes & customization"
        description="Pick a premium theme and fine-tune colours, fonts and button shapes. Coming up shortly."
      />
    </main>
  );
}
