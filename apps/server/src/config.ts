export type ServerConfig = {
  port: number;
  serviceName: string;
  llmChat: {
    apiKey?: string;
    baseUrl: string;
    model?: string;
    anthropicVersion: string;
    mockEnabled: boolean;
    mockDelayMs: number;
    timeoutMs: number;
  };
};

export function loadServerConfig(): ServerConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    serviceName: process.env.SERVICE_NAME ?? 'agent-mvp-server',
    llmChat: {
      apiKey: process.env.LLM_CHAT_API_KEY ?? process.env.ANTHROPIC_API_KEY,
      baseUrl: process.env.LLM_CHAT_BASE_URL ?? process.env.ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com',
      model: process.env.LLM_CHAT_MODEL ?? process.env.ANTHROPIC_MODEL,
      anthropicVersion: process.env.LLM_CHAT_ANTHROPIC_VERSION ?? process.env.ANTHROPIC_VERSION ?? '2023-06-01',
      mockEnabled: process.env.LLM_CHAT_MOCK === 'true',
      mockDelayMs: Number(process.env.LLM_CHAT_MOCK_DELAY_MS ?? 700),
      timeoutMs: Number(process.env.LLM_CHAT_TIMEOUT_MS ?? 30_000),
    },
  };
}
