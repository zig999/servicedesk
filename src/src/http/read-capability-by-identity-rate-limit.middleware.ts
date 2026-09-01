import type { FastifyReply, FastifyRequest } from 'fastify';

export const RATE_LIMIT_MAX_REQUESTS_PER_WINDOW = 60;

export const RATE_LIMIT_WINDOW_MS = 60_000;

const MS_PER_SECOND = 1_000;

type RateLimitWindow = {
  requestCount: number;
  readonly windowStartMs: number;
};

export function createReadCapabilityByIdentityRateLimitHook(): (
  request: FastifyRequest,
  reply: FastifyReply,
) => Promise<void> {
  const windows = new Map<string, RateLimitWindow>();
  return async function readCapabilityByIdentityRateLimitHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const now = Date.now();
    pruneExpiredWindows(windows, now);
    const sourceIp = request.ip;
    const window = windows.get(sourceIp);
    if (window === undefined) {
      windows.set(sourceIp, { requestCount: 1, windowStartMs: now });
      return;
    }
    window.requestCount += 1;
    if (window.requestCount > RATE_LIMIT_MAX_REQUESTS_PER_WINDOW) {
      await refuseOverLimit(reply, window, now);
    }
  };
}

function pruneExpiredWindows(windows: Map<string, RateLimitWindow>, now: number): void {
  for (const [sourceIp, window] of windows) {
    if (now - window.windowStartMs >= RATE_LIMIT_WINDOW_MS) {
      windows.delete(sourceIp);
    }
  }
}

async function refuseOverLimit(reply: FastifyReply, window: RateLimitWindow, now: number): Promise<void> {
  const retryAfterSeconds = Math.max(1, Math.ceil((window.windowStartMs + RATE_LIMIT_WINDOW_MS - now) / MS_PER_SECOND));
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
