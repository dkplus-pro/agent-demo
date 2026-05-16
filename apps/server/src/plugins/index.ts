import { AgentPluginRegistry } from '@ai-mind-clone/agent-core';

import type { ServerConfig } from '../config.ts';
import { createLlmProvider } from '../providers/llm/index.ts';
import { echoPlugin } from './echo.ts';
import { createLlmChatPlugin } from './llm-chat.ts';
import { mockSearchPlugin } from './mock-search.ts';
import { timePlugin } from './time.ts';

export function createPluginRegistry(config: ServerConfig) {
  const registry = new AgentPluginRegistry();

  registry.register(echoPlugin);
  registry.register(timePlugin);
  registry.register(mockSearchPlugin);
  registry.register(createLlmChatPlugin(createLlmProvider(config.llmChat)));

  return registry;
}
