import type { AgentPluginManifest } from '@ai-mind-clone/shared/generated/openapi';

import type { AgentPlugin } from './types.ts';
import { AgentInputValidationError } from './validation.ts';

export class AgentPluginRegistry {
  private readonly plugins = new Map<string, AgentPlugin>();

  register(plugin: AgentPlugin) {
    if (this.plugins.has(plugin.manifest.name)) {
      throw new Error(`Agent plugin already registered: ${plugin.manifest.name}`);
    }

    this.plugins.set(plugin.manifest.name, plugin);
  }

  list(): AgentPluginManifest[] {
    return Array.from(this.plugins.values()).map((plugin) => plugin.manifest);
  }

  resolve(pluginNames?: string[]) {
    const selectedNames = pluginNames ?? this.listEnabledPluginNames();

    return selectedNames.map((name) => {
      const plugin = this.plugins.get(name);

      if (!plugin) {
        throw new AgentInputValidationError(`Unknown agent plugin: ${name}`);
      }

      return plugin;
    });
  }

  private listEnabledPluginNames() {
    return this.list()
      .filter((plugin) => plugin.enabled !== false)
      .map((plugin) => plugin.name);
  }
}
