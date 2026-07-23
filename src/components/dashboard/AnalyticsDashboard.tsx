import { CommitComplexityBarChart } from "./CommitComplexityBarChart";
import type { AnalyticsDashboardData } from "@/types/dashboard";
import { ExecutiveSummaryCard } from "./ExecutiveSummaryCard";
import { HealthScoreCard } from "./HealthScoreCard";
import { HealthScoreGauge } from "./HealthScoreGauge";
import { MetricCard } from "./MetricCard";
import { RepositoryHeader } from "./RepositoryHeader";
import { TierDistributionPieChart } from "./TierDistributionPieChart";
import { TierCountsCard } from "./TierCountsCard";

type AnalyticsDashboardProps = {
  data: AnalyticsDashboardData;
};

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const totalTieredCommits =
    data.tierCounts.tier1 + data.tierCounts.tier2 + data.tierCounts.tier3;

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <RepositoryHeader repository={data.repository} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <HealthScoreCard health={data.health} />
          <MetricCard label="Stars" value={data.repository.stars} />
          <MetricCard label="Forks" value={data.repository.forks} />
          <MetricCard
            label="Analyzed Commits"
            value={totalTieredCommits}
            detail="Latest commit sample"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <TierCountsCard tierCounts={data.tierCounts} />
          <ExecutiveSummaryCard summary={data.executiveSummary} />
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <TierDistributionPieChart tierCounts={data.tierCounts} />
          <CommitComplexityBarChart data={data.commitComplexity} />
          <HealthScoreGauge health={data.health} />
        </section>
      </div>
    </main>
  );
}
