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
