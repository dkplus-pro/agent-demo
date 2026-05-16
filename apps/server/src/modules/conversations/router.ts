import type {
  ConversationDetailResponse,
  ConversationListResponse,
  ConversationMessagesResponse,
  CreateConversationRequest,
  DeleteConversationResponse,
} from '@ai-mind-clone/shared/generated/openapi';
import Router from 'koa-router';

import type { AgentFileStore } from '../../storage/file-store.ts';

export function createConversationRouter(store: AgentFileStore) {
  const router = new Router();

  router.get('/api/conversations', (context) => {
    context.body = {
      conversations: store.listConversations(),
    } satisfies ConversationListResponse;
  });

  router.post('/api/conversations', (context) => {
    const request = parseCreateConversationRequest(context.request.body);
    const conversation = store.createConversation(request.title?.trim() || 'New conversation');

    context.body = store.getConversationDetail(conversation.id) satisfies ConversationDetailResponse;
  });

  router.get('/api/conversations/:conversationId', (context) => {
    context.body = store.getConversationDetail(context.params.conversationId) satisfies ConversationDetailResponse;
  });

  router.delete('/api/conversations/:conversationId', (context) => {
    store.deleteConversation(context.params.conversationId);

    context.body = {
      ok: true,
    } satisfies DeleteConversationResponse;
  });

  router.get('/api/conversations/:conversationId/messages', (context) => {
    context.body = {
      messages: store.listMessages(context.params.conversationId),
    } satisfies ConversationMessagesResponse;
  });

  return router;
}

function parseCreateConversationRequest(value: unknown): CreateConversationRequest {
  if (value === undefined || value === null || value === '') {
    return {};
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw badRequest('Request body must be an object.');
  }

  const title = (value as Record<string, unknown>).title;

  if (title !== undefined && typeof title !== 'string') {
    throw badRequest('Field "title" must be a string.');
  }

  return {
    title,
  };
}

function badRequest(message: string) {
  const error = new Error(message) as Error & { status: number };
  error.status = 400;
  return error;
}
