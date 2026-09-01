import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CasesListScreen } from "./cases-list-screen";

function stubCasesFetch(
  handlers: Record<string, () => Response | Promise<Response>>,
): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(
        `cases-list-screen-aria-live.spec.ts: no mocked response registered for ${url}`,
      );
    }
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function buildTestRouter() {
  const rootRoute = createRootRoute();
  const casesListRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases",
    component: CasesListScreen,
  });
  const caseDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug",
    component: () => createElement("div", null, "Case Detail Placeholder"),
  });
  const routeTree = rootRoute.addChildren([casesListRoute, caseDetailRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/cases"] }),
  });
}

async function mountCasesListScreen(): Promise<void> {
  const router = buildTestRouter();
  await router.load();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterProvider, { router }),
    ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CasesListScreen — the search-filtered row count is announced (ACC-07, criterion 1)", () => {
  it("exposes the filtered row count through an aria-live=\"polite\" region that updates as the search input's own value changes", async () => {
    stubCasesFetch({
      "/v1/cases": () =>
        jsonResponse({
          data: [{ slug: "case-alpha" }, { slug: "case-beta" }, { slug: "case-gamma" }],
          total: 3,
          limit: 20,
          offset: 0,
          pageCount: 1,
        }),
      "/v1/cases/case-alpha/versions?limit=1&offset=0": () =>
        jsonResponse({ data: [], total: 0, limit: 1, offset: 0, pageCount: 0 }),
      "/v1/cases/case-beta/versions?limit=1&offset=0": () =>
        jsonResponse({ data: [], total: 0, limit: 1, offset: 0, pageCount: 0 }),
      "/v1/cases/case-gamma/versions?limit=1&offset=0": () =>
        jsonResponse({ data: [], total: 0, limit: 1, offset: 0, pageCount: 0 }),
    });

    await mountCasesListScreen();

    expect(await screen.findAllByRole("button")).toHaveLength(3);
    const initialAnnouncement = screen.getByText("3 cases found");
    expect(initialAnnouncement.getAttribute("aria-live")).toBe("polite");

    fireEvent.change(screen.getByLabelText("Search cases by slug"), {
      target: { value: "beta" },
    });

    const updatedAnnouncement = screen.getByText("1 case found");
    expect(updatedAnnouncement.getAttribute("aria-live")).toBe("polite");
    expect(screen.queryByText("3 cases found")).toBeNull();
  });
});
