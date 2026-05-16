declare module '@koa/cors' {
  import type { Middleware } from 'koa';

  export default function cors(): Middleware;
}
