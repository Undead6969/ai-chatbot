import { tool } from "ai";
import { z } from "zod";
import { BrowserUseClient } from "browser-use-sdk";

export const browserActionTool = tool({
  description:
    "Perform high-level browser actions (navigate, click, extract) in guided mode. This is a placeholder until a live browser runtime is attached.",
  inputSchema: z.object({
    goal: z.string().describe("What to do in the browser (e.g., open URL, extract data)"),
    url: z.string().url().optional().describe("Target URL if applicable"),
    notes: z.string().optional().describe("Extra guidance or CSS selectors to target"),
  }),
  async execute({ goal, url, notes }) {
    return {
      goal,
      url,
      notes,
      message:
        "Browser runtime not connected. Please attach a browser tool or MCP adapter. Provide steps and selectors so a human can execute if needed.",
    };
  },
});

export const browserUseTask = tool({
  description:
    "Run a Browser Use Cloud task (Chromium automation). Provide a clear goal and optional URL/context. Requires BROWSER_USE_API_KEY.",
  needsApproval: true,
  inputSchema: z.object({
    task: z.string().describe("High-level task, e.g., 'Open X, search Y, return titles'"),
    url: z.string().url().optional().describe("Optional starting URL"),
    notes: z.string().optional().describe("Extra guidance, selectors, or constraints"),
  }),
  async execute({ task, url, notes }) {
    const apiKey = process.env.BROWSER_USE_API_KEY;
    if (!apiKey) {
      return {
        error: "BROWSER_USE_API_KEY is not set. Add it to your environment to enable Browser Use Cloud.",
      };
    }

    try {
      const client = new BrowserUseClient({ apiKey });
      const created = await client.tasks.createTask({
        task: url ? `${task} (start at ${url})` : task,
        metadata: { notes },
      });
      const result = await created.complete();
      return {
        task,
        url,
        notes,
        output: result.output,
      };
    } catch (error) {
      return {
        error: `Browser Use task failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

export const shellTaskTool = tool({
  description:
    "Run a shell task in a sandboxed workspace. Requires approval. Uses an allowlist; write/install/network commands are blocked.",
  needsApproval: true,
  inputSchema: z.object({
    command: z.string().describe("Command to run (e.g., ls -la src)"),
    workdir: z.string().optional().describe("Working directory (default: workspace root)"),
    intent: z.string().optional().describe("Short reason for this command"),
  }),
  async execute({ command, workdir, intent }) {
    const allowlist = ["ls", "cat", "pwd", "stat", "find", "head", "tail", "grep"];
    const base = command.split(" ")[0];
    if (!allowlist.includes(base)) {
      return {
        error: `Command '${base}' is not allowed. Allowed commands: ${allowlist.join(", ")}`,
      };
    }
    try {
      const { execa } = await import("execa");
      const result = await execa(base, command.split(" ").slice(1), {
        cwd: workdir || process.cwd(),
        timeout: 10_000,
      });
      return {
        intent,
        workdir: workdir || process.cwd(),
        command,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
      };
    } catch (error) {
      return {
        intent,
        workdir,
        command,
        error: `Shell command failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

export type AdapterConfig = {
  id: string;
  name: string;
  description: string;
  needsApproval?: boolean;
  enabled?: boolean;
};

// Default placeholder adapters; these can be extended to real MCPs.
const defaultAdapters: AdapterConfig[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "List or read docs from Drive (placeholder)",
    needsApproval: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Read/write Notion pages (placeholder)",
    needsApproval: true,
  },
];

export function buildAdapterTool(adapters: AdapterConfig[] = defaultAdapters) {
  return tool({
    description:
      "Call an external adapter (MCP-style). Currently returns placeholders until real integrations are wired.",
    needsApproval: true,
    inputSchema: z.object({
      adapterId: z.string().describe("Adapter identifier"),
      action: z.string().describe("Action to perform"),
      payload: z.record(z.unknown()).optional().describe("Parameters for the action"),
    }),
    async execute({ adapterId, action, payload }) {
      const adapter = adapters.find((a) => a.id === adapterId);
      if (!adapter) {
        return { error: `Adapter ${adapterId} not found or disabled.` };
      }
      return {
        adapter: adapterId,
        action,
        payload,
        message:
          "Adapter call is stubbed. Wire this adapter to a real MCP/HTTP/SDK integration to activate.",
      };
    },
  });
}

