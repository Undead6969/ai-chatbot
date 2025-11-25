import { ToolLoopAgent, stepCountIs } from "ai";
import { getAllToolConfigs } from "@/lib/db/queries";
import { searchTool } from "@/lib/ai/tools/search";
import { fileSystemTool } from "@/lib/ai/tools/filesystem";
import { codeExecutionTool } from "@/lib/ai/tools/code-execution";
import { analysisTool } from "@/lib/ai/tools/analysis";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { myProvider } from "@/lib/ai/providers";
import type { Tool } from "ai";

/**
 * Lea Agent - An autonomous AI agent similar to Manus
 * Uses AI SDK 6 ToolLoopAgent with dynamic tool configuration
 * Uses the existing provider system to support multiple models
 */
export async function createLeaAgent(modelId: string = "chat-model") {
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

  // Build tools object dynamically based on configuration
  const tools: Record<string, Tool> = {};

  // Always include weather tool (from original template)
  tools.getWeather = getWeather;

  // Add tools based on configuration
  if (isToolEnabled("search")) {
    tools.search = searchTool;
  }

  if (isToolEnabled("filesystem")) {
    tools.filesystem = fileSystemTool;
  }

  if (isToolEnabled("codeExecution")) {
    tools.codeExecution = codeExecutionTool;
  }

  if (isToolEnabled("analysis")) {
    tools.analysis = analysisTool;
  }

  // Use the existing provider system to support multiple models
  const model = myProvider.languageModel(modelId);

  const agent = new ToolLoopAgent({
    model,
    instructions: `You are Lea, an autonomous AI agent capable of independently executing complex, multi-step tasks.

Your capabilities include:
- Web research and information gathering
- File system operations (reading, writing, listing files)
- Code execution and development
- Data analysis and visualization
- Weather information retrieval

You are designed to work autonomously, breaking down complex tasks into steps and executing them systematically. When you need to perform potentially sensitive operations (like writing files or executing code), you will request approval from the user.

Always be thorough, explain your reasoning, and provide clear summaries of your work.`,
    tools,
    stopWhen: stepCountIs(20), // Allow up to 20 steps for complex tasks
  });

  return agent;
}

// Export a function to get agent with specific model
export async function getLeaAgent(modelId: string = "chat-model"): Promise<ToolLoopAgent> {
  // Create a new agent instance for each model to avoid singleton issues
  return createLeaAgent(modelId);
}

