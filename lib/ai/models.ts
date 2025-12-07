export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
  provider: string;
};

export const chatModels: ChatModel[] = [
  // xAI Grok Models (via Gateway)
  {
    id: "chat-model",
    name: "Grok 2 Vision",
    description: "Advanced multimodal model with vision and text capabilities",
    provider: "xAI",
  },
  {
    id: "chat-model-reasoning",
    name: "Grok 3 Mini",
    description: "Uses advanced chain-of-thought reasoning for complex problems",
    provider: "xAI",
  },
  {
    id: "auto-model",
    name: "Auto",
    description: "Auto-pick model based on task (vision/reasoning/speed)",
    provider: "System",
  },
  // OpenAI Models
  {
    id: "openai-gpt-4o",
    name: "GPT-4o",
    description: "OpenAI's most capable multimodal model",
    provider: "OpenAI",
  },
  {
    id: "openai-gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Fast and efficient OpenAI model",
    provider: "OpenAI",
  },
  {
    id: "openai-gpt-4.1",
    name: "GPT-4.1",
    description: "OpenAI GPT-4.1 model",
    provider: "OpenAI",
  },
  {
    id: "openai-gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    description: "Fast GPT-4.1 mini model",
    provider: "OpenAI",
  },
  {
    id: "openai-o3-mini",
    name: "o3-mini",
    description: "OpenAI o3-mini reasoning model",
    provider: "OpenAI",
  },
  // Anthropic Claude Models
  {
    id: "anthropic-claude-opus-4",
    name: "Claude Opus 4",
    description: "Anthropic's most capable model with advanced reasoning",
    provider: "Anthropic",
  },
  {
    id: "anthropic-claude-sonnet-4",
    name: "Claude Sonnet 4",
    description: "Balanced performance and speed from Anthropic",
    provider: "Anthropic",
  },
  {
    id: "anthropic-claude-haiku",
    name: "Claude Haiku",
    description: "Fast and efficient Anthropic model",
    provider: "Anthropic",
  },
  {
    id: "anthropic-claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    description: "Anthropic Claude 3.5 Sonnet latest",
    provider: "Anthropic",
  },
  {
    id: "anthropic-claude-3.5-haiku",
    name: "Claude 3.5 Haiku",
    description: "Anthropic Claude 3.5 Haiku fast",
    provider: "Anthropic",
  },
  // Google Gemini Models
  {
    id: "google-gemini-2-flash",
    name: "Gemini 2.0 Flash",
    description: "Google's latest fast multimodal model",
    provider: "Google",
  },
  {
    id: "google-gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description: "Google's advanced model with long context",
    provider: "Google",
  },
  {
    id: "google-gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    description: "Fast and efficient Google model",
    provider: "Google",
  },
  {
    id: "google-gemini-3-pro",
    name: "Gemini 3 Pro",
    description: "Advanced multimodal model (aliased to latest Pro if 3 Pro unavailable)",
    provider: "Google",
  },
  // Mistral Models
  {
    id: "mistral-large",
    name: "Mistral Large",
    description: "Mistral's most capable model",
    provider: "Mistral",
  },
  {
    id: "mistral-medium",
    name: "Mistral Medium",
    description: "Balanced Mistral model",
    provider: "Mistral",
  },
];
