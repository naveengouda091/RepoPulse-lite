"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer
} from "recharts";
import type { DashboardHealth } from "@/types/dashboard";
import { ChartCard } from "./ChartCard";

type HealthScoreGaugeProps = {
  health: DashboardHealth;
};

function clampHealthScore(score: number): number {
  return Math.min(100, Math.max(0, score));
}

function getGaugeColor(score: number): string {
  if (score >= 85) {
    return "#059669";
  }

  if (score >= 70) {
    return "#65a30d";
  }

  if (score >= 55) {
    return "#d97706";
  }

  if (score >= 40) {
    return "#ea580c";
  }

  return "#dc2626";
}

export function HealthScoreGauge({ health }: HealthScoreGaugeProps) {
  const score = clampHealthScore(health.score);
  const data = [
    {
      name: "Health",
      value: score,
      fill: getGaugeColor(score)
    }
  ];

  return (
    <ChartCard
      title="Health Gauge"
      description="Repository health score normalized to a 100-point scale."
    >
      <div className="relative h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={data}
            cx="50%"
            cy="58%"
            innerRadius="70%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={8}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-x-0 bottom-8 text-center">
          <p className="text-4xl font-semibold tracking-normal">{score}</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Grade {health.grade}
          </p>
        </div>
      </div>
    </ChartCard>
  );
}
