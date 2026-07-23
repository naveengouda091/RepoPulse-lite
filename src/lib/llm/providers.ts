import { LlmServiceError } from "./errors";
import type { LlmProviderConfig, LlmProviderId } from "./types";

const PROVIDER_BASE_URLS: Record<Exclude<LlmProviderId, "custom">, string> = {
  groq: "https://api.groq.com/openai/v1",
  openrouter: "https://openrouter.ai/api/v1",
  "nvidia-nim": "https://integrate.api.nvidia.com/v1"
};

export type CreateProviderConfigInput = {
  provider: LlmProviderId;
  apiKey: string;
  model: string;
  baseUrl?: string;
  headers?: Record<string, string>;
};

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function assertNonEmpty(value: string | undefined, fieldName: string): string {
  if (!value || value.trim().length === 0) {
    throw new LlmServiceError({
      code: "LLM_CONFIG_ERROR",
      status: 400,
      message: `${fieldName} is required.`
    });
  }

  return value.trim();
}

function assertValidBaseUrl(baseUrl: string): string {
  let parsed: URL;

  try {
    parsed = new URL(baseUrl);
  } catch (error) {
    throw new LlmServiceError({
      code: "LLM_CONFIG_ERROR",
      status: 400,
      message: "LLM base URL must be a valid absolute URL.",
      cause: error
    });
  }

  if (parsed.protocol !== "https:") {
    throw new LlmServiceError({
      code: "LLM_CONFIG_ERROR",
      status: 400,
      message: "LLM base URL must use https."
    });
  }

  return normalizeBaseUrl(parsed.toString());
}

export function createLlmProviderConfig({
  provider,
  apiKey,
  model,
  baseUrl,
  headers
}: CreateProviderConfigInput): LlmProviderConfig {
  const resolvedBaseUrl =
    baseUrl ??
    (provider === "custom" ? undefined : PROVIDER_BASE_URLS[provider]);

  return {
    provider,
    apiKey: assertNonEmpty(apiKey, "LLM API key"),
    model: assertNonEmpty(model, "LLM model name"),
    baseUrl: assertValidBaseUrl(
      assertNonEmpty(resolvedBaseUrl, "LLM base URL")
    ),
    headers
  };
}
