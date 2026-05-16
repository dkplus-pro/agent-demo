import { Server } from 'lucide-react';
import { useEffect } from 'react';

import { useAgentStore } from '../../stores/agent-store';
import { ConversationPanel } from './ConversationPanel';
import { PluginPanel } from './PluginPanel';
import { RunComposer } from './RunComposer';
import { RunResults } from './RunResults';

export function AgentWorkspace() {
  const healthLabel = useAgentStore((state) => state.healthLabel);
  const loadBootstrapData = useAgentStore((state) => state.loadBootstrapData);
  const loadConversations = useAgentStore((state) => state.loadConversations);

  useEffect(() => {
    void loadBootstrapData();
    void loadConversations();
  }, [loadBootstrapData, loadConversations]);

  return (
    <main className="grid min-h-screen bg-zinc-50 text-zinc-950 md:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="flex min-h-screen min-w-0 flex-col border-r border-zinc-200">
        <ConversationPanel />
        <PluginPanel />
      </aside>
      <section className="flex min-h-screen min-w-0 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-5">
          <div className="text-sm font-semibold">Agent MVP</div>
          <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600">
            <Server className="size-3.5" />
            {healthLabel}
          </div>
        </header>
        <RunComposer />
        <RunResults />
      </section>
    </main>
  );
}
