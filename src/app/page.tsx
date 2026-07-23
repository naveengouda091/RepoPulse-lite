import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import type { AnalyticsDashboardData } from "@/types/dashboard";

const dashboardData: AnalyticsDashboardData = {
  repository: {
    name: "next.js",
    fullName: "vercel/next.js",
    stars: 129000,
    forks: 28200
  },
  health: {
    score: 86,
    grade: "A"
  },
  tierCounts: {
    tier1: 12,
    tier2: 6,
    tier3: 2
  },
  commitComplexity: [
    {
      label: "c1",
      tier: 1,
      totalChanges: 24,
      filesChanged: 2
    },
    {
      label: "c2",
      tier: 2,
      totalChanges: 118,
      filesChanged: 3
    },
    {
      label: "c3",
      tier: 1,
      totalChanges: 36,
      filesChanged: 1
    },
    {
      label: "c4",
      tier: 3,
      totalChanges: 420,
      filesChanged: 8
    },
    {
      label: "c5",
      tier: 2,
      totalChanges: 176,
      filesChanged: 4
    },
    {
      label: "c6",
      tier: 1,
      totalChanges: 18,
      filesChanged: 1
    }
  ],
  executiveSummary: {
    developmentMomentum:
      "- Active commit flow indicates steady development momentum across the latest repository sample.",
    operationalRisks:
      "- A small number of Tier 3 commits should be reviewed for release and regression risk.",
    commitHygiene:
      "- Most commits remain in lower complexity tiers, with documentation activity present in the recent sample."
  }
};

export default function HomePage() {
  return <AnalyticsDashboard data={dashboardData} />;
}
