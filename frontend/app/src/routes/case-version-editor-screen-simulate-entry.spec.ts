import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  jsonResponse,
  LOADED_RECORD,
  mountCaseVersionEditor,
  SLUG,
  VERSION_PATH,
} from "./case-version-editor-screen.test-support";

// task/simulation-cockpit/simulate-entry-links, criterion 1: the Version
// Editor's own screen now renders a "Simulate" Link to that same route's
// own "/cases/$slug/versions/$version/simulate", unconditionally of whether
// the loaded version's own state is draft or released. Split into its own
// sibling file rather than added to case-version-editor-screen.spec.ts,
// mirroring this same screen's own established convention for splitting its
// proof by concern (case-version-editor-screen-save.spec.ts,
// case-version-editor-screen-view-released.spec.ts,
// case-version-editor-screen-discard.spec.ts). Reuses
// case-version-editor-screen.test-support.ts's own fixtures and mounting
// helper -- extended by this task to also register the
// "/cases/$slug/versions/$version/simulate" leaf route this new Link
// targets.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseVersionEditorScreen — the Simulate entry control, draft state (criterion 1)", () => {
  it("renders a Simulate link targeting this same version's own simulate route when the loaded version is a draft", async () => {
    // baseHandlers()'s own LOADED_RECORD carries no "state" field, which
    // case-version-editor-screen-view-released.spec.ts already establishes
    // as this hook's own draft default.
    const fetchMock = createFetchStub(baseHandlers());
    await mountCaseVersionEditor(fetchMock);

    const link = await screen.findByRole("link", { name: "Simulate" });
    expect(link.getAttribute("href")).toBe(`/cases/${SLUG}/versions/3/simulate`);
  });
});

describe("CaseVersionEditorScreen — the Simulate entry control, released state (criterion 1)", () => {
  it("renders a Simulate link targeting this same version's own simulate route when the loaded version is released", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({ ...LOADED_RECORD, state: "released" as const, manifest: [] }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const link = await screen.findByRole("link", { name: "Simulate" });
    expect(link.getAttribute("href")).toBe(`/cases/${SLUG}/versions/3/simulate`);
  });
});

describe("CaseVersionEditorScreen — Simulate is a plain Link, not a Button (this task's own inference)", () => {
  it("exposes Simulate only as a link, never additionally as a button", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCaseVersionEditor(fetchMock);

    expect(await screen.findByRole("link", { name: "Simulate" })).toBeTruthy();
    // A Button (real or asChild-wrapping-Button) around this same label
    // would surface a second, "button"-roled node an assistive-technology
    // user hears announced alongside the link; a plain Link never does.
    expect(screen.queryByRole("button", { name: "Simulate" })).toBeNull();
  });
});

describe("CaseVersionEditorScreen — clicking Simulate (criterion 1)", () => {
  it("navigates to this version's own simulation cockpit route, issuing no further request", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCaseVersionEditor(fetchMock);

    const link = await screen.findByRole("link", { name: "Simulate" });
    const callsBeforeClick = fetchMock.mock.calls.length;

    fireEvent.click(link);

    expect(
      await screen.findByText("Simulation Cockpit Placeholder"),
    ).toBeTruthy();
    // A plain client-side Link performs no fetch of its own, and the dummy
    // destination route triggers none either.
    expect(fetchMock.mock.calls.length).toBe(callsBeforeClick);
  });
});
