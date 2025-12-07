import { ToolLoopAgent, stepCountIs } from "ai";
import { getAllToolConfigs } from "@/lib/db/queries";
import { createSearchTool } from "@/lib/ai/tools/search";
import { fileSystemTool } from "@/lib/ai/tools/filesystem";
import { codeExecutionTool } from "@/lib/ai/tools/code-execution";
import { analysisTool } from "@/lib/ai/tools/analysis";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { myProvider } from "@/lib/ai/providers";
import { buildManusToolRegistry } from "@/lib/ai/tools/manus-tools";
import { leaSystemPrompt } from "@/lib/ai/prompts/lea-system";
import { leaBrowserPrompt } from "@/lib/ai/prompts/lea-browser";
import { leaCodingPrompt } from "@/lib/ai/prompts/lea-coding";
import { leaCliPrompt } from "@/lib/ai/prompts/lea-cli";
import { browserActionTool, buildAdapterTool, shellTaskTool } from "@/lib/ai/tools/mode-tools";
import { selectRoutedModel } from "@/lib/ai/routing";
import type { Tool } from "ai";
import type { ChatMessage } from "@/lib/types";

/**
 * Lea Agent - An autonomous AI agent similar to Manus
 * Uses AI SDK 6 ToolLoopAgent with dynamic tool configuration
 * Uses the existing provider system to support multiple models
 */
type LeaMode = "coding" | "browser" | "cli";

export async function createLeaAgent(
  modelId: string = "chat-model",
  messages: ChatMessage[] = [],
  mode: LeaMode = "coding",
) {
  // Load tool configurations from database (with error handling)
  let toolConfigs: Awaited<ReturnType<typeof getAllToolConfigs>> = [];
  try {
    toolConfigs = await getAllToolConfigs();
  } catch (error) {
    console.warn("Failed to load tool configs from database, using defaults:", error);
    // Continue with empty configs - all tools will be enabled by default
  }
  
  const configMap = new Map(
    toolConfigs.map((config) => [config.toolId, config])
  );

  // Helper to check if a tool is enabled
  const isToolEnabled = (toolId: string): boolean => {
    const config = configMap.get(toolId);
    return config ? config.enabled : true; // Default to enabled if not configured
  };

  const applyNeedsApproval = (tool: Tool, toolId: string): Tool => {
    const config = configMap.get(toolId);
    if (config && typeof config.needsApproval === "boolean") {
      return { ...tool, needsApproval: config.needsApproval };
    }
    return tool;
  };

  const getConfigValue = (toolId: string, key: string): string | undefined => {
    const config = configMap.get(toolId);
    if (!config || !config.config || typeof config.config !== "object") return undefined;
    const value = (config.config as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  };

  // Build tools object dynamically based on configuration
  const tools: Record<string, Tool> = {};

  // Always include weather tool (from original template)
  tools.getWeather = getWeather;

  // Mode-specific tooling
  const includeSearch = isToolEnabled("search");
  if (mode === "browser") {
    if (includeSearch) {
      const searchApiKey =
        getConfigValue("search", "apiKey") ||
        process.env.TAVILY_API_KEY ||
        process.env.SEARCH_API_KEY;
      const searchNeedsApproval = configMap.get("search")?.needsApproval;
      tools.search = createSearchTool({
        apiKey: searchApiKey,
        needsApproval: searchNeedsApproval,
      });
    }
    if (isToolEnabled("browserAction")) {
      tools.browserAction = browserActionTool;
    }
    if (isToolEnabled("browserUseTask")) {
      tools.browserUseTask = browserUseTask;
    }
  } else if (mode === "cli") {
    if (includeSearch) {
      const searchApiKey =
        getConfigValue("search", "apiKey") ||
        process.env.TAVILY_API_KEY ||
        process.env.SEARCH_API_KEY;
      tools.search = createSearchTool({ apiKey: searchApiKey, needsApproval: false });
    }
    if (isToolEnabled("shellTask")) {
      tools.shellTask = shellTaskTool;
    }
    if (isToolEnabled("filesystem")) {
      tools.filesystem = applyNeedsApproval(fileSystemTool, "filesystem");
    }
  } else {
    // coding mode (default)
    if (includeSearch) {
      const searchApiKey =
        getConfigValue("search", "apiKey") ||
        process.env.TAVILY_API_KEY ||
        process.env.SEARCH_API_KEY;
      const searchNeedsApproval = configMap.get("search")?.needsApproval;
      tools.search = createSearchTool({
        apiKey: searchApiKey,
        needsApproval: searchNeedsApproval,
      });
    }
    if (isToolEnabled("filesystem")) {
      tools.filesystem = applyNeedsApproval(fileSystemTool, "filesystem");
    }
    if (isToolEnabled("codeExecution")) {
      tools.codeExecution = applyNeedsApproval(codeExecutionTool, "codeExecution");
    }
    if (isToolEnabled("analysis")) {
      tools.analysis = applyNeedsApproval(analysisTool, "analysis");
    }
  }

  // Adapter registry tool (MCP-style placeholder)
  if (isToolEnabled("adapterCall")) {
    tools.adapterCall = buildAdapterTool();
  }

  // Manus manifest tools (stubbed placeholders unless mapped above)
  const manusTools = buildManusToolRegistry();
  for (const [name, manusTool] of Object.entries(manusTools)) {
    if (!tools[name]) {
      tools[name] = manusTool;
    }
  }

  const modePrompt =
    mode === "browser" ? leaBrowserPrompt : mode === "cli" ? leaCliPrompt : leaCodingPrompt;

  // Task-based routing with safe defaults
  const hasVisionInput = messages.some((msg) =>
    msg.parts?.some((p) => p.type === "file" && (p as any).mediaType?.startsWith("image")),
  );
  const routed = selectRoutedModel({
    requestedModelId: modelId,
    messages,
    hasVisionInput,
    forceMode: mode === "auto" ? undefined : mode,
  });

  // Use the existing provider system to support multiple models
  const model = myProvider.languageModel(routed.modelId);

  const agent = new ToolLoopAgent({
    model,
    instructions: `${leaSystemPrompt}\n${modePrompt}\nCurrent mode: ${mode}`,
    tools,
    stopWhen: stepCountIs(20), // Allow up to 20 steps for complex tasks
  });

  return agent;
}

// Export a function to get agent with specific model
export async function getLeaAgent(
  modelId: string = "chat-model",
  messages: ChatMessage[] = [],
  mode: LeaMode = "coding",
): Promise<ToolLoopAgent> {
  // Create a new agent instance for each model to avoid singleton issues
  return createLeaAgent(modelId, messages, mode);
}

