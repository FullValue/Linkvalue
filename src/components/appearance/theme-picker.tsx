"use client";

import { Check } from "lucide-react";
import { useBuilder } from "@/components/builder/builder-context";
import { THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";

export function ThemePicker() {
  const { profile, setTheme } = useBuilder();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {THEMES.map((t) => {
        const active = profile.theme_id === t.id;
        const bg =
          t.styles.background.type === "gradient"
            ? `linear-gradient(${t.styles.background.angle}deg, ${t.styles.background.from}, ${t.styles.background.to})`
            : t.styles.background.color;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            aria-pressed={active}
            className={cn(
              "focus-visible:ring-ring group rounded-xl border-2 p-2.5 text-left transition outline-none focus-visible:ring-2",
              active ? "border-brand" : "border-border hover:border-foreground/30",
            )}
          >
            <div
              className="flex h-20 w-full flex-col items-center justify-center gap-1.5 rounded-lg px-4"
              style={{ background: bg }}
            >
              <span
                className="h-2.5 w-full rounded-full"
                style={{
                  background: t.styles.buttonColor,
                  borderRadius: t.styles.buttonShape === "square" ? 3 : 999,
                }}
              />
              <span
                className="h-2.5 w-4/5 rounded-full"
                style={{
                  background: t.styles.buttonColor,
                  borderRadius: t.styles.buttonShape === "square" ? 3 : 999,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium">{t.name}</span>
              {active ? (
                <span className="bg-brand text-brand-foreground grid size-5 place-items-center rounded-full">
                  <Check className="size-3" />
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
