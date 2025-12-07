"use client";

import { useMemo, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

function extractText(message: ChatMessage) {
  const parts = (message as any).parts;
  if (!parts || !Array.isArray(parts)) return "";
  return parts
    .filter((p: any) => p?.type === "text" && typeof p.text === "string")
    .map((p: any) => p.text)
    .join("\n");
}

export function CanvasPanel({ messages }: { messages: ChatMessage[] }) {
  const [open, setOpen] = useState(false);

  const { assistantSnippets, latestSummary } = useMemo(() => {
    const assistants = messages.filter((m) => m.role === "assistant").slice(-6).reverse();
    const snippets = assistants
      .map((m) => extractText(m))
      .filter((txt) => txt && txt.trim().length > 0)
      .slice(0, 3);
    return {
      assistantSnippets: snippets,
      latestSummary: snippets[0],
    };
  }, [messages]);

  return (
    <Card className="mx-3 mb-3 border-dashed md:mx-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Canvas</CardTitle>
          <CardDescription>Pin latest research/shop summaries and drafts.</CardDescription>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Show"}
        </Button>
      </CardHeader>
      {open && (
        <CardContent className="space-y-3">
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs uppercase text-muted-foreground">Latest summary</p>
            <p className="mt-1 text-sm">
              {latestSummary || "Assistant output will appear here after a response."}
            </p>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs uppercase text-muted-foreground">Recent snippets</p>
            {assistantSnippets.length === 0 ? (
              <p className="text-sm">No recent snippets yet.</p>
            ) : (
              <ul className="list-disc space-y-2 pl-4 text-sm">
                {assistantSnippets.map((snippet, idx) => (
                  <li key={idx}>{snippet.slice(0, 400)}</li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Canvas is read-only for now. Extend it to pin tool outputs (deepResearch/shopResearch/browserUse) and
            stream Browser Use logs.
          </p>
        </CardContent>
      )}
    </Card>
  );
}

