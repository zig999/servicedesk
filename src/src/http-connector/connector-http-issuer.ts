import type { AssembledConnectorRequest } from './connector-call-descriptor.js';
import type { HttpMethod } from './http-connector-call-configuration.js';

export type IssuedHttpCall =
  | { readonly kind: 'response'; readonly response: Response; readonly elapsedMs: number }
  | { readonly kind: 'timed-out'; readonly elapsedMs: number };

export type IssueConnectorHttpCallOptions = {
  readonly method: HttpMethod;
  readonly request: AssembledConnectorRequest;
  readonly timeoutMs: number;
  readonly httpClient: typeof fetch;
};

export async function issueConnectorHttpCall(options: IssueConnectorHttpCallOptions): Promise<IssuedHttpCall> {
  const { method, request, timeoutMs, httpClient } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  try {
    const response = await httpClient(connectorRequestUrl(request), connectorRequestInit(method, request, controller.signal));
    return { kind: 'response', response, elapsedMs: Date.now() - startedAt };
  } catch (error) {
    if (controller.signal.aborted) {
      return { kind: 'timed-out', elapsedMs: Date.now() - startedAt };
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function connectorRequestUrl(request: AssembledConnectorRequest): string {
  const url = new URL(request.address);
  for (const [key, value] of Object.entries(request.query)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function connectorRequestInit(method: HttpMethod, request: AssembledConnectorRequest, signal: AbortSignal): RequestInit {
  const init: RequestInit = { method, headers: { ...request.headers }, signal };
  if (request.body === undefined) {
    return init;
  }
  return { ...init, body: typeof request.body === 'string' ? request.body : JSON.stringify(request.body) };
}
