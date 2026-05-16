import { AgentRuntime, type AgentPluginRegistry } from '@ai-mind-clone/agent-core';
import type { AgentPluginListResponse, CreateAgentRunResponse } from '@ai-mind-clone/shared/generated/openapi';
import Router from 'koa-router';

import { apiRoutes } from '../../generated/api-contract.ts';
import { parseAgentRunRequest } from './validation.ts';

export function createAgentRouter(registry: AgentPluginRegistry) {
  const router = new Router();
  const runtime = new AgentRuntime(registry);

  router.get(apiRoutes.listAgentPlugins.path, (context) => {
    context.body = {
      plugins: registry.list(),
    } satisfies AgentPluginListResponse;
  });

  router.post(apiRoutes.createAgentRun.path, async (context) => {
    const request = parseAgentRunRequest(context.request.body);
    const response: CreateAgentRunResponse = await runtime.run(request);

    context.body = response;
  });

  return router;
}
