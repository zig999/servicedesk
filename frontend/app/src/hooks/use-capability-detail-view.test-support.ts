import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { CapabilityDetailViewState } from "./use-capability-detail-view";

// Shared fixtures and helpers for use-capability-detail-view.spec.ts, mirroring
// use-capability-detail.test-support.ts's own established pattern exactly (a METHOD-aware fetch
// stub over real Response objects -- TST-03's own "only the network boundary is a stand-in") --
// this hook composes over that already-delivered one at the very same CAPABILITY_PATH, so its
// own proof needs the same kind of stub for the same GET/PUT pair, plus this hook's own
// dependent Concept-vocabulary read (CONCEPTS_PATH) answered by default the same way
// use-capability-detail.test-support.ts's own defaultHandlers() already does, so a test that
// does not care about that vocabulary never has to repeat it.

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

/** Each handler is keyed by URL and receives the request's own method, so one entry can answer
 * both this hook's GET and its PUT to the very same path differently. Defaults both of this
 * hook's own reads to a successful load; a caller overrides just the entry it needs to vary for
 * its own test -- see this file's own header comment. */
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
