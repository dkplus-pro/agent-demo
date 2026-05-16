import type { AgentPlugin } from '@ai-mind-clone/agent-core';

import type { LlmProvider } from '../providers/llm/index.ts';

export function createLlmChatPlugin(provider: LlmProvider): AgentPlugin {
  const enabled = provider.isEnabled();

  return {
    manifest: {
      name: 'llm-chat',
      description: enabled ? `Calls the ${provider.name} LLM provider.` : 'Calls an LLM provider when API key and model are configured.',
      capabilities: provider.capabilities,
      enabled,
      inputSchema: {
        minLength: 1,
        maxLength: 12_000,
      },
      defaultConfig: {
        model: provider.getDefaultModel(),
        temperature: 0.2,
        maxTokens: 800,
        mockDelayMs: provider.getDefaultMockDelayMs(),
        systemPrompt: 'You are a concise, practical assistant.',
      },
    },
    async execute(context, input) {
      const model = stringConfig(input.config.model);
      const systemPrompt = stringConfig(input.config.systemPrompt) || 'You are a concise, practical assistant.';
      const temperature = numberConfig(input.config.temperature, 0.2);
      const maxTokens = numberConfig(input.config.maxTokens, 800);
      const mockDelayMs = numberConfig(input.config.mockDelayMs, provider.getDefaultMockDelayMs());

      return provider.chat({
        input: input.input,
        model,
        systemPrompt,
        temperature,
        maxTokens,
        mockDelayMs,
        context,
      });
    },
  };
}

function stringConfig(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberConfig(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
