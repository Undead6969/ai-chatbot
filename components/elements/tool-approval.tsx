"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ToolUIPart } from "ai";

export type ToolApprovalProps = {
  toolPart: ToolUIPart;
  onApprove: (approved: boolean) => void;
};

export function ToolApproval({ toolPart, onApprove }: ToolApprovalProps) {
  if (toolPart.state !== "approval-requested") {
    return null;
  }

  const toolName = String(toolPart.type).replace("tool-", "");
  const approvalId = (toolPart as any).approval?.id;

  if (!approvalId) {
    return null;
  }

  return (
    <Card className="p-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-1">
            Approval Required: {toolName}
          </h4>
          <p className="text-sm text-muted-foreground">
            Lea wants to execute the <strong>{toolName}</strong> tool. Review
            the parameters below and approve or deny the request.
          </p>
        </div>

        {(toolPart as any).input && (
          <div className="rounded-md bg-background p-3 text-xs">
            <div className="font-medium mb-2">Parameters:</div>
            <pre className="overflow-x-auto">
              {JSON.stringify((toolPart as any).input, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => onApprove(true)}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            Approve
          </Button>
          <Button
            onClick={() => onApprove(false)}
            size="sm"
            variant="destructive"
          >
            Deny
          </Button>
        </div>
      </div>
    </Card>
  );
}

