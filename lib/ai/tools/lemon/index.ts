import { tool } from "ai";
import { z } from "zod";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { browserUseTask, shellTaskTool } from "@/lib/ai/tools/mode-tools";
import { createSearchTool } from "@/lib/ai/tools/search";

const safeResolve = (relativePath: string) => {
  const workspaceRoot = process.cwd();
  const resolved = path.resolve(workspaceRoot, relativePath);
  if (!resolved.startsWith(workspaceRoot)) {
    throw new Error("Path traversal detected");
  }
  return resolved;
};

export const lemonWriteCodeTool = tool({
  description:
    "Write content to a workspace file (non-interactive). Provide relative path and full content.",
  inputSchema: z.object({
    path: z.string().describe("Relative file path to write, e.g., notes/todo.md"),
    content: z.string().describe("Full file content to write"),
  }),
  async execute({ path: targetPath, content }) {
    try {
      const resolved = safeResolve(targetPath);
      await mkdir(path.dirname(resolved), { recursive: true });
      await writeFile(resolved, content, "utf8");
      return { status: "ok", path: targetPath, bytes: Buffer.byteLength(content, "utf8") };
    } catch (error) {
      return { error: `write failed: ${error instanceof Error ? error.message : "unknown"}` };
    }
  },
});

export const lemonTerminalTool = shellTaskTool;

export const lemonBrowserTool = tool({
  description:
    "Browser automation via Browser Use Cloud. Provide a short goal and optional URL (non-interactive).",
  inputSchema: z.object({
    question: z.string().describe("What you want to do with the browser"),
    url: z.string().url().optional().describe("Optional starting URL"),
  }),
  async execute({ question, url }) {
    return browserUseTask.execute({ task: question, url });
  },
});

export const lemonSearchTool = (apiKey?: string) =>
  createSearchTool({ apiKey });

