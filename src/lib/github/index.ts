export { GitHubClient } from "./client";
export { GitHubServiceError, isGitHubServiceError } from "./errors";
export {
  fetchLatestRepositoryCommitDetails,
  GitHubRepositoryService
} from "./service";

export type {
  GitHubServiceConfig,
  GitHubServiceErrorCode,
  RepositoryCommitDetails,
  RepositoryCommitFile,
  RepositoryRef
} from "./types";
