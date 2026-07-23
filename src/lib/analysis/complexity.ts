import type { RepositoryCommitDetails } from "@/lib/github";

export type ComplexityTier = 1 | 2 | 3;

export type ComplexityInputFile = {
  filename: string;
  changes?: number;
};

export type ComplexityInput = {
  sha?: string;
  message?: string;
  totalChanges: number;
  filesChanged?: number;
  files?: ComplexityInputFile[];
};

export type CommitComplexityResult = {
  tier: ComplexityTier;
  reason: string;
  summary: string;
};

export type CommitComplexityAnalysis = CommitComplexityResult & {
  sha: string | null;
  totalChanges: number;
  filesChanged: number;
  documentationOnly: boolean;
};

const DOCUMENTATION_EXTENSIONS = new Set([
  ".adoc",
  ".markdown",
  ".md",
  ".mdx",
  ".rst",
  ".txt"
]);

const DOCUMENTATION_FILENAMES = new Set([
  "changelog",
  "changelog.md",
  "code_of_conduct.md",
  "contributing.md",
  "license",
  "license.md",
  "readme",
  "readme.md",
  "security.md"
]);

const DOCUMENTATION_DIRECTORIES = new Set([
  "doc",
  "docs",
  "documentation"
]);

function normalizePath(filename: string): string {
  return filename.trim().replace(/\\/g, "/").toLowerCase();
}

function getFileExtension(filename: string): string {
  const normalizedFilename = normalizePath(filename);
  const lastSlashIndex = normalizedFilename.lastIndexOf("/");
  const basename = normalizedFilename.slice(lastSlashIndex + 1);
  const lastDotIndex = basename.lastIndexOf(".");

  return lastDotIndex >= 0 ? basename.slice(lastDotIndex) : "";
}

function isDocumentationFile(filename: string): boolean {
  const normalizedFilename = normalizePath(filename);
  const parts = normalizedFilename.split("/").filter(Boolean);
  const basename = parts.at(-1) ?? "";

  return (
    DOCUMENTATION_FILENAMES.has(basename) ||
    DOCUMENTATION_EXTENSIONS.has(getFileExtension(normalizedFilename)) ||
    parts.some((part) => DOCUMENTATION_DIRECTORIES.has(part))
  );
}

export function isDocumentationOnlyChange(
  files: readonly ComplexityInputFile[] = []
): boolean {
  return files.length > 0 && files.every((file) => isDocumentationFile(file.filename));
}

export function getTotalChanges(commit: ComplexityInput): number {
  return Number.isFinite(commit.totalChanges)
    ? Math.max(0, commit.totalChanges)
    : 0;
}

export function getFilesChanged(commit: ComplexityInput): number {
  if (typeof commit.filesChanged === "number" && Number.isFinite(commit.filesChanged)) {
    return Math.max(0, commit.filesChanged);
  }

  return commit.files?.length ?? 0;
}

function createSummary(tier: ComplexityTier, reason: string): string {
  return `Tier ${tier} complexity: ${reason}`;
}

export function classifyCommitComplexity(
  commit: ComplexityInput
): CommitComplexityResult {
  const totalChanges = getTotalChanges(commit);
  const filesChanged = getFilesChanged(commit);
  const documentationOnly = isDocumentationOnlyChange(commit.files);

  if (totalChanges < 50) {
    const reason = `commit has ${totalChanges} total changes, below the 50-change Tier 1 threshold.`;

    return {
      tier: 1,
      reason,
      summary: createSummary(1, reason)
    };
  }

  if (documentationOnly) {
    const reason = "commit only changes documentation files.";

    return {
      tier: 1,
      reason,
      summary: createSummary(1, reason)
    };
  }

  if (totalChanges > 250) {
    const reason = `commit has ${totalChanges} total changes, above the 250-change Tier 3 threshold.`;

    return {
      tier: 3,
      reason,
      summary: createSummary(3, reason)
    };
  }

  if (filesChanged > 5) {
    const reason = `commit changes ${filesChanged} files, above the 5-file Tier 3 threshold.`;

    return {
      tier: 3,
      reason,
      summary: createSummary(3, reason)
    };
  }

  if (totalChanges >= 50 && totalChanges <= 250 && filesChanged < 5) {
    const reason = `commit has ${totalChanges} total changes and ${filesChanged} modified files.`;

    return {
      tier: 2,
      reason,
      summary: createSummary(2, reason)
    };
  }

  const reason = `commit has ${totalChanges} total changes and exactly ${filesChanged} modified files, placing it on the Tier 2/Tier 3 boundary.`;

  return {
    tier: 2,
    reason,
    summary: createSummary(2, reason)
  };
}

export function analyzeCommitComplexity(
  commit: RepositoryCommitDetails
): CommitComplexityAnalysis {
  const totalChanges = getTotalChanges(commit);
  const filesChanged = getFilesChanged(commit);
  const documentationOnly = isDocumentationOnlyChange(commit.files);
  const result = classifyCommitComplexity(commit);

  return {
    ...result,
    sha: commit.sha || null,
    totalChanges,
    filesChanged,
    documentationOnly
  };
}

export function analyzeCommitComplexities(
  commits: readonly RepositoryCommitDetails[]
): CommitComplexityAnalysis[] {
  return commits.map(analyzeCommitComplexity);
}
