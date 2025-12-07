import { tool } from "ai";
import { z } from "zod";

type TavilyResult = {
  title: string;
  url: string;
  content: string;
};

async function tavilySearch(apiKey: string, query: string, maxResults: number) {
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
    throw new Error(`Tavily error: ${response.status} ${response.statusText}`);
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

  return { results, answer: data.answer };
}

function mockResults(query: string, maxResults: number) {
  const mockResults = Array.from({ length: Math.min(maxResults, 5) }, (_, index) => ({
    title: `Result ${index + 1} for "${query}"`,
    url: `https://example.com/result-${index + 1}`,
    snippet: `Sample snippet for "${query}". Configure Tavily API for live results.`,
  }));
  return { results: mockResults, answer: undefined, provider: "mock" as const };
}

export const deepResearchTool = tool({
  description:
    "Perform deep research with multiple search pulls and a synthesized summary. Uses Tavily when configured; otherwise returns mock data.",
  inputSchema: z.object({
    topic: z.string().describe("Research topic or question"),
    maxResults: z.number().optional().default(5),
  }),
  async execute({ topic, maxResults = 5 }) {
    const apiKey = process.env.TAVILY_API_KEY || process.env.SEARCH_API_KEY;
    try {
      if (!apiKey) {
        const mock = mockResults(topic, maxResults);
        return {
          topic,
          ...mock,
          note: "No search API key set. Add TAVILY_API_KEY for live research.",
        };
      }
      const { results, answer } = await tavilySearch(apiKey, topic, maxResults);
      return {
        topic,
        results,
        answer,
        provider: "tavily",
      };
    } catch (error) {
      return {
        error: `Deep research failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

export const shopResearchTool = tool({
  description:
    "Research products for a query. Returns titles, links, and snippets. Uses Tavily when configured; otherwise returns mock data.",
  inputSchema: z.object({
    query: z.string().describe("Shopping query, e.g., 'best noise-cancelling headphones'"),
    maxResults: z.number().optional().default(5),
  }),
  async execute({ query, maxResults = 5 }) {
    const apiKey = process.env.TAVILY_API_KEY || process.env.SEARCH_API_KEY;
    try {
      if (!apiKey) {
        const mock = mockResults(query, maxResults);
        return {
          query,
          ...mock,
          note: "No search API key set. Add TAVILY_API_KEY for live shopping research.",
        };
      }
      const { results } = await tavilySearch(apiKey, query, maxResults);
      return {
        query,
        results,
        provider: "tavily",
      };
    } catch (error) {
      return {
        error: `Shop research failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});

