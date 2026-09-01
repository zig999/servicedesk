import { createElement } from "react";
import { vi, type Mock } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { ConnectorConfigurationDetailScreen } from "./connector-configuration-detail-screen";

export const CONNECTOR = "some-connector";
export const CONFIGURATION_PATH = `/v1/connectors/${CONNECTOR}`;
export const CAPABILITIES_PATH = "/v1/capabilities";
export const SUBJECT_TYPE_PATH = "/v1/glossary/subject-type";

export const LOADED_CONFIGURATION = '{"key":"value"}';
export const UPDATED_CONFIGURATION = '{"key":"updated"}';
export const INVALID_CONFIGURATION = "{not valid json";

export const ARRAY_CONFIGURATION = "[1,2,3]";

export const NULL_CONFIGURATION = "null";

export function prettyPrinted(value: string): string {
  return JSON.stringify(JSON.parse(value), null, 2);
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function errorResponse(code: string, status = 500): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

function emptyPage(): unknown {
  return { data: [], total: 0, limit: 20, offset: 0, pageCount: 0 };
}

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
export type FetchResponder = (method: string) => Response | Promise<Response>;

export function createFetchStub(handlers: Record<string, FetchResponder>): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(
        `connector-configuration-detail-screen proof: no mocked response for ${url}`,
      );
    }
    return handler((init?.method ?? "GET").toUpperCase());
  });
}

export function baseHandlers(
  configuration: string,
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return {
    [CONFIGURATION_PATH]: () => jsonResponse({ connector: CONNECTOR, configuration }),
    [CAPABILITIES_PATH]: () => jsonResponse(emptyPage()),
    [SUBJECT_TYPE_PATH]: () => jsonResponse(emptyPage()),
    ...overrides,
  };
}

function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors/$connector",
    component: ConnectorConfigurationDetailScreen,
  });

  const listRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors",
    component: () => createElement("div", null, "Connector Configurations List Placeholder"),
  });
  const routeTree = rootRoute.addChildren([detailRoute, listRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

export async function mountConnectorConfigurationDetailScreen(
  fetchMock: FetchFn,
  initialPath = `/connectors/${CONNECTOR}`,
): Promise<ReturnType<typeof buildTestRouter>> {
  vi.stubGlobal("fetch", fetchMock);
  const router = buildTestRouter(initialPath);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await router.load();
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
  return router;
}

export function putCallCount(fetchMock: Mock<FetchFn>): number {
  return fetchMock.mock.calls.filter(
    ([, init]) => (init?.method ?? "GET").toUpperCase() === "PUT",
  ).length;
}

export function parsedPutBody(fetchMock: Mock<FetchFn>, index = 0): unknown {
  const putCalls = fetchMock.mock.calls.filter(
    ([, init]) => (init?.method ?? "GET").toUpperCase() === "PUT",
  );
  const rawBody = putCalls[index]?.[1]?.body;
  if (typeof rawBody !== "string") {
    throw new Error(
      "connector-configuration-detail-screen proof: expected a PUT call carrying a JSON string body",
    );
  }
  return JSON.parse(rawBody);
}
