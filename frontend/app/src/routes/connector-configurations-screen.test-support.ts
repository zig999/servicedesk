import { createElement } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { ConnectorConfigurationsScreen } from "./connector-configurations-screen";
import type { ConnectorConfiguration } from "../hooks/use-connector-configurations";

export const CONNECTORS_PATH = "/v1/connectors";

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type RecordedCall = [string | URL | Request, RequestInit | undefined];

export function connectorPutPath(connector: string): string {
  return `/v1/connectors/${encodeURIComponent(connector)}`;
}

export function requestsWithMethod(
  fetchMock: Mock<FetchFn>,
  method: string,
): readonly RecordedCall[] {
  return fetchMock.mock.calls
    .filter(([, init]) => (init?.method ?? "GET").toUpperCase() === method)
    .map(([input, init]): RecordedCall => [input, init]);
}

export function putCallCount(fetchMock: Mock<FetchFn>): number {
  return requestsWithMethod(fetchMock, "PUT").length;
}

export function callsToPath(fetchMock: Mock<FetchFn>, path: string): readonly RecordedCall[] {
  return fetchMock.mock.calls
    .filter(([input]) => (typeof input === "string" ? input : input.toString()) === path)
    .map(([input, init]): RecordedCall => [input, init]);
}

export function parsedPutBody(fetchMock: Mock<FetchFn>, index = 0): unknown {
  const rawBody = requestsWithMethod(fetchMock, "PUT")[index]?.[1]?.body;
  if (typeof rawBody !== "string") {
    throw new Error(
      "connector-configurations-screen.test-support.ts: expected a PUT call carrying a JSON string body",
    );
  }
  return JSON.parse(rawBody);
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function connectorConfigurationsPage(data: readonly ConnectorConfiguration[]): unknown {
  return { data, total: data.length, limit: 20, offset: 0, pageCount: 1 };
}

export function connectorConfiguration(
  overrides: Partial<ConnectorConfiguration> = {},
): ConnectorConfiguration {
  return {
    connector: "deepl-connector",
    configuration: '{"apiKey":"secret"}',
    ...overrides,
  };
}

export function createConnectorConfigurationsFetchStub(
  handlers: Partial<Record<string, () => Response | Promise<Response>>>,
): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (handler === undefined) {
      throw new Error(
        `connector-configurations-screen.test-support.ts: no mocked response registered for ${url}`,
      );
    }
    return handler();
  });
}

export async function mountConnectorConfigurationsScreen(fetchMock: FetchFn): Promise<void> {
  vi.stubGlobal("fetch", fetchMock);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(ConnectorConfigurationsScreen),
    ),
  );
}
