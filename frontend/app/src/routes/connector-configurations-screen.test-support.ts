import { createElement } from "react";
import { vi, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { ConnectorConfigurationsScreen } from "./connector-configurations-screen";
import type { ConnectorConfiguration } from "../hooks/use-connector-configurations";

// Shared fixtures and mounting helper for
// task/connector-configuration-authoring/connector-configuration-create-edit-form's own proof,
// mirroring capabilities-browser-screen.test-support.ts's own established convention exactly:
// a handlers-map-keyed fetch stub (an unhandled path fails the test loudly rather than hanging
// it), a full-fidelity fixture builder, and a mounting helper that stubs global fetch and wraps
// the screen in a bare QueryClientProvider. ConnectorConfigurationsScreen calls no router hook
// at all (confirmed by reading connector-configurations-screen.tsx, connector-configuration-
// form-dialog.tsx and use-connector-configuration-form.ts in full: no useParams, no Link, no
// useNavigate), so this needs no createMemoryHistory/RouterProvider scaffolding either.

export const CONNECTORS_PATH = "/v1/connectors";

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

/** The shape of one element of vitest's own `Mock<FetchFn>['mock']['calls']`. */
type RecordedCall = [string | URL | Request, RequestInit | undefined];

/** The PUT path use-connector-configuration-form.ts's own mutation dispatches at (register-connector). */
export function connectorPutPath(connector: string): string {
  return `/v1/connectors/${encodeURIComponent(connector)}`;
}

/** Every call this fetch stub recorded whose own method matches (case-insensitively "GET" by default, since that is what `init` omits). */
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

/**
 * Every call this fetch stub recorded at exactly `path`, whatever method it carried --
 * mirroring connector-test-panel.test-support.ts's own callsToPath. Scoping a count to one path
 * is what lets a test over this screen's own list-read stay true once a sibling section mounted
 * inside the same dialog (e.g. ConnectorTestPanel) issues its own, unrelated reads: the total
 * call count across the whole dialog is no longer a fact this screen's own criteria state, but
 * the call count at this screen's own CONNECTORS_PATH still is.
 */
export function callsToPath(fetchMock: Mock<FetchFn>, path: string): readonly RecordedCall[] {
  return fetchMock.mock.calls
    .filter(([input]) => (typeof input === "string" ? input : input.toString()) === path)
    .map(([input, init]): RecordedCall => [input, init]);
}

/** The JSON body of the `index`-th PUT call this fetch stub recorded (0 by default -- the first one). */
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

/** The page envelope useConnectorConfigurations() reads only `data` out of -- total/limit/offset/pageCount are deliberately left unread, matching use-glossary-vocabulary.ts's own and use-capabilities.ts's own convention this hook mirrors. */
export function connectorConfigurationsPage(data: readonly ConnectorConfiguration[]): unknown {
  return { data, total: data.length, limit: 20, offset: 0, pageCount: 1 };
}

/** One full-fidelity fixture carrying both fields domain/integration/connector-configuration declares. */
export function connectorConfiguration(
  overrides: Partial<ConnectorConfiguration> = {},
): ConnectorConfiguration {
  return {
    connector: "deepl-connector",
    configuration: '{"apiKey":"secret"}',
    ...overrides,
  };
}

/**
 * A fetch stub answering exactly the paths its own `handlers` map names; any other path fails
 * the test loudly rather than hanging it, mirroring capabilities-browser-screen.test-support.ts's
 * own createCapabilitiesFetchStub.
 */
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
