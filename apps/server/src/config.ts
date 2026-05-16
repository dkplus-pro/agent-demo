export type ServerConfig = {
  port: number;
  serviceName: string;
  llmChat: {
    apiKey?: string;
    baseUrl: string;
    model?: string;
    timeoutMs: number;
  };
};

export function loadServerConfig(): ServerConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    serviceName: process.env.SERVICE_NAME ?? 'agent-mvp-server',
    llmChat: {
      apiKey: process.env.LLM_CHAT_API_KEY ?? process.env.OPENAI_API_KEY,
      baseUrl: process.env.LLM_CHAT_BASE_URL ?? process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
      model: process.env.LLM_CHAT_MODEL ?? process.env.OPENAI_MODEL,
      timeoutMs: Number(process.env.LLM_CHAT_TIMEOUT_MS ?? 30_000),
    },
  };
}
