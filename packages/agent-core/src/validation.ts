import type { AgentPlugin } from './types.ts';

export class AgentInputValidationError extends Error {
  readonly status = 400;
}

export function validatePluginInput(plugin: AgentPlugin, input: string, metadata?: Record<string, unknown>) {
  const schema = plugin.manifest.inputSchema;

  if (!schema) {
    return;
  }

  if (input.length < schema.minLength) {
    throw new AgentInputValidationError(
      `Plugin ${plugin.manifest.name} requires input with at least ${schema.minLength} characters.`,
    );
  }

  if (schema.maxLength !== undefined && input.length > schema.maxLength) {
    throw new AgentInputValidationError(
      `Plugin ${plugin.manifest.name} accepts input with at most ${schema.maxLength} characters.`,
    );
  }

  for (const key of schema.requiredMetadataKeys ?? []) {
    if (!metadata || !(key in metadata)) {
      throw new AgentInputValidationError(`Plugin ${plugin.manifest.name} requires metadata key "${key}".`);
    }
  }
}

export function resolvePluginConfig(plugin: AgentPlugin, config?: Record<string, unknown>) {
  return {
    ...(plugin.manifest.defaultConfig ?? {}),
    ...(config ?? {}),
  };
}
