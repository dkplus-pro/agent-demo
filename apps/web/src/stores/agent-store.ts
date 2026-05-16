import type { AgentPluginManifest, AgentRunResponse, AgentTraceEvent } from '@ai-mind-clone/shared/generated/openapi';
import { create } from 'zustand';

import { agentApiClient } from '../generated/api-client';

type AgentStoreState = {
  input: string;
  selectedPluginNames: string[];
  plugins: AgentPluginManifest[];
  runs: AgentRunResponse[];
  healthLabel: string;
  isLoadingPlugins: boolean;
  isRunning: boolean;
  error: string | null;
  setInput: (input: string) => void;
  togglePlugin: (pluginName: string) => void;
  loadBootstrapData: () => Promise<void>;
  runAgent: () => Promise<void>;
};

export const useAgentStore = create<AgentStoreState>((set, get) => ({
  input: 'Summarize the current agent MVP architecture.',
  selectedPluginNames: [],
  plugins: [],
  runs: [],
  healthLabel: 'checking',
  isLoadingPlugins: false,
  isRunning: false,
  error: null,
  setInput: (input) => set({ input }),
  togglePlugin: (pluginName) => {
    const selected = get().selectedPluginNames;
    const nextSelected = selected.includes(pluginName)
      ? selected.filter((name) => name !== pluginName)
      : [...selected, pluginName];

    set({ selectedPluginNames: nextSelected });
  },
  loadBootstrapData: async () => {
    set({ isLoadingPlugins: true, error: null });

    try {
      const [health, pluginList] = await Promise.all([agentApiClient.getHealth(), agentApiClient.listAgentPlugins()]);
      const enabledPluginNames = pluginList.plugins.filter((plugin) => plugin.enabled !== false).map((plugin) => plugin.name);

      set({
        plugins: pluginList.plugins,
        selectedPluginNames: enabledPluginNames,
        healthLabel: `${health.service} ${health.version ?? ''}`.trim(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load server data.',
        healthLabel: 'offline',
      });
    } finally {
      set({ isLoadingPlugins: false });
    }
  },
  runAgent: async () => {
    const { input, selectedPluginNames } = get();
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      set({ error: 'Input is required.' });
      return;
    }

    set({ isRunning: true, error: null });

    try {
      const response = await agentApiClient.createAgentRun({
        input: trimmedInput,
        pluginNames: selectedPluginNames,
      });

      set((state) => ({
        runs: [response, ...state.runs].slice(0, 10),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Agent run failed.',
      });
    } finally {
      set({ isRunning: false });
    }
  },
}));

export function getEventTone(event: AgentTraceEvent) {
  if (event.type === 'run.failed') {
    return 'border-red-200 bg-red-50 text-red-900';
  }

  if (event.type.endsWith('completed')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-950';
  }

  return 'border-zinc-200 bg-white text-zinc-800';
}
