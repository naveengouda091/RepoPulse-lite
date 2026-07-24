import { GitHubServiceError } from "./errors";
import type {
  GitHubCommitDetailResponse,
  GitHubCommitListItemResponse,
  GitHubRepositoryResponse,
  GitHubServiceConfig
} from "./types";

const DEFAULT_GITHUB_API_BASE_URL = "https://api.github.com";
const GITHUB_API_VERSION = "2022-11-28";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function createGitHubHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseErrorMessage(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { message?: unknown };
    return typeof body.message === "string" ? body.message : null;
  } catch {
    return null;
  }
}

function isRateLimited(response: Response, message: string | null): boolean {
  const remaining = response.headers.get("x-ratelimit-remaining");
  const lowerMessage = message?.toLowerCase() ?? "";

  return (
    remaining === "0" ||
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("secondary rate")
  );
}

async function mapGitHubError(response: Response): Promise<GitHubServiceError> {
  const message = await parseErrorMessage(response);

  if (response.status === 404) {
    return new GitHubServiceError({
      code: "GITHUB_NOT_FOUND",
      status: 404,
      message: "GitHub repository or commit was not found."
    });
  }

  if (response.status === 403 && isRateLimited(response, message)) {
    return new GitHubServiceError({
      code: "GITHUB_RATE_LIMITED",
      status: 403,
      message:
        "GitHub API rate limit was exceeded. Configure a token or try again later."
    });
  }

  if (response.status === 403) {
    return new GitHubServiceError({
      code: "GITHUB_FORBIDDEN",
      status: 403,
      message: "GitHub denied access to this repository."
    });
  }

  return new GitHubServiceError({
    code: "GITHUB_UPSTREAM_ERROR",
    status: response.status,
    message: message ?? "GitHub returned an unexpected error."
  });
}

export class GitHubClient {
  private readonly token?: string;
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(config: GitHubServiceConfig = {}) {
    this.token = config.token;
    this.baseUrl = trimTrailingSlash(
      config.baseUrl ?? DEFAULT_GITHUB_API_BASE_URL
    );
    this.fetcher = config.fetcher ?? fetch;
  }

  async getLatestCommits(
    owner: string,
    repo: string,
    limit = 20
  ): Promise<GitHubCommitListItemResponse[]> {
    return this.request<GitHubCommitListItemResponse[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo
      )}/commits?per_page=${limit}`
    );
  }

  async getRepository(
    owner: string,
    repo: string
  ): Promise<GitHubRepositoryResponse> {
    return this.request<GitHubRepositoryResponse>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
    );
  }

  async getCommitDetails(
    owner: string,
    repo: string,
    sha: string
  ): Promise<GitHubCommitDetailResponse> {
    return this.request<GitHubCommitDetailResponse>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo
      )}/commits/${encodeURIComponent(sha)}`
    );
  }

  private async request<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    let response: Response;

    try {
      response = await this.fetcher(url, {
        headers: createGitHubHeaders(this.token),
        cache: "no-store"
      });
    } catch (error) {
      throw new GitHubServiceError({
        code: "GITHUB_NETWORK_ERROR",
        status: 0,
        message: "Network failure while contacting GitHub.",
        cause: error
      });
    }

    if (!response.ok) {
      throw await mapGitHubError(response);
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new GitHubServiceError({
        code: "GITHUB_INVALID_RESPONSE",
        status: 502,
        message: "GitHub returned a response that could not be parsed.",
        cause: error
      });
    }
  }
}
