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
    requestedModelId !== "auto" &&
    requestedModelId !== "auto-model";
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
    return { modelId: "google-gemini-3-pro", reason: "browser-mode" };
  }

  if (forceMode === "cli") {
    return { modelId: "google-gemini-3-pro", reason: "cli-mode" };
  }

  if (hasVisionInput) {
    return { modelId: "google-gemini-3-pro", reason: "vision-input" };
  }

  if (hasReasoningSignal) {
    return { modelId: "google-gemini-3-pro", reason: "reasoning" };
  }

  return { modelId: "google-gemini-2.5-flash", reason: "fast" };
}

