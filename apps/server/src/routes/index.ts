import type Koa from 'koa';

import type { ServerConfig } from '../config.ts';
import { createAgentRouter } from '../modules/agent/router.ts';
import { createPluginRegistry } from '../plugins/index.ts';
import { createHealthRouter } from './health.ts';

export function registerRoutes(app: Koa, config: ServerConfig) {
  const registry = createPluginRegistry(config);
  const healthRouter = createHealthRouter(config);
  const agentRouter = createAgentRouter(registry);

  app.use(healthRouter.routes());
  app.use(healthRouter.allowedMethods());
  app.use(agentRouter.routes());
  app.use(agentRouter.allowedMethods());
}
