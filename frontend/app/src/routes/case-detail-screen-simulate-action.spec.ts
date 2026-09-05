import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  manifestPath as versionDetailPath,
  mountCaseDetailScreen,
  SLUG,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseDetailScreen's Versions tab actions cell — Simulate on a draft row (criterion 2)", () => {
  it("renders a Simulate link on a draft version's row, targeting that row's own simulate route", async () => {
    const versions = [{ version: 3, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(3)]: () => jsonResponse({}),
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
      [versionDetailPath(5)]: () => jsonResponse({}),
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
      [versionDetailPath(2)]: () => jsonResponse({}),
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
      [versionDetailPath(6)]: () => jsonResponse({}),
    });

    await mountCaseDetailScreen(fetchMock);

    expect(await screen.findByRole("link", { name: "Simulate" })).toBeTruthy();

    expect(screen.queryByRole("button", { name: "Simulate" })).toBeNull();
  });
});

describe("CaseDetailScreen's Versions tab actions cell — clicking Simulate (criterion 2)", () => {
  it("navigates to that version's own simulation cockpit route, issuing no request beyond the versions-list load already made", async () => {
    const versions = [{ version: 4, state: "draft" }];
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: versions }),
      [versionDetailPath(4)]: () => jsonResponse({}),
    });

    await mountCaseDetailScreen(fetchMock);

    const link = await screen.findByRole("link", { name: "Simulate" });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    fireEvent.click(link);

    expect(
      await screen.findByText("Simulation Cockpit Placeholder"),
    ).toBeTruthy();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
