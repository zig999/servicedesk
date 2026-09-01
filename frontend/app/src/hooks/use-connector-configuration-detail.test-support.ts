import { createElement, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ConnectorConfigurationDetailState } from "./use-connector-configuration-detail";

export const CONNECTOR = "some-connector";
export const CONFIGURATION_PATH = `/v1/connectors/${CONNECTOR}`;
export const LOADED_CONFIGURATION = '{"key":"value"}';
export const UPDATED_CONFIGURATION = '{"key":"updated"}';

export const NON_OBJECT_CONFIGURATIONS: ReadonlyArray<{
  readonly label: string;
  readonly text: string;
}> = [
  { label: "an array", text: "[1,2,3]" },
  { label: "a bare string", text: '"just a string"' },
  { label: "a number", text: "42" },
  { label: "true", text: "true" },
  { label: "null", text: "null" },
];

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function errorResponse(code: string, status = 500): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

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
