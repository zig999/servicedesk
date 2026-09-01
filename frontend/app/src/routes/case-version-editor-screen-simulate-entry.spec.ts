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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseVersionEditorScreen — the Simulate entry control, draft state (criterion 1)", () => {
  it("renders a Simulate link targeting this same version's own simulate route when the loaded version is a draft", async () => {

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

    expect(fetchMock.mock.calls.length).toBe(callsBeforeClick);
  });
});
