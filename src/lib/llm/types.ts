export type LlmProviderId = "groq" | "openrouter" | "nvidia-nim" | "custom";

export type LlmProviderConfig = {
  provider: LlmProviderId;
  baseUrl: string;
  apiKey: string;
  model: string;
  headers?: Record<string, string>;
};

export type LlmSummaryInput = {
  repository: {
    owner: string;
    repo: string;
  };
  healthScore?: number;
  healthGrade?: string;
  tierCounts?: {
    tier1: number;
    tier2: number;
    tier3: number;
  };
  commitCount?: number;
  recentActivity?: string;
  risks?: readonly string[];
  notes?: readonly string[];
};

export type LlmRepositorySummary = {
  developmentMomentum: string;
  operationalRisks: string;
  commitHygiene: string;
};

export type LlmClientConfig = {
  providerConfig: LlmProviderConfig;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

export type LlmServiceErrorCode =
  | "LLM_CONFIG_ERROR"
  | "LLM_TIMEOUT"
  | "LLM_AUTH_ERROR"
  | "LLM_BAD_MODEL"
  | "LLM_NETWORK_ERROR"
  | "LLM_UPSTREAM_ERROR"
  | "LLM_EMPTY_RESPONSE"
  | "LLM_MALFORMED_JSON";

export type OpenAiCompatibleMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenAiCompatibleChatResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};
