# Multi-Provider Model Support

Lea now supports multiple AI providers! You can use models from different providers by configuring the appropriate API keys.

## Supported Providers

### 1. xAI Grok (Default - via AI Gateway)
**Always Available** - No API key needed when using Vercel AI Gateway

- **Grok 2 Vision** (`chat-model`) - Multimodal with vision
- **Grok 3 Mini** (`chat-model-reasoning`) - Advanced reasoning

### 2. OpenAI
**Requires:** `OPENAI_API_KEY` in `.env.local`

```bash
OPENAI_API_KEY=sk-...
```

Available Models:
- **GPT-4o** (`openai-gpt-4o`) - Most capable multimodal model
- **GPT-4o Mini** (`openai-gpt-4o-mini`) - Fast and efficient

### 3. Anthropic Claude
**Requires:** `ANTHROPIC_API_KEY` in `.env.local`

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Available Models:
- **Claude Opus 4** (`anthropic-claude-opus-4`) - Most capable with advanced reasoning
- **Claude Sonnet 4** (`anthropic-claude-sonnet-4`) - Balanced performance
- **Claude Haiku** (`anthropic-claude-haiku`) - Fast and efficient

### 4. Google Gemini
**Requires:** `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`

```bash
GOOGLE_GENERATIVE_AI_API_KEY=...
```

Available Models:
- **Gemini 2.0 Flash** (`google-gemini-2-flash`) - Latest fast multimodal model
- **Gemini 1.5 Pro** (`google-gemini-1.5-pro`) - Advanced with long context
- **Gemini 1.5 Flash** (`google-gemini-1.5-flash`) - Fast and efficient

### 5. Mistral
**Requires:** `MISTRAL_API_KEY` in `.env.local`

```bash
MISTRAL_API_KEY=...
```

Available Models:
- **Mistral Large** (`mistral-large`) - Most capable model
- **Mistral Medium** (`mistral-medium`) - Balanced performance

## Setup Instructions

1. **Install Provider Packages** (already installed):
   ```bash
   pnpm install
   ```

2. **Add API Keys** to `.env.local`:
   ```bash
   # OpenAI
   OPENAI_API_KEY=sk-...
   
   # Anthropic
   ANTHROPIC_API_KEY=sk-ant-...
   
   # Google
   GOOGLE_GENERATIVE_AI_API_KEY=...
   
   # Mistral
   MISTRAL_API_KEY=...
   ```

3. **Restart the Server**:
   ```bash
   pnpm dev
   ```

4. **Select Models** in the UI:
   - Click the model selector dropdown
   - Choose from available models (only models with configured API keys will work)

## How It Works

- Models are **automatically detected** based on available API keys
- If an API key is missing, those models won't be initialized (no errors)
- The Lea agent **works with any configured model**
- Models fall back to AI Gateway if not configured

## Model Features

All models support:
- ✅ Text generation
- ✅ Tool calling (for Lea agent tools)
- ✅ Structured output
- ✅ Streaming responses

Some models also support:
- 🖼️ Image input (multimodal)
- 🧠 Advanced reasoning
- 📊 Object generation

## Troubleshooting

**Model not appearing?**
- Check that the API key is set in `.env.local`
- Restart the dev server after adding keys
- Check server logs for provider initialization warnings

**Model not working?**
- Verify API key is valid
- Check API key has sufficient credits/quota
- Review server logs for specific error messages

**Want to add more providers?**
- Install the provider package: `pnpm add @ai-sdk/[provider]`
- Add models to `lib/ai/models.ts`
- Add initialization in `lib/ai/providers.ts`
- Add API key to `.env.local`

