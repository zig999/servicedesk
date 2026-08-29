import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  SimulateCaseRef,
  SimulateCaseRequestBody,
  SimulateCaseResult,
  SimulateCaseState,
  SimulateEvaluation,
  SimulateSubject,
} from "./use-simulate-case";

// Shared fixtures and helpers for use-simulate-case.spec.ts and
// use-simulate-case-response-shape.spec.ts, mirroring
// use-capability-detail.test-support.ts's own established one-support-file-per-unit pattern.

export const SIMULATE_PATH = "/v1/simulate";
export const REQUESTER = "operator@example.com";

/** A case identity a real system would treat as a draft version -- this hook's own request
 * body carries no `state` field at all, so nothing here distinguishes it structurally from
 * releasedCaseRef() below except the version number a caller happens to pass. */
export function draftCaseRef(): SimulateCaseRef {
  return { slug: "some-case", version: 1 };
}

/** A case identity a real system would treat as a released version -- see draftCaseRef() above. */
export function releasedCaseRef(): SimulateCaseRef {
  return { slug: "some-case", version: 2 };
}

export function subject(): SimulateSubject {
  return {
    type: "billing-dispute",
    attributes: [{ attribute: "account-id", value: "12345" }],
  };
}

export function requestBody(caseRef: SimulateCaseRef): SimulateCaseRequestBody {
  return { case: caseRef, subject: subject(), requester: REQUESTER };
}

/** A full, typed success response: one evidence item carrying result_detail and one without
 * it, one confirmed evaluation carrying citations and a call record and one inconclusive
 * evaluation carrying a reason and no call record, and a fully-populated assessment/cost/
 * durations record. */
export function simulateResult(overrides: Partial<SimulateCaseResult> = {}): SimulateCaseResult {
  return {
    evidence: [
      {
        concept: "account-standing",
        inputs: "{}",
        observation: "the account is in good standing",
        observed_at: "2026-08-01T00:00:00.000Z",
        ttl: 3600,
        origin: "billing-connector",
        result: "ok",
        result_detail: "cached",
        elapsed_ms: 120,
        capability_name: "lookup-account",
        capability_version: "1.0.0",
      },
      {
        concept: "payment-history",
        inputs: "{}",
        observation: "",
        observed_at: "2026-08-01T00:00:05.000Z",
        ttl: 0,
        origin: "billing-connector",
        result: "timeout",
        elapsed_ms: 5000,
        capability_name: "lookup-payments",
        capability_version: "2.0.0",
      },
    ],
    evaluations: [
      {
        hypothesis: "billing-dispute-valid",
        verdict: "confirmed",
        citations: [{ concept: "account-standing", field: "observation" }],
        usage: { input_tokens: 120, output_tokens: 40 },
        elapsed_ms: 800,
        prompt: "judge billing-dispute-valid",
      },
      {
        hypothesis: "fraud-suspected",
        verdict: "inconclusive",
        reason: "no-data",
        citations: [],
      },
    ],
    assessment: {
      outcome: "confirmed",
      referral: { action: "escalate", recipient: "billing-team" },
      determining_hypothesis: "billing-dispute-valid",
      text: "The dispute is valid based on account standing.",
      register: "formal",
      usage: { input_tokens: 200, output_tokens: 90 },
      elapsed_ms: 950,
      prompt: "consolidate the assessment",
    },
    cost: { calls: 3, input_tokens: 320, output_tokens: 130 },
    durations: { collection: 1200, judgment: 800, writing: 300, total: 2300 },
    ...overrides,
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function errorResponse(code: string, status = 500, message = code): Response {
  return new Response(JSON.stringify({ error: { code, message } }), { status });
}

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type Handler = (method: string, body: unknown) => Response | Promise<Response>;

function parsedBody(init?: RequestInit): unknown {
  if (typeof init?.body !== "string") {
    return undefined;
  }
  return JSON.parse(init.body);
}

/** Each handler receives the request's own method and its parsed JSON body, so a test can
 * inspect exactly what onSimulate dispatched without reaching into the hook's own internals. */
export function stubFetch(handlers: Record<string, Handler>): Mock<FetchFn> {
  const fetchMock = vi.fn(
    async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      const handler = handlers[url];
      if (!handler) {
        throw new Error(`useSimulateCase proof: no mocked response for ${url}`);
      }
      return handler(init?.method ?? "GET", parsedBody(init));
    },
  );
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

/** Narrows the hook's own nullable `result` without a cast, mirroring
 * use-capability-detail.test-support.ts's own readyState()/loadErrorState() narrowing helpers. */
export function loadedResult(state: SimulateCaseState): SimulateCaseResult {
  if (state.result === null) {
    throw new Error("expected a loaded simulate-case result");
  }
  return state.result;
}

export function confirmedEvaluation(
  evaluations: readonly SimulateEvaluation[],
): Extract<SimulateEvaluation, { verdict: "confirmed" | "refuted" }> {
  const found = evaluations.find((one) => one.verdict === "confirmed" || one.verdict === "refuted");
  if (!found || (found.verdict !== "confirmed" && found.verdict !== "refuted")) {
    throw new Error("expected a decided evaluation in the fixture");
  }
  return found;
}

export function inconclusiveEvaluation(
  evaluations: readonly SimulateEvaluation[],
): Extract<SimulateEvaluation, { verdict: "inconclusive" }> {
  const found = evaluations.find((one) => one.verdict === "inconclusive");
  if (!found || found.verdict !== "inconclusive") {
    throw new Error("expected an inconclusive evaluation in the fixture");
  }
  return found;
}
