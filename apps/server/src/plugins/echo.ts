import type { AgentPlugin } from '@ai-mind-clone/agent-core';

export const echoPlugin: AgentPlugin = {
  manifest: {
    name: 'echo',
    description: 'Returns the user input unchanged.',
    capabilities: ['debug', 'text'],
    enabled: true,
    inputSchema: {
      minLength: 1,
      maxLength: 4000,
    },
    defaultConfig: {
      uppercase: false,
    },
  },
  async execute(_context, input) {
    const uppercase = input.config.uppercase === true;
    const output = uppercase ? input.input.toUpperCase() : input.input;

    return {
      output,
      data: {
        length: input.input.length,
        uppercase,
      },
    };
  },
};
