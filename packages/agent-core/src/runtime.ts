import { randomUUID } from 'node:crypto';

import type { AgentRunResponse, AgentTraceEvent } from '@ai-mind-clone/shared/generated/openapi';

import { AgentPluginRegistry } from './registry.ts';
import type { AgentRuntimeInput, AgentRuntimeRunOptions } from './types.ts';
import { resolvePluginConfig, validatePluginInput } from './validation.ts';

export class AgentRuntime {
  private readonly registry: AgentPluginRegistry;

  constructor(registry: AgentPluginRegistry) {
    this.registry = registry;
  }

  async run(input: AgentRuntimeInput, options: AgentRuntimeRunOptions = {}): Promise<AgentRunResponse> {
    const runId = randomUUID();
    const events: AgentTraceEvent[] = [];

    const emit = async (event: Omit<AgentTraceEvent, 'id' | 'timestamp'>) => {
      const traceEvent: AgentTraceEvent = {
        ...event,
        id: randomUUID(),
        timestamp: new Date().toISOString(),
      };

      events.push(traceEvent);
      await options.onEvent?.(traceEvent);
      return traceEvent;
    };

    await emit({
      type: 'run.started',
      message: 'Agent run started.',
    });

    try {
      const plugins = this.registry.resolve(input.pluginNames);
      const outputs: string[] = [];

      for (const plugin of plugins) {
        const startedAt = performance.now();
        const config = resolvePluginConfig(plugin, input.pluginConfigs?.[plugin.manifest.name]);

        validatePluginInput(plugin, input.input, input.metadata);

        await emit({
          type: 'plugin.started',
          pluginName: plugin.manifest.name,
          message: `Plugin ${plugin.manifest.name} started.`,
          data: {
            config,
          },
        });

        const result = await plugin.execute(
          {
            runId,
            metadata: input.metadata,
            emit,
          },
          {
            input: input.input,
            metadata: input.metadata,
            config,
          },
        );

        outputs.push(result.output);

        await emit({
          type: 'plugin.completed',
          pluginName: plugin.manifest.name,
          message: `Plugin ${plugin.manifest.name} completed.`,
          data: result.data,
          durationMs: Math.round(performance.now() - startedAt),
        });
      }

      await emit({
        type: 'run.completed',
        message: 'Agent run completed.',
      });

      return {
        runId,
        output: outputs.join('\n\n'),
        events,
      };
    } catch (error) {
      await emit({
        type: 'run.failed',
        message: error instanceof Error ? error.message : 'Agent run failed.',
      });

      throw error;
    }
  }
}
