import { LlmServiceError } from "./errors";
import type {
  LlmClientConfig,
  OpenAiCompatibleChatResponse,
  OpenAiCompatibleMessage
} from "./types";

const DEFAULT_TIMEOUT_MS = 20_000;

function createHeaders(
  apiKey: string,
  extraHeaders: Record<string, string> | undefined
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    ...extraHeaders
  };
}

async function parseErrorMessage(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as {
      error?: {
        message?: unknown;
      };
      message?: unknown;
    };

    if (typeof body.error?.message === "string") {
      return body.error.message;
    }

    return typeof body.message === "string" ? body.message : null;
  } catch {
    return null;
  }
}

function isBadModelStatus(status: number, message: string | null): boolean {
  const lowerMessage = message?.toLowerCase() ?? "";

  return (
    status === 404 ||
    lowerMessage.includes("model") ||
    lowerMessage.includes("not found") ||
    lowerMessage.includes("does not exist")
  );
}

function isAbortError(error: unknown): boolean {
  return (
    typeof DOMException !== "undefined" &&
    error instanceof DOMException &&
    error.name === "AbortError"
  ) || (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  );
}

async function mapProviderError(response: Response): Promise<LlmServiceError> {
  const message = await parseErrorMessage(response);

  if (response.status === 401 || response.status === 403) {
    return new LlmServiceError({
      code: "LLM_AUTH_ERROR",
      status: response.status,
      message: "LLM provider rejected the API key."
    });
  }

  if (isBadModelStatus(response.status, message)) {
    return new LlmServiceError({
      code: "LLM_BAD_MODEL",
      status: response.status,
      message: message ?? "LLM provider rejected the requested model."
    });
  }

  return new LlmServiceError({
    code: "LLM_UPSTREAM_ERROR",
    status: response.status,
    message: message ?? "LLM provider returned an unexpected error."
  });
}

export class OpenAiCompatibleLlmClient {
  private readonly config: LlmClientConfig;
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;

  constructor(config: LlmClientConfig) {
    this.config = config;
    this.fetcher = config.fetcher ?? fetch;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async createJsonChatCompletion(
    messages: readonly OpenAiCompatibleMessage[]
  ): Promise<string> {
    const { providerConfig } = this.config;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;

    try {
      response = await this.fetcher(
        `${providerConfig.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: createHeaders(providerConfig.apiKey, providerConfig.headers),
          signal: controller.signal,
          body: JSON.stringify({
            model: providerConfig.model,
            messages,
            temperature: 0.2,
            max_tokens: 300,
            response_format: {
              type: "json_object"
            }
          })
        }
      );
    } catch (error) {
      if (isAbortError(error)) {
        throw new LlmServiceError({
          code: "LLM_TIMEOUT",
          status: 408,
          message: "LLM provider request timed out.",
          cause: error
        });
      }

      throw new LlmServiceError({
        code: "LLM_NETWORK_ERROR",
        status: 0,
        message: "Network failure while contacting LLM provider.",
        cause: error
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw await mapProviderError(response);
    }

    let payload: OpenAiCompatibleChatResponse;

    try {
      payload = (await response.json()) as OpenAiCompatibleChatResponse;
    } catch (error) {
      throw new LlmServiceError({
        code: "LLM_MALFORMED_JSON",
        status: 502,
        message: "LLM provider response was not valid JSON.",
        cause: error
      });
    }

    const content = payload.choices?.[0]?.message?.content;

    if (typeof content !== "string" || content.trim().length === 0) {
      throw new LlmServiceError({
        code: "LLM_EMPTY_RESPONSE",
        status: 502,
        message: "LLM provider returned an empty message."
      });
    }

    return content;
  }
}
