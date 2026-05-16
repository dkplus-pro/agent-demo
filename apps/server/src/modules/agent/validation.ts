import type { AgentRunRequest } from '@ai-mind-clone/shared/generated/openapi';

export function parseAgentRunRequest(value: unknown): AgentRunRequest {
  if (!isRecord(value)) {
    throw badRequest('Request body must be an object.');
  }

  if (typeof value.input !== 'string' || value.input.trim().length === 0) {
    throw badRequest('Field "input" must be a non-empty string.');
  }

  const pluginNames = value.pluginNames;
  const metadata = value.metadata;
  const pluginConfigs = value.pluginConfigs;

  if (pluginNames !== undefined && !isStringArray(pluginNames)) {
    throw badRequest('Field "pluginNames" must be an array of strings.');
  }

  if (metadata !== undefined && !isRecord(metadata)) {
    throw badRequest('Field "metadata" must be an object.');
  }

  if (pluginConfigs !== undefined && !isPluginConfigs(pluginConfigs)) {
    throw badRequest('Field "pluginConfigs" must be an object keyed by plugin name.');
  }

  return {
    input: value.input,
    pluginNames,
    metadata,
    pluginConfigs,
  };
}

function badRequest(message: string) {
  const error = new Error(message) as Error & { status: number };
  error.status = 400;
  return error;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPluginConfigs(value: unknown): value is Record<string, Record<string, unknown>> {
  return isRecord(value) && Object.values(value).every((config) => isRecord(config));
}
