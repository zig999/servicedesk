import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  mountCaseDetailScreen,
  SLUG,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

// task/version-editor/view-released-version-read-only, criteria 1-3: the
// Versions tab's own actions cell (case-detail-screen.tsx's actionsForRow())
// now renders "View" for a released row -- previously empty -- and a draft
// row keeps rendering only "Continue editing". Split into its own sibling
// file rather than added to case-detail-screen.spec.ts, mirroring this same
// screen's own established convention for splitting its proof by concern
// (case-detail-screen-versions-retry.spec.ts, case-detail-screen-hypotheses-
// tab.spec.ts, case-detail-screen-attributes-tab.spec.ts). Reuses
// case-hypotheses-tab.test-support.ts's own mountCaseDetailScreen and
// createFetchStub, the same fixtures those sibling files already mount this
// exact screen with.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseDetailScreen's Versions tab actions cell — a released row's own View action (criterion 1)", () => {
  it("renders a View action on a released version's row, where today it renders none", async () => {
    const versions = [{ version: 1, state: "released" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
    });

    await mountCaseDetailScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    expect(rows).toHaveLength(2);
    expect(within(rows[1]).getByRole("link", { name: "View" })).toBeTruthy();
  });
});

describe("CaseDetailScreen's Versions tab actions cell — a draft row's own action (criterion 2)", () => {
  it("renders only Continue editing on a draft version's row, never a View action", async () => {
    const versions = [{ version: 2, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
    });

    await mountCaseDetailScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    const draftRow = rows[1];
    expect(within(draftRow).getByRole("link", { name: "Continue editing" })).toBeTruthy();
    expect(within(draftRow).queryByRole("link", { name: "View" })).toBeNull();
    // Exactly one action link on this row -- never both.
    expect(within(draftRow).getAllByRole("link")).toHaveLength(1);
  });
});

describe("CaseDetailScreen's Versions tab actions cell — clicking View (criterion 3)", () => {
  it("navigates to the released version's own route, issuing no request beyond the versions-list load already made", async () => {
    const versions = [{ version: 5, state: "released" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
    });

    await mountCaseDetailScreen(fetchMock);

    const link = await screen.findByRole("link", { name: "View" });
    expect(link.getAttribute("href")).toBe(`/cases/${SLUG}/versions/5`);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(link);

    // The destination route in this test tree is a dummy leaf (() => null),
    // so navigating away from CaseDetailScreen unmounts its own version
    // table entirely -- the one observable sign the click actually
    // navigated, given that dummy leaf renders nothing of its own.
    await waitFor(() => expect(screen.queryByRole("table")).toBeNull());
    // No request was issued beyond the one GET that already loaded this
    // row: a plain client-side Link performs no fetch of its own, and the
    // dummy destination route triggers none either.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
