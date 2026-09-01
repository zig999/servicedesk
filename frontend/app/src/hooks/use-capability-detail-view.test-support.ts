import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { CapabilityDetailViewState } from "./use-capability-detail-view";

export const NAME = "some-capability";
export const VERSION = "v1";
export const CAPABILITY_PATH = `/v1/capabilities/${NAME}/${VERSION}`;
export const CONCEPTS_PATH = "/v1/glossary/concepts";

export const LOADED_INPUT_SCHEMA = '{"type":"object"}';
export const LOADED_OUTPUT_SCHEMA = '{"type":"string"}';
export const UPDATED_INPUT_SCHEMA = '{"type":"object","updated":true}';
export const UPDATED_OUTPUT_SCHEMA = '{"type":"string","updated":true}';
export const FURTHER_INPUT_SCHEMA = '{"type":"object","further":true}';
export const FURTHER_OUTPUT_SCHEMA = '{"type":"string","further":true}';

export const LOADED_CAPABILITY = {
  name: NAME,
  version: VERSION,
  nature: "read-only",
  input_schema: LOADED_INPUT_SCHEMA,
  output_schema: LOADED_OUTPUT_SCHEMA,
  timeout: 30,
  connector: "some-connector",
  concept: "some-concept",
};

export const CONCEPTS_RESPONSE = { data: [{ name: "some-concept", accepts: ["capability"] }] };

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type Handlers = Record<string, (method: string) => Response | Promise<Response>>;

export function stubFetch(overrides: Handlers = {}): Mock<FetchFn> {
  const handlers: Handlers = {
    [CAPABILITY_PATH]: () => jsonResponse(LOADED_CAPABILITY),
    [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
    ...overrides,
  };
  const fetchMock = vi.fn(
    async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      const handler = handlers[url];
      if (!handler) {
        throw new Error(`useCapabilityDetailView proof: no mocked response for ${url}`);
      }
      return handler((init?.method ?? "GET").toUpperCase());
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export function createWrapper(): {
  Wrapper: (props: { children: ReactNode }) => ReactElement;
} {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
  return { Wrapper };
}

export function readyState(
  state: CapabilityDetailViewState,
): Extract<CapabilityDetailViewState, { phase: "ready" }> {
  if (state.phase !== "ready") {
    throw new Error(`expected the ready phase, got "${state.phase}"`);
  }
  return state;
}
