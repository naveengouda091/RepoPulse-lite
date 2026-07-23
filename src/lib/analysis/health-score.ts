import type { RepositoryCommitDetails } from "@/lib/github";
import {
  analyzeCommitComplexities,
  type CommitComplexityAnalysis
} from "./complexity";

export type RepositoryHealthGrade = "A" | "B" | "C" | "D" | "F";

export type HealthScoreBreakdownItem = {
  score: number;
  weight: number;
  reason: string;
};

export type RepositoryHealthBreakdown = {
  tierCounts: {
    tier1: number;
    tier2: number;
    tier3: number;
  };
  tierDistribution: HealthScoreBreakdownItem;
  commitFrequency: HealthScoreBreakdownItem;
  documentationCommits: HealthScoreBreakdownItem;
  largeRiskyCommits: HealthScoreBreakdownItem;
  recentActivity: HealthScoreBreakdownItem;
};

export type RepositoryHealthScore = {
  score: number;
  grade: RepositoryHealthGrade;
  breakdown: RepositoryHealthBreakdown;
};

export type RepositoryHealthScoreOptions = {
  referenceDate?: Date;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const WEIGHTS = {
  tierDistribution: 0.3,
  commitFrequency: 0.2,
  documentationCommits: 0.15,
  largeRiskyCommits: 0.2,
  recentActivity: 0.15
} as const;

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getValidCommitDates(commits: readonly RepositoryCommitDetails[]): Date[] {
  return commits
    .map((commit) => (commit.date ? new Date(commit.date) : null))
    .filter((date): date is Date => date instanceof Date && !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
}

function getGrade(score: number): RepositoryHealthGrade {
  if (score >= 85) {
    return "A";
  }

  if (score >= 70) {
    return "B";
  }

  if (score >= 55) {
    return "C";
  }

  if (score >= 40) {
    return "D";
  }

  return "F";
}

function countTiers(complexities: readonly CommitComplexityAnalysis[]) {
  return complexities.reduce(
    (counts, commit) => {
      if (commit.tier === 1) {
        counts.tier1 += 1;
      }

      if (commit.tier === 2) {
        counts.tier2 += 1;
      }

      if (commit.tier === 3) {
        counts.tier3 += 1;
      }

      return counts;
    },
    {
      tier1: 0,
      tier2: 0,
      tier3: 0
    }
  );
}

function scoreTierDistribution(
  complexities: readonly CommitComplexityAnalysis[]
): HealthScoreBreakdownItem {
  if (complexities.length === 0) {
    return {
      score: 0,
      weight: WEIGHTS.tierDistribution,
      reason: "No commits were available for tier analysis."
    };
  }

  const rawScore =
    complexities.reduce((total, commit) => {
      if (commit.tier === 1) {
        return total + 100;
      }

      if (commit.tier === 2) {
        return total + 70;
      }

      return total + 35;
    }, 0) / complexities.length;

  return {
    score: clampScore(rawScore),
    weight: WEIGHTS.tierDistribution,
    reason: "Tier 1 commits score highest, Tier 2 commits score moderately, and Tier 3 commits reduce health."
  };
}

function scoreCommitFrequency(
  commits: readonly RepositoryCommitDetails[],
  dates: readonly Date[]
): HealthScoreBreakdownItem {
  if (commits.length === 0 || dates.length === 0) {
    return {
      score: 0,
      weight: WEIGHTS.commitFrequency,
      reason: "No dated commits were available for frequency analysis."
    };
  }

  const oldest = dates[0];
  const newest = dates[dates.length - 1];
  const activeDays = Math.max(7, (newest.getTime() - oldest.getTime()) / DAY_IN_MS);
  const commitsPerWeek = dates.length / (activeDays / 7);

  let score = 15;

  if (commitsPerWeek >= 4) {
    score = 100;
  } else if (commitsPerWeek >= 2) {
    score = 75;
  } else if (commitsPerWeek >= 1) {
    score = 55;
  } else if (commitsPerWeek >= 0.5) {
    score = 35;
  }

  return {
    score,
    weight: WEIGHTS.commitFrequency,
    reason: `Recent sample averages ${commitsPerWeek.toFixed(1)} commits per week.`
  };
}

function scoreDocumentationCommits(
  complexities: readonly CommitComplexityAnalysis[]
): HealthScoreBreakdownItem {
  if (complexities.length === 0) {
    return {
      score: 0,
      weight: WEIGHTS.documentationCommits,
      reason: "No commits were available for documentation analysis."
    };
  }

  const documentationCount = complexities.filter(
    (commit) => commit.documentationOnly
  ).length;
  const documentationRatio = documentationCount / complexities.length;

  let score: number;

  if (documentationRatio === 0) {
    score = 45;
  } else if (documentationRatio <= 0.1) {
    score = 70;
  } else if (documentationRatio <= 0.35) {
    score = 100;
  } else if (documentationRatio <= 0.6) {
    score = 80;
  } else if (documentationRatio <= 0.8) {
    score = 60;
  } else {
    score = 40;
  }

  return {
    score,
    weight: WEIGHTS.documentationCommits,
    reason: `${documentationCount} of ${complexities.length} commits are documentation-only.`
  };
}

function isLargeRiskyCommit(commit: CommitComplexityAnalysis): boolean {
  return commit.tier === 3 || commit.totalChanges > 500 || commit.filesChanged > 10;
}

function scoreLargeRiskyCommits(
  complexities: readonly CommitComplexityAnalysis[]
): HealthScoreBreakdownItem {
  if (complexities.length === 0) {
    return {
      score: 0,
      weight: WEIGHTS.largeRiskyCommits,
      reason: "No commits were available for large risky commit analysis."
    };
  }

  const riskyCount = complexities.filter(isLargeRiskyCommit).length;
  const riskyRatio = riskyCount / complexities.length;
  const score = clampScore(100 - riskyRatio * 100);

  return {
    score,
    weight: WEIGHTS.largeRiskyCommits,
    reason: `${riskyCount} of ${complexities.length} commits are large or risky.`
  };
}

function scoreRecentActivity(
  dates: readonly Date[],
  referenceDate: Date
): HealthScoreBreakdownItem {
  if (dates.length === 0) {
    return {
      score: 0,
      weight: WEIGHTS.recentActivity,
      reason: "No dated commits were available for recent activity analysis."
    };
  }

  const latest = dates[dates.length - 1];
  const daysSinceLatest = Math.max(
    0,
    Math.floor((referenceDate.getTime() - latest.getTime()) / DAY_IN_MS)
  );

  let score = 10;

  if (daysSinceLatest <= 7) {
    score = 100;
  } else if (daysSinceLatest <= 14) {
    score = 85;
  } else if (daysSinceLatest <= 30) {
    score = 70;
  } else if (daysSinceLatest <= 60) {
    score = 50;
  } else if (daysSinceLatest <= 90) {
    score = 30;
  }

  return {
    score,
    weight: WEIGHTS.recentActivity,
    reason: `Latest commit is ${daysSinceLatest} days before the reference date.`
  };
}

/*
 * Deterministic repository health formula:
 *
 * score =
 *   tierDistribution.score * 0.30 +
 *   commitFrequency.score * 0.20 +
 *   documentationCommits.score * 0.15 +
 *   largeRiskyCommits.score * 0.20 +
 *   recentActivity.score * 0.15
 *
 * Inputs are normalized commit details and an optional referenceDate. When no
 * referenceDate is provided, the latest commit date is used so the same commit
 * input always returns the same score. Each factor is independently clamped to
 * 0-100, then the final weighted score is rounded and clamped to 0-100.
 * No randomness or LLM output is used.
 */
export function calculateRepositoryHealthScore(
  commits: readonly RepositoryCommitDetails[],
  options: RepositoryHealthScoreOptions = {}
): RepositoryHealthScore {
  const complexities = analyzeCommitComplexities(commits);
  const dates = getValidCommitDates(commits);
  const referenceDate =
    options.referenceDate ?? dates[dates.length - 1] ?? new Date(0);
  const tierCounts = countTiers(complexities);

  const tierDistribution = scoreTierDistribution(complexities);
  const commitFrequency = scoreCommitFrequency(commits, dates);
  const documentationCommits = scoreDocumentationCommits(complexities);
  const largeRiskyCommits = scoreLargeRiskyCommits(complexities);
  const recentActivity = scoreRecentActivity(dates, referenceDate);

  const score = clampScore(
    tierDistribution.score * WEIGHTS.tierDistribution +
      commitFrequency.score * WEIGHTS.commitFrequency +
      documentationCommits.score * WEIGHTS.documentationCommits +
      largeRiskyCommits.score * WEIGHTS.largeRiskyCommits +
      recentActivity.score * WEIGHTS.recentActivity
  );

  return {
    score,
    grade: getGrade(score),
    breakdown: {
      tierCounts,
      tierDistribution,
      commitFrequency,
      documentationCommits,
      largeRiskyCommits,
      recentActivity
    }
  };
}
