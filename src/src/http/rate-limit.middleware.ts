import type { FastifyReply, FastifyRequest } from 'fastify';

const MS_PER_SECOND = 1_000;

export type RateLimitHookOptions = {
  readonly maxRequestsPerWindow: number;
  readonly windowMs: number;
};

type RateLimitWindow = {
  requestCount: number;
  readonly windowStartMs: number;
};

export function createRateLimitHook(
  options: RateLimitHookOptions,
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  const windows = new Map<string, RateLimitWindow>();
  return async function rateLimitHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const now = Date.now();
    pruneExpiredWindows(windows, now, options.windowMs);
    const sourceIp = request.ip;
    const window = windows.get(sourceIp);
    if (window === undefined) {
      windows.set(sourceIp, { requestCount: 1, windowStartMs: now });
      return;
    }
    window.requestCount += 1;
    if (window.requestCount > options.maxRequestsPerWindow) {
      const retryAfterSeconds = computeRetryAfterSeconds(window, now, options.windowMs);
      await refuseOverLimit(reply, retryAfterSeconds);
    }
  };
}

function pruneExpiredWindows(windows: Map<string, RateLimitWindow>, now: number, windowMs: number): void {
  for (const [sourceIp, window] of windows) {
    if (now - window.windowStartMs >= windowMs) {
      windows.delete(sourceIp);
    }
  }
}

function computeRetryAfterSeconds(window: RateLimitWindow, now: number, windowMs: number): number {
  return Math.max(1, Math.ceil((window.windowStartMs + windowMs - now) / MS_PER_SECOND));
}

async function refuseOverLimit(reply: FastifyReply, retryAfterSeconds: number): Promise<void> {
  await reply
    .header('Retry-After', String(retryAfterSeconds))
    .code(429)
    .send({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'too many requests from this source; retry after the given number of seconds',
        details: { retryAfterSeconds },
      },
    });
}
