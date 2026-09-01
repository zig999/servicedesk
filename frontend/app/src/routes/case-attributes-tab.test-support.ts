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
