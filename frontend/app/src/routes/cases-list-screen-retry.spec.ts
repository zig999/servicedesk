import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CasesListScreen } from "./cases-list-screen";

// task/case-authoring-console/every-load-error-offers-retry's own criterion 1 (Cases
// List) plus the two cross-cutting behaviors this task's own record asks every one of
// its three retry controls to satisfy: exactly one more request per Retry click, and a
// second failure following Retry still leaving the Retry control in place rather than
// getting the screen stuck. Split into its own sibling file (rather than added to
// cases-list-screen.spec.ts, already at 359 lines -- past this project's own
// three-hundred-line MNT-01 cap before this task even starts) mirroring
// case-detail-screen-hypotheses-tab.spec.ts's own established precedent for splitting a
// screen's proof by concern to stay under that same cap. The router/mount scaffolding
// below is duplicated from cases-list-screen.spec.ts rather than imported, the same
// reasoning case-detail-screen.spec.ts's own header comment gives for its own
// duplication: that file exports nothing.

function stubCasesFetch(
  handlers: Record<string, () => Response | Promise<Response>>,
): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(`cases-list-screen-retry.spec.ts: no mocked response registered for ${url}`);
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

describe("CasesListScreen's own retry control (criterion 1)", () => {
  it("re-issues GET /v1/cases when Retry is clicked, rendering the cases once that retry succeeds", async () => {
    let casesCallCount = 0;
    stubCasesFetch({
      "/v1/cases": () => {
        casesCallCount += 1;
        if (casesCallCount === 1) {
          throw new Error("network down");
        }
        return jsonResponse({
          data: [{ slug: "case-alpha" }],
          total: 1,
          limit: 20,
          offset: 0,
          pageCount: 1,
        });
      },
      "/v1/cases/case-alpha/versions?limit=1&offset=0": () =>
        jsonResponse({ data: [], total: 0, limit: 1, offset: 0, pageCount: 0 }),
    });

    await mountCasesListScreen();

    expect(await screen.findByText("Cases could not be loaded.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("case-alpha")).toBeTruthy();
    expect(screen.queryByText("Cases could not be loaded.")).toBeNull();
    expect(casesCallCount).toBe(2);
  });
});

describe("CasesListScreen's own retry control (criterion 4)", () => {
  it("issues no request other than GET /v1/cases when Retry is clicked", async () => {
    const fetchMock = stubCasesFetch({
      "/v1/cases": () => {
        throw new Error("network down");
      },
    });

    await mountCasesListScreen();
    await screen.findByText("Cases could not be loaded.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    for (const call of fetchMock.mock.calls) {
      const url = typeof call[0] === "string" ? call[0] : call[0].toString();
      expect(url).toBe("/v1/cases");
    }
  });
});

describe("CasesListScreen's own retry control -- exactly one more request", () => {
  it("issues exactly one more GET /v1/cases request per Retry click, never zero and never more than one", async () => {
    const fetchMock = stubCasesFetch({
      "/v1/cases": () => {
        throw new Error("network down");
      },
    });

    await mountCasesListScreen();
    await screen.findByText("Cases could not be loaded.");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});

describe("CasesListScreen's own retry control -- repeated failure", () => {
  it("still shows the failure message and Retry control after a second failure following Retry, rather than getting stuck", async () => {
    const fetchMock = stubCasesFetch({
      "/v1/cases": () => {
        throw new Error("network down");
      },
    });

    await mountCasesListScreen();
    await screen.findByText("Cases could not be loaded.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(screen.getByText("Cases could not be loaded.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByText("Loading cases…")).toBeNull();
  });
});
