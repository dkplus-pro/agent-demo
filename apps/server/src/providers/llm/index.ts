import { createAnthropicCompatibleProvider } from './anthropic-compatible.ts';
import type { LlmProvider, LlmProviderConfig } from './types.ts';

export type { LlmProvider, LlmProviderConfig } from './types.ts';

export function createLlmProvider(config: LlmProviderConfig): LlmProvider {
  switch (config.provider) {
    case 'anthropic-compatible':
      return createAnthropicCompatibleProvider(config);
  }
}
