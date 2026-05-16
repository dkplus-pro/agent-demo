import type { AgentPlugin } from '@ai-mind-clone/agent-core';

export const mockSearchPlugin: AgentPlugin = {
  manifest: {
    name: 'mock-search',
    description: 'Returns deterministic mock search results for framework testing.',
    capabilities: ['search', 'mock-data'],
    enabled: true,
    inputSchema: {
      minLength: 2,
      maxLength: 500,
    },
    defaultConfig: {
      limit: 2,
    },
  },
  async execute(_context, input) {
    const normalizedInput = input.input.trim();
    const limit = typeof input.config.limit === 'number' ? input.config.limit : 2;
    const results = [
      {
        title: 'Agent MVP architecture note',
        snippet: `Mock result for "${normalizedInput}" covering plugin runtime design.`,
      },
      {
        title: 'OpenAPI contract',
        snippet: 'Mock result showing the generated API contract is available to both clients and server.',
      },
    ].slice(0, Math.max(1, Math.min(limit, 2)));

    return {
      output: results.map((result, index) => `${index + 1}. ${result.title}: ${result.snippet}`).join('\n'),
      data: {
        results,
        limit,
      },
    };
  },
};
