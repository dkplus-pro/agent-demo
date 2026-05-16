export type ServerConfig = {
  port: number;
  serviceName: string;
};

export function loadServerConfig(): ServerConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    serviceName: process.env.SERVICE_NAME ?? 'agent-mvp-server',
  };
}
