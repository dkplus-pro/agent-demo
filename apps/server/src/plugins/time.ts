import type { AgentPlugin } from '@ai-mind-clone/agent-core';

export const timePlugin: AgentPlugin = {
  manifest: {
    name: 'time',
    description: 'Returns the current server time.',
    capabilities: ['time'],
    enabled: true,
    inputSchema: {
      minLength: 1,
    },
    defaultConfig: {
      format: 'iso',
    },
  },
  async execute() {
    const now = new Date();

    return {
      output: `Server time: ${now.toISOString()}`,
      data: {
        iso: now.toISOString(),
        unixMs: now.getTime(),
      },
    };
  },
};
