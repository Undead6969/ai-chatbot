import { tool } from "ai";
import { z } from "zod";
import { BrowserUseClient } from "browser-use-sdk";
import { getApiKeyConfig } from "@/lib/db/queries";

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
  }),
  async execute({ task, url }) {
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
      });
      const result = await created.complete();
      return {
        task,
        url,
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
      const { execFile } = await import("node:child_process");
      const cwd = workdir || process.cwd();
      const args = command.split(" ").slice(1);
      const result = await new Promise<{ stdout: string; stderr: string; exitCode: number }>(
        (resolve, reject) => {
          const child = execFile(base, args, { cwd, timeout: 10_000 }, (error, stdout, stderr) => {
            if (error && typeof (error as any).code === "number") {
              resolve({ stdout: stdout ?? "", stderr: stderr ?? String(error), exitCode: (error as any).code });
            } else if (error) {
              reject(error);
            } else {
              resolve({ stdout: stdout ?? "", stderr: stderr ?? "", exitCode: 0 });
            }
          });
          child.on("error", reject);
        },
      );
      return {
        intent,
        workdir: cwd,
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

// Default adapters; where possible we attempt a lightweight API call, else return guidance.
const defaultAdapters: AdapterConfig[] = [
  { id: "notion", name: "Notion", description: "Read/write pages (needs NOTION_API_KEY)", needsApproval: true },
  { id: "google-drive", name: "Google Drive", description: "List files (service account/OAuth required)", needsApproval: true },
  { id: "canva", name: "Canva", description: "Design management (placeholder)", needsApproval: true },
  { id: "figma", name: "Figma", description: "File/component lookup (needs FIGMA_TOKEN)", needsApproval: true },
  { id: "vercel", name: "Vercel", description: "Projects/deployments (needs VERCEL_TOKEN)", needsApproval: true },
  { id: "github", name: "GitHub", description: "Repos/issues (needs GITHUB_TOKEN)", needsApproval: true },
];

async function getAdapterToken(adapterId: string, envVar?: string) {
  const envToken = envVar ? process.env[envVar] : undefined;
  if (envToken) {
    return { token: envToken, source: "env" as const };
  }
  const stored = await getApiKeyConfig({ provider: `adapter-${adapterId}` });
  if (stored?.apiKey) {
    try {
      const parsed = JSON.parse(stored.apiKey) as { accessToken?: string; refreshToken?: string; token?: string };
      const token = parsed.accessToken || parsed.token;
      if (token) {
        return { token, source: "db" as const, meta: parsed };
      }
    } catch (_error) {
      return { token: stored.apiKey, source: "db" as const };
    }
  }
  return null;
}

async function handleGithub(action: string, payload: Record<string, unknown> | undefined) {
  const tokenInfo = await getAdapterToken("github", "GITHUB_TOKEN");
  if (!tokenInfo?.token) {
    return { error: "Set GITHUB_TOKEN or connect GitHub via OAuth to enable GitHub adapter." };
  }
  const headers = { Authorization: `Bearer ${tokenInfo.token}`, "User-Agent": "lea-agent" };
  if (action === "listRepos") {
    const res = await fetch("https://api.github.com/user/repos?per_page=20", { headers });
    if (!res.ok) return { error: `GitHub listRepos failed: ${res.status} ${res.statusText}` };
    const data = (await res.json()) as Array<{ name: string; full_name: string; html_url: string }>;
    return { repos: data.map((r) => ({ name: r.name, fullName: r.full_name, url: r.html_url })) };
  }
  if (action === "repoInfo") {
    const repo = typeof payload?.repo === "string" ? payload.repo : undefined;
    if (!repo) return { error: "repo is required for repoInfo" };
    const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
    if (!res.ok) return { error: `GitHub repoInfo failed: ${res.status} ${res.statusText}` };
    const data = await res.json();
    return { name: data.name, fullName: data.full_name, url: data.html_url, description: data.description };
  }
  return { error: `Unsupported GitHub action: ${action}` };
}

export function buildAdapterTool(adapters: AdapterConfig[] = defaultAdapters) {
  return tool({
    description:
      "Call an external adapter (MCP-style). Some adapters return live data when tokens are set; others return guidance.",
    needsApproval: true,
    inputSchema: z.object({
      adapterId: z.string().describe("Adapter identifier"),
      action: z.string().describe("Action to perform (e.g., listRepos)"),
      payload: z.record(z.unknown()).optional().describe("Parameters for the action"),
    }),
    async execute({ adapterId, action, payload }) {
      const adapter = adapters.find((a) => a.id === adapterId);
      if (!adapter) {
        return { error: `Adapter ${adapterId} not found or disabled.` };
      }

      if (adapterId === "github") {
        return handleGithub(action, payload as Record<string, unknown>);
      }

  if (adapterId === "notion") {
    const notionToken = await getAdapterToken("notion", "NOTION_API_KEY");
    if (!notionToken?.token) {
      return { info: "Connect Notion via OAuth or set NOTION_API_KEY, then implement actions like listDatabases/queryPages." };
    }
    return { info: "Notion token available. Implement actions (listDatabases/queryPages) to activate live calls." };
  }

  if (adapterId === "google-drive") {
    const driveToken = await getAdapterToken("google-drive");
    if (!driveToken?.token) {
      return { info: "Connect Google Drive via OAuth to listFiles/readFile." };
    }
    return { info: "Google Drive token available. Implement listFiles/readFile to activate live calls." };
  }

  if (adapterId === "figma") {
    const figmaToken = await getAdapterToken("figma", "FIGMA_TOKEN");
    if (!figmaToken?.token) {
      return { info: "Connect Figma via OAuth or set FIGMA_TOKEN to enable fileInfo/componentSearch." };
    }
    return { info: "Figma token available. Implement fileInfo/componentSearch to activate live calls." };
  }

  if (adapterId === "vercel") {
    const vercelToken = await getAdapterToken("vercel", "VERCEL_TOKEN");
    if (!vercelToken?.token) {
      return { info: "Connect Vercel via OAuth or set VERCEL_TOKEN to enable listProjects/deployments." };
    }
    return { info: "Vercel token available. Implement listProjects/deployments to activate live calls." };
  }

  if (adapterId === "canva") {
    const canvaToken = await getAdapterToken("canva");
    if (!canvaToken?.token) {
      return { info: "Connect Canva via OAuth to enable design actions (API app config required)." };
    }
    return { info: "Canva token available. Implement design actions to activate live calls." };
  }

  return { error: `Adapter ${adapterId} is stubbed. Provide credentials and implement the action.` };
    },
  });
}

