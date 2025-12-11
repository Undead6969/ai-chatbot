"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Paperclip, Send, Globe, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chatModels } from "@/lib/ai/models";
import { ModelSelect } from "./ModelSelect";
import { ModeSelector } from "./ModeSelector";

export function ChatInput({
  onSend,
  onModeChange,
  placeholder = "What's your mission in mind? Give me the idea and I'll handle the rest",
  workMode = "auto",
  disabled = false,
  selectedModelId,
  onModelChange,
}: {
  onSend: (value: { text: string; mode: string; files: any[]; mcp_server_ids: any[]; is_public: boolean; workMode: string; modelId: string }) => void;
  onModeChange?: (mode: string) => void;
  placeholder?: string;
  workMode?: string;
  disabled?: boolean;
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
}) {
  const { data: session } = useSession();
  const [messageText, setMessageText] = useState("");
  const [fileList, setFileList] = useState<any[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedMcpServerIds, setSelectedMcpServerIds] = useState<any[]>([]);
  const [currentMode, setCurrentMode] = useState("text");
  const [currentWorkMode, setCurrentWorkMode] = useState(workMode);
  const [currentModelId, setCurrentModelId] = useState(selectedModelId || "google-gemini-2.5-flash");

  const handleSend = () => {
    const text = messageText.trim();
    if (!text) return;

    onSend({
      text,
      mode: currentMode,
      files: fileList,
      mcp_server_ids: selectedMcpServerIds,
      is_public: isPublic,
      workMode: currentWorkMode,
      modelId: currentModelId,
    });

    setMessageText("");
    setFileList([]);
  };

  const handleModelChange = (modelId: string) => {
    setCurrentModelId(modelId);
    onModelChange?.(modelId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.shiftKey && e.key === "Enter") || (e as any).isComposing) return;
    if (e.key === "Enter" && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleModeChangeInternal = (mode: string) => {
    setCurrentWorkMode(mode);
    onModeChange?.(mode);
    localStorage.setItem("workMode", mode);
  };

  return (
    <div className="chat-input">
      <div className="input-wrapper">
        <div className="input-area">
          <div className="input-container">
            <Textarea
              className="input-textarea bg-transparent border-none text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={2}
              style={{ minHeight: "46px", maxHeight: "240px", resize: "none" }}
            />
            <div className="input-actions">
              <div className="left-actions">
                <div className="button-row first-row">
                  <Button type="button" variant="ghost" size="sm" className="upload-button">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <ModelSelect selectedModelId={currentModelId} onModelChange={handleModelChange} />
                  <ModeSelector value={currentWorkMode} onValueChange={handleModeChangeInternal} disabled={disabled} />
                  <Select value={isPublic ? "public" : "private"} onValueChange={(v) => setIsPublic(v === "public")}>
                    <SelectTrigger className="visibility-select h-8 w-[80px] text-xs bg-[#1a1a1a] border-[#333] text-white">
                      <SelectValue>{isPublic ? "Public" : "Private"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333]">
                      <SelectItem value="public" className="text-white hover:bg-[#252525]">Public</SelectItem>
                      <SelectItem value="private" className="text-white hover:bg-[#252525]">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  {currentWorkMode !== "chat" && (
                    <Button type="button" variant="ghost" size="sm" className="mcp-button">
                      <span className="text-xs">MCP</span>
                    </Button>
                  )}
                </div>
              </div>
              {!disabled ? (
                <Button onClick={handleSend} disabled={!messageText.trim()} className="send-button">
                  <Send className="h-4 w-4" />
                </Button>
              ) : (
                <button className="stop-button" onClick={() => {}}>
                  <div></div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .chat-input {
          border-radius: 22px;
          position: sticky;
          bottom: 0;
          padding-bottom: 0.75rem;
          background: transparent;
          padding-top: 0.75rem;
        }
        .input-wrapper {
          margin: 0 auto;
          width: 100%;
        }
        .input-area {
          display: flex;
          flex-direction: column;
          min-height: 140px;
          padding: 20px 20px 12px 20px;
          line-height: 20px;
          border-radius: 16px;
          background-color: #1a1a1a;
          color: #ffffff;
          font-size: 14px;
          text-align: center;
          box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.5);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .input-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 100%;
        }
        .input-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }
        .left-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .button-row {
          display: contents;
        }
        .send-button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: unset !important;
          background-color: #ffc700;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          color: #000;
        }
        .send-button:hover:not(:disabled) {
          background: #ffd633;
          transform: translateY(-1px);
        }
        .send-button:disabled {
          background: #2a2a2a;
          border: 0px solid #2a2a2a;
          color: #666;
          cursor: not-allowed;
        }
        .stop-button {
          background: rgba(255, 199, 0, 1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          cursor: pointer;
          border: unset !important;
        }
        .stop-button div {
          width: 10px;
          height: 10px;
          background: white;
        }
        .upload-button {
          border-color: #0000000f;
          border-radius: 6px;
        }
        .mcp-button {
          border-color: #0000000f;
          border-radius: 6px;
        }
        @media (min-width: 640px) {
          .chat-input {
            max-width: 1039px !important;
            min-width: 390px !important;
          }
        }
      `}</style>
    </div>
  );
}

