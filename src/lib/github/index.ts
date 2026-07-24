export { GitHubClient } from "./client";
export { GitHubServiceError, isGitHubServiceError } from "./errors";
export {
  fetchRepositoryMetadata,
  fetchLatestRepositoryCommitDetails,
  GitHubRepositoryService
} from "./service";

export type {
  GitHubServiceConfig,
  GitHubServiceErrorCode,
  RepositoryCommitDetails,
  RepositoryCommitFile,
  RepositoryMetadata,
  RepositoryRef
} from "./types";
