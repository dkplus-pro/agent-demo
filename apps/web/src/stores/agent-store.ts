import type {
  AgentPluginManifest,
  AgentRunResponse,
  AgentTraceEvent,
  ConversationMessage,
  ConversationSummary,
} from '@ai-mind-clone/shared/generated/openapi';
import { create } from 'zustand';

import { agentApiClient } from '../generated/api-client';
import { streamAgentRun } from '../features/agent/stream-client';

type AgentStoreState = {
  input: string;
  selectedPluginNames: string[];
  pluginConfigs: Record<string, Record<string, unknown>>;
  plugins: AgentPluginManifest[];
  conversations: ConversationSummary[];
  messages: ConversationMessage[];
  activeConversationId: string | null;
  runs: AgentRunResponse[];
  healthLabel: string;
  isLoadingPlugins: boolean;
  isLoadingConversations: boolean;
  isRunning: boolean;
  error: string | null;
  setInput: (input: string) => void;
  togglePlugin: (pluginName: string) => void;
  setPluginConfigValue: (pluginName: string, key: string, value: unknown) => void;
  loadBootstrapData: () => Promise<void>;
  loadConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  createNewConversation: () => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  runAgent: () => Promise<void>;
};

export const useAgentStore = create<AgentStoreState>((set, get) => ({
  input: 'Summarize the current agent MVP architecture.',
  selectedPluginNames: [],
  pluginConfigs: {},
  plugins: [],
  conversations: [],
  messages: [],
  activeConversationId: null,
  runs: [],
  healthLabel: 'checking',
  isLoadingPlugins: false,
  isLoadingConversations: false,
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
  loadConversations: async () => {
    set({ isLoadingConversations: true, error: null });

    try {
      const response = await agentApiClient.listConversations();

      set({ conversations: response.conversations });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load conversations.' });
    } finally {
      set({ isLoadingConversations: false });
    }
  },
  selectConversation: async (conversationId) => {
    set({ isLoadingConversations: true, error: null });

    try {
      const detail = await agentApiClient.getConversation(conversationId);

      set({
        activeConversationId: conversationId,
        messages: detail.messages,
        runs: detail.runs
          .slice()
          .reverse()
          .map((run) => ({
            runId: run.id,
            conversationId: run.conversationId,
            output: run.output,
            events: run.events,
          })),
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load conversation.' });
    } finally {
      set({ isLoadingConversations: false });
    }
  },
  createNewConversation: () => {
    set({
      activeConversationId: null,
      messages: [],
      runs: [],
      error: null,
    });
  },
  deleteConversation: async (conversationId) => {
    set({ isLoadingConversations: true, error: null });

    try {
      await agentApiClient.deleteConversation(conversationId);
      const conversations = get().conversations.filter((conversation) => conversation.id !== conversationId);
      const isActive = get().activeConversationId === conversationId;

      set({
        conversations,
        activeConversationId: isActive ? null : get().activeConversationId,
        messages: isActive ? [] : get().messages,
        runs: isActive ? [] : get().runs,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete conversation.' });
    } finally {
      set({ isLoadingConversations: false });
    }
  },
  runAgent: async () => {
    const { activeConversationId, input, pluginConfigs, selectedPluginNames } = get();
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      set({ error: 'Input is required.' });
      return;
    }

    set({ isRunning: true, error: null });

    try {
      const draftRunId = `pending-${Date.now()}`;
      const draftConversationId = activeConversationId ?? draftRunId;

      set((state) => ({
        runs: [
          {
            runId: draftRunId,
            conversationId: draftConversationId,
            output: '',
            events: [],
          },
          ...state.runs,
        ].slice(0, 10),
      }));

      await streamAgentRun(
        {
          input: trimmedInput,
          conversationId: activeConversationId ?? undefined,
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
                      output:
                        event.type === 'llm.delta' && typeof event.data?.delta === 'string'
                          ? `${run.output}${event.data.delta}`
                          : run.output,
                      events: [...run.events, event],
                    }
                  : run,
              ),
            }));
          },
          onResult: (response) => {
            set((state) => ({
              activeConversationId: response.conversationId,
              runs: state.runs.map((run) => (run.runId === draftRunId ? response : run)),
            }));
            void get().loadConversations();
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

  if (event.type === 'llm.delta') {
    return 'border-zinc-200 bg-zinc-50 text-zinc-700';
  }

  if (event.type.endsWith('completed')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-950';
  }

  return 'border-zinc-200 bg-white text-zinc-800';
}
