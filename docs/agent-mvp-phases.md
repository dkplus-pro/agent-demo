# Agent MVP Phase Record

This document records the first five implementation phases for the Agent MVP in this monorepo.

## Phase 1: Monorepo Skeleton

Goal: add the Agent MVP app/package structure without implementing business behavior.

Added apps:

- `apps/web`: React + Vite + Tailwind CSS + Zustand + axios web app
- `apps/server`: Koa + TypeScript backend
- `apps/idl`: OpenAPI source and generation scripts

Added packages:

- `packages/shared`: shared generated API types and cross-side utilities
- `packages/agent-core`: agent runtime, plugin contracts, and plugin registry

Root scripts added:

```bash
pnpm dev:web
pnpm dev:server
pnpm idl:gen
```

Turbo tasks added:

- `dev`
- `gen`

## Phase 2: OpenAPI IDL And Generated Code

Goal: make OpenAPI the HTTP contract source of truth and generate frontend/backend/shared TypeScript code from it.

OpenAPI source:

```text
apps/idl/src/openapi/openapi.json
```

Initial API surface:

```text
GET  /api/health
GET  /api/agent/plugins
POST /api/agent/runs
```

Generated outputs:

```text
packages/shared/src/generated/openapi.ts
apps/web/src/generated/api-client.ts
apps/server/src/generated/api-contract.ts
```

Generation command:

```bash
pnpm idl:gen
```

Design note: the generator is intentionally lightweight and local. It reads OpenAPI components/paths and emits shared types, an axios client for the web app, and a server route contract.

## Phase 3: Koa Backend MVP

Goal: implement the backend API and agent runtime path.

Server layers:

```text
apps/server/src/
  app.ts
  config.ts
  main.ts
  middleware/
  routes/
  modules/agent/
  plugins/
```

Agent core features:

- `AgentPlugin` contract
- `AgentPluginRegistry`
- `AgentRuntime`
- trace events
- serial plugin execution

Initial built-in plugins:

- `echo`: returns input text
- `time`: returns server time
- `mock-search`: returns deterministic mock search results

Backend endpoints implemented:

```text
GET  /api/health
GET  /api/agent/plugins
POST /api/agent/runs
```

Validation and middleware:

- JSON request parsing
- CORS
- centralized error handling
- request body validation for agent runs

## Phase 4: React Web MVP

Goal: implement a usable Agent MVP web interface connected to the generated axios client.

Frontend structure:

```text
apps/web/src/
  app/
  features/agent/
  generated/
  shared/ui/
  stores/
```

User-facing features:

- plugin list loaded from `GET /api/agent/plugins`
- selectable plugins
- prompt input
- run action calling `POST /api/agent/runs`
- run output display
- trace event display
- server health label
- loading and error states

State management:

```text
apps/web/src/stores/agent-store.ts
```

API access:

```text
apps/web/src/generated/api-client.ts
```

Styling:

- Tailwind CSS v4
- `@tailwindcss/vite`
- `apps/web/src/styles.css`

## Phase 5: Plugin System Enhancement

Goal: make plugins more self-describing and configurable while keeping new plugin registration simple.

OpenAPI extensions:

- `AgentPluginManifest.inputSchema`
- `AgentPluginManifest.defaultConfig`
- `AgentRunRequest.pluginConfigs`
- `AgentTraceEvent.durationMs`

Agent core enhancements:

- plugin input schema validation
- default config and request config merge
- unknown plugin errors as bad requests
- schema validation errors as bad requests
- trace event duration recording
- plugin start events include resolved config

Backend plugin enhancements:

- `echo` supports `uppercase`
- `mock-search` supports `limit`
- all built-in plugins expose `inputSchema`
- all configurable plugins expose `defaultConfig`

Frontend enhancements:

- plugin panel displays input constraints
- selected plugin configs can be edited
- run requests submit `pluginConfigs`
- trace panel displays plugin duration

Current plugin registration path:

```text
apps/server/src/plugins/index.ts
```

New plugins should implement `AgentPlugin` and register with `AgentPluginRegistry`. Once registered, their manifest appears in the web plugin panel through `GET /api/agent/plugins`.

## Verification Summary

Commands used during the first five phases:

```bash
pnpm idl:gen
pnpm --filter @ai-mind-clone/idl typecheck
pnpm --filter @ai-mind-clone/idl lint
pnpm --filter @ai-mind-clone/agent-core typecheck
pnpm --filter @ai-mind-clone/agent-core lint
pnpm --filter @ai-mind-clone/agent-core build
pnpm --filter @ai-mind-clone/server typecheck
pnpm --filter @ai-mind-clone/server lint
pnpm --filter @ai-mind-clone/server build
pnpm --filter @ai-mind-clone/web typecheck
pnpm --filter @ai-mind-clone/web lint
pnpm --filter @ai-mind-clone/web build
```

Manual API smoke tests covered:

- health check
- plugin manifest list
- successful agent run
- plugin config behavior
- plugin schema validation failure returning `400 Bad Request`

