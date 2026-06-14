import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="bg-card rounded-2xl border p-5">
      <div className="text-muted-foreground flex items-center gap-2">
        <Icon className="size-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="font-heading mt-2 text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? <p className="text-muted-foreground mt-1 text-xs">{hint}</p> : null}
    </div>
  );
}
