<h1 align="center">Lea — Multi-Mode Agent</h1>

Lea is a multi-mode agent (Coding, Browser, CLI, Auto) built on Next.js App Router, AI SDK v6, and shadcn/ui, with tool approvals, admin-configurable tools/API keys, and model routing.

## Quick Start

1) Install deps & migrate  
```bash
pnpm install
pnpm db:migrate
```

2) Env vars (`.env.local`) — minimum:
- `AUTH_SECRET` / `AUTH_URL`
- `POSTGRES_URL`
- Model keys (any you have): `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `MISTRAL_API_KEY`
- Browser automation (optional): `BROWSER_USE_API_KEY`
- GitHub adapter (optional): `GITHUB_TOKEN`

3) Run dev  
```bash
pnpm dev
```

## Modes & Routing
- Modes: Coding, Browser, CLI, Auto (selector in chat header). Auto routes by task signals (vision → GPT-4o, reasoning → GPT-4.1, fast/default → Gemini 2 Flash; CLI forced → GPT-4.1; Browser forced → GPT-4o).
- Prompts: Comet (browser), Cursor (coding), Claude Code (CLI), Lea system base.

## Tools
- Core: search (Tavily-ready), filesystem (approval for writes), code execution (approval), analysis, weather.
- Browser: `browserUseTask` (Browser Use Cloud, needs `BROWSER_USE_API_KEY`), `browserAction` fallback.
- CLI: `shellTask` allowlist (ls/cat/pwd/stat/find/head/tail/grep, approval).
- Adapters (approval): GitHub live (`GITHUB_TOKEN`), stubs for Notion, Drive, Figma, Vercel, Canva with guidance.
- Admin → Tools toggles enable/approval per tool.

## Models
Included IDs: auto-model, xAI Grok, OpenAI (gpt-4o/4o-mini/4.1/4.1-mini/o3-mini), Anthropic (Opus, Sonnet, Haiku, 3.5 Sonnet/Haiku), Google (Gemini 3 Pro alias, 2.0 Flash, 1.5 Pro/Flash), Mistral (Large/Medium). Add keys to activate.

## Browser Use Cloud
Install already added: `browser-use-sdk`. Set `BROWSER_USE_API_KEY`. Tool `browserUseTask` will run tasks via Browser Use Cloud API.

## Deployment (Vercel)
- Ensure env vars set in Vercel: `POSTGRES_URL`, auth vars, model keys, optional `BROWSER_USE_API_KEY`, `GITHUB_TOKEN`.
- Prisma/Drizzle migrations: run `pnpm db:migrate` locally and push DB before deploy.
- Edge/runtime: Next.js App Router; no custom server required.

## Safety & Approvals
- Filesystem writes, code execution, shell tasks, adapters, browser-use are approval-gated.
- Search falls back to mock when no key; tools return clear errors when creds missing.

## Notes
- Deep research/shop research tools not added yet; can be added as chained search+summarize flows.
- No canvas UI yet; can be added if desired.
