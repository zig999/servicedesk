import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  createFetchStub,
  HYPOTHESES_PATH,
  jsonResponse,
  mountCaseDetailScreen,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

// Criterion 1 of task/manifest-hypothesis-authoring/hypotheses-tab: "Case Detail renders a
// 'Hypotheses' tab beside 'Versions', using the existing tabs component, never as a
// top-level sidebar entry." case-detail-screen.spec.ts already covers the Versions tab's
// own rendered content in full (delivered across Ondas 2-3) and is left untouched here --
// this file adds only what this task's own criteria newly assert: that Hypotheses now
// exists as a second tab beside Versions, and that selecting either one mounts that tab's
// own content in place of the other's, exactly as TUI's Tabs primitive is documented to do
// (frontend/tui's own tabs.tsx: TabsContent returns null for an inactive value, so only the
// selected tab's own subtree is ever mounted).

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseDetailScreen's own tab strip (criterion 1)", () => {
  it("renders a Hypotheses tab beside the existing Versions tab, with Versions selected by default", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [] }),
    });

    await mountCaseDetailScreen(fetchMock);
    await screen.findByRole("table");

    const versionsTab = screen.getByRole("tab", { name: "Versions" });
    const hypothesesTab = screen.getByRole("tab", { name: "Hypotheses" });
    expect(versionsTab.getAttribute("aria-selected")).toBe("true");
    expect(hypothesesTab.getAttribute("aria-selected")).toBe("false");
  });

  it("renders the Hypotheses tab's own content in place of the Versions tab's when Hypotheses is selected", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [] }),
      [HYPOTHESES_PATH]: () => new Promise<Response>(() => {}),
    });

    await mountCaseDetailScreen(fetchMock);
    // The Versions tab's own "New draft" link is this task's own proof that the
    // pre-existing Versions content really was mounted first, before Hypotheses
    // is ever selected.
    await screen.findByRole("link", { name: "New draft" });

    fireEvent.click(screen.getByRole("tab", { name: "Hypotheses" }));

    expect(screen.queryByRole("link", { name: "New draft" })).toBeNull();
    expect(screen.getByText("Loading hypotheses…")).toBeTruthy();
  });

  it("re-mounts the Versions tab's own content when switching back to it from Hypotheses", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [] }),
      [HYPOTHESES_PATH]: () => jsonResponse({ data: [] }),
    });

    await mountCaseDetailScreen(fetchMock);
    await screen.findByRole("link", { name: "New draft" });

    fireEvent.click(screen.getByRole("tab", { name: "Hypotheses" }));
    await screen.findByText("This case has originated no hypotheses yet.");

    fireEvent.click(screen.getByRole("tab", { name: "Versions" }));

    expect(await screen.findByRole("link", { name: "New draft" })).toBeTruthy();
    expect(screen.queryByText("This case has originated no hypotheses yet.")).toBeNull();
  });
});
