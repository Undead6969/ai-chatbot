"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chatModels } from "@/lib/ai/models";

export function ModelSelect({
  selectedModelId,
  onModelChange,
}: {
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
}) {
  const [selectedModel, setSelectedModel] = useState<string>(selectedModelId || "google-gemini-2.5-flash");

  useEffect(() => {
    if (selectedModelId) {
      setSelectedModel(selectedModelId);
    }
  }, [selectedModelId]);

  const displayModelName = (id: string) => {
    if (id === "google-gemini-2.5-flash") return "Lite";
    if (id === "google-gemini-3-pro") return "Pro";
    if (id === "auto-model") return "Auto";
    return chatModels.find((m) => m.id === id)?.name || "Lite";
  };

  const handleChange = (value: string) => {
    setSelectedModel(value);
    onModelChange?.(value);
  };

  return (
    <Select value={selectedModel} onValueChange={handleChange}>
      <SelectTrigger className="model-select h-8 w-[90px] text-xs bg-[#1a1a1a] border-[#333] text-white">
        <SelectValue>{displayModelName(selectedModel)}</SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-[#1a1a1a] border-[#333]">
        {chatModels
          .filter((m) => m.id.includes("gemini") || m.id === "auto-model")
          .map((model) => (
            <SelectItem key={model.id} value={model.id} className="text-white hover:bg-[#252525]">
              {displayModelName(model.id)}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}

