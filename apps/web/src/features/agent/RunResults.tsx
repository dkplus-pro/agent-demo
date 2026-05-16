import { AlertCircle, Activity, Clock3, Terminal } from 'lucide-react';

import { getEventTone, useAgentStore } from '../../stores/agent-store';

export function RunResults() {
  const runs = useAgentStore((state) => state.runs);
  const error = useAgentStore((state) => state.error);
  const isRunning = useAgentStore((state) => state.isRunning);

  if (error) {
    return (
      <div className="m-5 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-950">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="grid min-h-0 flex-1 place-items-center p-6">
        <div className="max-w-sm text-center">
          <Terminal className="mx-auto size-8 text-zinc-400" />
          <p className="mt-3 text-sm font-medium text-zinc-800">{isRunning ? 'Agent is running.' : 'No runs yet.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto p-5">
      <div className="space-y-4">
        {runs.map((run) => (
          <article key={run.runId} className="rounded-md border border-zinc-200 bg-white shadow-sm">
            <header className="flex items-center justify-between gap-4 border-b border-zinc-100 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                  <Activity className="size-4" />
                  <span className="truncate">{run.runId}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{run.events.length} trace events</p>
              </div>
            </header>

            <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-900">
                {run.output}
              </pre>
              <div className="max-h-96 space-y-2 overflow-auto">
                {run.events.map((event) => (
                  <div key={event.id} className={`rounded-md border p-3 text-xs ${getEventTone(event)}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{event.type}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] opacity-70">
                        <Clock3 className="size-3" />
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 leading-5">{event.message}</p>
                    <div className="mt-1 flex items-center justify-between gap-2 font-mono text-[11px] opacity-70">
                      <span>{event.pluginName ?? 'runtime'}</span>
                      {event.durationMs !== undefined ? <span>{event.durationMs}ms</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
