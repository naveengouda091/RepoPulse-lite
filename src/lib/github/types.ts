export type GitHubServiceErrorCode =
  | "GITHUB_INVALID_REQUEST"
  | "GITHUB_NOT_FOUND"
  | "GITHUB_FORBIDDEN"
  | "GITHUB_RATE_LIMITED"
  | "GITHUB_NETWORK_ERROR"
  | "GITHUB_UPSTREAM_ERROR"
  | "GITHUB_INVALID_RESPONSE";

export type GitHubServiceConfig = {
  token?: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
};

export type RepositoryRef = {
  owner: string;
  repo: string;
};

export type RepositoryMetadata = {
  owner: string;
  name: string;
  fullName: string;
  stars: number;
  forks: number;
};

export type GitHubRepositoryResponse = {
  name?: unknown;
  full_name?: unknown;
  stargazers_count?: unknown;
  forks_count?: unknown;
  owner?: {
    login?: unknown;
  } | null;
};

export type RepositoryCommitSummary = {
  sha: string;
};

export type RepositoryCommitFile = {
  filename: string;
  status?: string;
  additions: number;
  deletions: number;
  changes: number;
};

export type RepositoryCommitDetails = {
  sha: string;
  author: {
    name: string | null;
    email: string | null;
    username: string | null;
  };
  date: string | null;
  message: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  totalChanges: number;
  files: RepositoryCommitFile[];
};

export type GitHubCommitListItemResponse = {
  sha?: unknown;
};

export type GitHubCommitDetailResponse = {
  sha?: unknown;
  author?: {
    login?: unknown;
  } | null;
  commit?: {
    author?: {
      name?: unknown;
      email?: unknown;
      date?: unknown;
    } | null;
    message?: unknown;
  } | null;
  stats?: {
    additions?: unknown;
    deletions?: unknown;
    total?: unknown;
  } | null;
  files?: Array<{
    filename?: unknown;
    status?: unknown;
    additions?: unknown;
    deletions?: unknown;
    changes?: unknown;
  }>;
};
