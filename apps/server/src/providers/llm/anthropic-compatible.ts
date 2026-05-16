import type { LlmChatInput, LlmProvider, LlmProviderConfig } from './types.ts';

type AnthropicMessageResponse = {
  id?: string;
  model?: string;
  content?: Array<{ text?: string; type?: string }>;
  usage?: Record<string, unknown>;
  error?: { message?: string; type?: string };
};

export function createAnthropicCompatibleProvider(config: LlmProviderConfig): LlmProvider {
  return {
    name: 'anthropic-compatible',
    capabilities: ['llm', 'chat', 'anthropic-compatible'],
    isEnabled: () => config.mockEnabled || Boolean(config.apiKey && config.model),
    getDefaultModel: () => config.model ?? (config.mockEnabled ? 'mock-anthropic' : ''),
    getDefaultMockDelayMs: () => config.mockDelayMs,
    async chat(input) {
      if (config.mockEnabled) {
        return runMockLlmChat(input, input.mockDelayMs);
      }

      if (!config.apiKey || !config.model) {
        throw withStatus('LLM provider is not configured. Set LLM_API_KEY and LLM_MODEL.', 400);
      }

      const model = input.model || config.model;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

      try {
        const response = await fetch(`${trimTrailingSlash(config.baseUrl)}/v1/messages`, {
          method: 'POST',
          headers: {
            'x-api-key': config.apiKey,
            'anthropic-version': config.anthropicVersion,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            system: input.systemPrompt,
            max_tokens: input.maxTokens,
            messages: [
              {
                role: 'user',
                content: input.input,
              },
            ],
            temperature: input.temperature,
          }),
          signal: controller.signal,
        });

        const body = (await response.json().catch(() => ({}))) as AnthropicMessageResponse;

        if (!response.ok) {
          throw withStatus(body.error?.message ?? `LLM chat request failed with ${response.status}.`, 502);
        }

        const output = extractMessageContent(body);

        if (!output) {
          throw withStatus('LLM chat response did not include message content.', 502);
        }

        return {
          output,
          data: {
            id: body.id,
            model: body.model ?? model,
            usage: body.usage,
          },
        };
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw withStatus(`LLM chat request timed out after ${config.timeoutMs}ms.`, 504);
        }

        throw error;
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

async function runMockLlmChat(input: LlmChatInput, delayMs: number) {
  const chunks = [
    'Mock LLM response: ',
    'I received your request, ',
    `"${input.input}", `,
    'and streamed this answer through SSE.',
  ];

  let output = '';

  for (const chunk of chunks) {
    output += chunk;

    await input.context.emit({
      type: 'llm.delta',
      pluginName: 'llm-chat',
      message: chunk,
      data: {
        delta: chunk,
      },
    });

    await delay(Math.max(0, delayMs));
  }

  return {
    output,
    data: {
      id: `mock-${input.context.runId}`,
      model: 'mock-anthropic',
      mock: true,
      delayMs,
    },
  };
}

function extractMessageContent(response: AnthropicMessageResponse) {
  return (
    response.content
      ?.map((part) => part.text)
      .filter((text): text is string => typeof text === 'string')
      .join('\n')
      .trim() ?? ''
  );
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function withStatus(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}
