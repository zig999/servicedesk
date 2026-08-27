import { createElement, type ReactElement, type ReactNode } from "react";
import { act, waitFor } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { CaseVersionRecord, CaseVersionManifestEntry } from "../services/case-version-record";
import type { SimulateCaseResult, SimulateEvaluation } from "./use-simulate-case";
import type { SimulateHypothesisResult, Evaluation as HypothesisEvaluation } from "./use-simulate-hypothesis";
import type { CaseSimulationCockpitState } from "./use-case-simulation-cockpit";

// Shared fixtures and helpers for use-case-simulation-cockpit.ts's own split proof
// (-gating.spec.ts, -evaluations.spec.ts, -staleness.spec.ts), mirroring
// use-simulation-subject.test-support.ts's own URL-keyed fetch stub and
// use-simulate-case.test-support.ts's own method/body-capturing handler shape. This hook
// composes exactly four network boundaries through its own four already-delivered composed
// hooks (useSimulationSubject's capabilities/connector-configurations, useSimulateCase's
// /v1/simulate, useSimulateHypothesis's own per-slug/version endpoint) -- this file stands in
// for those four boundaries only (TST-03), never for this hook's own composition logic
// (the gating, the shared subject, the per-hypothesis evaluation map, the case-result and
// staleness bookkeeping), which each spec file exercises directly against the real hook.

export const CAPABILITIES_PATH = "/v1/capabilities";
export const CONNECTORS_PATH = "/v1/connectors";
export const SIMULATE_CASE_PATH = "/v1/simulate";

export function simulateHypothesisPath(slug: string, version: number): string {
  return `/v1/cases/${slug}/versions/${version}/simulate-hypothesis`;
}

/** Mirrors use-simulation-subject.test-support.ts's own identical fixture pair exactly -- that
 * file's own suite already proves this capability/connector-configuration combination derives
 * exactly one required field, "account-id". */
export const CAPABILITY = {
  name: "fetch-billing-account",
  version: "1",
  nature: "read-only" as const,
  input_schema: '{"type":"object"}',
  output_schema: "{}",
  timeout: 5000,
  connector: "billing-connector",
  concept: "billing-history",
};

export const CONNECTOR_CONFIGURATION = {
  connector: "billing-connector",
  configuration: JSON.stringify({ address: "https://billing/${subject:account-id}" }),
};

export const MANIFEST: readonly CaseVersionManifestEntry[] = [
  {
    position: 1,
    hypothesis_revision: {
      hypothesis: { name: "hypothesis-a" },
      revision: 1,
      criterion: "The customer disputes a charge the account never authorized.",
      collects: ["billing-history"],
    },
  },
  {
    position: 2,
    hypothesis_revision: {
      hypothesis: { name: "hypothesis-b" },
      revision: 1,
      criterion: "The account shows a duplicate charge for the same order.",
      collects: ["billing-history"],
    },
  },
];

