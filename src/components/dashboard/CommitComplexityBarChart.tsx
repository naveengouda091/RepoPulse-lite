"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { DashboardCommitComplexityPoint } from "@/types/dashboard";
import { ChartCard } from "./ChartCard";

type CommitComplexityBarChartProps = {
  data: DashboardCommitComplexityPoint[];
};

export function CommitComplexityBarChart({
  data
}: CommitComplexityBarChartProps) {
  return (
    <ChartCard
      title="Commit Complexity"
      description="Total changes per recent commit, with file count available in the tooltip."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name) => [
              value,
              name === "totalChanges" ? "Total changes" : name
            ]}
            labelFormatter={(label) => `Commit ${label}`}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))"
            }}
          />
          <Bar
            dataKey="totalChanges"
            fill="#2563eb"
            radius={[4, 4, 0, 0]}
            name="totalChanges"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
