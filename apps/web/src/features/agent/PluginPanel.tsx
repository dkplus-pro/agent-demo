import { Check, Plug, RefreshCw } from 'lucide-react';

import { IconButton } from '../../shared/ui/IconButton';
import { useAgentStore } from '../../stores/agent-store';

export function PluginPanel() {
  const plugins = useAgentStore((state) => state.plugins);
  const selectedPluginNames = useAgentStore((state) => state.selectedPluginNames);
  const pluginConfigs = useAgentStore((state) => state.pluginConfigs);
  const isLoadingPlugins = useAgentStore((state) => state.isLoadingPlugins);
  const loadBootstrapData = useAgentStore((state) => state.loadBootstrapData);
  const togglePlugin = useAgentStore((state) => state.togglePlugin);
  const setPluginConfigValue = useAgentStore((state) => state.setPluginConfigValue);

  return (
    <section className="flex min-h-0 flex-1 flex-col border-t border-zinc-200 bg-zinc-100/70">
      <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
          <Plug className="size-4" />
          Plugins
        </div>
        <IconButton label="Refresh plugins" onClick={loadBootstrapData} disabled={isLoadingPlugins}>
          <RefreshCw className={isLoadingPlugins ? 'size-4 animate-spin' : 'size-4'} />
        </IconButton>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
        {plugins.map((plugin) => {
          const selected = selectedPluginNames.includes(plugin.name);

          return (
            <div key={plugin.name} className="space-y-2">
            <button
              type="button"
              onClick={() => togglePlugin(plugin.name)}
              className="grid w-full grid-cols-[1fr_auto] gap-3 rounded-md border border-zinc-200 bg-white p-3 text-left shadow-sm transition hover:border-zinc-300"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-zinc-950">{plugin.name}</span>
                <span className="mt-1 block text-xs leading-5 text-zinc-600">{plugin.description}</span>
                <span className="mt-3 flex flex-wrap gap-1">
                  {plugin.capabilities.map((capability) => (
                    <span key={capability} className="rounded border border-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-600">
                      {capability}
                    </span>
                  ))}
                </span>
                {plugin.inputSchema ? (
                  <span className="mt-2 block text-[11px] leading-4 text-zinc-500">
                    Input {plugin.inputSchema.minLength}
                    {plugin.inputSchema.maxLength ? `-${plugin.inputSchema.maxLength}` : '+'} chars
                  </span>
                ) : null}
              </span>
              <span
                className={
                  selected
                    ? 'inline-flex size-5 items-center justify-center rounded border border-zinc-950 bg-zinc-950 text-white'
                    : 'inline-flex size-5 rounded border border-zinc-300 bg-white'
                }
              >
                {selected ? <Check className="size-3.5" /> : null}
              </span>
            </button>
            {selected && plugin.defaultConfig ? (
              <div className="rounded-md border border-zinc-200 bg-white p-3 shadow-sm">
                <div className="grid gap-2">
                  {Object.entries(plugin.defaultConfig).map(([key, value]) => (
                    <label key={key} className="grid gap-1 text-xs text-zinc-600">
                      <span className="font-medium text-zinc-700">{key}</span>
                      <ConfigInput
                        value={(pluginConfigs[plugin.name]?.[key] ?? value) as boolean | number | string}
                        onChange={(nextValue) => setPluginConfigValue(plugin.name, key, nextValue)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ConfigInput({
  value,
  onChange,
}: {
  value: boolean | number | string;
  onChange: (value: boolean | number | string) => void;
}) {
  if (typeof value === 'boolean') {
    return (
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-zinc-300"
      />
    );
  }

  if (typeof value === 'number') {
    return (
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-8 rounded-md border border-zinc-300 px-2 text-sm text-zinc-950 outline-none focus:border-zinc-950"
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 rounded-md border border-zinc-300 px-2 text-sm text-zinc-950 outline-none focus:border-zinc-950"
    />
  );
}
