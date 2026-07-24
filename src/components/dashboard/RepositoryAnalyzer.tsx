"use client";

import { FormEvent, useState } from "react";
import type { AnalyticsDashboardData } from "@/types/dashboard";
import type { AppErrorPresentation } from "@/types/app-error";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { ErrorState } from "./ErrorState";

type AnalyzeApiError = {
  error?: {
    code?: string;
    message?: string;
    status?: number;
  };
};

const DEFAULT_REPOSITORY_URL = "https://github.com/vercel/next.js";

function createClientErrorPresentation(
  error: AnalyzeApiError["error"] | null,
  retry: () => void
): AppErrorPresentation {
  const code = error?.code;
  const message = error?.message;
  const retryAction = {
    label: "Try again",
    onClick: retry
  };

  if (code === "GITHUB_RATE_LIMITED") {
    return {
      kind: "github-rate-limit",
      eyebrow: "GitHub Rate Limit",
      title: "GitHub is temporarily limiting requests.",
      message:
        "Wait for the limit to reset, then retry. Configuring a GitHub token gives the app higher API limits.",
      details: message,
      primaryAction: retryAction
    };
  }

  if (
    code === "INVALID_REPOSITORY_URL" ||
    code === "REPOSITORY_URL_REQUIRED" ||
    code === "MISSING_REPOSITORY_OWNER" ||
    code === "MISSING_REPOSITORY_NAME" ||
    code === "INVALID_REPOSITORY_OWNER" ||
    code === "INVALID_REPOSITORY_NAME" ||
    code === "UNSUPPORTED_REPOSITORY_URL_HOST" ||
    code === "UNSUPPORTED_REPOSITORY_URL_PROTOCOL" ||
    code === "UNSUPPORTED_REPOSITORY_URL_PATH"
  ) {
    return {
      kind: "invalid-repository",
      eyebrow: "Invalid Repository",
      title: "Enter a valid GitHub repository URL.",
      message:
        "Use the format https://github.com/owner/repository. Repository subpages and private hosts are not supported.",
      details: message,
      primaryAction: retryAction
    };
  }

  if (code === "GITHUB_NOT_FOUND") {
    return {
      kind: "not-found",
      eyebrow: "Repository Not Found",
      title: "This repository could not be reached.",
      message:
        "Check that the repository exists, is public, and the URL is spelled correctly.",
      details: message,
      primaryAction: retryAction
    };
  }

  return {
    kind: "generic",
    eyebrow: "Analysis Error",
    title: "The repository could not be analyzed.",
    message:
      "Check the repository URL and retry. If the issue continues, GitHub may be unavailable.",
    details: message,
    primaryAction: retryAction
  };
}

async function analyzeRepository(
  repositoryUrl: string
): Promise<AnalyticsDashboardData> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      repositoryUrl
    })
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as AnalyzeApiError;
    throw payload;
  }

  return (await response.json()) as AnalyticsDashboardData;
}

export function RepositoryAnalyzer() {
  const [repositoryUrl, setRepositoryUrl] = useState(DEFAULT_REPOSITORY_URL);
  const [lastSubmittedUrl, setLastSubmittedUrl] = useState("");
  const [dashboardData, setDashboardData] =
    useState<AnalyticsDashboardData | null>(null);
  const [error, setError] = useState<AnalyzeApiError["error"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function runAnalysis(nextRepositoryUrl: string) {
    setIsLoading(true);
    setError(null);
    setLastSubmittedUrl(nextRepositoryUrl);

    try {
      const data = await analyzeRepository(nextRepositoryUrl);
      setDashboardData(data);
    } catch (caughtError) {
      const apiError = caughtError as AnalyzeApiError;
      setError(
        apiError.error ?? {
          code: "ANALYSIS_ERROR",
          message: "Repository analysis failed.",
          status: 500
        }
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runAnalysis(repositoryUrl);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-6 py-8">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            RepoPulse Lite
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Analyze any public GitHub repository.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Enter a repository URL and RepoPulse will fetch recent commits,
                calculate deterministic complexity tiers, and score repository
                health.
              </p>
            </div>
            <form className="grid gap-3" onSubmit={handleSubmit}>
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="repository-url"
              >
                GitHub repository URL
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="repository-url"
                  type="url"
                  value={repositoryUrl}
                  onChange={(event) => setRepositoryUrl(event.target.value)}
                  placeholder="https://github.com/owner/repository"
                  className="min-h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="min-h-10 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Analyzing" : "Analyze"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {isLoading ? <DashboardSkeleton /> : null}

      {!isLoading && error ? (
        <div className="mx-auto w-full max-w-7xl px-6 py-8">
          <ErrorState
            {...createClientErrorPresentation(error, () =>
              runAnalysis(lastSubmittedUrl || repositoryUrl)
            )}
          />
        </div>
      ) : null}

      {!isLoading && !error && dashboardData ? (
        <AnalyticsDashboard data={dashboardData} />
      ) : null}

      {!isLoading && !error && !dashboardData ? (
        <section className="mx-auto w-full max-w-7xl px-6 py-8">
          <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              No repository analyzed yet.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Submit a GitHub repository URL to generate the dashboard.
            </p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
