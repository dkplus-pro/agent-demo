import { Play, RotateCcw } from 'lucide-react';

import { IconButton } from '../../shared/ui/IconButton';
import { useAgentStore } from '../../stores/agent-store';

const defaultPrompt = 'Summarize the current agent MVP architecture.';

export function RunComposer() {
  const input = useAgentStore((state) => state.input);
  const isRunning = useAgentStore((state) => state.isRunning);
  const selectedPluginNames = useAgentStore((state) => state.selectedPluginNames);
  const setInput = useAgentStore((state) => state.setInput);
  const runAgent = useAgentStore((state) => state.runAgent);

  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
        <div>
          <h1 className="text-base font-semibold text-zinc-950">Agent Run</h1>
          <p className="mt-0.5 text-xs text-zinc-500">{selectedPluginNames.length} plugins selected</p>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="Reset input" onClick={() => setInput(defaultPrompt)} disabled={isRunning}>
            <RotateCcw className="size-4" />
          </IconButton>
          <button
            type="button"
            onClick={runAgent}
            disabled={isRunning || selectedPluginNames.length === 0}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="size-4" />
            {isRunning ? 'Running' : 'Run'}
          </button>
        </div>
      </div>

      <div className="p-5">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="min-h-28 w-full resize-y rounded-md border border-zinc-300 bg-white p-3 text-sm leading-6 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
          placeholder="Enter a task for the agent"
        />
      </div>
    </section>
  );
}
