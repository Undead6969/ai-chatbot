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
- Modes: Coding, Browser, CLI, Auto (selector in chat header). Auto routes between Lea 1.5 Lite (Gemini 2.5 Flash alias) for fast/default and Lea 2.0 (Gemini 3 Pro alias to 1.5 Pro) for vision/reasoning/CLI/browser tasks.
- Prompts: Comet (browser), Cursor (coding), Claude Code (CLI), Lea system base.

## Tools
- Core: search (Tavily-ready), filesystem (approval for writes), code execution (approval), analysis, weather.
- Browser: `browserUseTask` (Browser Use Cloud, needs `BROWSER_USE_API_KEY`), `browserAction` fallback.
- CLI: `shellTask` allowlist (ls/cat/pwd/stat/find/head/tail/grep, approval).
- Adapters (approval): GitHub live (`GITHUB_TOKEN`), stubs for Notion, Drive, Figma, Vercel, Canva with guidance.
- Admin → Tools toggles enable/approval per tool.

## Models
- Lea 1.5 Lite → `google-gemini-2.5-flash` (alias to 2.0 flash exp)
- Lea 2.0 → `google-gemini-3-pro` (alias to 1.5 Pro until 3 Pro GA)
- Auto → routes between the above.

## Browser Use Cloud
Install already added: `browser-use-sdk`. Set `BROWSER_USE_API_KEY`. Tool `browserUseTask` will run tasks via Browser Use Cloud API (Chromium automation).

## OAuth adapters
- Start URL: `/api/oauth/<provider>/start` → redirects to provider.
- Callback: `/api/oauth/<provider>/callback` stores tokens in DB for adapters (`adapter-<id>`). Providers wired: github, notion, google-drive, figma, vercel, canva. Set client credentials (e.g., `GITHUB_OAUTH_CLIENT_ID` / `_SECRET`, `GOOGLE_DRIVE_CLIENT_ID` / `_SECRET`, etc.).

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
