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
import { CaseDetailScreen } from "./case-detail-screen";
import { CaseHypothesesTab } from "./case-hypotheses-tab";
import {
  HypothesisRevisionHistory,
  type HypothesisRevisionHistoryProps,
} from "./hypothesis-revision-history";

export const SLUG = "some-slug";
export const HYPOTHESES_PATH = `/v1/cases/${SLUG}/hypotheses`;
export const VERSIONS_PATH = `/v1/cases/${SLUG}/versions`;

export function revisionsPath(hypothesisName: string): string {
  return `/v1/cases/${SLUG}/hypotheses/${encodeURIComponent(hypothesisName)}/revisions`;
}

export function manifestPath(version: number): string {
  return `/v1/cases/${SLUG}/versions/${version}`;
}

export function manifestPinning(
  hypothesisName: string,
  revision: number,
): { manifest: { hypothesis_revision: { hypothesis: { name: string }; revision: number } }[] } {
  return { manifest: [{ hypothesis_revision: { hypothesis: { name: hypothesisName }, revision } }] };
}

export function emptyManifest(): { manifest: never[] } {
  return { manifest: [] };
}

export const REVISE_ROUTE_PATTERN = "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName";

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

type FetchFn = (input: string | URL | Request) => Promise<Response>;

export function createFetchStub(
  handlers: Record<string, () => Response | Promise<Response>>,
): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(`case-hypotheses-tab proof: no mocked response registered for ${url}`);
    }
    return handler();
  });
}

function newQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

export async function mountCaseDetailScreen(
  fetchMock: FetchFn,
  initialPath: string = `/cases/${SLUG}`,
): Promise<void> {
  vi.stubGlobal("fetch", fetchMock);
  const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
  const caseDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug",
    component: CaseDetailScreen,
  });
  const caseVersionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version",
    component: () => null,
  });
  const newDraftRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/new",
    component: () => null,
  });
  const simulateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version/simulate",
    component: () => createElement("div", null, "Simulation Cockpit Placeholder"),
  });
  const routeTree = rootRoute.addChildren([
    caseDetailRoute,
    caseVersionRoute,
    newDraftRoute,
    simulateRoute,
  ]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  const queryClient = newQueryClient();
  await router.load();
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
}

export async function mountCaseHypothesesTab(fetchMock: FetchFn, slug: string = SLUG): Promise<void> {
  vi.stubGlobal("fetch", fetchMock);
  const rootRoute = createRootRoute({
    component: () => createElement(CaseHypothesesTab, { slug }),
  });
  const reviseRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: REVISE_ROUTE_PATTERN,
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([reviseRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  const queryClient = newQueryClient();
  await router.load();
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
}

export async function mountHypothesisRevisionHistory(
  fetchMock: FetchFn,
  props: HypothesisRevisionHistoryProps,
): Promise<void> {
  vi.stubGlobal("fetch", fetchMock);
  const rootRoute = createRootRoute({
    component: () => createElement(HypothesisRevisionHistory, props),
  });
  const reviseRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: REVISE_ROUTE_PATTERN,
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([reviseRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  const queryClient = newQueryClient();
  await router.load();
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
}
