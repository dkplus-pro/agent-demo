import type { AgentPluginManifest, AgentRunResponse, AgentTraceEvent } from '@ai-mind-clone/shared/generated/openapi';
import { create } from 'zustand';

import { agentApiClient } from '../generated/api-client';
import { streamAgentRun } from '../features/agent/stream-client';

type AgentStoreState = {
  input: string;
  selectedPluginNames: string[];
  pluginConfigs: Record<string, Record<string, unknown>>;
  plugins: AgentPluginManifest[];
  runs: AgentRunResponse[];
  healthLabel: string;
  isLoadingPlugins: boolean;
  isRunning: boolean;
  error: string | null;
  setInput: (input: string) => void;
  togglePlugin: (pluginName: string) => void;
  setPluginConfigValue: (pluginName: string, key: string, value: unknown) => void;
  loadBootstrapData: () => Promise<void>;
  runAgent: () => Promise<void>;
};

export const useAgentStore = create<AgentStoreState>((set, get) => ({
  input: 'Summarize the current agent MVP architecture.',
  selectedPluginNames: [],
  pluginConfigs: {},
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
  setPluginConfigValue: (pluginName, key, value) => {
    set((state) => ({
      pluginConfigs: {
        ...state.pluginConfigs,
        [pluginName]: {
          ...(state.pluginConfigs[pluginName] ?? {}),
          [key]: value,
        },
      },
    }));
  },
  loadBootstrapData: async () => {
    set({ isLoadingPlugins: true, error: null });

    try {
      const [health, pluginList] = await Promise.all([agentApiClient.getHealth(), agentApiClient.listAgentPlugins()]);
      const enabledPluginNames = pluginList.plugins.filter((plugin) => plugin.enabled !== false).map((plugin) => plugin.name);
      const pluginConfigs = Object.fromEntries(
        pluginList.plugins.map((plugin) => [plugin.name, plugin.defaultConfig ?? {}]),
      );

      set({
        plugins: pluginList.plugins,
        selectedPluginNames: enabledPluginNames,
        pluginConfigs,
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
    const { input, pluginConfigs, selectedPluginNames } = get();
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      set({ error: 'Input is required.' });
      return;
    }

    set({ isRunning: true, error: null });

    try {
      const draftRunId = `pending-${Date.now()}`;

      set((state) => ({
        runs: [
          {
            runId: draftRunId,
            output: '',
            events: [],
          },
          ...state.runs,
        ].slice(0, 10),
      }));

      await streamAgentRun(
        {
          input: trimmedInput,
          pluginNames: selectedPluginNames,
          pluginConfigs,
        },
        {
          onEvent: (event) => {
            set((state) => ({
              runs: state.runs.map((run) =>
                run.runId === draftRunId
                  ? {
                      ...run,
                      events: [...run.events, event],
                    }
                  : run,
              ),
            }));
          },
          onResult: (response) => {
            set((state) => ({
              runs: state.runs.map((run) => (run.runId === draftRunId ? response : run)),
            }));
          },
          onError: (message) => {
            set({ error: message });
          },
        },
      );
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
