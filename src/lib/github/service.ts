import { GitHubServiceError } from "./errors";
import { GitHubClient } from "./client";
import type {
  GitHubCommitDetailResponse,
  GitHubServiceConfig,
  RepositoryCommitDetails,
  RepositoryCommitFile,
  RepositoryRef
} from "./types";

const DEFAULT_COMMIT_LIMIT = 20;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function assertRepositoryRef({ owner, repo }: RepositoryRef): void {
  if (!isNonEmptyString(owner)) {
    throw new GitHubServiceError({
      code: "GITHUB_INVALID_REQUEST",
      status: 400,
      message: "Repository owner is required."
    });
  }

  if (!isNonEmptyString(repo)) {
    throw new GitHubServiceError({
      code: "GITHUB_INVALID_REQUEST",
      status: 400,
      message: "Repository name is required."
    });
  }
}

function normalizeCommitFile(
  file: NonNullable<GitHubCommitDetailResponse["files"]>[number]
): RepositoryCommitFile {
  const additions = asNumber(file.additions);
  const deletions = asNumber(file.deletions);
  const changes = asNumber(file.changes);

  return {
    filename: isNonEmptyString(file.filename) ? file.filename : "unknown",
    status: isNonEmptyString(file.status) ? file.status : undefined,
    additions,
    deletions,
    changes
  };
}

function normalizeCommitDetails(
  commit: GitHubCommitDetailResponse
): RepositoryCommitDetails {
  if (!isNonEmptyString(commit.sha)) {
    throw new GitHubServiceError({
      code: "GITHUB_INVALID_RESPONSE",
      status: 502,
      message: "GitHub commit response did not include a SHA."
    });
  }

  const files = Array.isArray(commit.files)
    ? commit.files.map(normalizeCommitFile)
    : [];
  const additions =
    asNumber(commit.stats?.additions) ||
    files.reduce((total, file) => total + file.additions, 0);
  const deletions =
    asNumber(commit.stats?.deletions) ||
    files.reduce((total, file) => total + file.deletions, 0);
  const totalChanges =
    asNumber(commit.stats?.total) ||
    files.reduce((total, file) => total + file.changes, 0);

  return {
    sha: commit.sha,
    author: {
      name: isNonEmptyString(commit.commit?.author?.name)
        ? commit.commit.author.name
        : null,
      email: isNonEmptyString(commit.commit?.author?.email)
        ? commit.commit.author.email
        : null,
      username: isNonEmptyString(commit.author?.login)
        ? commit.author.login
        : null
    },
    date: isNonEmptyString(commit.commit?.author?.date)
      ? commit.commit.author.date
      : null,
    message: isNonEmptyString(commit.commit?.message)
      ? commit.commit.message
      : "",
    filesChanged: files.length,
    additions,
    deletions,
    totalChanges,
    files
  };
}

export class GitHubRepositoryService {
  private readonly client: GitHubClient;

  constructor(config: GitHubServiceConfig = {}) {
    this.client = new GitHubClient(config);
  }

  async getLatestCommitDetails({
    owner,
    repo
  }: RepositoryRef): Promise<RepositoryCommitDetails[]> {
    assertRepositoryRef({ owner, repo });

    const commits = await this.client.getLatestCommits(
      owner,
      repo,
      DEFAULT_COMMIT_LIMIT
    );

    if (!Array.isArray(commits)) {
      throw new GitHubServiceError({
        code: "GITHUB_INVALID_RESPONSE",
        status: 502,
        message: "GitHub commit list response was not an array."
      });
    }

    const boundedCommits = commits.slice(0, DEFAULT_COMMIT_LIMIT);
    const shas = boundedCommits
      .map((commit) => commit.sha)
      .filter(isNonEmptyString);

    if (shas.length !== boundedCommits.length) {
      throw new GitHubServiceError({
        code: "GITHUB_INVALID_RESPONSE",
        status: 502,
        message: "GitHub commit list response included commits without SHAs."
      });
    }

    const details = await Promise.all(
      shas.map((sha) => this.client.getCommitDetails(owner, repo, sha))
    );

    return details.map(normalizeCommitDetails);
  }
}

export async function fetchLatestRepositoryCommitDetails(
  repository: RepositoryRef,
  config: GitHubServiceConfig = {}
): Promise<RepositoryCommitDetails[]> {
  const service = new GitHubRepositoryService(config);
  return service.getLatestCommitDetails(repository);
}
