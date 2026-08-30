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
import { ConnectorConfigurationCreateScreen } from "./connector-configuration-create-screen";

// Shared fixtures and mounting helper for connector-configuration-create-screen.spec.ts and its
// sibling connector-configuration-create-screen-save.spec.ts (split across two files to stay
// under this project's own max-lines convention, mirroring
// connector-configuration-detail-screen.test-support.ts's own base-plus-save split).
// ConnectorConfigurationCreateScreen calls useNavigate() and renders a Link to "/connectors", so
// it needs a real router context -- this builds a small, self-contained test router (the create
// screen at its own static "/connectors/new" route, the real dynamic "/connectors/$connector"
// pattern as a dummy placeholder so criterion 2's own specificity claim and criterion 11's own
// post-save destination are both checked against the actual dynamic route TanStack Router has to
// rank the static one over, plus a dummy "/connectors" leaf for the Back link, criterion 12)
// rather than reusing route-tree.tsx's own production tree.

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
export type FetchResponder = (method: string) => Response | Promise<Response>;

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

/** The PUT path use-connector-configuration-form.ts's own mutation dispatches at (register-connector). */
export function connectorPutPath(connector: string): string {
  return `/v1/connectors/${encodeURIComponent(connector)}`;
}

/** Each handler is keyed by URL and receives the request's own method, mirroring
 * connector-configuration-detail-screen.test-support.ts's own createFetchStub convention. The
 * create screen issues no GET at all (useConnectorConfigurationForm(null, ...) needs none), so
 * every test here registers at most one PUT handler. A key this test does not register throws,
 * so a request nobody expected fails the test loudly rather than hanging it. */
export function createFetchStub(handlers: Record<string, FetchResponder> = {}): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(
        `connector-configuration-create-screen proof: no mocked response for ${url}`,
      );
    }
    return handler((init?.method ?? "GET").toUpperCase());
  });
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
      "connector-configuration-create-screen proof: expected a PUT call carrying a JSON string body",
    );
  }
  return JSON.parse(rawBody);
}

function buildTestRouter(initialPath: string) {
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const createRouteDef = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors/new",
    component: ConnectorConfigurationCreateScreen,
  });
  // A dummy leaf at the real dynamic pattern, so criterion 2 (navigating to "/connectors/new"
  // must not resolve here) and criterion 11 (a successful save must resolve here, at the
  // just-registered connector's own name) are both checked against actual TanStack Router
  // resolution rather than a stand-in path. What renders at this route in production is
  // connector-configuration-detail-screen.tsx's own concern, not this proof's -- mirroring
  // connector-configurations-screen-navigation.spec.ts's own dummy connectorDetailRoute exactly.
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors/$connector",
    component: () => createElement("div", null, "Connector Detail Placeholder"),
  });
  // A dummy leaf so "/connectors" is a resolvable Back-link destination -- what renders there is
  // connector-configurations-screen.tsx's own concern, not this proof's.
  const listRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/connectors",
    component: () => createElement("div", null, "Connector Configurations List Placeholder"),
  });
  const routeTree = rootRoute.addChildren([createRouteDef, detailRoute, listRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

// Named "mount", not "render", matching connector-configuration-detail-screen.test-support.ts's
// own established convention -- it returns the test router instance, not a render result.
export async function mountConnectorConfigurationCreateScreen(
  fetchMock: FetchFn,
  initialPath = "/connectors/new",
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