export function record(overrides: Partial<CaseVersionRecord> = {}): CaseVersionRecord {
  return {
    title: "A title no criterion of this task names",
    when_to_use: "Use when the customer disputes a charge",
    subject: "billing-dispute",
    fallback: { outcome: "resolved", referral: { action: "notify", recipient: "customer" } },
    manifest: MANIFEST,
    ...overrides,
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function errorResponse(code: string, status = 500): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type Handler = (method: string, body: unknown) => Response | Promise<Response>;

function parsedBody(init?: RequestInit): unknown {
  if (typeof init?.body !== "string") {
    return undefined;
  }
  return JSON.parse(init.body);
}

function hasSubjectField(body: unknown): body is { subject: unknown } {
  return typeof body === "object" && body !== null && "subject" in body;
}

/** Narrows a handler's own parsed request body down to its `subject` field without a cast,
 * mirroring use-simulate-case.test-support.ts's own loadedResult()/confirmedEvaluation()
 * narrowing-helper convention. Throws loudly rather than letting an unrelated body shape slip
 * past as `undefined`. */
export function bodySubject(body: unknown): unknown {
  if (!hasSubjectField(body)) {
    throw new Error("use-case-simulation-cockpit proof: expected a request body carrying a subject");
  }
  return body.subject;
}

/** Defaults the two registry reads useSimulationSubject composes to a successful, single-entry
 * load; a caller overrides just the endpoint it needs to vary (typically SIMULATE_CASE_PATH or
 * simulateHypothesisPath's own endpoint) for its own test. Throws loudly for any unmocked URL
 * rather than hanging the test. */
export function stubFetch(overrides: Record<string, Handler> = {}): Mock<FetchFn> {
  const handlers: Record<string, Handler> = {
    [CAPABILITIES_PATH]: () => jsonResponse({ data: [CAPABILITY] }),
    [CONNECTORS_PATH]: () => jsonResponse({ data: [CONNECTOR_CONFIGURATION] }),
    ...overrides,
  };
  const fetchMock = vi.fn(
    async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      const handler = handlers[url];
      if (!handler) {
        throw new Error(`use-case-simulation-cockpit proof: no mocked response for ${url}`);
      }
      return handler(init?.method ?? "GET", parsedBody(init));
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// Built once per test and captured in this closure, not constructed inline inside the returned
// component's own body -- a QueryClient built there would be rebuilt on every render the
// provider tree undergoes, discarding its cache mid-test (mirrors every sibling hook's own
// test-support convention in this hooks directory).
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

export function confirmedCaseEvaluation(hypothesis: string): SimulateEvaluation {
  return {
    hypothesis,
    verdict: "confirmed",
    citations: [{ concept: "billing-history", field: "observation" }],
  };
}

export function inconclusiveCaseEvaluation(hypothesis: string): SimulateEvaluation {
  return {
    hypothesis,
    verdict: "inconclusive",
    reason: "no-data",
    citations: [],
  };
}

export function simulateCaseResult(overrides: Partial<SimulateCaseResult> = {}): SimulateCaseResult {
  return {
    evidence: [
      {
        concept: "billing-history",
        inputs: "{}",
        observation: "the account shows one authorized charge",
        observed_at: "2026-08-01T00:00:00.000Z",
        ttl: 3600,
        origin: "billing-connector",
        result: "ok",
        elapsed_ms: 120,
        capability: { name: "fetch-billing-account", version: "1" },
      },
    ],
    evaluations: [confirmedCaseEvaluation("hypothesis-a"), inconclusiveCaseEvaluation("hypothesis-b")],
    assessment: {
      outcome: "resolved",
      referral: { action: "notify", recipient: "customer" },
      determining_hypothesis: "hypothesis-a",
      text: "The disputed charge was authorized.",
      register: "formal",
      usage: { input_tokens: 200, output_tokens: 90 },
      elapsed_ms: 950,
      prompt: "consolidate the assessment",
    },
    cost: { calls: 2, input_tokens: 300, output_tokens: 130 },
    durations: { collection: 1200, judgment: 800, writing: 300, total: 2300 },
    ...overrides,
  };
}

export function confirmedHypothesisEvaluation(hypothesis: string): HypothesisEvaluation {
  return {
    hypothesis,
    verdict: "confirmed",
    citations: [{ concept: "billing-history", field: "observation" }],
  };
}

export function inconclusiveHypothesisEvaluation(hypothesis: string): HypothesisEvaluation {
  return {
    hypothesis,
    verdict: "inconclusive",
    reason: "no-data",
  };
}

export function simulateHypothesisResult(
  evaluation: HypothesisEvaluation = confirmedHypothesisEvaluation("hypothesis-a"),
): SimulateHypothesisResult {
  return { evaluation };
}

/** Fills the shared subject's own one derived required field and requester so
 * `subjectState.isReady` turns true, the precondition every gating test needs before it can
 * observe the gate actually flip -- awaits the field's own async derivation (capabilities/
 * connector-configurations) before typing into it, the same waitFor-then-act shape
 * use-simulation-subject.spec.ts's own tests already establish. */
export async function makeSubjectReady(
  result: { readonly current: CaseSimulationCockpitState },
): Promise<void> {
  await waitFor(() => {
    if (result.current.subject.requiredFields.length !== 1) {
      throw new Error(
        "use-case-simulation-cockpit proof: expected exactly one derived required field to have loaded",
      );
    }
  });
  act(() => {
    result.current.subject.requiredFields[0]?.onChange("acct-1");
  });
  act(() => {
    result.current.subject.onRequesterChange("someone");
  });
}
