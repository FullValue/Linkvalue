"use client";

import { useBuilder } from "@/components/builder/builder-context";
import { ThemePicker } from "./theme-picker";
import { StyleControls } from "./style-controls";
import { LivePreview } from "@/components/builder/live-preview";

export function AppearanceEditor() {
  const { profile } = useBuilder();

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-5 lg:grid-cols-[1fr_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <section className="bg-card rounded-2xl border p-5">
          <h2 className="font-heading mb-4 text-sm font-semibold tracking-tight">
            Theme
          </h2>
          <ThemePicker />
        </section>
        <section className="bg-card rounded-2xl border p-5">
          <h2 className="font-heading mb-2 text-sm font-semibold tracking-tight">
            Fine-tune
          </h2>
          {/* Remount controls on theme change so fields reset to the preset. */}
          <StyleControls key={profile.theme_id} />
        </section>
      </div>
      <aside className="row-start-1 lg:sticky lg:top-24 lg:row-auto lg:self-start">
        <LivePreview />
      </aside>
    </div>
  );
}
