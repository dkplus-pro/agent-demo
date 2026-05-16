import type { AgentTraceEvent } from '@ai-mind-clone/shared/generated/openapi';

export type ConversationRecord = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type MessageRecord = {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  runId?: string;
  createdAt: string;
};

export type RunStatus = 'running' | 'completed' | 'failed';

export type RunRecord = {
  id: string;
  conversationId: string;
  input: string;
  output: string;
  status: RunStatus;
  pluginNames?: string[];
  pluginConfigs?: Record<string, Record<string, unknown>>;
  events: AgentTraceEvent[];
  createdAt: string;
  completedAt?: string;
};

export type AgentStoreData = {
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  runs: RunRecord[];
};
