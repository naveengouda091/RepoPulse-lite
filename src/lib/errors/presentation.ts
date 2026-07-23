import type { AppErrorPresentation } from "@/types/app-error";

type ErrorLike = {
  code?: unknown;
  message?: unknown;
  status?: unknown;
};

function toErrorLike(error: unknown): ErrorLike {
  if (typeof error !== "object" || error === null) {
    return {};
  }

  return error as ErrorLike;
}

function getMessage(error: unknown): string | undefined {
  const message = toErrorLike(error).message;
  return typeof message === "string" && message.trim() ? message : undefined;
}

function getCode(error: unknown): string | undefined {
  const code = toErrorLike(error).code;
  return typeof code === "string" && code.trim() ? code : undefined;
}

function getStatus(error: unknown): number | undefined {
  const status = toErrorLike(error).status;
  return typeof status === "number" && Number.isFinite(status)
    ? status
    : undefined;
}

export function createErrorPresentation(
  error: unknown,
  retry: () => void
): AppErrorPresentation {
  const code = getCode(error);
  const status = getStatus(error);
  const details = getMessage(error);
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
        "The dashboard could not refresh because GitHub rate limits were reached. Wait for the limit to reset or configure a GitHub token for higher limits.",
      details,
      primaryAction: retryAction
    };
  }

  if (code === "LLM_TIMEOUT") {
    return {
      kind: "llm-timeout",
      eyebrow: "LLM Timeout",
      title: "The executive summary took too long.",
      message:
        "Repository metrics can still be shown, but the LLM summary provider did not respond in time. Retry the request or use a faster model.",
      details,
      primaryAction: retryAction
    };
  }

  if (
    code === "INVALID_REPOSITORY_URL" ||
    code === "MISSING_REPOSITORY_OWNER" ||
    code === "MISSING_REPOSITORY_NAME" ||
    code === "INVALID_REPOSITORY_OWNER" ||
    code === "INVALID_REPOSITORY_NAME" ||
    code === "UNSUPPORTED_REPOSITORY_URL_HOST" ||
    code === "UNSUPPORTED_REPOSITORY_URL_PROTOCOL" ||
    code === "UNSUPPORTED_REPOSITORY_URL_PATH" ||
    code === "REPOSITORY_URL_REQUIRED" ||
    code === "GITHUB_INVALID_REQUEST"
  ) {
    return {
      kind: "invalid-repository",
      eyebrow: "Invalid Repository",
      title: "Enter a valid GitHub repository URL.",
      message:
        "Use a repository URL in the format https://github.com/owner/repository. Links to organizations, settings pages, issues, or private hosts are not supported.",
      details,
      primaryAction: retryAction
    };
  }

  if (code === "GITHUB_NOT_FOUND" || status === 404) {
    return {
      kind: "not-found",
      eyebrow: "Repository Not Found",
      title: "This repository could not be reached.",
      message:
        "Check that the repository exists, is public, and that the owner and repository name are spelled correctly.",
      details,
      primaryAction: retryAction
    };
  }

  if (code === "GITHUB_NETWORK_ERROR" || code === "LLM_NETWORK_ERROR") {
    return {
      kind: "network",
      eyebrow: "Network Error",
      title: "The request could not reach an upstream service.",
      message:
        "Check the network connection and retry. If the problem continues, the upstream provider may be unavailable.",
      details,
      primaryAction: retryAction
    };
  }

  return {
    kind: "generic",
    eyebrow: "Dashboard Error",
    title: "The dashboard could not be loaded.",
    message:
      "Something went wrong while preparing the repository analytics. Retry the request, and check provider settings if the issue continues.",
    details,
    primaryAction: retryAction
  };
}
