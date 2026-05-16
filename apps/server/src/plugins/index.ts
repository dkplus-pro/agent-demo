import { AgentPluginRegistry } from '@ai-mind-clone/agent-core';

import { echoPlugin } from './echo.ts';
import { mockSearchPlugin } from './mock-search.ts';
import { timePlugin } from './time.ts';

export function createPluginRegistry() {
  const registry = new AgentPluginRegistry();

  registry.register(echoPlugin);
  registry.register(timePlugin);
  registry.register(mockSearchPlugin);

  return registry;
}
