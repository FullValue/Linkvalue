"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";

export interface LinkStat {
  block_id: string;
  title: string | null;
  url: string | null;
  clicks: number;
}

export function ClicksChart({ data }: { data: LinkStat[] }) {
  const rows = data.slice(0, 10).map((d) => ({
    name: d.title?.trim() || "Untitled",
    clicks: Number(d.clicks),
  }));
  const height = Math.max(140, rows.length * 46);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          layout="vertical"
          data={rows}
          margin={{ left: 4, right: 36, top: 4, bottom: 4 }}
          barCategoryGap={10}
        >
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            cursor={{ fill: "var(--accent)", opacity: 0.4 }}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              color: "var(--popover-foreground)",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--popover-foreground)" }}
          />
          <Bar dataKey="clicks" fill="var(--chart-1)" radius={[0, 6, 6, 0]}>
            <LabelList
              dataKey="clicks"
              position="right"
              style={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
