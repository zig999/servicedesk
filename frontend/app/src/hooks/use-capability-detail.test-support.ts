import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { CapabilityDetailState } from "./use-capability-detail";

// Shared fixtures and helpers for use-capability-detail.spec.ts, split out to stay under this
// project's own max-lines rule from the start -- mirrors
// use-connector-configuration-detail.test-support.ts's own established pattern of one
// .test-support.ts file per unit whose own proof needs it split.

export const NAME = "some-capability";
export const VERSION = "v1";
export const CAPABILITY_PATH = `/v1/capabilities/${NAME}/${VERSION}`;
export const CONCEPTS_PATH = "/v1/glossary/concepts";

export const LOADED_INPUT_SCHEMA = '{"type":"object"}';
export const LOADED_OUTPUT_SCHEMA = '{"type":"string"}';
export const UPDATED_INPUT_SCHEMA = '{"type":"object","updated":true}';
export const UPDATED_OUTPUT_SCHEMA = '{"type":"string","updated":true}';

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

export function errorResponse(code: string, status = 500): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type Handlers = Record<string, (method: string) => Response | Promise<Response>>;

/** Each handler is keyed by URL and receives the request's own method, so one entry can answer
 * both a GET and a PUT to the very same path differently. */
export function stubFetch(handlers: Handlers): Mock<FetchFn> {
  const fetchMock = vi.fn(
    async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      const handler = handlers[url];
      if (!handler) {
        throw new Error(`useCapabilityDetail proof: no mocked response for ${url}`);
      }
      return handler(init?.method ?? "GET");
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Defaults both of this hook's own reads to a successful load; a caller overrides just the
 * entry it needs to vary for its own test. */
export function defaultHandlers(overrides: Handlers = {}): Handlers {
  return {
    [CAPABILITY_PATH]: () => jsonResponse(LOADED_CAPABILITY),
    [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
    ...overrides,
  };
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

export function readyState(
  state: CapabilityDetailState,
): Extract<CapabilityDetailState, { phase: "ready" }> {
  if (state.phase !== "ready") {
    throw new Error(`expected the ready phase, got "${state.phase}"`);
  }
  return state;
}

export function loadErrorState(
  state: CapabilityDetailState,
): Extract<CapabilityDetailState, { phase: "load-error" }> {
  if (state.phase !== "load-error") {
    throw new Error(`expected the load-error phase, got "${state.phase}"`);
  }
  return state;
}
