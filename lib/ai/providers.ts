import "server-only";

import { gateway } from "@ai-sdk/gateway";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

// Cache for API keys loaded from database (updated when admin changes them)
let apiKeyCache: Record<string, string> = {};

// Function to update API key cache (called when admin updates keys)
export function updateApiKeyCache(provider: string, apiKey: string) {
  apiKeyCache[provider] = apiKey;
  // Also update process.env for immediate use
  const envMap: Record<string, string> = {
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    google: "GOOGLE_GENERATIVE_AI_API_KEY",
    mistral: "MISTRAL_API_KEY",
  };
  if (envMap[provider]) {
    process.env[envMap[provider]] = apiKey;
  }
}

// Get API key from cache or environment
function getApiKey(provider: string, envVar: string): string | null {
  // Check cache first (updated by admin)
  if (apiKeyCache[provider]) {
    return apiKeyCache[provider];
  }
  // Then check environment variable
  return process.env[envVar] || null;
}

// Initialize providers synchronously
function initializeProviders() {
  const languageModels: Record<string, any> = {};

  // xAI Grok Models (via Gateway - always available)
  languageModels["chat-model"] = gateway.languageModel("xai/grok-2-vision-1212");
  languageModels["chat-model-reasoning"] = wrapLanguageModel({
    model: gateway.languageModel("xai/grok-3-mini"),
    middleware: extractReasoningMiddleware({ tagName: "think" }),
  });
  languageModels["title-model"] = gateway.languageModel("xai/grok-2-1212");
  languageModels["artifact-model"] = gateway.languageModel("xai/grok-2-1212");

  // OpenAI Models
  const openaiKey = getApiKey("openai", "OPENAI_API_KEY");
  if (openaiKey) {
    try {
      const openaiModule = require("@ai-sdk/openai");
      const { openai } = openaiModule;
      languageModels["openai-gpt-4o"] = openai("gpt-4o", { apiKey: openaiKey });
      languageModels["openai-gpt-4o-mini"] = openai("gpt-4o-mini", { apiKey: openaiKey });
    } catch (error) {
      console.warn("OpenAI provider not available:", error);
    }
  }

  // Anthropic Claude Models
  const anthropicKey = getApiKey("anthropic", "ANTHROPIC_API_KEY");
  if (anthropicKey) {
    try {
      const anthropicModule = require("@ai-sdk/anthropic");
      const { anthropic } = anthropicModule;
      languageModels["anthropic-claude-opus-4"] = anthropic("claude-opus-4-1", { apiKey: anthropicKey });
      languageModels["anthropic-claude-sonnet-4"] = anthropic("claude-sonnet-4-0", { apiKey: anthropicKey });
      languageModels["anthropic-claude-haiku"] = anthropic("claude-3-5-haiku-latest", { apiKey: anthropicKey });
    } catch (error) {
      console.warn("Anthropic provider not available:", error);
    }
  }

  // Google Gemini Models
  const googleKey = getApiKey("google", "GOOGLE_GENERATIVE_AI_API_KEY");
  if (googleKey) {
    try {
      const googleModule = require("@ai-sdk/google");
      const { google } = googleModule;
      languageModels["google-gemini-2-flash"] = google("gemini-2.0-flash-exp", { apiKey: googleKey });
      languageModels["google-gemini-1.5-pro"] = google("gemini-1.5-pro", { apiKey: googleKey });
      languageModels["google-gemini-1.5-flash"] = google("gemini-1.5-flash", { apiKey: googleKey });
    } catch (error) {
      console.warn("Google provider not available:", error);
    }
  }

  // Mistral Models
  const mistralKey = getApiKey("mistral", "MISTRAL_API_KEY");
  if (mistralKey) {
    try {
      const mistralModule = require("@ai-sdk/mistral");
      const { mistral } = mistralModule;
      languageModels["mistral-large"] = mistral("mistral-large-latest", { apiKey: mistralKey });
      languageModels["mistral-medium"] = mistral("mistral-medium-latest", { apiKey: mistralKey });
    } catch (error) {
      console.warn("Mistral provider not available:", error);
    }
  }

  // Fallback: if a model is requested but not available, use gateway default
  return new Proxy(languageModels, {
    get(target, prop: string) {
      if (prop in target) {
        return target[prop];
      }
      // Fallback to gateway for unknown models
      console.warn(`Model ${prop} not configured, using gateway default`);
      return gateway.languageModel("xai/grok-2-vision-1212");
    },
  });
}

// Initialize API key cache from database on startup (non-blocking)
if (!isTestEnvironment) {
  import("../db/queries").then(({ getAllApiKeyConfigs }) => {
    getAllApiKeyConfigs()
      .then((configs) => {
        configs.forEach((config) => {
          if (config.isActive) {
            updateApiKeyCache(config.provider, config.apiKey);
          }
        });
      })
      .catch((error) => {
        console.warn("Failed to load API keys from database on startup:", error);
      });
  });
}

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: initializeProviders(),
    });
