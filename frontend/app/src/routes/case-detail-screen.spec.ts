import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CaseDetailScreen } from "./case-detail-screen";

// This file stays .spec.ts (not .spec.tsx), matching this codebase's existing
// convention for component specs (see status-table.spec.ts, app-shell.spec.ts).
// Rendering is done through React.createElement rather than JSX syntax.
//
// CaseDetailScreen reads its own route's slug through @tanstack/react-router's
// useParams({ from: "/cases/$slug" }) and renders a Link, so -- exactly like
// app-shell.spec.ts and toaster-mount.spec.ts -- it cannot render outside a
// real router context. This builds a small, self-contained test router
// (CaseDetailScreen at "/cases/$slug", plus its own leaf route at
// "/cases/$slug/versions/$version" so Link has a real route to resolve an
// href against) rather than reusing the production ten-route tree, and drives
// it to a chosen slug through createMemoryHistory's initialEntries.
//
// CaseDetailScreen also reads GET /v1/cases/:slug/versions through a
// @tanstack/react-query useQuery, so it needs a QueryClientProvider too. Each
// test builds its own fresh QueryClient with retry:false (the established
// pattern for a mocked-failure test not to retry and time out) rather than
// reusing the shared services/query-client.ts instance, and stubs the global
// fetch the same way api-client.spec.ts does -- the Response objects handed
// back are the platform's real Response, so apiFetch()'s own parsing runs for
// real.

function buildTestRouter(initialPath: string) {
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
  // task/version-editor/new-draft-creation's own "New draft" Link target --
  // registered here the same way caseVersionRoute is above, so that Link
  // resolves a real href rather than one this test router cannot match.
  const newDraftRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cases/$slug/versions/new",
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([caseDetailRoute, caseVersionRoute, newDraftRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

async function renderCaseDetail(initialPath: string): Promise<void> {
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
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("CaseDetailScreen", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders one row per returned version, with its number and its state as a color-and-label cell", async () => {
    const versions = [
      { version: 1, state: "released" },
      { version: 2, state: "draft" },
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ data: versions })));

    await renderCaseDetail("/cases/some-slug");

    const rows = await screen.findAllByRole("row");
    // header + one row per version, nothing collapsed and nothing extra.
    expect(rows).toHaveLength(3);

    const releasedRow = rows[1];
    expect(within(releasedRow).getByText("1")).toBeTruthy();
    expect(within(releasedRow).getByText("Released")).toBeTruthy();
    // The color dot is aria-hidden="true" (decorative) by design, so it is
    // excluded from the accessibility tree and no Testing Library query can
    // find it -- mirroring status-table.spec.ts's own established pattern
    // for asserting this same decorative element renders alongside its label.
    // eslint-disable-next-line testing-library/no-node-access -- see comment above; the indicator is intentionally aria-hidden and unreachable by any RTL query
    expect(releasedRow.querySelector(".bg-success")).not.toBeNull();

    const draftRow = rows[2];
    expect(within(draftRow).getByText("2")).toBeTruthy();
    expect(within(draftRow).getByText("Draft")).toBeTruthy();
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    expect(draftRow.querySelector(".bg-warning")).not.toBeNull();
  });

  it("shows Continue editing on the draft version's row and not on the released version's row", async () => {
    const versions = [
      { version: 1, state: "released" },
      { version: 2, state: "draft" },
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ data: versions })));

    await renderCaseDetail("/cases/some-slug");

    const rows = await screen.findAllByRole("row");
    expect(within(rows[1]).queryByText("Continue editing")).toBeNull();
    expect(within(rows[2]).getByText("Continue editing")).toBeTruthy();
  });

  it("renders Continue editing as a router Link to that version's own route", async () => {
    const versions = [{ version: 7, state: "draft" }];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ data: versions })));

    await renderCaseDetail("/cases/some-slug");

    const link = await screen.findByRole("link", { name: "Continue editing" });
    expect(link.getAttribute("href")).toBe("/cases/some-slug/versions/7");
  });

  it("renders every version the endpoint returns, not only the most recently opened one", async () => {
    const versions = [
      { version: 1, state: "released" },
      { version: 2, state: "released" },
      { version: 3, state: "released" },
      { version: 4, state: "draft" },
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ data: versions })));

    await renderCaseDetail("/cases/some-slug");

    const rows = await screen.findAllByRole("row");
    expect(rows).toHaveLength(5);
    expect(within(rows[1]).getByText("1")).toBeTruthy();
    expect(within(rows[2]).getByText("2")).toBeTruthy();
    expect(within(rows[3]).getByText("3")).toBeTruthy();
    expect(within(rows[4]).getByText("4")).toBeTruthy();
  });

  it("URL-encodes the slug before requesting its version list", async () => {
    const mockFetch = vi.fn().mockResolvedValue(jsonResponse({ data: [] }));
    vi.stubGlobal("fetch", mockFetch);

    // "foo%26bar" decodes to the router param "foo&bar"; a request built by
    // simply interpolating that decoded value back into the path would send
    // an unencoded "&", which is what this test would catch.
    await renderCaseDetail("/cases/foo%26bar");
    await screen.findByText("This case currently holds no version.");

    expect(mockFetch.mock.calls[0]?.[0]).toBe("/v1/cases/foo%26bar/versions");
  });

  it("shows a loading placeholder before the version list arrives", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>(() => {})),
    );

    await renderCaseDetail("/cases/some-slug");

    expect(screen.getByText("Loading version timeline…")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
    // task/version-editor/new-draft-creation's own criterion 1: nothing
    // decides yet whether a draft exists, so New draft does not render
    // before the version list this decision depends on has even arrived.
    expect(screen.queryByRole("link", { name: "New draft" })).toBeNull();
  });

  it("shows a failure placeholder when the version list request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await renderCaseDetail("/cases/some-slug");

    expect(await screen.findByText("Unable to load this case's version timeline.")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("link", { name: "New draft" })).toBeNull();
  });

  // task/version-editor/new-draft-creation's own criterion 1: "New draft" is
  // rendered in Case Detail only when none of that case's existing versions
  // is currently in draft state.
  it("renders New draft as a link to the case's own new-draft route when none of the case's versions is a draft", async () => {
    const versions = [
      { version: 1, state: "released" },
      { version: 2, state: "released" },
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ data: versions })));

    await renderCaseDetail("/cases/some-slug");

    const link = await screen.findByRole("link", { name: "New draft" });
    expect(link.getAttribute("href")).toBe("/cases/some-slug/versions/new");
  });

  it("does not render New draft when one of the case's versions is already a draft", async () => {
    const versions = [
      { version: 1, state: "released" },
      { version: 2, state: "draft" },
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ data: versions })));

    await renderCaseDetail("/cases/some-slug");

    await screen.findByRole("table");
    expect(screen.queryByRole("link", { name: "New draft" })).toBeNull();
  });

  it("renders New draft when the case currently holds no versions at all", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ data: [] })));

    await renderCaseDetail("/cases/some-slug");

    expect(await screen.findByRole("link", { name: "New draft" })).toBeTruthy();
  });

  // API-04: an explicit empty-state sentence replaces the header-only table
  // when the case holds zero versions.
  it("renders an explicit empty-state sentence instead of the versions table when the case holds no versions", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ data: [] })));

    await renderCaseDetail("/cases/some-slug");

    expect(
      await screen.findByText("This case currently holds no version."),
    ).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});
