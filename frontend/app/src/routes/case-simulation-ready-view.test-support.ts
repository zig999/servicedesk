import { createElement } from "react";
import { vi, type Mock } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CaseSimulationReadyView,
  type CaseSimulationReadyViewProps,
} from "./case-simulation-ready-view";
import type { CaseVersionRecord, CaseVersionManifestEntry } from "../services/case-version-record";
import type { SimulateCaseResult, SimulateEvaluation } from "../hooks/use-simulate-case";
import type {
  Durations as HypothesisDurations,
  Evidence as HypothesisEvidence,
  SimulateHypothesisResult,
  Evaluation as HypothesisEvaluation,
} from "../hooks/use-simulate-hypothesis";

// Shared fixtures and mounting helper for case-simulation-ready-view.spec.ts,
// case-simulation-ready-view-dispatch.spec.ts and case-simulation-ready-view-selection.spec.ts
// -- task/simulation-cockpit/screen-assembly's own composed cockpit, which now calls
// react-query hooks (useSimulationSubject's own useCapabilities/useConnectorConfigurations,
// CaseSimulationSubjectPanel's own useGlossaryVocabularyOptions x2, useSimulateCase,
// useSimulateHypothesis) and needs a QueryClientProvider in the render tree to mount at all --
// unlike this file's own previous placeholder wiring, which needed none of this. Mirrors
// case-simulation-screen.spec.ts's own QueryClientProvider + real-router mounting shape (this
// component renders CaseSimulationHeader's and the Hypotheses table's own real router Links) and
// use-simulation-subject.test-support.ts's own URL-keyed fetch stub (TST-03: only the network
// boundary this composed tree reads through is a stand-in, never this tree's own rendering).

export const CAPABILITIES_PATH = "/v1/capabilities";
export const CONNECTORS_PATH = "/v1/connectors";
export const GLOSSARY_SUBJECT_TYPE_PATH = "/v1/glossary/subject-type";
export const GLOSSARY_SUBJECT_ATTRIBUTE_PATH = "/v1/glossary/subject-attribute";
export const SIMULATE_CASE_PATH = "/v1/simulate";

/** fix-use-simulate-hypothesis-dispatch (a corrective increment): the hook now dispatches to one
 * fixed route regardless of slug/version -- the case identity travels in the body instead. Keeps
 * its own two parameters so every existing call site in this route's own sibling spec files
 * (`simulateHypothesisPath(SLUG, VERSION)`) still resolves to the one URL the hook actually
 * calls, without editing those call sites. */
export function simulateHypothesisPath(_slug: string, _version: number): string {
  return "/v1/simulate/hypothesis";
}

export const SLUG = "acme-widgets";
export const VERSION = 7;

/** Mirrors use-simulation-subject.test-support.ts's own identical fixture pair -- that file's
 * own suite already proves this exact combination derives exactly one required field,
 * "account-id". */
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

export const RECORD: CaseVersionRecord = {
  title: "A title no criterion of this task names",
  when_to_use: "Use when the customer disputes a charge",
  subject: "billing-dispute",
  fallback: { outcome: "resolved", referral: { action: "notify", recipient: "customer" } },
  manifest: MANIFEST,
};

type ReadyState = CaseSimulationReadyViewProps["state"];

export function readyState(
  overrides: Partial<Pick<ReadyState, "versionState" | "record">> = {},
): ReadyState {
  return {
    phase: "ready",
    record: overrides.record ?? RECORD,
    versionState: overrides.versionState ?? "draft",
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
    throw new Error("case-simulation-ready-view proof: expected a request body carrying a subject");
  }
  return body.subject;
}

/** Defaults every registry read this composed tree issues (capabilities, connector
 * configurations, both glossary vocabularies) to a successful, single-entry load; a caller
 * overrides just the endpoint it needs to vary (typically SIMULATE_CASE_PATH or
 * simulateHypothesisPath's own endpoint) for its own test. Throws loudly for any unmocked URL
 * rather than hanging the test. */
export function stubFetch(overrides: Record<string, Handler> = {}): Mock<FetchFn> {
  const handlers: Record<string, Handler> = {
    [CAPABILITIES_PATH]: () => jsonResponse({ data: [CAPABILITY] }),
    [CONNECTORS_PATH]: () => jsonResponse({ data: [CONNECTOR_CONFIGURATION] }),
    [GLOSSARY_SUBJECT_TYPE_PATH]: () => jsonResponse({ data: [{ name: "billing-dispute" }] }),
    [GLOSSARY_SUBJECT_ATTRIBUTE_PATH]: () => jsonResponse({ data: [{ name: "case-priority" }] }),
    ...overrides,
  };
  const fetchMock = vi.fn(
    async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      const handler = handlers[url];
      if (!handler) {
        throw new Error(`case-simulation-ready-view proof: no mocked response for ${url}`);
      }
      return handler(init?.method ?? "GET", parsedBody(init));
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Mounts the composed ready view through a real router (its own header and its own Hypotheses
 * table each render a real TanStack Router Link) and a real QueryClient -- mirrors
 * case-simulation-ready-view.spec.ts's own previous mountReadyView shape, widened with the
 * QueryClientProvider this composed tree now needs to mount at all, and with the manifest-
 * hypothesis edit route the Hypotheses table's own row Edit links now resolve against. */
export async function mountReadyView(props: CaseSimulationReadyViewProps): Promise<QueryClient> {
  const rootRoute = createRootRoute({
    component: () => createElement(CaseSimulationReadyView, props),
  });
  const versionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version",
    component: () => null,
  });
  const newVersionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/new",
    component: () => null,
  });
  const manifestRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest",
    component: () => null,
  });
  const editHypothesisRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName",
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([
    versionRoute,
    newVersionRoute,
    manifestRoute,
    editHypothesisRoute,
  ]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
  return queryClient;
}

/** Fills the shared subject's own one derived required field ("account-id") and the requester,
 * through the rendered Subject region, so the header's and every row's own Simulate action
 * become enabled (criterion 1). Awaits the field's own async derivation before typing into it. */
export async function fillSubjectReadyInView(): Promise<void> {
  const requiredField = await screen.findByLabelText("account-id");
  fireEvent.change(requiredField, { target: { value: "acct-1" } });
  const requester = screen.getByLabelText("Requester");
  fireEvent.change(requester, { target: { value: "someone" } });
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
    citations: [],
  };
}

/** The evidence array and durations object a simulateHypothesisResult() fixture carries by
 * default, shaped after the route's own delivered evidenceSchema/durationsSchema
 * (fix-use-simulate-hypothesis-dispatch's own header comment on use-simulate-hypothesis.ts). */
function hypothesisEvidence(): readonly HypothesisEvidence[] {
  return [
    {
      concept: "billing-history",
      inputs: "{}",
      observation: "the account shows one authorized charge",
      observed_at: "2026-08-01T00:00:00.000Z",
      ttl: 3600,
      origin: "billing-connector",
      result: "ok",
      capability_name: "fetch-billing-account",
      capability_version: "1",
      elapsed_ms: 120,
    },
  ];
}

function hypothesisDurations(): HypothesisDurations {
  return { collection: 400, judgment: 300, total: 700 };
}

export function simulateHypothesisResult(
  evaluation: HypothesisEvaluation = confirmedHypothesisEvaluation("hypothesis-a"),
): SimulateHypothesisResult {
  return { evidence: hypothesisEvidence(), evaluation, durations: hypothesisDurations() };
}
