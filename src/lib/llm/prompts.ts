import type { LlmSummaryInput, OpenAiCompatibleMessage } from "./types";

export function createRepositorySummaryMessages(
  input: LlmSummaryInput
): OpenAiCompatibleMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a concise engineering executive analyst. Return only valid JSON. Do not wrap the response in markdown."
    },
    {
      role: "user",
      content: JSON.stringify({
        task:
          "Generate exactly three concise bullet points for this repository analysis.",
        requiredJsonShape: {
          developmentMomentum: "One bullet point string.",
          operationalRisks: "One bullet point string.",
          commitHygiene: "One bullet point string."
        },
        rules: [
          "Each field must be a single string.",
          "Each string must begin with '- '.",
          "Do not add extra keys.",
          "Base claims only on the provided analysis input."
        ],
        analysis: input
      })
    }
  ];
}
