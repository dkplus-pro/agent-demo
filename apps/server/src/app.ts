import cors from '@koa/cors';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import type { ServerConfig } from './config.ts';
import { errorHandler } from './middleware/error-handler.ts';
import { registerRoutes } from './routes/index.ts';

export function createServerApp(config: ServerConfig) {
  const app = new Koa();

  app.use(errorHandler);
  app.use(cors());
  app.use(bodyParser());

  registerRoutes(app, config);

  app.on('error', (error) => {
    console.error(error);
  });

  return app;
}
