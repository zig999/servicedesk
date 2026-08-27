import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { SimulationSubjectSource } from "./use-simulation-subject";
import type { CaseVersionManifestEntry } from "../services/case-version-record";

// Shared fixtures and helpers for use-simulation-subject.spec.ts, mirroring
// use-capability-detail-view.test-support.ts's own established pattern: a URL-keyed fetch stub
// over real Response objects (TST-03 -- only the network boundary this hook composes through,
// via useCapabilities/useConnectorConfigurations, is a stand-in) and a QueryClient built once
// per test rather than inline inside the wrapper's own render.

export const CAPABILITIES_PATH = "/v1/capabilities";
export const CONNECTORS_PATH = "/v1/connectors";

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

const REQUIRED_FIELD_MANIFEST: readonly CaseVersionManifestEntry[] = [
  {
    position: 1,
    hypothesis_revision: {
      hypothesis: { name: "some-hypothesis" },
      revision: 1,
      criterion: "some criterion",
      collects: ["billing-history"],
    },
  },
];

/** A version whose collection plan derives exactly one required field ("account-id"), resolved
 * through CAPABILITY/CONNECTOR_CONFIGURATION above. */
export const VERSION_WITH_REQUIRED_FIELD: SimulationSubjectSource = {
  subject: "billing-dispute",
  manifest: REQUIRED_FIELD_MANIFEST,
};

/** A version whose collection plan derives no required field at all -- criterion 6's own case. */
export const VERSION_WITH_NO_REQUIRED_FIELDS: SimulationSubjectSource = {
  subject: "billing-dispute",
  manifest: [],
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

type FetchFn = (input: string | URL | Request) => Promise<Response>;
type Handlers = Record<string, () => Response | Promise<Response>>;

/** Defaults both of this hook's own composed registry reads to a successful, single-entry
 * load; a caller overrides just the entry it needs to vary for its own test. */
export function stubFetch(overrides: Handlers = {}): Mock<FetchFn> {
  const handlers: Handlers = {
    [CAPABILITIES_PATH]: () => jsonResponse({ data: [CAPABILITY] }),
    [CONNECTORS_PATH]: () => jsonResponse({ data: [CONNECTOR_CONFIGURATION] }),
    ...overrides,
  };
  const fetchMock = vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(`useSimulationSubject proof: no mocked response for ${url}`);
    }
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export function createWrapper(): { Wrapper: (props: { children: ReactNode }) => ReactElement } {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
  return { Wrapper };
}
