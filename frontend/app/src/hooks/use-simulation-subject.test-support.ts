import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { SimulationSubjectSource } from "./use-simulation-subject";

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

export const NO_REQUIRED_FIELDS_RESPONSE = {
  requirements: [],
  capabilities_with_malformed_input_schema: [],
};

export const SOURCE: SimulationSubjectSource = { subject: "billing-dispute" };

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

type FetchFn = (input: string | URL | Request) => Promise<Response>;
type Handlers = Record<string, () => Response | Promise<Response>>;

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
