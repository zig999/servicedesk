import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  mountCaseDetailScreen,
  SLUG,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";
import type { CaseVersionRecord } from "../services/case-version-record";

// task/cases-list-and-detail/case-attributes-at-a-glance's own criterion 1: Case Detail
// renders a third view, "Attributes", alongside the existing Versions and Hypotheses tabs.
// This file proves only the tab-strip wiring -- a third TabsTrigger/TabsContent exists and
// switching to it mounts CaseAttributesTab's own content in place of the other two --
// mirroring the split case-detail-screen-hypotheses-tab.spec.ts / case-hypotheses-tab.spec.ts
// already established for the Hypotheses tab. case-attributes-tab.spec.ts proves that
// component's own rendered content directly.

afterEach(() => {
  vi.unstubAllGlobals();
});

const VERSION_5_PATH = `/v1/cases/${SLUG}/versions/5`;

const RECORD: CaseVersionRecord = {
  title: "Some title",
  when_to_use: "When to use text",
  subject: "billing-dispute",
  fallback: { outcome: "resolved", referral: { action: "notify", recipient: "customer" } },
};

describe("CaseDetailScreen's own tab strip (criterion 1, Attributes)", () => {
  it("renders an Attributes tab beside the existing Versions and Hypotheses tabs, unselected by default", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [] }),
    });

    await mountCaseDetailScreen(fetchMock);
    await screen.findByText("This case currently holds no version.");

    const versionsTab = screen.getByRole("tab", { name: "Versions" });
    const attributesTab = screen.getByRole("tab", { name: "Attributes" });
    expect(versionsTab.getAttribute("aria-selected")).toBe("true");
    expect(attributesTab.getAttribute("aria-selected")).toBe("false");
  });

  it("renders CaseAttributesTab's own content, not the Versions tab's, once Attributes is selected", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 5, state: "released" }] }),
      [VERSION_5_PATH]: () => jsonResponse(RECORD),
    });

    await mountCaseDetailScreen(fetchMock);
    await screen.findByRole("table");

    fireEvent.click(screen.getByRole("tab", { name: "Attributes" }));

    expect(screen.queryByRole("table")).toBeNull();
    expect(await screen.findByRole("link", { name: "View released v5" })).toBeTruthy();
  });

  it("re-mounts the Versions tab's own content when switching back to it from Attributes", async () => {
    const fetchMock = createFetchStub({
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 5, state: "released" }] }),
      [VERSION_5_PATH]: () => jsonResponse(RECORD),
    });

    await mountCaseDetailScreen(fetchMock);
    await screen.findByRole("table");

    fireEvent.click(screen.getByRole("tab", { name: "Attributes" }));
    await screen.findByRole("link", { name: "View released v5" });

    fireEvent.click(screen.getByRole("tab", { name: "Versions" }));

    expect(await screen.findByRole("table")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "View released v5" })).toBeNull();
  });
});
