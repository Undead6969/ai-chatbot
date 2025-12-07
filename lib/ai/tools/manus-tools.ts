import "server-only";

import fs from "node:fs";
import path from "node:path";
import { tool } from "ai";
import { z } from "zod";

type ManusToolDef = {
  type?: string;
  function?: {
    name?: string;
    description?: string;
  };
};

const dangerousKeywords = ["write", "exec", "shell", "kill", "browser_", "deploy", "delete"];

function isDangerous(name: string): boolean {
  return dangerousKeywords.some((kw) => name.includes(kw));
}

function loadManusToolsFromJson(): ManusToolDef[] {
  try {
    const manifestPath = path.join(
      process.cwd(),
      "AI prompts templates",
      "system-prompts-and-models-of-ai-tools-main",
      "Manus Agent Tools & Prompt",
      "tools.json",
    );
    const raw = fs.readFileSync(manifestPath, "utf-8");
    return JSON.parse(raw) as ManusToolDef[];
  } catch (error) {
    console.warn("Failed to load Manus tools manifest, using empty list", error);
    return [];
  }
}

export function buildManusToolRegistry(): Record<string, ReturnType<typeof tool>> {
  const registry: Record<string, ReturnType<typeof tool>> = {};

  const manifest = loadManusToolsFromJson();

  for (const entry of manifest) {
    const name = entry.function?.name;
    if (!name || registry[name]) continue;

    const needsApproval = isDangerous(name);
    const description = entry.function?.description ?? "Manus-style tool (stubbed in Lea).";

    registry[name] = tool({
      description,
      needsApproval,
      inputSchema: z.record(z.string(), z.unknown()).describe("Arbitrary parameters for tool").optional(),
      execute: async (input) => {
        return {
          tool: name,
          input,
          note:
            "This Manus tool is currently a placeholder in Lea. Implement or map it to a concrete capability to enable full functionality.",
        };
      },
    });
  }

  return registry;
}

