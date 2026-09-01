import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type {
  Durations,
  Evaluation,
  Evidence,
  SimulateHypothesisResult,
} from "./use-simulate-hypothesis";

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

export function hypothesisDurations(): Durations {
  return { collection: 400, judgment: 300, total: 700 };
}

export function simulateHypothesisResult(
  evaluation: Evaluation = confirmedEvaluation(),
): SimulateHypothesisResult {
  return { evidence: [evidenceItem()], evaluation, durations: hypothesisDurations() };
}

export function definedResult(result: SimulateHypothesisResult | null): SimulateHypothesisResult {
  if (result === null) {
    throw new Error("use-simulate-hypothesis.test-support.ts: expected a non-null result");
  }
  return result;
}
