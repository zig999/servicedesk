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
import { CapabilityDetailScreen } from "./capability-detail-screen";

export const NAME = "some-capability";
export const VERSION = "v1";
export const CAPABILITY_PATH = `/v1/capabilities/${NAME}/${VERSION}`;
export const CONCEPTS_PATH = "/v1/glossary/concepts";

export const LOADED_INPUT_SCHEMA = '{"type":"object"}';
export const LOADED_OUTPUT_SCHEMA = '{"type":"string"}';
export const UPDATED_INPUT_SCHEMA = '{"type":"object","updated":true}';
export const UPDATED_OUTPUT_SCHEMA = '{"type":"string","updated":true}';
export const INVALID_INPUT_SCHEMA = "{not valid json";
export const INVALID_OUTPUT_SCHEMA = "{also not valid";

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

export function prettyPrinted(value: string): string {
  return JSON.stringify(JSON.parse(value), null, 2);
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function errorResponse(code: string, status = 500): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
export type FetchResponder = (method: string) => Response | Promise<Response>;

export function createFetchStub(handlers: Record<string, FetchResponder>): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(`capability-detail-screen proof: no mocked response for ${url}`);
    }
    return handler((init?.method ?? "GET").toUpperCase());
  });
}

export function baseHandlers(
  inputSchema: string = LOADED_INPUT_SCHEMA,
  outputSchema: string = LOADED_OUTPUT_SCHEMA,
  overrides: Record<string, FetchResponder> = {},
): Record<string, FetchResponder> {
  return {
    [CAPABILITY_PATH]: () =>
      jsonResponse({
        ...LOADED_CAPABILITY,
        input_schema: inputSchema,
        output_schema: outputSchema,
      }),
    [CONCEPTS_PATH]: () => jsonResponse(CONCEPTS_RESPONSE),
    ...overrides,
  };
}

function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities/$name/$version",
    component: CapabilityDetailScreen,
  });

  const listRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/capabilities",
    component: () => createElement("div", null, "Capabilities List Placeholder"),
  });
  const routeTree = rootRoute.addChildren([detailRoute, listRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

export async function mountCapabilityDetailScreen(
  fetchMock: FetchFn,
  initialPath = `/capabilities/${NAME}/${VERSION}`,
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
      "capability-detail-screen proof: expected a PUT call carrying a JSON string body",
    );
  }
  return JSON.parse(rawBody);
}
