import { z } from "zod";

const GITHUB_HOST = "github.com";
const OWNER_PATTERN = /^[A-Za-z0-9-]{1,39}$/;
const REPOSITORY_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;

export const githubRepositoryUrlErrorCodes = {
  required: "REPOSITORY_URL_REQUIRED",
  invalidUrl: "INVALID_REPOSITORY_URL",
  unsupportedProtocol: "UNSUPPORTED_REPOSITORY_URL_PROTOCOL",
  unsupportedHost: "UNSUPPORTED_REPOSITORY_URL_HOST",
  missingOwner: "MISSING_REPOSITORY_OWNER",
  missingRepository: "MISSING_REPOSITORY_NAME",
  invalidOwner: "INVALID_REPOSITORY_OWNER",
  invalidRepository: "INVALID_REPOSITORY_NAME",
  unsupportedPath: "UNSUPPORTED_REPOSITORY_URL_PATH"
} as const;

export type GitHubRepositoryUrlErrorCode =
  (typeof githubRepositoryUrlErrorCodes)[keyof typeof githubRepositoryUrlErrorCodes];

export type GitHubRepository = {
  owner: string;
  repo: string;
  url: string;
};

export type RepositoryValidationError = {
  code: GitHubRepositoryUrlErrorCode;
  message: string;
  path: string[];
};

export type RepositoryValidationResult =
  | {
      success: true;
      data: GitHubRepository;
      errors: [];
    }
  | {
      success: false;
      data: null;
      errors: RepositoryValidationError[];
    };

function createIssue(
  code: GitHubRepositoryUrlErrorCode,
  message: string
): z.IssueData {
  return {
    code: z.ZodIssueCode.custom,
    message,
    params: {
      code
    }
  };
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function hasValidOwnerShape(owner: string): boolean {
  return (
    OWNER_PATTERN.test(owner) &&
    !owner.startsWith("-") &&
    !owner.endsWith("-") &&
    !owner.includes("--")
  );
}

function hasValidRepositoryShape(repo: string): boolean {
  return (
    REPOSITORY_PATTERN.test(repo) &&
    repo !== "." &&
    repo !== ".." &&
    !repo.endsWith(".git")
  );
}

export const githubRepositoryUrlSchema = z
  .unknown()
  .superRefine((value, context) => {
    if (typeof value !== "string") {
      context.addIssue(
        createIssue(
          githubRepositoryUrlErrorCodes.invalidUrl,
          "Repository URL must be a string."
        )
      );
      return;
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      context.addIssue(
        createIssue(
          githubRepositoryUrlErrorCodes.required,
          "Repository URL is required."
        )
      );
      return;
    }

    const url = parseUrl(trimmedValue);

    if (!url) {
      context.addIssue(
        createIssue(
          githubRepositoryUrlErrorCodes.invalidUrl,
          "Enter a valid GitHub repository URL."
        )
      );
      return;
    }

    if (url.protocol !== "https:") {
      context.addIssue(
        createIssue(
          githubRepositoryUrlErrorCodes.unsupportedProtocol,
          "Repository URL must use https."
        )
      );
    }

    if (url.hostname.toLowerCase() !== GITHUB_HOST) {
      context.addIssue(
        createIssue(
          githubRepositoryUrlErrorCodes.unsupportedHost,
          "Repository URL must use github.com."
        )
      );
    }

    const pathParts = url.pathname.split("/").filter(Boolean);
    const [owner, repo] = pathParts;

    if (!owner) {
      context.addIssue(
        createIssue(
          githubRepositoryUrlErrorCodes.missingOwner,
          "Repository URL must include an owner."
        )
      );
      return;
    }

    if (!repo) {
      context.addIssue(
        createIssue(
          githubRepositoryUrlErrorCodes.missingRepository,
          "Repository URL must include a repository name."
        )
      );
      return;
    }

    if (pathParts.length > 2) {
      context.addIssue(
        createIssue(
          githubRepositoryUrlErrorCodes.unsupportedPath,
          "Repository URL must point to the repository root."
        )
      );
    }

    if (!hasValidOwnerShape(owner)) {
      context.addIssue(
        createIssue(
          githubRepositoryUrlErrorCodes.invalidOwner,
          "Repository owner is not a valid GitHub owner name."
        )
      );
    }

    if (!hasValidRepositoryShape(repo)) {
      context.addIssue(
        createIssue(
          githubRepositoryUrlErrorCodes.invalidRepository,
          "Repository name is not a valid GitHub repository name."
        )
      );
    }
  })
  .transform((value): GitHubRepository => {
    const url = new URL((value as string).trim());
    const [owner, repo] = url.pathname.split("/").filter(Boolean);

    return {
      owner,
      repo,
      url: `https://${GITHUB_HOST}/${owner}/${repo}`
    };
  });

export function formatRepositoryValidationErrors(
  error: z.ZodError
): RepositoryValidationError[] {
  return error.issues.map((issue) => ({
    code:
      "params" in issue && typeof issue.params?.code === "string"
        ? (issue.params.code as GitHubRepositoryUrlErrorCode)
        : githubRepositoryUrlErrorCodes.invalidUrl,
    message: issue.message,
    path: issue.path.map(String)
  }));
}

export function validateGitHubRepositoryUrl(
  value: unknown
): RepositoryValidationResult {
  const result = githubRepositoryUrlSchema.safeParse(value);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: []
    };
  }

  return {
    success: false,
    data: null,
    errors: formatRepositoryValidationErrors(result.error)
  };
}

export function isValidGitHubRepositoryUrl(value: unknown): boolean {
  return validateGitHubRepositoryUrl(value).success;
}
