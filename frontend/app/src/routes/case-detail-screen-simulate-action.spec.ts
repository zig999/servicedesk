import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  mountCaseDetailScreen,
  SLUG,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

// task/simulation-cockpit/simulate-entry-links, criterion 2: the Versions
// tab's own actions cell (case-detail-screen.tsx's actionsForRow()) now
// carries a second, unconditional "Simulate" Link beside its existing
// state-branched Continue-editing/View action, for every listed version
// whichever of draft or released its own state is. Split into its own
// sibling file rather than added to case-detail-screen.spec.ts or
// case-detail-screen-view-released-action.spec.ts, mirroring this same
// screen's own established convention for splitting its proof by concern
// (case-detail-screen-versions-retry.spec.ts, case-detail-screen-hypotheses-
// tab.spec.ts, case-detail-screen-attributes-tab.spec.ts,
// case-detail-screen-view-released-action.spec.ts). Reuses
// case-hypotheses-tab.test-support.ts's own mountCaseDetailScreen and
// createFetchStub, the same fixtures those sibling files already mount this
// exact screen with -- extended by this task to also register the
// "/cases/$slug/versions/$version/simulate" leaf route this new Link
// targets.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseDetailScreen's Versions tab actions cell — Simulate on a draft row (criterion 2)", () => {
  it("renders a Simulate link on a draft version's row, targeting that row's own simulate route", async () => {
    const versions = [{ version: 3, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
    });

    await mountCaseDetailScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    const link = within(rows[1]).getByRole("link", { name: "Simulate" });
    expect(link.getAttribute("href")).toBe(`/cases/${SLUG}/versions/3/simulate`);
  });
});

describe("CaseDetailScreen's Versions tab actions cell — Simulate on a released row (criterion 2)", () => {
  it("renders a Simulate link on a released version's row, targeting that row's own simulate route", async () => {
    const versions = [{ version: 5, state: "released" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
    });

    await mountCaseDetailScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    const link = within(rows[1]).getByRole("link", { name: "Simulate" });
    expect(link.getAttribute("href")).toBe(`/cases/${SLUG}/versions/5/simulate`);
  });
});

describe("CaseDetailScreen's Versions tab actions cell — Simulate is per-row (criterion 2)", () => {
  it("targets each row's own version number, never one row's version repeated on another", async () => {
    const versions = [
      { version: 1, state: "released" },
      { version: 2, state: "draft" },
    ];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
    });

    await mountCaseDetailScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    const firstLink = within(rows[1]).getByRole("link", { name: "Simulate" });
    const secondLink = within(rows[2]).getByRole("link", { name: "Simulate" });
    expect(firstLink.getAttribute("href")).toBe(`/cases/${SLUG}/versions/1/simulate`);
    expect(secondLink.getAttribute("href")).toBe(`/cases/${SLUG}/versions/2/simulate`);
  });
});

describe("CaseDetailScreen's Versions tab actions cell — Simulate is a plain Link, not a Button (this task's own inference)", () => {
  it("exposes Simulate only as a link, never additionally as a button", async () => {
    const versions = [{ version: 6, state: "released" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
    });

    await mountCaseDetailScreen(fetchMock);

    expect(await screen.findByRole("link", { name: "Simulate" })).toBeTruthy();
    // Same reasoning as case-version-editor-screen-simulate-entry.spec.ts's
    // own sibling test: a Button around this same label would surface a
    // second, "button"-roled node, which a plain Link never does.
    expect(screen.queryByRole("button", { name: "Simulate" })).toBeNull();
  });
});

describe("CaseDetailScreen's Versions tab actions cell — clicking Simulate (criterion 2)", () => {
  it("navigates to that version's own simulation cockpit route, issuing no request beyond the versions-list load already made", async () => {
    const versions = [{ version: 4, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
    });

    await mountCaseDetailScreen(fetchMock);

    const link = await screen.findByRole("link", { name: "Simulate" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(link);

    expect(
      await screen.findByText("Simulation Cockpit Placeholder"),
    ).toBeTruthy();
    // No request was issued beyond the one GET that already loaded this row:
    // a plain client-side Link performs no fetch of its own, and the dummy
    // destination route triggers none either.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
