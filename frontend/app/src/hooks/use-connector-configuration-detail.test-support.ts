import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ConnectorConfigurationDetailState } from "./use-connector-configuration-detail";

// Shared fixtures and helpers for use-connector-configuration-detail.spec.ts,
// split out to stay under this project's own max-lines rule -- mirrors
// new-case-draft-screen.test-support.ts's own established pattern of one
// .test-support.ts file per unit whose own proof needs it split.

export const CONNECTOR = "some-connector";
export const CONFIGURATION_PATH = `/v1/connectors/${CONNECTOR}`;
export const LOADED_CONFIGURATION = '{"key":"value"}';
export const UPDATED_CONFIGURATION = '{"key":"updated"}';

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function errorResponse(code: string, status = 500): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

/** Each handler is keyed by URL and receives the request's own method, so one entry can answer
 * both this hook's GET and its PUT to the very same path differently. */
export function stubFetch(
  handlers: Record<string, (method: string) => Response | Promise<Response>>,
): Mock<FetchFn> {
  const fetchMock = vi.fn(
    async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      const handler = handlers[url];
      if (!handler) {
        throw new Error(
          `useConnectorConfigurationDetail proof: no mocked response for ${url}`,
        );
      }
      return handler(init?.method ?? "GET");
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

export function readyState(
  state: ConnectorConfigurationDetailState,
): Extract<ConnectorConfigurationDetailState, { phase: "ready" }> {
  if (state.phase !== "ready") {
    throw new Error(`expected the ready phase, got "${state.phase}"`);
  }
  return state;
}

export function loadErrorState(
  state: ConnectorConfigurationDetailState,
): Extract<ConnectorConfigurationDetailState, { phase: "load-error" }> {
  if (state.phase !== "load-error") {
    throw new Error(`expected the load-error phase, got "${state.phase}"`);
  }
  return state;
}
