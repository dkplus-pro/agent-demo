import type { AgentPlugin } from '@ai-mind-clone/agent-core';

type LlmChatConfig = {
  apiKey?: string;
  baseUrl: string;
  model?: string;
  anthropicVersion: string;
  mockEnabled: boolean;
  timeoutMs: number;
};

type AnthropicMessageResponse = {
  id?: string;
  model?: string;
  content?: Array<{ text?: string; type?: string }>;
  usage?: Record<string, unknown>;
};

export function createLlmChatPlugin(config: LlmChatConfig): AgentPlugin {
  const enabled = config.mockEnabled || Boolean(config.apiKey && config.model);

  return {
    manifest: {
      name: 'llm-chat',
      description: enabled
        ? 'Calls an Anthropic-compatible Messages API.'
        : 'Calls an Anthropic-compatible Messages API when API key and model are configured.',
      capabilities: ['llm', 'chat', 'anthropic-compatible'],
      enabled,
      inputSchema: {
        minLength: 1,
        maxLength: 12_000,
      },
      defaultConfig: {
        model: config.model ?? (config.mockEnabled ? 'mock-anthropic' : ''),
        temperature: 0.2,
        maxTokens: 800,
        systemPrompt: 'You are a concise, practical assistant.',
      },
    },
    async execute(context, input) {
      if (config.mockEnabled) {
        return runMockLlmChat(context, input.input);
      }

      if (!config.apiKey || !config.model) {
        throw withStatus('LLM chat plugin is not configured. Set LLM_CHAT_API_KEY and LLM_CHAT_MODEL.', 400);
      }

      const model = stringConfig(input.config.model) || config.model;
      const systemPrompt = stringConfig(input.config.systemPrompt) || 'You are a concise, practical assistant.';
      const temperature = numberConfig(input.config.temperature, 0.2);
      const maxTokens = numberConfig(input.config.maxTokens, 800);
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
            system: systemPrompt,
            max_tokens: maxTokens,
            messages: [
              {
                role: 'user',
                content: input.input,
              },
            ],
            temperature,
          }),
          signal: controller.signal,
        });

        const body = (await response.json().catch(() => ({}))) as AnthropicMessageResponse & {
          error?: { message?: string; type?: string };
        };

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

async function runMockLlmChat(context: Parameters<AgentPlugin['execute']>[0], input: string) {
  const chunks = [
    'Mock LLM response: ',
    'I received your request, ',
    `"${input}", `,
    'and streamed this answer through SSE.',
  ];

  let output = '';

  for (const chunk of chunks) {
    output += chunk;

    context.emit({
      type: 'llm.delta',
      pluginName: 'llm-chat',
      message: chunk,
      data: {
        delta: chunk,
      },
    });

    await delay(180);
  }

  return {
    output,
    data: {
      id: `mock-${context.runId}`,
      model: 'mock-anthropic',
      mock: true,
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

function stringConfig(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberConfig(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
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
