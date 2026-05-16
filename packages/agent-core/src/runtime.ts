import { randomUUID } from 'node:crypto';

import type { AgentRunResponse, AgentTraceEvent } from '@ai-mind-clone/shared/generated/openapi';

import { AgentPluginRegistry } from './registry.ts';
import type { AgentRuntimeInput } from './types.ts';

export class AgentRuntime {
  private readonly registry: AgentPluginRegistry;

  constructor(registry: AgentPluginRegistry) {
    this.registry = registry;
  }

  async run(input: AgentRuntimeInput): Promise<AgentRunResponse> {
    const runId = randomUUID();
    const events: AgentTraceEvent[] = [];

    const emit = (event: Omit<AgentTraceEvent, 'id' | 'timestamp'>) => {
      const traceEvent: AgentTraceEvent = {
        ...event,
        id: randomUUID(),
        timestamp: new Date().toISOString(),
      };

      events.push(traceEvent);
      return traceEvent;
    };

    emit({
      type: 'run.started',
      message: 'Agent run started.',
    });

    try {
      const plugins = this.registry.resolve(input.pluginNames);
      const outputs: string[] = [];

      for (const plugin of plugins) {
        emit({
          type: 'plugin.started',
          pluginName: plugin.manifest.name,
          message: `Plugin ${plugin.manifest.name} started.`,
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
          },
        );

        outputs.push(result.output);

        emit({
          type: 'plugin.completed',
          pluginName: plugin.manifest.name,
          message: `Plugin ${plugin.manifest.name} completed.`,
          data: result.data,
        });
      }

      emit({
        type: 'run.completed',
        message: 'Agent run completed.',
      });

      return {
        runId,
        output: outputs.join('\n\n'),
        events,
      };
    } catch (error) {
      emit({
        type: 'run.failed',
        message: error instanceof Error ? error.message : 'Agent run failed.',
      });

      throw error;
    }
  }
}
