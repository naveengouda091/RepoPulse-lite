import { LlmServiceError } from "./errors";
import type { LlmProviderConfig, LlmProviderId } from "./types";

const PROVIDER_BASE_URLS: Record<Exclude<LlmProviderId, "custom">, string> = {
  groq: "https://api.groq.com/openai/v1",
  openrouter: "https://openrouter.ai/api/v1",
  "nvidia-nim": "https://integrate.api.nvidia.com/v1"
};
const VALID_PROVIDERS = new Set<LlmProviderId>([
  "groq",
  "openrouter",
  "nvidia-nim",
  "custom"
]);
const BLOCKED_CUSTOM_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1"
]);
const PRIVATE_IPV4_PATTERNS = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./
];

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

function assertValidProvider(provider: LlmProviderId): LlmProviderId {
  if (!VALID_PROVIDERS.has(provider)) {
    throw new LlmServiceError({
      code: "LLM_CONFIG_ERROR",
      status: 400,
      message: "LLM provider is not supported."
    });
  }

  return provider;
}

function isBlockedCustomHost(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();

  return (
    BLOCKED_CUSTOM_HOSTS.has(normalizedHostname) ||
    PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(normalizedHostname))
  );
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

function assertValidBaseUrl(baseUrl: string, provider: LlmProviderId): string {
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

  if (parsed.username || parsed.password) {
    throw new LlmServiceError({
      code: "LLM_CONFIG_ERROR",
      status: 400,
      message: "LLM base URL must not include credentials."
    });
  }

  if (provider === "custom" && isBlockedCustomHost(parsed.hostname)) {
    throw new LlmServiceError({
      code: "LLM_CONFIG_ERROR",
      status: 400,
      message: "Custom LLM base URL must not target a local host."
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
  const validProvider = assertValidProvider(provider);
  const resolvedBaseUrl =
    baseUrl ??
    (validProvider === "custom" ? undefined : PROVIDER_BASE_URLS[validProvider]);

  return {
    provider: validProvider,
    apiKey: assertNonEmpty(apiKey, "LLM API key"),
    model: assertNonEmpty(model, "LLM model name"),
    baseUrl: assertValidBaseUrl(
      assertNonEmpty(resolvedBaseUrl, "LLM base URL"),
      validProvider
    ),
    headers
  };
}
