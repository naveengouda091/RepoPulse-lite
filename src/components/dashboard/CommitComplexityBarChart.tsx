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
import { EmptyChartState } from "./EmptyChartState";

type CommitComplexityBarChartProps = {
  data: DashboardCommitComplexityPoint[];
};

export function CommitComplexityBarChart({
  data
}: CommitComplexityBarChartProps) {
  const chartData = data
    .filter(
      (item) =>
        Number.isFinite(item.totalChanges) && Number.isFinite(item.filesChanged)
    )
    .map((item) => ({
      ...item,
      totalChanges: Math.max(0, item.totalChanges),
      filesChanged: Math.max(0, item.filesChanged)
    }));

  return (
    <ChartCard
      title="Commit Complexity"
      description="Total changes per recent commit, with file count available in the tooltip."
    >
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
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
      ) : (
        <EmptyChartState message="Commit complexity data is not available yet." />
      )}
    </ChartCard>
  );
}
