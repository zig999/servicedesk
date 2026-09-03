import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  mountCaseDetailScreen,
  SLUG,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

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
  it("renders Continue editing and Simulate on a draft version's row, never a View action", async () => {
    const versions = [{ version: 2, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
    });

    await mountCaseDetailScreen(fetchMock);

    const rows = await screen.findAllByRole("row");
    const draftRow = rows[1];
    expect(within(draftRow).getByRole("link", { name: "Continue editing" })).toBeTruthy();
    expect(within(draftRow).queryByRole("link", { name: "View" })).toBeNull();

    expect(within(draftRow).getByRole("link", { name: "Simulate" })).toBeTruthy();
    expect(within(draftRow).getAllByRole("link")).toHaveLength(3);
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

    await waitFor(() => expect(screen.queryByRole("table")).toBeNull());

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
