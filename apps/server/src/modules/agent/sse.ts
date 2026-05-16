import type { Context } from 'koa';

type SsePayload = Record<string, unknown>;

export function prepareSse(context: Context) {
  context.status = 200;
  context.set('Content-Type', 'text/event-stream; charset=utf-8');
  context.set('Cache-Control', 'no-cache, no-transform');
  context.set('Connection', 'keep-alive');
  context.respond = false;

  context.res.writeHead(200);
}

export function writeSse(context: Context, event: string, data: SsePayload) {
  context.res.write(`event: ${event}\n`);
  context.res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function closeSse(context: Context) {
  context.res.end();
}
