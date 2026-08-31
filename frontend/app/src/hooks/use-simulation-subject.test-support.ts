import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { SimulationSubjectSource } from "./use-simulation-subject";

// Shared fixtures and helpers for use-simulation-subject.spec.ts and its sibling
// use-simulation-subject-malformed-capabilities.spec.ts (split out of the former to stay under
// this project's own max-lines rule -- that file's own header comment carries the full rationale
// and TST-04 divergence), mirroring
// use-capability-detail-view.test-support.ts's own established pattern: a URL-keyed fetch stub
// over real Response objects (TST-03 -- only the network boundary this hook composes through,
// via useCaseInputRequirements/useCapabilities, is a stand-in) and a QueryClient built once per
// test rather than inline inside the wrapper's own render.
//
// task/subject-input-requirements/derive-subject-fields-from-input-requirements: this hook now
// composes useCaseInputRequirements(slug, version) and useCapabilities() instead of
// useConnectorConfigurations(), so the fixtures below key on the case-input-requirements
// endpoint (one path per pinned slug/version) rather than on a connector-configurations page.

export const SLUG = "billing-dispute-case";
export const VERSION_WITH_FIELD = 1;
export const VERSION_WITHOUT_FIELD = 2;

export const CAPABILITIES_PATH = "/v1/capabilities";

export function inputRequirementsPath(slug: string, version: number): string {
  return `/v1/cases/${encodeURIComponent(slug)}/versions/${version}/input-requirements`;
}

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

/** A pinned version whose derived requirements name exactly one field ("account-id"),
 * resolved to CAPABILITY above by exact name/version identity. */
export const REQUIRED_FIELD_RESPONSE = {
  requirements: [
    {
      attribute: "account-id",
      required: true,
      capabilities: [{ name: CAPABILITY.name, version: CAPABILITY.version }],
    },
  ],
  capabilities_with_malformed_input_schema: [],
};

/** A pinned version whose derived requirements name no field at all -- criterion 6's own case. */
export const NO_REQUIRED_FIELDS_RESPONSE = {
  requirements: [],
  capabilities_with_malformed_input_schema: [],
};

/** This hook's own source no longer carries a `manifest` field -- slug/version are threaded
 * straight into the hook's own two extra arguments instead (this hook's own header comment). */
export const SOURCE: SimulationSubjectSource = { subject: "billing-dispute" };

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

type FetchFn = (input: string | URL | Request) => Promise<Response>;
type Handlers = Record<string, () => Response | Promise<Response>>;

/** Defaults both of this hook's own composed registry reads to a successful load -- one
 * capability, and VERSION_WITH_FIELD/VERSION_WITHOUT_FIELD's own case-input-requirements
 * responses; a caller overrides just the entry it needs to vary for its own test. */
export function stubFetch(overrides: Handlers = {}): Mock<FetchFn> {
  const handlers: Handlers = {
    [CAPABILITIES_PATH]: () => jsonResponse({ data: [CAPABILITY] }),
    [inputRequirementsPath(SLUG, VERSION_WITH_FIELD)]: () => jsonResponse(REQUIRED_FIELD_RESPONSE),
    [inputRequirementsPath(SLUG, VERSION_WITHOUT_FIELD)]: () => jsonResponse(NO_REQUIRED_FIELDS_RESPONSE),
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
