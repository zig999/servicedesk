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

// Shared fixtures and mounting helper for connector-configuration-detail-screen.spec.ts and its
// siblings connector-configuration-detail-screen-save.spec.ts and
// connector-configuration-detail-screen-discard.spec.ts (split across three files to stay under
// this project's own max-lines rule, mirroring case-version-editor-screen.test-support.ts's own
// established convention of one .test-support.ts file shared by a base spec plus save/discard
// siblings). ConnectorConfigurationDetailScreen reads its own route's connector through
// useParams({ from: "/connectors/$connector" }) and renders a Link to "/connectors", so -- exactly
// like case-version-editor-screen.spec.ts -- it needs a real router context rather than a bare
// render; this builds a small, self-contained test router (the screen at its own route, plus a
// dummy "/connectors" leaf so the Back link has a real destination) rather than reusing
// route-tree.tsx's own production tree.
//
// The screen composes useConnectorConfigurationDetailView (its own GET/PUT at
// CONFIGURATION_PATH) and reuses ConnectorTestPanel unchanged, which issues its own two
// independent reads (GET /v1/capabilities, GET /v1/glossary/subject-type) the moment the ready
// phase mounts. baseHandlers below answers all three by default, mirroring
// case-version-editor-screen.test-support.ts's own baseHandlers convention, so a test that does
// not care about ConnectorTestPanel's own fields never has to repeat them; a key this test does
// not register throws, so a request nobody expected fails the test loudly rather than hanging it.

export const CONNECTOR = "some-connector";
export const CONFIGURATION_PATH = `/v1/connectors/${CONNECTOR}`;
export const CAPABILITIES_PATH = "/v1/capabilities";
export const SUBJECT_TYPE_PATH = "/v1/glossary/subject-type";

export const LOADED_CONFIGURATION = '{"key":"value"}';
export const UPDATED_CONFIGURATION = '{"key":"updated"}';
export const INVALID_CONFIGURATION = "{not valid json";

/** JsonTextareaField's own mount-time pretty-print effect reformats a syntactically valid loaded
 * value before any test can observe it (json-textarea-pretty-print-on-load, already delivered) --
 * every assertion on the field's own displayed text uses this rather than the raw fixture. */
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

/** Each handler is keyed by URL and receives the request's own method, mirroring
 * case-version-editor-screen.test-support.ts's own METHOD-keyed convention -- this screen's own
 * CONFIGURATION_PATH answers both a GET (load) and a PUT (save) to the very same URL. */
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

/** Answers the load GET with `configuration`, plus both of ConnectorTestPanel's own reads with
 * an empty page -- see this file's own header comment. */
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
  // A dummy leaf so "/connectors" is a resolvable Back-link destination -- what renders there is
  // connector-configurations-screen.tsx's own concern, not this proof's, mirroring
  // case-version-editor-screen.test-support.ts's own dummy "/cases" leaf.
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

// Named "mount", not "render", matching case-version-editor-screen.test-support.ts's own
// testing-library/render-result-naming-convention precedent for a helper shaped this way -- it
// returns the test router instance, not a render result.
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
