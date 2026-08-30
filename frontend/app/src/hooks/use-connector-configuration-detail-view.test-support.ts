import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ConnectorConfigurationDetailViewState } from "./use-connector-configuration-detail-view";

// Shared fixtures and helpers for use-connector-configuration-detail-view.spec.ts, mirroring
// use-connector-configuration-detail.test-support.ts's own established pattern exactly (a
// METHOD-aware fetch stub over real Response objects -- TST-03's own "only the network boundary
// is a stand-in") -- this hook composes over that already-delivered one at the very same
// CONFIGURATION_PATH, so its own proof needs the same kind of stub for the same GET/PUT pair.

export const CONNECTOR = "some-connector";
export const CONFIGURATION_PATH = `/v1/connectors/${CONNECTOR}`;
export const LOADED_CONFIGURATION = '{"key":"value"}';
export const UPDATED_CONFIGURATION = '{"key":"updated"}';
export const FURTHER_CONFIGURATION = '{"key":"further"}';

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
          `useConnectorConfigurationDetailView proof: no mocked response for ${url}`,
        );
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
  state: ConnectorConfigurationDetailViewState,
): Extract<ConnectorConfigurationDetailViewState, { phase: "ready" }> {
  if (state.phase !== "ready") {
    throw new Error(`expected the ready phase, got "${state.phase}"`);
  }
  return state;
}
