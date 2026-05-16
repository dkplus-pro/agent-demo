import type Koa from 'koa';

import type { ServerConfig } from '../config.ts';
import { createConversationRouter } from '../modules/conversations/router.ts';
import { createAgentRouter } from '../modules/agent/router.ts';
import { createPluginRegistry } from '../plugins/index.ts';
import { AgentFileStore } from '../storage/file-store.ts';
import { createHealthRouter } from './health.ts';

export function registerRoutes(app: Koa, config: ServerConfig) {
  const store = new AgentFileStore(config.storagePath);
  const registry = createPluginRegistry(config);
  const healthRouter = createHealthRouter(config);
  const conversationRouter = createConversationRouter(store);
  const agentRouter = createAgentRouter(registry, store);

  app.use(healthRouter.routes());
  app.use(healthRouter.allowedMethods());
  app.use(conversationRouter.routes());
  app.use(conversationRouter.allowedMethods());
  app.use(agentRouter.routes());
  app.use(agentRouter.allowedMethods());
}
