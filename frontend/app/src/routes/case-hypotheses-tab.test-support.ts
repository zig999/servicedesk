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

// Shared fixtures and mounting helpers for task/manifest-hypothesis-authoring/
// hypotheses-tab's own proof, split three ways -- one file per unit under test
// (case-detail-screen-hypotheses-tab.spec.ts, case-hypotheses-tab.spec.ts,
// hypothesis-revision-history.spec.ts) -- mirroring
// hypothesis-revision-screen.test-support.ts's own established convention for a
// task proven across several spec files sharing one fetch-stub scaffold. Each
// mount function below renders its own router type directly (rather than
// delegating to one shared, generically-typed helper) since the three route
// trees below are three different, incompatible ones -- the same reasoning
// hypothesis-revision-screen.test-support.ts's own header comment gives for
// mountHypothesisForm and mountIsolatedRevise staying two separate functions.
//
// Every request this task's screens issue is a GET (list-hypotheses,
// list-hypothesis-revisions, list-case-versions), so createFetchStub below is
// keyed by exact URL alone, unlike hypothesis-revision-screen.test-support.ts's
// own createFetchStub, which also has to key by method because that task's own
// screens POST too.

export const SLUG = "some-slug";
export const HYPOTHESES_PATH = `/v1/cases/${SLUG}/hypotheses`;
export const VERSIONS_PATH = `/v1/cases/${SLUG}/versions`;

export function revisionsPath(hypothesisName: string): string {
  return `/v1/cases/${SLUG}/hypotheses/${encodeURIComponent(hypothesisName)}/revisions`;
}

/** The Revise route's own path pattern (route-tree.tsx) -- a plain `const` (not a function returning `string`) so its literal type survives into createRoute()'s own path generic, used only so a rendered Link has a real destination to resolve an href against. */
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

// case-detail-screen.spec.ts already carries this exact route tree for the
// Versions tab's own two Link destinations; duplicated here (rather than
// imported, since that file exports nothing) for this task's own new tab
// strip assertions over the same screen.
//
// task/simulation-cockpit/simulate-entry-links's own criterion 2 adds a
// second Link per Versions-tab row, to "/cases/$slug/versions/$version/
// simulate" -- registered here as one more dummy leaf, the same reasoning
// caseVersionRoute and newDraftRoute already give: so that Link has a real
// route to resolve an href against.
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

// CaseHypothesesTab takes its slug as a prop, not a route param, so the root
// route's own component renders it directly -- the reviseRoute sibling exists
// purely so a Link a selected hypothesis's own revision-history view renders
// (HypothesisRevisionHistory's "Revise ->") has a real destination to resolve
// an href against, mirroring hypothesis-revision-screen.test-support.ts's own
// "dummy leaf so Link has a real route to resolve against" precedent.
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

// Same reasoning as mountCaseHypothesesTab above: HypothesisRevisionHistory
// takes every one of its inputs as props, so the root route's own component
// renders it directly with the props this test supplies, and the reviseRoute
// sibling exists only for its own "Revise ->" Link to resolve against.
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
