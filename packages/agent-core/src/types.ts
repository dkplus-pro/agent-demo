import type { AgentPluginManifest, AgentTraceEvent } from '@ai-mind-clone/shared/generated/openapi';

export type AgentPluginInput = {
  input: string;
  metadata?: Record<string, unknown>;
  config: Record<string, unknown>;
};

export type AgentPluginResult = {
  output: string;
  data?: Record<string, unknown>;
};

export type AgentContext = {
  runId: string;
  metadata?: Record<string, unknown>;
  emit: (event: Omit<AgentTraceEvent, 'id' | 'timestamp'>) => AgentTraceEvent;
};

export type AgentPlugin = {
  manifest: AgentPluginManifest;
  execute: (context: AgentContext, input: AgentPluginInput) => Promise<AgentPluginResult>;
};

export type AgentRuntimeInput = {
  input: string;
  pluginNames?: string[];
  metadata?: Record<string, unknown>;
  pluginConfigs?: Record<string, Record<string, unknown>>;
};

export type AgentRuntimeRunOptions = {
  onEvent?: (event: AgentTraceEvent) => void | Promise<void>;
};
