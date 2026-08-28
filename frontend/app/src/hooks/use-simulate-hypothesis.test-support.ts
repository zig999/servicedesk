import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  Durations,
  Evaluation,
  Evidence,
  SimulateHypothesisResult,
} from "./use-simulate-hypothesis";

// Shared fixtures and helpers for use-simulate-hypothesis's own split spec files
// (use-simulate-hypothesis-request.spec.ts, use-simulate-hypothesis-dispatch-safety.spec.ts),
// mirroring use-capability-detail.test-support.ts's own established one-support-file-per-unit
// pattern and connector-configurations-screen.test-support.ts's own parsedPutBody guard-not-cast
// convention. fix-use-simulate-hypothesis-dispatch (a corrective increment): the backend route
// this hook now dispatches to (POST /v1/simulate/hypothesis) is live, and every response fixture
// below models its own delivered simulateHypothesisResponseSchema shape -- still a mocked
// fetch response rather than a call against a running backend, matching how this app's own
// sibling use-simulate-case.ts hook is proven.

export const SLUG = "some-case";
export const VERSION = 3;
export const REQUESTER = "someone";
export const SIMULATE_PATH = "/v1/simulate/hypothesis";

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
    citations: [],
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

/** The evidence array a simulateHypothesisResult() fixture carries by default -- one collected
 * concept, shaped after the route's own delivered evidenceSchema (flat capability_name/
 * capability_version fields, this file's own header comment). */
export function evidenceItem(): Evidence {
  return {
    concept: "billing-account",
    inputs: "{}",
    observation: "the account is in good standing",
    observed_at: "2026-08-01T00:00:00.000Z",
    ttl: 3600,
    origin: "billing-connector",
    result: "ok",
    capability_name: "fetch-billing-account",
    capability_version: "1",
    elapsed_ms: 120,
  };
}

/** The durations object a simulateHypothesisResult() fixture carries by default -- no writing
 * figure, since this operation never consolidates (this file's own header comment). */
export function hypothesisDurations(): Durations {
  return { collection: 400, judgment: 300, total: 700 };
}

export function simulateHypothesisResult(
  evaluation: Evaluation = confirmedEvaluation(),
): SimulateHypothesisResult {
  return { evidence: [evidenceItem()], evaluation, durations: hypothesisDurations() };
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
