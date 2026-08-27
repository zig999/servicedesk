import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Evaluation, SimulateHypothesisResult } from "./use-simulate-hypothesis";

// Shared fixtures and helpers for use-simulate-hypothesis's own split spec files
// (use-simulate-hypothesis-request.spec.ts, use-simulate-hypothesis-dispatch-safety.spec.ts),
// mirroring use-capability-detail.test-support.ts's own established one-support-file-per-unit
// pattern and connector-configurations-screen.test-support.ts's own parsedPutBody guard-not-cast
// convention. No live simulate-hypothesis backend exists yet (the task's own Notes), so every
// response below is a mocked stand-in for the operation's own declared contract shape, never a
// read of a real endpoint.

export const SLUG = "some-case";
export const VERSION = 3;
export const SIMULATE_PATH = `/v1/cases/${SLUG}/versions/${VERSION}/simulate-hypothesis`;

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function errorResponse(code: string, status = 500): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type Handlers = Record<string, () => Response | Promise<Response>>;

/** A fetch stub answering exactly the paths its own `handlers` map names; any other path fails
 * the test loudly rather than hanging it, mirroring connector-test-panel.test-support.ts's own
 * createTestPanelFetchStub. */
export function stubFetch(handlers: Handlers): Mock<FetchFn> {
  const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(`use-simulate-hypothesis proof: no mocked response for ${url}`);
    }
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// Built once per test and captured in this closure, not constructed inline inside the returned
// component's own body -- a QueryClient built there would be rebuilt on every render the
// provider tree undergoes, discarding its cache mid-test.
export function createWrapper(): {
  Wrapper: (props: { children: ReactNode }) => ReactElement;
  queryClient: QueryClient;
} {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
  return { Wrapper, queryClient };
}

/** The JSON body of the `index`-th POST call this fetch stub recorded at SIMULATE_PATH --
 * mirrors connector-configurations-screen.test-support.ts's own parsedPutBody: a thrown guard
 * rather than an `as` cast (TYP-02) over a body that is not the JSON string apiFetch always
 * sends. */
export function parsedPostBody(fetchMock: Mock<FetchFn>, index = 0): unknown {
  const posts = fetchMock.mock.calls.filter(
    ([input, init]) =>
      (typeof input === "string" ? input : input.toString()) === SIMULATE_PATH &&
      (init?.method ?? "GET").toUpperCase() === "POST",
  );
  const rawBody = posts[index]?.[1]?.body;
  if (typeof rawBody !== "string") {
    throw new Error(
      "use-simulate-hypothesis.test-support.ts: expected a POST call to SIMULATE_PATH carrying a JSON string body",
    );
  }
  return JSON.parse(rawBody);
}

export const SUBJECT = {
  type: "billing-dispute",
  attributes: [{ attribute: "account-id", value: "12345" }],
} as const;

export function confirmedEvaluation(): Evaluation {
  return {
    hypothesis: "hypothesis-a",
    verdict: "confirmed",
    citations: [{ concept: "billing-account", field: "status" }],
  };
}

export function inconclusiveEvaluation(): Evaluation {
  return {
    hypothesis: "hypothesis-a",
    verdict: "inconclusive",
    reason: "no-data",
  };
}

/** A decided evaluation the way domain/investigation/evaluation.md describes one where a
 * judgment call actually happened -- carrying usage, elapsed_ms and prompt, none of which
 * confirmedEvaluation() above carries, since that fixture stands in for the no-judgment-call
 * case (reason "no-data" never having reached a call at all). */
export function confirmedEvaluationWithJudgmentCall(): Evaluation {
  return {
    hypothesis: "hypothesis-a",
    verdict: "confirmed",
    citations: [{ concept: "billing-account", field: "status" }],
    usage: { input_tokens: 120, output_tokens: 45 },
    elapsed_ms: 850,
    prompt: "Does the billing account status confirm hypothesis-a?",
  };
}

export function simulateHypothesisResult(
  evaluation: Evaluation = confirmedEvaluation(),
): SimulateHypothesisResult {
  return { evaluation };
}

/** Narrows a possibly-null result the way readyState/loadErrorState narrow
 * CapabilityDetailState in use-capability-detail.test-support.ts -- a thrown guard, never a `!`
 * non-null assertion, so a test failing this precondition reports why rather than a TypeError
 * from a null property read. */
export function definedResult(result: SimulateHypothesisResult | null): SimulateHypothesisResult {
  if (result === null) {
    throw new Error("use-simulate-hypothesis.test-support.ts: expected a non-null result");
  }
  return result;
}
