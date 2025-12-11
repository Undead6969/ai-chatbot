"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { useWindowSize } from "usehooks-ts";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "./icons";
import { useSidebar } from "./ui/sidebar";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
  mode,
  onModeChange,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  mode: "coding" | "browser" | "cli" | "auto";
  onModeChange: (mode: "coding" | "browser" | "cli" | "auto") => void;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-gradient-to-r from-[#0c0c0e] via-[#0f1115] to-[#0c0c0e] px-3 py-2 md:px-4">
      <div className="flex items-center gap-2">
        <SidebarToggle />
        <div className="flex items-center gap-2 rounded-full border border-border/80 bg-black/40 px-3 py-1">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
            Lea
          </span>
        </div>
      </div>

      {(!open || windowWidth < 768) && (
        <Button
          className="order-2 ml-auto h-8 rounded-full border border-border/80 bg-black/40 px-3 text-xs font-medium md:order-1 md:ml-0 md:h-fit md:px-3"
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
          variant="ghost"
        >
          <PlusIcon />
          <span className="md:sr-only">New Chat</span>
        </Button>
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          className="order-1 md:order-2"
          selectedVisibilityType={selectedVisibilityType}
        />
      )}

      <div className="order-4 ml-auto flex items-center gap-2 rounded-full border border-border/80 bg-black/40 px-3 py-1 text-xs md:order-3">
        <span className="text-muted-foreground">Mode:</span>
        <select
          className="bg-transparent text-foreground outline-none"
          value={mode}
          onChange={(e) => onModeChange(e.target.value as "coding" | "browser" | "cli" | "auto")}
        >
          <option value="auto">Auto</option>
          <option value="coding">Coding</option>
          <option value="browser">Browser</option>
          <option value="cli">CLI</option>
        </select>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
