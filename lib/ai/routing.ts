import type { ChatMessage } from "@/lib/types";

export type RoutedModel = {
  modelId: string;
  reason: string;
};

const reasoningKeywords = ["plan", "architecture", "design", "strategy", "analyze", "analysis"];

export function selectRoutedModel({
  requestedModelId,
  messages,
  hasVisionInput,
  forceMode,
}: {
  requestedModelId: string;
  messages: ChatMessage[];
  hasVisionInput: boolean;
  forceMode?: "coding" | "browser" | "cli" | "auto";
}): RoutedModel {
  // Preserve explicit user choice except when default/basic model is chosen.
  const userChosen =
    requestedModelId &&
    requestedModelId !== "chat-model" &&
    requestedModelId !== "auto" &&
    requestedModelId !== "auto-model" &&
    requestedModelId !== "google-gemini-3-pro";
  if (userChosen) {
    return { modelId: requestedModelId, reason: "user-selected" };
  }

  const lastMessage = messages.at(-1);
  const textParts =
    lastMessage?.parts
      ?.filter((p) => p.type === "text")
      .map((p: any) => p.text || "")
      .join(" ")
      .trim() || "";

  const textLength = textParts.length;
  const hasReasoningSignal =
    textLength > 800 || reasoningKeywords.some((kw) => textParts.toLowerCase().includes(kw));

  if (forceMode === "browser") {
    return { modelId: "openai-gpt-4o", reason: "browser-mode" };
  }

  if (forceMode === "cli") {
    return { modelId: "openai-gpt-4.1", reason: "cli-mode" };
  }

  if (hasVisionInput) {
    return { modelId: "openai-gpt-4o", reason: "vision-input" };
  }

  if (hasReasoningSignal) {
    return { modelId: "openai-gpt-4.1", reason: "reasoning" };
  }

  return { modelId: "google-gemini-2-flash", reason: "fast" };
}

