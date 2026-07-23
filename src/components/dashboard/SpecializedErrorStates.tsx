"use client";

import { ErrorState } from "./ErrorState";

type RetryableStateProps = {
  onRetry: () => void;
  details?: string;
};

export function GitHubRateLimitState({
  onRetry,
  details
}: RetryableStateProps) {
  return (
    <ErrorState
      kind="github-rate-limit"
      eyebrow="GitHub Rate Limit"
      title="GitHub is temporarily limiting requests."
      message="Wait for the limit to reset or configure a GitHub token for higher limits."
      details={details}
      primaryAction={{
        label: "Retry GitHub request",
        onClick: onRetry
      }}
    />
  );
}

export function LlmTimeoutState({ onRetry, details }: RetryableStateProps) {
  return (
    <ErrorState
      kind="llm-timeout"
      eyebrow="LLM Timeout"
      title="The executive summary took too long."
      message="The repository metrics can still be used. Retry the LLM summary or choose a faster model."
      details={details}
      primaryAction={{
        label: "Retry summary",
        onClick: onRetry
      }}
    />
  );
}

export function InvalidRepositoryState({
  onRetry,
  details
}: RetryableStateProps) {
  return (
    <ErrorState
      kind="invalid-repository"
      eyebrow="Invalid Repository"
      title="Enter a valid GitHub repository URL."
      message="Use the format https://github.com/owner/repository. Repository subpages and private hosts are not supported."
      details={details}
      primaryAction={{
        label: "Edit repository",
        onClick: onRetry
      }}
    />
  );
}
