import { NextResponse } from "next/server";
import {
  analyzeCommitComplexities,
  calculateRepositoryHealthScore
} from "@/lib/analysis";
import {
  GitHubRepositoryService,
  isGitHubServiceError
} from "@/lib/github";
import { validateGitHubRepositoryUrl } from "@/lib/validation";
import type { AnalyticsDashboardData } from "@/types/dashboard";

type AnalyzeRequestBody = {
  repositoryUrl?: unknown;
};

type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    status: number;
  };
};

function createErrorResponse(
  code: string,
  message: string,
  status: number
) {
  const responseStatus = status >= 400 && status <= 599 ? status : 500;

  return NextResponse.json<ApiErrorResponse>(
    {
      error: {
        code,
        message,
        status: responseStatus
      }
    },
    {
      status: responseStatus
    }
  );
}

function createExecutiveSummary(
  data: Pick<AnalyticsDashboardData, "health" | "tierCounts">
): AnalyticsDashboardData["executiveSummary"] {
  const totalCommits =
    data.tierCounts.tier1 + data.tierCounts.tier2 + data.tierCounts.tier3;

  return {
    developmentMomentum: `- Latest sample includes ${totalCommits} analyzed commits with a health grade of ${data.health.grade}.`,
    operationalRisks: `- Tier 3 risky commits account for ${data.tierCounts.tier3} of the latest analyzed commits.`,
    commitHygiene: `- Tier 1 and Tier 2 commits account for ${
      data.tierCounts.tier1 + data.tierCounts.tier2
    } of ${totalCommits} analyzed commits.`
  };
}

function toCommitComplexityPoint(
  complexity: ReturnType<typeof analyzeCommitComplexities>[number],
  index: number
): AnalyticsDashboardData["commitComplexity"][number] {
  return {
    label: complexity.sha ? complexity.sha.slice(0, 7) : `c${index + 1}`,
    tier: complexity.tier,
    totalChanges: complexity.totalChanges,
    filesChanged: complexity.filesChanged
  };
}

async function parseRequestBody(request: Request): Promise<AnalyzeRequestBody> {
  try {
    return (await request.json()) as AnalyzeRequestBody;
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const body = await parseRequestBody(request);
  const validation = validateGitHubRepositoryUrl(body.repositoryUrl);

  if (!validation.success) {
    const firstError = validation.errors[0];

    return createErrorResponse(
      firstError?.code ?? "INVALID_REPOSITORY_URL",
      firstError?.message ?? "Enter a valid GitHub repository URL.",
      400
    );
  }

  const service = new GitHubRepositoryService({
    token: process.env.GITHUB_TOKEN
  });

  try {
    const [repository, commits] = await Promise.all([
      service.getRepositoryMetadata({
        owner: validation.data.owner,
        repo: validation.data.repo
      }),
      service.getLatestCommitDetails({
        owner: validation.data.owner,
        repo: validation.data.repo
      })
    ]);
    const health = calculateRepositoryHealthScore(commits);
    const complexities = analyzeCommitComplexities(commits);
    const dashboardData: AnalyticsDashboardData = {
      repository: {
        name: repository.name,
        fullName: repository.fullName,
        stars: repository.stars,
        forks: repository.forks
      },
      health: {
        score: health.score,
        grade: health.grade
      },
      tierCounts: health.breakdown.tierCounts,
      commitComplexity: complexities.map(toCommitComplexityPoint),
      executiveSummary: createExecutiveSummary({
        health: {
          score: health.score,
          grade: health.grade
        },
        tierCounts: health.breakdown.tierCounts
      })
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    if (isGitHubServiceError(error)) {
      return createErrorResponse(error.code, error.message, error.status);
    }

    return createErrorResponse(
      "ANALYSIS_ERROR",
      "Repository analysis failed unexpectedly.",
      500
    );
  }
}
