"use client";

import { useSession } from "next-auth/react";
import { WelcomeLayout } from "./WelcomeLayout";
import { ChatInput } from "./ChatInput";
import { Sample } from "./Sample";
import { useState } from "react";
import type { ChatMessage } from "@/lib/types";

export function WelcomeView({
  onSendMessage,
  agentId,
  selectedModelId,
  onModelChange,
  mode,
  onModeChange,
}: {
  onSendMessage?: (message: ChatMessage) => void;
  agentId?: string;
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
  mode?: "coding" | "browser" | "cli" | "auto";
  onModeChange?: (mode: "coding" | "browser" | "cli" | "auto") => void;
}) {
  const { data: session } = useSession();
  const [workMode, setWorkMode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("workMode") || "auto";
    }
    return "auto";
  });
  const [currentModelId, setCurrentModelId] = useState(selectedModelId || "google-gemini-2.5-flash");

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const greeting = `Hello, ${userName}`;
  const description = "Let's tackle your mission together.";

  // Map workMode to API mode
  const mapWorkModeToApiMode = (workMode: string): "coding" | "browser" | "cli" | "auto" => {
    if (workMode === "task") return "coding";
    if (workMode === "twins") return "browser";
    if (workMode === "chat") return "auto";
    return "auto";
  };

  const handleSend = (value: {
    text: string;
    mode: string;
    files: any[];
    mcp_server_ids: any[];
    is_public: boolean;
    workMode: string;
    modelId: string;
  }) => {
    if (onSendMessage) {
      const apiMode = mapWorkModeToApiMode(value.workMode);
      // Update local state
      if (value.modelId) {
        setCurrentModelId(value.modelId);
        onModelChange?.(value.modelId);
      }
      if (apiMode) {
        onModeChange?.(apiMode);
      }
      // Send message with metadata
      onSendMessage({
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text: value.text }],
        metadata: {
          modelId: value.modelId,
          mode: apiMode,
        },
      } as ChatMessage & { metadata?: { modelId: string; mode: string } });
    }
  };

  const handleSampleClick = (content: string) => {
    if (onSendMessage) {
      onSendMessage({
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text: content }],
      });
    }
  };

  const handleModeChange = (mode: string) => {
    setWorkMode(mode);
    localStorage.setItem("workMode", mode);
  };

  return (
    <WelcomeLayout greeting={greeting} description={description}>
      <div className="welcome-input-section">
        <ChatInput
          onSend={handleSend}
          onModeChange={handleModeChange}
          workMode={workMode}
          selectedModelId={currentModelId}
          onModelChange={(id) => {
            setCurrentModelId(id);
            onModelChange?.(id);
          }}
          placeholder={
            workMode === "chat"
              ? "Ask me anything..."
              : "What's your mission in mind? Give me the idea and I'll handle the rest"
          }
        />
      </div>
      <div className="welcome-sample-section">
        <Sample onSampleClick={handleSampleClick} workMode={workMode} />
      </div>
    </WelcomeLayout>
  );
}

