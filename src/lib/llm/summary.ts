import { z } from "zod";
import { LlmServiceError } from "./errors";
import { OpenAiCompatibleLlmClient } from "./client";
import { createRepositorySummaryMessages } from "./prompts";
import type {
  LlmClientConfig,
  LlmRepositorySummary,
  LlmSummaryInput
} from "./types";

const bulletPointSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => value.startsWith("- "), {
    message: "Bullet point must start with '- '."
  });

export const llmRepositorySummarySchema = z
  .object({
    developmentMomentum: bulletPointSchema,
    operationalRisks: bulletPointSchema,
    commitHygiene: bulletPointSchema
  })
  .strict();

export function parseRepositorySummaryJson(content: string): LlmRepositorySummary {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new LlmServiceError({
      code: "LLM_MALFORMED_JSON",
      status: 502,
      message: "LLM summary was not valid JSON.",
      cause: error
    });
  }

  const result = llmRepositorySummarySchema.safeParse(parsed);

  if (!result.success) {
    throw new LlmServiceError({
      code: "LLM_MALFORMED_JSON",
      status: 502,
      message: "LLM summary JSON did not match the required shape.",
      cause: result.error
    });
  }

  return result.data;
}

export async function generateRepositorySummary(
  input: LlmSummaryInput,
  config: LlmClientConfig
): Promise<LlmRepositorySummary> {
  const client = new OpenAiCompatibleLlmClient(config);
  const content = await client.createJsonChatCompletion(
    createRepositorySummaryMessages(input)
  );

  return parseRepositorySummaryJson(content);
}
