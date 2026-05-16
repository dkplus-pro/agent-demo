import { AgentPluginRegistry } from '@ai-mind-clone/agent-core';

import type { ServerConfig } from '../config.ts';
import { echoPlugin } from './echo.ts';
import { createLlmChatPlugin } from './llm-chat.ts';
import { mockSearchPlugin } from './mock-search.ts';
import { timePlugin } from './time.ts';

export function createPluginRegistry(config: ServerConfig) {
  const registry = new AgentPluginRegistry();

  registry.register(echoPlugin);
  registry.register(timePlugin);
  registry.register(mockSearchPlugin);
  registry.register(createLlmChatPlugin(config.llmChat));

  return registry;
}
