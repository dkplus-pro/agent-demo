import type { HealthResponse } from '@ai-mind-clone/shared/generated/openapi';
import Router from 'koa-router';

import type { ServerConfig } from '../config.ts';
import { apiRoutes } from '../generated/api-contract.ts';

export function createHealthRouter(config: ServerConfig) {
  const router = new Router();

  router.get(apiRoutes.getHealth.path, (context) => {
    context.body = {
      ok: true,
      service: config.serviceName,
      version: '0.1.0',
    } satisfies HealthResponse;
  });

  return router;
}
