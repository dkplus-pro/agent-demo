import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

type JsonRecord = Record<string, unknown>;

const port = 3100;
const baseUrl = `http://127.0.0.1:${port}`;
const serverProcess = spawn('pnpm', ['--filter', '@ai-mind-clone/server', 'dev'], {
  cwd: process.cwd(),
  detached: true,
  env: {
    ...process.env,
    PORT: String(port),
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';

serverProcess.stdout.on('data', (chunk) => {
  serverOutput += String(chunk);
});

serverProcess.stderr.on('data', (chunk) => {
  serverOutput += String(chunk);
});

async function main() {
  try {
    await waitForHealth();
    await assertHealth();
    await assertPlugins();
    await assertAgentRun();
    await assertValidationError();

    console.log('Agent E2E smoke test passed.');
  } finally {
    await stopServer();
  }
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

  assert.deepEqual(pluginNames, ['echo', 'time', 'mock-search']);
  assert.equal(typeof response.plugins[0]?.inputSchema, 'object');
  assert.equal(typeof response.plugins[0]?.defaultConfig, 'object');
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

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

await main();
