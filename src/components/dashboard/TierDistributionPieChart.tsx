"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import type { DashboardTierCounts } from "@/types/dashboard";
import { ChartCard } from "./ChartCard";
import { EmptyChartState } from "./EmptyChartState";
import { toSafeCount } from "./format";

type TierDistributionPieChartProps = {
  tierCounts: DashboardTierCounts;
};

const TIER_COLORS = {
  tier1: "#059669",
  tier2: "#d97706",
  tier3: "#dc2626"
} as const;

export function TierDistributionPieChart({
  tierCounts
}: TierDistributionPieChartProps) {
  const safeTierCounts = {
    tier1: toSafeCount(tierCounts.tier1),
    tier2: toSafeCount(tierCounts.tier2),
    tier3: toSafeCount(tierCounts.tier3)
  };
  const data = [
    {
      key: "tier1",
      name: "Tier 1",
      value: safeTierCounts.tier1,
      fill: TIER_COLORS.tier1
    },
    {
      key: "tier2",
      name: "Tier 2",
      value: safeTierCounts.tier2,
      fill: TIER_COLORS.tier2
    },
    {
      key: "tier3",
      name: "Tier 3",
      value: safeTierCounts.tier3,
      fill: TIER_COLORS.tier3
    }
  ];
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartCard
      ariaLabel="Pie chart showing commit distribution across Tier 1, Tier 2, and Tier 3 complexity."
      title="Tier Distribution"
      description="Latest commit sample grouped by deterministic complexity tier."
    >
      {total > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} commits`, "Count"]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid hsl(var(--border))"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChartState message="No tiered commits are available for this repository yet." />
      )}
    </ChartCard>
  );
}
