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
