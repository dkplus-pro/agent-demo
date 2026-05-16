import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AgentPluginRegistry } from './registry.ts';
import { AgentRuntime } from './runtime.ts';
import type { AgentPlugin } from './types.ts';

describe('AgentRuntime', () => {
  it('runs selected plugins with merged config and trace events', async () => {
    const registry = new AgentPluginRegistry();
    const plugin: AgentPlugin = {
      manifest: {
        name: 'test-plugin',
        description: 'Test plugin',
        capabilities: ['test'],
        enabled: true,
        inputSchema: {
          minLength: 1,
        },
        defaultConfig: {
          prefix: 'default',
        },
      },
      async execute(_context, input) {
        return {
          output: `${input.config.prefix}:${input.input}`,
          data: {
            config: input.config,
          },
        };
      },
    };

    registry.register(plugin);

    const runtime = new AgentRuntime(registry);
    const response = await runtime.run({
      input: 'hello',
      pluginNames: ['test-plugin'],
      pluginConfigs: {
        'test-plugin': {
          prefix: 'custom',
        },
      },
    });

    assert.equal(response.output, 'custom:hello');
    assert.equal(response.events[0]?.type, 'run.started');
    assert.equal(response.events.at(-1)?.type, 'run.completed');
    assert.equal(response.events.some((event) => event.type === 'plugin.completed' && event.durationMs !== undefined), true);
  });

  it('rejects input that violates plugin schema', async () => {
    const registry = new AgentPluginRegistry();

    registry.register({
      manifest: {
        name: 'strict-plugin',
        description: 'Strict plugin',
        capabilities: ['test'],
        enabled: true,
        inputSchema: {
          minLength: 3,
        },
      },
      async execute() {
        return {
          output: 'unreachable',
        };
      },
    });

    const runtime = new AgentRuntime(registry);

    await assert.rejects(
      () =>
        runtime.run({
          input: 'no',
          pluginNames: ['strict-plugin'],
        }),
      /at least 3 characters/,
    );
  });
});
