# ai-mind-clone-fe-monorepo

Monorepo for mini programs, shared packages, and the Agent MVP web/server stack.

## Stack

- pnpm workspace for package management
- Turborepo for task orchestration and cache
- TypeScript, ESLint, Prettier, and Stylelint for baseline quality
- uni-app + Vue 3 + Vite for mini programs
- React + Vite + Tailwind CSS + Zustand + axios for the Agent web app
- Koa + TypeScript for the Agent server
- OpenAPI as the HTTP contract source of truth

## Structure

```text
apps/
  web/                 # Agent MVP React web app
  server/              # Agent MVP Koa API
  idl/                 # OpenAPI contract and generation script
  miniapp-main/        # primary uni-app mini program
  miniapp-companion/   # second uni-app mini program

packages/
  agent-core/          # plugin registry, runtime, schema validation
  shared/              # shared generated API types
  request/             # uni.request wrapper and API client utilities
  utils/               # framework-agnostic helper functions
  ui/                  # shared uni-app/Vue components
  tsconfig/            # shared TypeScript configs
  eslint-config/       # shared ESLint flat configs
```

## Setup

```bash
corepack enable
pnpm install
```

Optional local env files:

```bash
cp apps/server/.env.example apps/server/.env.local
cp apps/web/.env.example apps/web/.env.local
```

The web app can use Vite proxy with the default empty `VITE_API_BASE_URL`.

## Agent MVP

Start the backend:

```bash
pnpm dev:server
```

Start the web app:

```bash
pnpm dev:web
```

Open:

```text
http://localhost:5173/
```

The server listens on:

```text
http://localhost:3000/
```

Current API surface:

```text
GET  /api/health
GET  /api/agent/plugins
POST /api/agent/runs
POST /api/agent/runs/stream
```

`POST /api/agent/runs/stream` returns `text/event-stream` with:

```text
agent.event   # trace event
agent.result  # final AgentRunResponse
agent.error   # stream error payload
```

## IDL

OpenAPI source:

```text
apps/idl/src/openapi/openapi.json
```

Regenerate shared types and generated clients:

```bash
pnpm idl:gen
```

Generated outputs:

```text
packages/shared/src/generated/openapi.ts
apps/web/src/generated/api-client.ts
apps/server/src/generated/api-contract.ts
```

Do not edit generated files manually.

## Agent Plugins

Plugins implement `AgentPlugin` from `@ai-mind-clone/agent-core`.

Each plugin exposes:

```text
manifest.name
manifest.description
manifest.capabilities
manifest.inputSchema
manifest.defaultConfig
execute(context, input)
```

Register server plugins in:

```text
apps/server/src/plugins/index.ts
```

The web app reads plugin manifests from `GET /api/agent/plugins`, so new registered plugins appear in the plugin panel without frontend hardcoding.

### LLM Chat Plugin

The `llm-chat` plugin calls an Anthropic-compatible Messages API.

Configure it with:

```bash
LLM_CHAT_API_KEY=...
LLM_CHAT_BASE_URL=https://api.anthropic.com
LLM_CHAT_MODEL=...
LLM_CHAT_ANTHROPIC_VERSION=2023-06-01
LLM_CHAT_MOCK=false
LLM_CHAT_MOCK_DELAY_MS=700
LLM_CHAT_TIMEOUT_MS=30000
```

Anthropic aliases are also supported:

```bash
ANTHROPIC_API_KEY=...
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_MODEL=...
ANTHROPIC_VERSION=2023-06-01
```

If API key or model is missing, the plugin is still listed but marked disabled and is not selected by default.

Set `LLM_CHAT_MOCK=true` to enable a local mock LLM response. Mock mode does not require an API key or model and emits `llm.delta` trace events so the web UI can exercise streaming output. Use `LLM_CHAT_MOCK_DELAY_MS` or the plugin's `mockDelayMs` config to slow down each mock chunk.

## Commands

Agent MVP:

```bash
pnpm dev:server
pnpm dev:web
pnpm idl:gen
```

Mini programs:

```bash
pnpm dev:main
pnpm dev:companion
```

Quality gates:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Mini program build:

```bash
pnpm build:mp-weixin
```

## Notes

- Configure real WeChat Mini Program app IDs in each mini app's `src/manifest.json`.
- Keep OpenAPI changes and generated files in the same commit.
- Put cross-app API types in `packages/shared`.
- Put agent runtime behavior in `packages/agent-core`; keep `apps/server` focused on HTTP adaptation and server-owned plugins.
