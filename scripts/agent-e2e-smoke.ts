import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

type JsonRecord = Record<string, unknown>;

const port = 3100;
const baseUrl = `http://127.0.0.1:${port}`;
const storageDir = mkdtempSync(join(tmpdir(), 'agent-e2e-'));
const storagePath = join(storageDir, 'store.json');
let serverProcess = createServerProcess(false);
let serverOutput = '';

async function main() {
  try {
    await waitForHealth();
    await assertHealth();
    await assertPlugins();
    await assertAgentRun();
    await assertPersistence();
    await assertAgentRunStream();
    await assertValidationError();
    await restartServer(true);
    await assertMockLlmStream();

    console.log('Agent E2E smoke test passed.');
  } finally {
    await stopServer();
    rmSync(storageDir, { recursive: true, force: true });
  }
}

function createServerProcess(mockEnabled: boolean) {
  const child = spawn('pnpm', ['--filter', '@ai-mind-clone/server', 'dev'], {
    cwd: process.cwd(),
    detached: true,
    env: {
      ...process.env,
      AGENT_STORAGE_PATH: storagePath,
      LLM_CHAT_MOCK: String(mockEnabled),
      PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => {
    serverOutput += String(chunk);
  });

  child.stderr.on('data', (chunk) => {
    serverOutput += String(chunk);
  });

  return child;
}

async function waitForHealth() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 10_000) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Server exited before becoming ready.\n${serverOutput}`);
    }

    try {
      const response = await fetch(`${baseUrl}/api/health`);

      if (response.ok) {
        return;
      }
    } catch {
      // Retry until timeout.
    }

    await delay(100);
  }

  throw new Error(`Timed out waiting for server.\n${serverOutput}`);
}

async function assertHealth() {
  const health = await getJson<JsonRecord>('/api/health');

  assert.equal(health.ok, true);
  assert.equal(health.service, 'agent-mvp-server');
}

async function assertPlugins() {
  const response = await getJson<{ plugins: JsonRecord[] }>('/api/agent/plugins');
  const pluginNames = response.plugins.map((plugin) => plugin.name);
  const llmChatPlugin = response.plugins.find((plugin) => plugin.name === 'llm-chat');

  assert.deepEqual(pluginNames, ['echo', 'time', 'mock-search', 'llm-chat']);
  assert.equal(typeof response.plugins[0]?.inputSchema, 'object');
  assert.equal(typeof response.plugins[0]?.defaultConfig, 'object');
  assert.equal(llmChatPlugin?.enabled, false);
  assert.equal(typeof llmChatPlugin?.defaultConfig, 'object');
}

async function assertAgentRun() {
  const response = await postJson<{ output: string; events: JsonRecord[] }>('/api/agent/runs', {
    input: 'agent e2e',
    pluginNames: ['echo', 'mock-search'],
    pluginConfigs: {
      echo: {
        uppercase: true,
      },
      'mock-search': {
        limit: 1,
      },
    },
  });

  assert.match(response.output, /AGENT E2E/);
  assert.match(response.output, /Agent MVP architecture note/);
  assert.equal(response.events.some((event) => event.type === 'plugin.completed' && typeof event.durationMs === 'number'), true);
}

async function assertPersistence() {
  const conversations = await getJson<{ conversations: JsonRecord[] }>('/api/conversations');

  assert.equal(conversations.conversations.length >= 1, true);

  const conversationId = String(conversations.conversations[0]?.id);
  const detail = await getJson<{ messages: JsonRecord[]; runs: JsonRecord[] }>(`/api/conversations/${conversationId}`);
  const messages = await getJson<{ messages: JsonRecord[] }>(`/api/conversations/${conversationId}/messages`);

  assert.equal(detail.messages.length >= 2, true);
  assert.equal(detail.runs.length >= 1, true);
  assert.equal(messages.messages.length, detail.messages.length);
}

async function assertValidationError() {
  const response = await fetch(`${baseUrl}/api/agent/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: 'x',
      pluginNames: ['mock-search'],
    }),
  });

  const body = (await response.json()) as JsonRecord;

  assert.equal(response.status, 400);
  assert.match(String(body.message), /at least 2 characters/);
}

async function assertAgentRunStream() {
  const response = await fetch(`${baseUrl}/api/agent/runs/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: 'stream e2e',
      pluginNames: ['echo'],
      pluginConfigs: {
        echo: {
          uppercase: true,
        },
      },
    }),
  });

  assert.equal(response.ok, true);
  assert.equal(response.headers.get('content-type')?.startsWith('text/event-stream'), true);

  const body = await readStreamText(response);

  assert.match(body, /event: agent\.event/);
  assert.match(body, /event: agent\.result/);
  assert.match(body, /STREAM E2E/);
}

async function assertMockLlmStream() {
  const plugins = await getJson<{ plugins: JsonRecord[] }>('/api/agent/plugins');
  const llmChatPlugin = plugins.plugins.find((plugin) => plugin.name === 'llm-chat');

  assert.equal(llmChatPlugin?.enabled, true);

  const response = await fetch(`${baseUrl}/api/agent/runs/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: 'mock stream',
      pluginNames: ['llm-chat'],
    }),
  });

  assert.equal(response.ok, true);

  const body = await readStreamText(response);

  assert.match(body, /event: agent\.event/);
  assert.match(body, /llm\.delta/);
  assert.match(body, /Mock LLM response/);
}

async function getJson<T>(path: string) {
  const response = await fetch(`${baseUrl}${path}`);

  assert.equal(response.ok, true, `${path} failed with ${response.status}`);

  return (await response.json()) as T;
}

async function postJson<T>(path: string, body: JsonRecord) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  assert.equal(response.ok, true, `${path} failed with ${response.status}`);

  return (await response.json()) as T;
}

async function readStreamText(response: Response) {
  if (!response.body) {
    return '';
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let body = '';

  while (true) {
    try {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      body += decoder.decode(value, { stream: true });
    } catch (error) {
      if (error instanceof TypeError && error.message === 'terminated' && body.length > 0) {
        break;
      }

      throw error;
    }
  }

  body += decoder.decode();
  return body;
}

async function stopServer() {
  if (serverProcess.exitCode !== null) {
    return;
  }

  try {
    process.kill(-serverProcess.pid, 'SIGTERM');
  } catch {
    serverProcess.kill('SIGTERM');
  }

  await Promise.race([
    new Promise<void>((resolve) => {
      serverProcess.once('exit', () => resolve());
    }),
    delay(2_000).then(() => {
      try {
        process.kill(-serverProcess.pid, 'SIGKILL');
      } catch {
        serverProcess.kill('SIGKILL');
      }
    }),
  ]);
}

async function restartServer(mockEnabled: boolean) {
  await stopServer();
  serverOutput = '';
  serverProcess = createServerProcess(mockEnabled);
  await waitForHealth();
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

await main();
