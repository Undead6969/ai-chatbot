"use client";

import { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const workModeOptions = [
  { value: "twins", label: "Twins Chat" },
  { value: "task", label: "Evolving Agent" },
  { value: "chat", label: "AI Chat" },
  { value: "auto", label: "Adaptive" },
];

export function ModeSelector({
  value,
  onValueChange,
  disabled = false,
}: {
  value: string;
  onValueChange: (mode: string) => void;
  disabled?: boolean;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentLabel = workModeOptions.find((opt) => opt.value === value)?.label || "Auto";

  const handleModeChange = (mode: string) => {
    onValueChange(mode);
    localStorage.setItem("workMode", mode);
  };

  if (isMobile) {
    return (
      <>
        <div className="mobile-mode-trigger" onClick={() => !disabled && setShowModeModal(true)}>
          <span className="mode-name">{currentLabel}</span>
          <ChevronDown className="dropdown-icon h-3 w-3" />
        </div>
        {showModeModal && (
          <div className="mode-modal-overlay" onClick={() => setShowModeModal(false)}>
            <div className="mode-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Mode</h3>
                <button className="close-btn" onClick={() => setShowModeModal(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="option-list">
                {workModeOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`option-item ${value === option.value ? "selected" : ""}`}
                    onClick={() => {
                      handleModeChange(option.value);
                      setShowModeModal(false);
                    }}
                  >
                    <div className="option-info">
                      <span className="option-circle">
                        {value === option.value && <span className="option-inner-circle" />}
                      </span>
                      <div className="option-texts">
                        <div className="option-label">{option.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <style jsx>{`
          .mobile-mode-trigger {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            height: 24px;
            padding: 0 2px;
            background: #fff;
            border: 1px solid #d9d9d9;
            border-radius: 4px;
            cursor: pointer;
            font-size: 10px;
          }
          .mode-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.45);
            z-index: 10001;
            display: flex;
            align-items: flex-end;
            justify-content: center;
          }
          .mode-modal-content {
            background: #fff;
            border-radius: 12px 12px 0 0;
            padding: 0;
            max-height: 50vh;
            min-height: 200px;
            width: 100%;
            display: flex;
            flex-direction: column;
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #f0f0f0;
          }
          .option-list {
            flex: 1;
            overflow-y: auto;
            padding-bottom: 16px;
          }
          .option-item {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .option-item.selected {
            background-color: #e6f7ff;
          }
          .option-circle {
            width: 16px;
            height: 16px;
            border: 2px solid #333;
            border-radius: 50%;
            margin-top: 3px;
            position: relative;
          }
          .option-inner-circle {
            position: absolute;
            top: 1.5px;
            left: 1.5px;
            width: 8px;
            height: 8px;
            background-color: #333;
            border-radius: 50%;
          }
        `}</style>
      </>
    );
  }

  // Map workMode to API mode
  const mapWorkModeToApiMode = (workMode: string): "coding" | "browser" | "cli" | "auto" => {
    if (workMode === "task") return "coding";
    if (workMode === "twins") return "browser";
    if (workMode === "chat") return "auto";
    return "auto";
  };

  const handleModeChangeWithMapping = (mode: string) => {
    handleModeChange(mode);
    // Also emit the API mode if needed
    const apiMode = mapWorkModeToApiMode(mode);
  };

  return (
    <Select value={value} onValueChange={handleModeChangeWithMapping} disabled={disabled}>
      <SelectTrigger className="mode-select-dropdown h-8 w-[140px] text-xs bg-[#1a1a1a] border-[#333] text-white">
        <SelectValue>{currentLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-[#1a1a1a] border-[#333]">
        {workModeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-white hover:bg-[#252525]">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

