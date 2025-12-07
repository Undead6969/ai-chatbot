import { tool } from "ai";
import { z } from "zod";

type SearchToolOptions = {
  apiKey?: string;
  needsApproval?: boolean;
};

type TavilyResult = {
  title: string;
  url: string;
  content: string;
};

/**
 * Factory to build the search tool.
 * If apiKey is provided, uses Tavily. Otherwise returns a mock response.
 */
export function createSearchTool(options?: SearchToolOptions) {
  const { apiKey, needsApproval } = options ?? {};

  return tool({
    description:
      "Search the web for information. Uses Tavily when configured; otherwise returns mock results.",
    needsApproval: needsApproval ?? false,
    inputSchema: z.object({
      query: z.string().describe("The search query to look up"),
      maxResults: z
        .number()
        .optional()
        .default(5)
        .describe("Maximum number of results to return (default: 5)"),
    }),
    execute: async ({ query, maxResults = 5 }) => {
      // Use real Tavily search when apiKey is available
      if (apiKey && apiKey.trim().length > 0) {
        try {
          const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: apiKey,
            },
            body: JSON.stringify({
              query,
              max_results: Math.max(1, Math.min(maxResults, 10)),
              include_images: false,
              include_answer: true,
            }),
          });

          if (!response.ok) {
            return {
              error: `Search provider error: ${response.status} ${response.statusText}`,
            };
          }

          const data = (await response.json()) as {
            results?: TavilyResult[];
            answer?: string;
          };

          const results = (data.results ?? []).slice(0, maxResults).map((item, index) => ({
            title: item.title || `Result ${index + 1}`,
            url: item.url,
            snippet: item.content,
          }));

          return {
            query,
            results,
            totalResults: results.length,
            answer: data.answer,
            provider: "tavily",
          };
        } catch (error) {
          return {
            error: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          };
        }
      }

      // Fallback mock search when no provider is configured
      const mockResults = Array.from({ length: Math.min(maxResults, 5) }, (_, index) => ({
        title: `Search Result ${index + 1} for "${query}"`,
        url: `https://example.com/result-${index + 1}`,
        snippet: `Sample result for "${query}". Configure Tavily (API key) in the admin panel for real results.`,
      }));

      return {
        query,
        results: mockResults,
        totalResults: mockResults.length,
        provider: "mock",
        note: "No search provider configured. Add a Tavily API key in the admin panel.",
      };
    },
  });
}

// Default export to keep backward compatibility where a static tool is expected
export const searchTool = createSearchTool();

