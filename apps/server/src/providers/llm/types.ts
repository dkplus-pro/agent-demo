import type { AgentPlugin } from '@ai-mind-clone/agent-core';

export type LlmProviderConfig = {
  provider: 'anthropic-compatible';
  apiKey?: string;
  baseUrl: string;
  model?: string;
  anthropicVersion: string;
  mockEnabled: boolean;
  mockDelayMs: number;
  timeoutMs: number;
};

export type LlmChatInput = {
  input: string;
  model?: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  mockDelayMs: number;
  context: Parameters<AgentPlugin['execute']>[0];
};

export type LlmChatOutput = {
  output: string;
  data?: Record<string, unknown>;
};

export type LlmProvider = {
  name: string;
  capabilities: string[];
  isEnabled: () => boolean;
  getDefaultModel: () => string;
  getDefaultMockDelayMs: () => number;
  chat: (input: LlmChatInput) => Promise<LlmChatOutput>;
};
