import type { GitHubServiceErrorCode } from "./types";

export class GitHubServiceError extends Error {
  readonly code: GitHubServiceErrorCode;
  readonly status: number;
  readonly cause?: unknown;

  constructor({
    code,
    message,
    status,
    cause
  }: {
    code: GitHubServiceErrorCode;
    message: string;
    status: number;
    cause?: unknown;
  }) {
    super(message);
    this.name = "GitHubServiceError";
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

export function isGitHubServiceError(
  error: unknown
): error is GitHubServiceError {
  return error instanceof GitHubServiceError;
}
