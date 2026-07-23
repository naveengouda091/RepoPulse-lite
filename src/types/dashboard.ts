export type DashboardTierCounts = {
  tier1: number;
  tier2: number;
  tier3: number;
};

export type DashboardCommitComplexityPoint = {
  label: string;
  tier: 1 | 2 | 3;
  totalChanges: number;
  filesChanged: number;
};

export type DashboardExecutiveSummary = {
  developmentMomentum: string;
  operationalRisks: string;
  commitHygiene: string;
};

export type DashboardRepository = {
  name: string;
  fullName: string;
  stars: number;
  forks: number;
};

export type DashboardHealth = {
  score: number;
  grade: string;
};

export type AnalyticsDashboardData = {
  repository: DashboardRepository;
  health: DashboardHealth;
  tierCounts: DashboardTierCounts;
  commitComplexity: DashboardCommitComplexityPoint[];
  executiveSummary: DashboardExecutiveSummary;
};
