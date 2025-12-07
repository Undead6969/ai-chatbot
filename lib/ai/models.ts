export const DEFAULT_CHAT_MODEL: string = "google-gemini-2.5-flash";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
  provider: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "auto-model",
    name: "Auto",
    description: "Auto-pick (Lea chooses between Lite and 2.0 by task)",
    provider: "Lea",
  },
  {
    id: "google-gemini-2.5-flash",
    name: "Lea 1.5 Lite",
    description: "Fast default (Gemini 2.5 Flash alias to 2.0 flash exp)",
    provider: "Lea",
  },
  {
    id: "google-gemini-3-pro",
    name: "Lea 2.0",
    description: "Upgraded reasoning/vision (Gemini 3 Pro alias to 1.5 Pro for now)",
    provider: "Lea",
  },
];
