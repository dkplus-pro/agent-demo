import type { AgentPlugin } from '@ai-mind-clone/agent-core';

export const echoPlugin: AgentPlugin = {
  manifest: {
    name: 'echo',
    description: 'Returns the user input unchanged.',
    capabilities: ['debug', 'text'],
    enabled: true,
  },
  async execute(_context, input) {
    return {
      output: input.input,
      data: {
        length: input.input.length,
      },
    };
  },
};
