import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  createFetchStub,
  HYPOTHESES_PATH,
  jsonResponse,
  mountCaseDetailScreen,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseDetailScreen's own tab strip (criterion 1)", () => {
  it("renders a Hypotheses tab beside the existing Versions tab, with Versions selected by default", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [] }),
    });

    await mountCaseDetailScreen(fetchMock);
    await screen.findByText("This case currently holds no version.");

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
