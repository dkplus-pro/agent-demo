import { MessageSquare, Plus, RefreshCw, Trash2 } from 'lucide-react';

import { IconButton } from '../../shared/ui/IconButton';
import { useAgentStore } from '../../stores/agent-store';

export function ConversationPanel() {
  const conversations = useAgentStore((state) => state.conversations);
  const activeConversationId = useAgentStore((state) => state.activeConversationId);
  const isLoadingConversations = useAgentStore((state) => state.isLoadingConversations);
  const createNewConversation = useAgentStore((state) => state.createNewConversation);
  const loadConversations = useAgentStore((state) => state.loadConversations);
  const selectConversation = useAgentStore((state) => state.selectConversation);
  const deleteConversation = useAgentStore((state) => state.deleteConversation);

  return (
    <section className="flex min-h-0 flex-[0_0_42%] flex-col bg-zinc-100/70">
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
          <MessageSquare className="size-4" />
          Conversations
        </div>
        <div className="flex items-center gap-1">
          <IconButton label="New conversation" onClick={createNewConversation} disabled={isLoadingConversations}>
            <Plus className="size-4" />
          </IconButton>
          <IconButton label="Refresh conversations" onClick={loadConversations} disabled={isLoadingConversations}>
            <RefreshCw className={isLoadingConversations ? 'size-4 animate-spin' : 'size-4'} />
          </IconButton>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
        {conversations.length === 0 ? (
          <div className="rounded-md border border-dashed border-zinc-300 bg-white/60 p-3 text-xs leading-5 text-zinc-500">
            No saved conversations yet.
          </div>
        ) : null}

        {conversations.map((conversation) => {
          const isActive = conversation.id === activeConversationId;

          return (
            <div
              key={conversation.id}
              className={
                isActive
                  ? 'grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-md border border-zinc-950 bg-white p-3 text-left shadow-sm'
                  : 'grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-md border border-zinc-200 bg-white p-3 text-left shadow-sm transition hover:border-zinc-300'
              }
            >
              <button type="button" onClick={() => void selectConversation(conversation.id)} className="min-w-0 text-left">
                <span className="block truncate text-sm font-medium text-zinc-950">{conversation.title}</span>
                <span className="mt-1 block text-xs text-zinc-500">{new Date(conversation.updatedAt).toLocaleString()}</span>
              </button>
              <button
                type="button"
                onClick={() => void deleteConversation(conversation.id)}
                className="inline-flex size-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-red-50 hover:text-red-700"
                aria-label={`Delete ${conversation.title}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
