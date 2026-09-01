import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CasesListScreen } from "./cases-list-screen";

function stubFetchResponses(responses: Record<string, unknown>): void {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input.toString();
    if (!Object.prototype.hasOwnProperty.call(responses, url)) {
      throw new Error(`cases-list-screen.spec.ts: no mocked response registered for ${url}`);
    }
    return new Response(JSON.stringify(responses[url]), { status: 200 });
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

async function mountCasesListScreen() {
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
  return router;
}

function expectedLastUpdated(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CasesListScreen", () => {
  it("renders one row per case from GET /v1/cases, each showing its slug, a {color,label} state cell, its version count and when it was last updated", async () => {
    stubFetchResponses({
      "/v1/cases": {
        data: [{ slug: "case-alpha" }, { slug: "case-beta" }],
        total: 2,
        limit: 20,
        offset: 0,
        pageCount: 1,
      },

      "/v1/cases/case-alpha/versions?limit=1&offset=0": {
        data: [{ version: 1, state: "draft" }],
        total: 1,
        limit: 1,
        offset: 0,
        pageCount: 1,
      },
      "/v1/cases/case-alpha/versions/1": { authored_at: "2024-01-15T09:30:00.000Z" },

      "/v1/cases/case-beta/versions?limit=1&offset=0": {
        data: [{ version: 1, state: "draft" }],
        total: 2,
        limit: 1,
        offset: 0,
        pageCount: 2,
      },
      "/v1/cases/case-beta/versions?limit=1&offset=1": {
        data: [{ version: 2, state: "released" }],
        total: 2,
        limit: 1,
        offset: 1,
        pageCount: 2,
      },
      "/v1/cases/case-beta/versions/2": { authored_at: "2024-06-20T16:45:00.000Z" },
    });

    await mountCasesListScreen();

    const rows = await screen.findAllByRole("button");
    expect(rows).toHaveLength(2);

    const alphaRow = rows[0];
    expect(within(alphaRow).getByText("case-alpha")).toBeTruthy();
    expect(within(alphaRow).getByText("Draft")).toBeTruthy();
    expect(within(alphaRow).getByText("1")).toBeTruthy();
    expect(
      within(alphaRow).getByText(expectedLastUpdated("2024-01-15T09:30:00.000Z")),
    ).toBeTruthy();
    // eslint-disable-next-line testing-library/no-node-access -- mirrors status-table.spec.ts's own precedent: the color dot is aria-hidden and decorative, so no RTL query (role/text/label) can reach it.
    expect(alphaRow.querySelector(".bg-warning")).not.toBeNull();

    const betaRow = rows[1];
    expect(within(betaRow).getByText("case-beta")).toBeTruthy();
    expect(within(betaRow).getByText("Released")).toBeTruthy();
    expect(within(betaRow).getByText("2")).toBeTruthy();
    expect(
      within(betaRow).getByText(expectedLastUpdated("2024-06-20T16:45:00.000Z")),
    ).toBeTruthy();
    // eslint-disable-next-line testing-library/no-node-access -- see above
    expect(betaRow.querySelector(".bg-success")).not.toBeNull();
  });

  it("renders an explicit 'No version yet' state and a dash for last-updated for a case currently holding zero versions, rather than an invented state or timestamp", async () => {
    stubFetchResponses({
      "/v1/cases": {
        data: [{ slug: "case-empty" }],
        total: 1,
        limit: 20,
        offset: 0,
        pageCount: 1,
      },
      "/v1/cases/case-empty/versions?limit=1&offset=0": {
        data: [],
        total: 0,
        limit: 1,
        offset: 0,
        pageCount: 0,
      },
    });

    await mountCasesListScreen();

    const rows = await screen.findAllByRole("button");
    expect(rows).toHaveLength(1);
    expect(within(rows[0]).getByText("case-empty")).toBeTruthy();
    expect(within(rows[0]).getByText("No version yet")).toBeTruthy();
    expect(within(rows[0]).getByText("0")).toBeTruthy();
    expect(within(rows[0]).getByText("—")).toBeTruthy();
    // eslint-disable-next-line testing-library/no-node-access -- see comment on the first test: the color dot is aria-hidden and decorative.
    expect(rows[0].querySelector(".bg-muted")).not.toBeNull();
  });

  it("narrows the rendered rows to cases whose slug matches the typed search text", async () => {
    stubFetchResponses({
      "/v1/cases": {
        data: [{ slug: "case-alpha" }, { slug: "case-beta" }, { slug: "case-gamma" }],
        total: 3,
        limit: 20,
        offset: 0,
        pageCount: 1,
      },
      "/v1/cases/case-alpha/versions?limit=1&offset=0": {
        data: [],
        total: 0,
        limit: 1,
        offset: 0,
        pageCount: 0,
      },
      "/v1/cases/case-beta/versions?limit=1&offset=0": {
        data: [],
        total: 0,
        limit: 1,
        offset: 0,
        pageCount: 0,
      },
      "/v1/cases/case-gamma/versions?limit=1&offset=0": {
        data: [],
        total: 0,
        limit: 1,
        offset: 0,
        pageCount: 0,
      },
    });

    await mountCasesListScreen();

    expect(await screen.findAllByRole("button")).toHaveLength(3);

    const input = screen.getByLabelText("Search cases by slug");
    fireEvent.change(input, { target: { value: "beta" } });

    const filteredRows = screen.getAllByRole("button");
    expect(filteredRows).toHaveLength(1);
    expect(within(filteredRows[0]).getByText("case-beta")).toBeTruthy();
    expect(screen.queryByText("case-alpha")).toBeNull();
    expect(screen.queryByText("case-gamma")).toBeNull();
  });

  it("does not narrow rows by a match against a visible column other than slug", async () => {

    stubFetchResponses({
      "/v1/cases": {
        data: [{ slug: "case-one" }, { slug: "case-two" }],
        total: 2,
        limit: 20,
        offset: 0,
        pageCount: 1,
      },
      "/v1/cases/case-one/versions?limit=1&offset=0": {
        data: [{ version: 1, state: "released" }],
        total: 1,
        limit: 1,
        offset: 0,
        pageCount: 1,
      },
      "/v1/cases/case-one/versions/1": { authored_at: "2024-03-01T00:00:00.000Z" },
      "/v1/cases/case-two/versions?limit=1&offset=0": {
        data: [{ version: 1, state: "draft" }],
        total: 1,
        limit: 1,
        offset: 0,
        pageCount: 1,
      },
      "/v1/cases/case-two/versions/1": { authored_at: "2024-03-02T00:00:00.000Z" },
    });

    await mountCasesListScreen();

    expect(await screen.findAllByRole("button")).toHaveLength(2);
    expect(screen.getByText("Released")).toBeTruthy();

    const input = screen.getByLabelText("Search cases by slug");
    fireEvent.change(input, { target: { value: "released" } });

    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("keeps showing the searchable table with zero rows when the search text matches no case, rather than the no-cases-yet empty state", async () => {
    stubFetchResponses({
      "/v1/cases": {
        data: [{ slug: "case-only" }],
        total: 1,
        limit: 20,
        offset: 0,
        pageCount: 1,
      },
      "/v1/cases/case-only/versions?limit=1&offset=0": {
        data: [],
        total: 0,
        limit: 1,
        offset: 0,
        pageCount: 0,
      },
    });

    await mountCasesListScreen();

    expect(await screen.findAllByRole("button")).toHaveLength(1);

    const input = screen.getByLabelText("Search cases by slug");
    fireEvent.change(input, { target: { value: "no-such-case" } });

    expect(screen.queryByText("No cases yet — create the first one")).toBeNull();
    expect(screen.getByLabelText("Search cases by slug")).toBeTruthy();
    expect(screen.getByRole("table")).toBeTruthy();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("renders the empty-state message and a Create case action instead of a table when GET /v1/cases returns zero cases", async () => {
    stubFetchResponses({
      "/v1/cases": { data: [], total: 0, limit: 20, offset: 0, pageCount: 0 },
    });

    await mountCasesListScreen();

    expect(await screen.findByText("No cases yet — create the first one")).toBeTruthy();
    const button = screen.getByRole("button", { name: "Create case" });
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.title.length).toBeGreaterThan(0);
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByLabelText("Search cases by slug")).toBeNull();
  });

  it("navigates to that case's own Case Detail route, addressed by its slug, when its row is clicked", async () => {
    stubFetchResponses({
      "/v1/cases": {
        data: [{ slug: "case-alpha" }],
        total: 1,
        limit: 20,
        offset: 0,
        pageCount: 1,
      },
      "/v1/cases/case-alpha/versions?limit=1&offset=0": {
        data: [{ version: 1, state: "draft" }],
        total: 1,
        limit: 1,
        offset: 0,
        pageCount: 1,
      },
      "/v1/cases/case-alpha/versions/1": { authored_at: "2024-01-15T09:30:00.000Z" },
    });

    const router = await mountCasesListScreen();

    const rows = await screen.findAllByRole("button");
    expect(rows).toHaveLength(1);

    fireEvent.click(rows[0]);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/cases/case-alpha");
    });
  });
});
