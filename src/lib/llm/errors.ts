import type { LlmServiceErrorCode } from "./types";

export class LlmServiceError extends Error {
  readonly code: LlmServiceErrorCode;
  readonly status: number;
  readonly cause?: unknown;

  constructor({
    code,
    message,
    status,
    cause
  }: {
    code: LlmServiceErrorCode;
    message: string;
    status: number;
    cause?: unknown;
  }) {
    super(message);
    this.name = "LlmServiceError";
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

export function isLlmServiceError(error: unknown): error is LlmServiceError {
  return error instanceof LlmServiceError;
}
