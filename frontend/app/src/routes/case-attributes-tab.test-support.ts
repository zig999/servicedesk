import { createElement } from "react";
import { vi, type Mock } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { CaseAttributesTab } from "./case-attributes-tab";

// Shared fixtures and a mounting helper for task/cases-list-and-detail/
// case-attributes-at-a-glance's own proof, mirroring case-hypotheses-tab.test-support.ts's
// own established convention (one shared fetch-stub scaffold for a task's own new tab,
// mounted on its own -- case-detail-screen-attributes-tab.spec.ts proves the tab-strip
// wiring separately, reusing case-hypotheses-tab.test-support.ts's own mountCaseDetailScreen
// rather than a second copy of it here).

export const SLUG = "some-slug";
export const VERSIONS_PATH = `/v1/cases/${SLUG}/versions`;

export function versionPath(version: number): string {
  return `/v1/cases/${SLUG}/versions/${version}`;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

export function errorResponse(code: string, status = 422): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

type FetchFn = (input: string | URL | Request) => Promise<Response>;

export function createFetchStub(
  handlers: Record<string, () => Response | Promise<Response>>,
): Mock<FetchFn> {
  return vi.fn(async (input: string | URL | Request): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(`case-attributes-tab proof: no mocked response registered for ${url}`);
    }
    return handler();
  });
}

/**
 * CaseAttributesTab takes its slug as a prop, not a route param (mirroring
 * case-hypotheses-tab.test-support.ts's own mountCaseHypothesesTab), so the root route's own
 * component renders it directly. The two leaf routes exist only so this component's own
 * Links ("Continue editing" / "View released vX" / "New draft from vX") have a real
 * destination to resolve an href against.
 */
export async function mountCaseAttributesTab(fetchMock: FetchFn, slug: string = SLUG): Promise<void> {
  vi.stubGlobal("fetch", fetchMock);
  const rootRoute = createRootRoute({
    component: () => createElement(CaseAttributesTab, { slug }),
  });
  const versionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/$version",
    component: () => null,
  });
  const newDraftRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/new",
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([versionRoute, newDraftRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await router.load();
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
}
