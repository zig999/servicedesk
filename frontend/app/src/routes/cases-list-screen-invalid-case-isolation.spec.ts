import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CasesListScreen } from "./cases-list-screen";

const NOT_VALID_STATEMENT = "This case's current version does not read back as a case.";

type FetchHandler = () => Response | Promise<Response>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function errorResponse(code: string, status = 409): Response {
  return new Response(JSON.stringify({ error: { code, message: code } }), { status });
}

function stubFetch(handlers: Record<string, FetchHandler>): void {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input.toString();
    const handler = handlers[url];
    if (!handler) {
      throw new Error(
        `cases-list-screen-invalid-case-isolation.spec.ts: no mocked response registered for ${url}`,
      );
    }
    return handler();
  });
  vi.stubGlobal("fetch", fetchMock);
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

function expectedLastUpdated(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CasesListScreen -- isolating one case's current version failing validation from the rest of the listing (criterion 1, criterion 2)", () => {
  it("renders every other case's own row unaffected and a row carrying the failing case's slug and the not-valid statement with no summary values, when one case's current version fails validation", async () => {
    stubFetch({
      "/v1/cases": () =>
        jsonResponse({
          data: [{ slug: "case-alpha" }, { slug: "case-broken" }],
          total: 2,
          limit: 20,
          offset: 0,
          pageCount: 1,
        }),
      "/v1/cases/case-alpha/versions?limit=1&offset=0": () =>
        jsonResponse({
          data: [{ version: 1, state: "released" }],
          total: 1,
          limit: 1,
          offset: 0,
          pageCount: 1,
        }),
      "/v1/cases/case-alpha/versions/1": () =>
        jsonResponse({ authored_at: "2024-01-15T09:30:00.000Z" }),
      "/v1/cases/case-broken/versions?limit=1&offset=0": () =>
        jsonResponse({
          data: [{ version: 5, state: "draft" }],
          total: 5,
          limit: 1,
          offset: 0,
          pageCount: 5,
        }),
      "/v1/cases/case-broken/versions/5": () => errorResponse("CaseVersionNotValidError"),
    });

    await mountCasesListScreen();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("button");
    expect(rows).toHaveLength(2);

    const alphaRow = rows[0];
    expect(within(alphaRow).getByText("case-alpha")).toBeTruthy();
    expect(within(alphaRow).getByText("Released")).toBeTruthy();
    expect(within(alphaRow).getByText("1")).toBeTruthy();
    expect(
      within(alphaRow).getByText(expectedLastUpdated("2024-01-15T09:30:00.000Z")),
    ).toBeTruthy();

    const brokenRow = rows[1];
    expect(within(brokenRow).getByText("case-broken")).toBeTruthy();
    expect(within(brokenRow).getByText(NOT_VALID_STATEMENT)).toBeTruthy();
    const brokenCells = within(brokenRow).getAllByRole("cell");
    expect(brokenCells[2].textContent).toBe("");
    expect(brokenCells[3].textContent).toBe("");
  });
});
