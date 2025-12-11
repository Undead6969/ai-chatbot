import { ToolLoopAgent, stepCountIs } from "ai";
import { getApiKey, myProvider } from "@/lib/ai/providers";
import {
  lemonAutoReplyPrompt,
  lemonPlanningTemplate,
  lemonSystemPrompt,
} from "@/lib/ai/prompts/lemon";
import {
  lemonBrowserTool,
  lemonSearchTool,
  lemonTerminalTool,
  lemonWriteCodeTool,
} from "@/lib/ai/tools/lemon";

type LemonAgentOptions = {
  modelId?: string;
  goal?: string;
  executorCapabilities?: string;
};

const renderPlanningPrompt = ({
  goal = "",
  files = "none",
  previous = "",
  bestPractice = "None provided",
  executorCapabilities = "Search, browser, terminal (allowlisted), write_code",
}: {
  goal?: string;
  files?: string;
  previous?: string;
  bestPractice?: string;
  executorCapabilities?: string;
}) => {
  return lemonPlanningTemplate
    .replace("{system}", new Date().toISOString())
    .replace("{files}", files)
    .replace("{previous}", previous || "None")
    .replace("{best_practice_knowledge}", bestPractice)
    .replace("{executor_capabilities}", executorCapabilities)
    .replace("{goal}", goal);
};

export function getLemonAgent(options: LemonAgentOptions = {}) {
  const modelId = options.modelId ?? "google-gemini-2.5-flash";
  const model = myProvider.languageModel(modelId);

  const searchApiKey =
    getApiKey("search", "TAVILY_API_KEY") ||
    process.env.TAVILY_API_KEY ||
    process.env.SEARCH_API_KEY;

  const tools = {
    lemonSearch: lemonSearchTool(searchApiKey),
    lemonBrowser: lemonBrowserTool,
    lemonTerminal: lemonTerminalTool,
    lemonWriteCode: lemonWriteCodeTool,
  };

  const planningPrompt = renderPlanningPrompt({
    goal: options.goal ?? "",
    executorCapabilities: options.executorCapabilities,
  });

  const instructions = `
${lemonSystemPrompt}

Phases:
1) Auto-reply to acknowledge (short, polite): 
${lemonAutoReplyPrompt(options.goal ?? "")}

2) Plan: produce a lean Markdown plan using this template:
${planningPrompt}

3) Execute: use tools to fulfill tasks. Prefer non-interactive commands. Summarize concisely.
`;

  return new ToolLoopAgent({
    model,
    instructions,
    tools,
    stopWhen: stepCountIs(30),
  });
}

