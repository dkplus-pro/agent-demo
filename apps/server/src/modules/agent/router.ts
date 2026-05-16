import { AgentRuntime, type AgentPluginRegistry } from '@ai-mind-clone/agent-core';
import type { AgentPluginListResponse, AgentRunResponse } from '@ai-mind-clone/shared/generated/openapi';
import Router from 'koa-router';

import { apiRoutes } from '../../generated/api-contract.ts';
import type { AgentFileStore } from '../../storage/file-store.ts';
import { closeSse, prepareSse, writeSse } from './sse.ts';
import { parseAgentRunRequest } from './validation.ts';

export function createAgentRouter(registry: AgentPluginRegistry, store: AgentFileStore) {
  const router = new Router();
  const runtime = new AgentRuntime(registry);

  router.get(apiRoutes.listAgentPlugins.path, (context) => {
    context.body = {
      plugins: registry.list(),
    } satisfies AgentPluginListResponse;
  });

  router.post(apiRoutes.createAgentRun.path, async (context) => {
    const request = parseAgentRunRequest(context.request.body);
    const conversation = store.ensureConversation(request.conversationId, createConversationTitle(request.input));
    const run = store.createRun({
      conversationId: conversation.id,
      input: request.input,
      pluginNames: request.pluginNames,
      pluginConfigs: request.pluginConfigs,
    });

    store.addMessage({
      conversationId: conversation.id,
      role: 'user',
      content: request.input,
      runId: run.id,
    });

    const response: AgentRunResponse = {
      ...(await runtime.run(request)),
      conversationId: conversation.id,
    };

    store.completeRun(run.id, {
      output: response.output,
      events: response.events,
      status: 'completed',
    });
    store.addMessage({
      conversationId: conversation.id,
      role: 'assistant',
      content: response.output,
      runId: run.id,
    });

    context.body = response;
  });

  router.post('/api/agent/runs/stream', async (context) => {
    const request = parseAgentRunRequest(context.request.body);
    const conversation = store.ensureConversation(request.conversationId, createConversationTitle(request.input));
    const run = store.createRun({
      conversationId: conversation.id,
      input: request.input,
      pluginNames: request.pluginNames,
      pluginConfigs: request.pluginConfigs,
    });

    store.addMessage({
      conversationId: conversation.id,
      role: 'user',
      content: request.input,
      runId: run.id,
    });

    prepareSse(context);

    try {
      const runResponse = await runtime.run(request, {
        onEvent: (event) => {
          writeSse(context, 'agent.event', event);
        },
      });
      const response: AgentRunResponse = {
        ...runResponse,
        conversationId: conversation.id,
      };

      store.completeRun(run.id, {
        output: response.output,
        events: response.events,
        status: 'completed',
      });
      store.addMessage({
        conversationId: conversation.id,
        role: 'assistant',
        content: response.output,
        runId: run.id,
      });

      writeSse(context, 'agent.result', response);
    } catch (error) {
      store.completeRun(run.id, {
        output: '',
        events: [],
        status: 'failed',
      });
      writeSse(context, 'agent.error', {
        message: error instanceof Error ? error.message : 'Agent run failed.',
      });
    } finally {
      closeSse(context);
    }
  });

  return router;
}

function createConversationTitle(input: string) {
  const title = input.trim().replace(/\s+/g, ' ').slice(0, 48);

  return title || 'New conversation';
}
