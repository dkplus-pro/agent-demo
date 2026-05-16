import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type {
  AgentTraceEvent,
  ConversationDetailResponse,
  ConversationMessage,
  ConversationSummary,
  StoredAgentRun,
} from '@ai-mind-clone/shared/generated/openapi';

import type { AgentStoreData, MessageRecord, MessageRole, RunRecord, RunStatus } from './types.ts';

const emptyStore = (): AgentStoreData => ({
  conversations: [],
  messages: [],
  runs: [],
});

export class AgentFileStore {
  private data: AgentStoreData;
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    mkdirSync(dirname(filePath), { recursive: true });
    this.data = this.load();
    this.persist();
  }

  listConversations(): ConversationSummary[] {
    return [...this.data.conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  createConversation(title = 'New conversation') {
    const now = new Date().toISOString();
    const conversation = {
      id: randomUUID(),
      title,
      createdAt: now,
      updatedAt: now,
    };

    this.data.conversations.push(conversation);
    this.persist();

    return conversation;
  }

  getConversationDetail(conversationId: string): ConversationDetailResponse {
    const conversation = this.findConversation(conversationId);

    return {
      conversation,
      messages: this.listMessages(conversationId),
      runs: this.listRuns(conversationId),
    };
  }

  listMessages(conversationId: string): ConversationMessage[] {
    this.findConversation(conversationId);

    return this.data.messages
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  deleteConversation(conversationId: string) {
    this.data.conversations = this.data.conversations.filter((conversation) => conversation.id !== conversationId);
    this.data.messages = this.data.messages.filter((message) => message.conversationId !== conversationId);
    this.data.runs = this.data.runs.filter((run) => run.conversationId !== conversationId);
    this.persist();
  }

  ensureConversation(conversationId: string | undefined, fallbackTitle: string) {
    if (conversationId) {
      return this.findConversation(conversationId);
    }

    return this.createConversation(fallbackTitle);
  }

  addMessage(input: { conversationId: string; role: MessageRole; content: string; runId?: string }) {
    const now = new Date().toISOString();
    const message: MessageRecord = {
      id: randomUUID(),
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      runId: input.runId,
      createdAt: now,
    };

    this.data.messages.push(message);
    this.touchConversation(input.conversationId, now);
    this.persist();

    return message;
  }

  createRun(input: {
    conversationId: string;
    input: string;
    pluginNames?: string[];
    pluginConfigs?: Record<string, Record<string, unknown>>;
  }) {
    const now = new Date().toISOString();
    const run: RunRecord = {
      id: randomUUID(),
      conversationId: input.conversationId,
      input: input.input,
      output: '',
      status: 'running',
      pluginNames: input.pluginNames,
      pluginConfigs: input.pluginConfigs,
      events: [],
      createdAt: now,
    };

    this.data.runs.push(run);
    this.touchConversation(input.conversationId, now);
    this.persist();

    return run;
  }

  completeRun(runId: string, input: { output: string; events: AgentTraceEvent[]; status: RunStatus }) {
    const run = this.findRun(runId);
    const now = new Date().toISOString();

    run.output = input.output;
    run.events = input.events;
    run.status = input.status;
    run.completedAt = now;
    this.touchConversation(run.conversationId, now);
    this.persist();

    return run;
  }

  private listRuns(conversationId: string): StoredAgentRun[] {
    return this.data.runs
      .filter((run) => run.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((run) => ({
        id: run.id,
        conversationId: run.conversationId,
        input: run.input,
        output: run.output,
        status: run.status,
        events: run.events,
        createdAt: run.createdAt,
        completedAt: run.completedAt,
      }));
  }

  private load() {
    try {
      return JSON.parse(readFileSync(this.filePath, 'utf8')) as AgentStoreData;
    } catch {
      return emptyStore();
    }
  }

  private persist() {
    writeFileSync(this.filePath, `${JSON.stringify(this.data, null, 2)}\n`);
  }

  private findConversation(conversationId: string) {
    const conversation = this.data.conversations.find((item) => item.id === conversationId);

    if (!conversation) {
      throw withStatus(`Conversation not found: ${conversationId}`, 404);
    }

    return conversation;
  }

  private findRun(runId: string) {
    const run = this.data.runs.find((item) => item.id === runId);

    if (!run) {
      throw withStatus(`Run not found: ${runId}`, 404);
    }

    return run;
  }

  private touchConversation(conversationId: string, updatedAt: string) {
    const conversation = this.findConversation(conversationId);
    conversation.updatedAt = updatedAt;
  }
}

function withStatus(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}
