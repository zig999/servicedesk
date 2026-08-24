// The HTTP-issuance mechanics HttpDeclarativeObservationSource uses
// internally (task/connector-diagnostics/test-connector-route), extracted
// so a second caller — the test-connector diagnostic route — can issue
// exactly the same call the adapter issues for a real observation, without
// duplicating request assembly, the fetch call itself, or timing (MNT-03).
// http-declarative-observation-source.adapter.ts's own private issueRequest
// now delegates here, unchanged in every observable way: it still answers
// only 'response' or 'timed-out', still bounded by the given timeout via an
// AbortController, and still lets any non-timeout rejection propagate
// unmodified, exactly as it always did — the elapsedMs this module adds is
// new information the adapter simply never reads, never a behavior change.
//
// Pure mechanics only: no store read, no domain decision, no classification
// into one of the four evidence-result endings — that stays the adapter's
// own concern (outcomeFromResponse). This module knows nothing about
// evidence-result and imports nothing from investigation/.

import type { AssembledConnectorRequest } from './connector-call-descriptor.js';
import type { HttpMethod } from './http-connector-call-configuration.js';

/**
 * What issuing one bounded HTTP call answers: the response it received, or
 * a mark that the given timeout elapsed first — each carrying how long the
 * call actually took, in milliseconds, for a caller (the test-connector
 * route) that needs to report it; the adapter itself discards this field,
 * unchanged from before this extraction.
 */
export type IssuedHttpCall =
  | { readonly kind: 'response'; readonly response: Response; readonly elapsedMs: number }
  | { readonly kind: 'timed-out'; readonly elapsedMs: number };

/** What one issueConnectorHttpCall call takes, bundled as an object (MNT-01's own parameter bound) rather than four positional arguments. */
export type IssueConnectorHttpCallOptions = {
  readonly method: HttpMethod;
  readonly request: AssembledConnectorRequest;
  readonly timeoutMs: number;
  readonly httpClient: typeof fetch;
};

/**
 * Issues exactly one HTTP call, bounded by the given timeout and never a
 * moment longer: a client-side abort once that bound elapses is reported as
 * timed-out rather than propagated as a fault; any other rejection — a
 * genuine network failure — propagates unmodified, letting a caller decide
 * how to represent it (the adapter degrades toward its own four endings;
 * the diagnostic route reports it as the raw error it is).
 */
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

/** The URL one assembled request calls: the resolved address with every resolved query parameter appended — exactly what issueConnectorHttpCall fetches, so a caller reporting "the resolved address" reports this same value. */
export function connectorRequestUrl(request: AssembledConnectorRequest): string {
  const url = new URL(request.address);
  for (const [key, value] of Object.entries(request.query)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/**
 * The fetch call's own init: the connector's own declared method, its
 * resolved headers and its own AbortSignal, plus its resolved body where
 * the descriptor declared one — serialized as JSON text unless it already
 * is a plain string.
 */
export function connectorRequestInit(method: HttpMethod, request: AssembledConnectorRequest, signal: AbortSignal): RequestInit {
  const init: RequestInit = { method, headers: { ...request.headers }, signal };
  if (request.body === undefined) {
    return init;
  }
  return { ...init, body: typeof request.body === 'string' ? request.body : JSON.stringify(request.body) };
}
