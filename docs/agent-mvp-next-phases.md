# Agent MVP Follow-up Phase Record

This document records the follow-up work after the initial five MVP phases.

## Phase A: Agent Build And E2E Verification

Goal: separate Agent MVP validation from the existing mini program build flow and add a reliable smoke test.

Root scripts added:

```bash
pnpm build:agent
pnpm test:e2e:agent
```

`build:agent` covers only Agent-related workspaces:

- `@ai-mind-clone/idl`
- `@ai-mind-clone/shared`
- `@ai-mind-clone/agent-core`
- `@ai-mind-clone/server`
- `@ai-mind-clone/web`

E2E smoke test:

```text
scripts/agent-e2e-smoke.ts
```

The smoke test:

- starts the Koa server on port `3100`
- waits for `/api/health`
- verifies `/api/agent/plugins`
- verifies `POST /api/agent/runs`
- verifies plugin config behavior
- verifies schema validation returns `400 Bad Request`
- verifies `POST /api/agent/runs/stream`
- shuts down its test server process group

Note: `test:e2e:agent` must run in an environment that allows local port binding.

## Phase B: Anthropic-Compatible LLM Plugin

Goal: add a real LLM plugin path while keeping the existing plugin/runtime architecture.

Plugin:

```text
apps/server/src/plugins/llm-chat.ts
```

Registered as:

```text
llm-chat
```

Protocol:

- Anthropic-compatible Messages API
- `POST /v1/messages`
- `x-api-key` header
- `anthropic-version` header
- top-level `system` field
- `messages` with user input

Configuration:

```bash
LLM_CHAT_API_KEY=
LLM_CHAT_BASE_URL=https://api.anthropic.com
LLM_CHAT_MODEL=
LLM_CHAT_ANTHROPIC_VERSION=2023-06-01
LLM_CHAT_TIMEOUT_MS=30000
```

Anthropic aliases:

```bash
ANTHROPIC_API_KEY=
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_MODEL=
ANTHROPIC_VERSION=2023-06-01
```

GLM TODO placeholder:

```bash
# TODO(GLM): set these to the GLM Anthropic-compatible endpoint, API key, and model you want to test.
# LLM_CHAT_BASE_URL=
# LLM_CHAT_API_KEY=
# LLM_CHAT_MODEL=
```

Behavior:

- if key/model are configured, `llm-chat` is enabled
- if key/model are missing, `llm-chat` is listed but disabled
- disabled plugins are rejected by `AgentPluginRegistry.resolve`

## Phase C: SSE Streaming Runs

Goal: let the web UI receive Agent run progress while the run is still executing.

Backend stream endpoint:

```text
POST /api/agent/runs/stream
```

SSE events:

```text
agent.event   # trace event
agent.result  # final AgentRunResponse
agent.error   # stream error payload
```

Server implementation:

```text
apps/server/src/modules/agent/sse.ts
apps/server/src/modules/agent/router.ts
```

Runtime change:

- `AgentRuntime.run(input, options)`
- `options.onEvent` receives each `AgentTraceEvent`

Frontend implementation:

```text
apps/web/src/features/agent/stream-client.ts
apps/web/src/stores/agent-store.ts
```

Frontend behavior:

- Run button calls the stream endpoint
- a pending run is inserted immediately
- trace events are appended as they arrive
- final result replaces the pending run
- stream errors are surfaced in the store

Current streaming boundary:

- Agent trace/result streaming is implemented
- token-level provider streaming is not implemented yet

## Mock LLM Streaming Switch

Goal: make streaming behavior testable without a real API key or GLM endpoint.

Configuration:

```bash
LLM_CHAT_MOCK=true
```

Mock behavior:

- enables `llm-chat` without API key/model
- returns a deterministic mock LLM response
- emits multiple `llm.delta` trace events
- lets the web UI show output growing over time

OpenAPI change:

```text
AgentTraceEvent.type includes "llm.delta"
```

Frontend behavior:

- when an `llm.delta` event arrives
- and `event.data.delta` is a string
- the store appends the delta to the pending run output

Local mock run:

```bash
LLM_CHAT_MOCK=true pnpm dev:server
pnpm dev:web
```

Then select `llm-chat` in the web UI and run a prompt.

## Verification Summary

Commands used:

```bash
pnpm idl:gen
pnpm build:agent
pnpm test:e2e:agent
pnpm typecheck
pnpm lint
pnpm test
```

Additional E2E coverage:

- stream endpoint emits `agent.event`
- stream endpoint emits `agent.result`
- mock LLM stream emits `llm.delta`
- mock LLM output appears in streamed response

