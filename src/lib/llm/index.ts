export { OpenAiCompatibleLlmClient } from "./client";
export { LlmServiceError, isLlmServiceError } from "./errors";
export {
  createLlmProviderConfig,
  type CreateProviderConfigInput
} from "./providers";
export { createRepositorySummaryMessages } from "./prompts";
export {
  generateRepositorySummary,
  llmRepositorySummarySchema,
  parseRepositorySummaryJson
} from "./summary";

export type {
  LlmClientConfig,
  LlmProviderConfig,
  LlmProviderId,
  LlmRepositorySummary,
  LlmServiceErrorCode,
  LlmSummaryInput,
  OpenAiCompatibleChatResponse,
  OpenAiCompatibleMessage
} from "./types";
