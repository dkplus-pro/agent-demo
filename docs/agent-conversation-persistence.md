# Agent Conversation Persistence

This document records the conversation persistence work added after the streaming mock MVP.

## Goal

Persist Agent run history on the backend and make saved conversations visible in the web UI.

The MVP intentionally uses a local JSON file store instead of a database. This keeps the current phase lightweight while preserving the backend storage boundary so it can later be replaced by SQLite, Postgres, or another durable store.

## Backend

Storage files:

```text
apps/server/src/storage/file-store.ts
apps/server/src/storage/types.ts
```

Conversation routes:

```text
apps/server/src/modules/conversations/router.ts
```

Route registration:

```text
apps/server/src/routes/index.ts
```

The backend creates one `AgentFileStore` instance from server config and shares it between conversation routes and agent run routes.

Default storage path:

```text
apps/server/data/agent-store.json
```

Environment override:

```bash
AGENT_STORAGE_PATH=/absolute/path/to/agent-store.json
```

Ignored local data:

```text
apps/server/data/*.json
apps/server/data/*.sqlite
apps/server/data/*.sqlite-*
```

## API

OpenAPI source:

```text
apps/idl/src/openapi/openapi.json
```

New conversation endpoints:

```text
GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/{conversationId}
DELETE /api/conversations/{conversationId}
GET    /api/conversations/{conversationId}/messages
```

Run request/response changes:

- `AgentRunRequest.conversationId` is optional
- `AgentRunResponse.conversationId` is required
- if no `conversationId` is provided, the server creates a new conversation
- if a `conversationId` is provided, the run appends to that conversation

Generated files:

```text
packages/shared/src/generated/openapi.ts
apps/web/src/generated/api-client.ts
apps/server/src/generated/api-contract.ts
```

Generation command:

```bash
pnpm idl:gen
```

## Persisted Data

The file store persists:

- conversations: id, title, createdAt, updatedAt
- messages: id, conversationId, role, content, runId, createdAt
- runs: id, conversationId, input, output, status, pluginNames, pluginConfigs, events, createdAt, completedAt

Both normal and streaming agent runs are persisted.

For each successful run:

1. ensure or create conversation
2. create a run record with `running` status
3. add a user message
4. execute the runtime
5. complete the run with output/events
6. add an assistant message

For failed stream runs, the run is marked `failed`.

## Frontend

Conversation panel:

```text
apps/web/src/features/agent/ConversationPanel.tsx
```

State changes:

```text
apps/web/src/stores/agent-store.ts
```

Workspace integration:

```text
apps/web/src/features/agent/AgentWorkspace.tsx
```

Web UI behavior:

- loads conversation list on startup
- supports refresh
- supports starting a new blank conversation
- supports selecting an existing conversation
- supports deleting a conversation
- selecting a conversation loads its persisted runs into the result panel
- new streamed runs include the active `conversationId`
- if no conversation is active, the server creates one and returns its id

## Verification

Commands run:

```bash
pnpm idl:gen
pnpm --filter @ai-mind-clone/server typecheck
pnpm --filter @ai-mind-clone/web typecheck
pnpm --filter @ai-mind-clone/agent-core typecheck
pnpm lint
pnpm build:agent
pnpm test:e2e:agent
```

E2E additions:

```text
scripts/agent-e2e-smoke.ts
```

The smoke test now uses a temporary `AGENT_STORAGE_PATH` and verifies:

- conversation list after an agent run
- conversation detail contains messages and runs
- conversation messages endpoint returns persisted messages
- stream mock behavior still emits `llm.delta` and `agent.result`

## Current Limits

- storage is local JSON and not safe for concurrent multi-process writes
- no pagination yet for conversations, messages, or runs
- no rename/edit conversation title action yet
- failed non-stream runs are not deeply modeled beyond the current error path
- provider token streaming is still mocked through `llm.delta`; real Anthropic-compatible token streaming remains a later phase

## Related Later Change

After this persistence phase, LLM provider calls were moved behind a provider boundary:

```text
apps/server/src/providers/llm/
```

Conversation persistence is independent of that provider layer. Runs continue to persist the final output and trace events regardless of which LLM provider produced them.
