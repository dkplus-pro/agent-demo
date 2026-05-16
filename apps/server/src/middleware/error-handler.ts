import type { Context, Next } from 'koa';

import type { ApiErrorResponse } from '@ai-mind-clone/shared/generated/openapi';

export async function errorHandler(context: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    const status = isHttpError(error) ? error.status : 500;

    context.status = status;
    context.body = {
      message,
      code: status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST',
    } satisfies ApiErrorResponse;

    if (status >= 500) {
      context.app.emit('error', error, context);
    }
  }
}

function isHttpError(error: unknown): error is Error & { status: number } {
  return error instanceof Error && 'status' in error && typeof error.status === 'number';
}
