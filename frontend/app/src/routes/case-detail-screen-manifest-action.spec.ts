import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createFetchStub,
  jsonResponse,
  manifestPath as versionDetailPath,
  mountCaseDetailScreen,
  SLUG,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";
import { CaseDetailScreen } from "./case-detail-screen";
import { VersionManifestScreen } from "./version-manifest-screen";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseDetailScreen's Versions tab actions cell — Manifest on a draft row (criterion 1, criterion 5)", () => {
  it("renders a Manifest link on a draft version's row, targeting that row's own manifest route", async () => {
    const versions = [{ version: 3, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(3)]: () => jsonResponse({}),
    });

    await mountCaseDetailScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    const link = within(rows[1]).getByRole("link", { name: "Manifest" });
    expect(link.getAttribute("href")).toBe(`/cases/${SLUG}/versions/3/manifest`);
  });
});

describe("CaseDetailScreen's Versions tab actions cell — Manifest on a released row (criterion 3)", () => {
  it("renders a Manifest link on a released version's row too, targeted at that row's own manifest route the same way a draft row's is", async () => {
    const versions = [{ version: 5, state: "released" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(5)]: () => jsonResponse({}),
    });

    await mountCaseDetailScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    const link = within(rows[1]).getByRole("link", { name: "Manifest" });
    expect(link.getAttribute("href")).toBe(`/cases/${SLUG}/versions/5/manifest`);
  });
});

describe("CaseDetailScreen's Versions tab actions cell — Manifest is per-row (criterion 2)", () => {
  it("targets each row's own version number, never one row's version repeated on another", async () => {
    const versions = [
      { version: 1, state: "released" },
      { version: 2, state: "draft" },
    ];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(2)]: () => jsonResponse({}),
    });

    await mountCaseDetailScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    const firstLink = within(rows[1]).getByRole("link", { name: "Manifest" });
    const secondLink = within(rows[2]).getByRole("link", { name: "Manifest" });
    expect(firstLink.getAttribute("href")).toBe(`/cases/${SLUG}/versions/1/manifest`);
    expect(secondLink.getAttribute("href")).toBe(`/cases/${SLUG}/versions/2/manifest`);
  });
});

describe("CaseDetailScreen's Versions tab actions cell — Manifest is a plain Link, not a Button (criterion 5)", () => {
  it("exposes Manifest only as a link, never additionally as a button", async () => {
    const versions = [{ version: 6, state: "released" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(6)]: () => jsonResponse({}),
    });

    await mountCaseDetailScreen(fetchMock);

    expect(await screen.findByRole("link", { name: "Manifest" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Manifest" })).toBeNull();
  });
});

describe("CaseDetailScreen's Versions tab actions cell — Manifest alongside the existing actions (criterion 1)", () => {
  it("renders Continue editing, Simulate and Manifest together on a draft row, replacing neither existing action", async () => {
    const versions = [{ version: 2, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(2)]: () => jsonResponse({}),
    });

    await mountCaseDetailScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    const draftRow = rows[1];
    expect(within(draftRow).getByRole("link", { name: "Continue editing" })).toBeTruthy();
    expect(within(draftRow).getByRole("link", { name: "Simulate" })).toBeTruthy();
    expect(within(draftRow).getByRole("link", { name: "Manifest" })).toBeTruthy();
    expect(within(draftRow).getAllByRole("link")).toHaveLength(3);
  });
});

describe("CaseDetailScreen's Versions tab actions cell — Manifest sits last among a row's actions (this task's own inference)", () => {
  it("orders a released row's actions as View, then Simulate, then Manifest, and a draft row's as Continue editing, then Simulate, then Manifest", async () => {
    const versions = [
      { version: 1, state: "released" },
      { version: 2, state: "draft" },
    ];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(2)]: () => jsonResponse({}),
    });

    await mountCaseDetailScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    const releasedLinks = within(rows[1]).getAllByRole("link");
    const draftLinks = within(rows[2]).getAllByRole("link");
    expect(releasedLinks.map((link) => link.textContent)).toEqual([
      "View",
      "Simulate",
      "Manifest",
    ]);
    expect(draftLinks.map((link) => link.textContent)).toEqual([
      "Continue editing",
      "Simulate",
      "Manifest",
    ]);
  });
});

describe("CaseDetailScreen's Versions tab actions cell — clicking Manifest", () => {
  it("navigates to that version's own manifest route, issuing no request beyond the versions-list load already made", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 4, state: "draft" }] }),
      [versionDetailPath(4)]: () => jsonResponse({}),
    });

    await mountCaseDetailScreen(fetchMock);

    const link = await screen.findByRole("link", { name: "Manifest" });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    fireEvent.click(link);

    expect(await screen.findByText("Version Manifest Placeholder")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("CaseDetailScreen's Versions tab actions cell — a released row's Manifest action reaches a read-only manifest (underdetermined finding: criterion 3 read literally admits a Manifest action wired with nothing bounding a released row to reading)", () => {
  it("navigates a released row's Manifest link to a manifest whose entries cannot be moved or removed", async () => {
    const version = 5;
    const manifestPath = `/v1/cases/${SLUG}/versions/${version}`;
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version, state: "released" }] }),
      [manifestPath]: () =>
        jsonResponse({
          manifest: [
            { position: 1, hypothesis_revision: { hypothesis: { name: "H1" }, revision: 1 } },
            { position: 2, hypothesis_revision: { hypothesis: { name: "H2" }, revision: 1 } },
          ],
          state: "released",
        }),
    });

    const rootRoute = createRootRoute({ component: () => createElement(Outlet) });
    const caseDetailRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/cases/$slug",
      component: CaseDetailScreen,
    });
    const manifestRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/cases/$slug/versions/$version/manifest",
      component: VersionManifestScreen,
    });
    const routeTree = rootRoute.addChildren([caseDetailRoute, manifestRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: [`/cases/${SLUG}`] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await router.load();
    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(RouterProvider, { router }),
      ),
    );

    const link = await screen.findByRole("link", { name: "Manifest" });
    fireEvent.click(link);

    const h1Row = await screen.findByRole("row", { name: /H1/ });
    const h2Row = screen.getByRole("row", { name: /H2/ });
    expect(
      within(h1Row).getByRole<HTMLButtonElement>("button", { name: "Remove" }).disabled,
    ).toBe(true);
    expect(
      within(h1Row).getByRole<HTMLButtonElement>("button", { name: "Move H1 down" }).disabled,
    ).toBe(true);
    expect(
      within(h2Row).getByRole<HTMLButtonElement>("button", { name: "Move H2 up" }).disabled,
    ).toBe(true);
  });
});
