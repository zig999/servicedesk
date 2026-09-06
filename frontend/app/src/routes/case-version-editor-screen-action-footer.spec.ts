import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  baseHandlers,
  createFetchStub,
  jsonResponse,
  LOADED_RECORD,
  mountCaseVersionEditor,
  VERSION_PATH,
} from "./case-version-editor-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const DRAFT_RECORD = { ...LOADED_RECORD, state: "draft" as const };
const RELEASED_RECORD = { ...LOADED_RECORD, state: "released" as const };

describe("CaseVersionEditorScreen's action row composes the shared ButtonFooter (criterion 1)", () => {
  it("renders Release, Discard, Save changes and Cancel inside one accessible group named Actions", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({ [`GET ${VERSION_PATH}`]: () => jsonResponse(DRAFT_RECORD) }),
    );
    await mountCaseVersionEditor(fetchMock);

    const footer = await screen.findByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("button", { name: "Release…" })).toBeTruthy();
    expect(within(footer).getByRole("button", { name: "Discard draft" })).toBeTruthy();
    expect(within(footer).getByRole("button", { name: "Save changes" })).toBeTruthy();
    expect(within(footer).getByRole("button", { name: "Cancel" })).toBeTruthy();
  });

  it("still offers Cancel inside that same group when the version is read-only, even though Save and Release are withheld", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({ [`GET ${VERSION_PATH}`]: () => jsonResponse(RELEASED_RECORD) }),
    );
    await mountCaseVersionEditor(fetchMock);

    await screen.findByDisplayValue(LOADED_RECORD.title);
    const footer = screen.getByRole("group", { name: "Actions" });
    expect(within(footer).getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(within(footer).queryByRole("button", { name: "Save changes" })).toBeNull();
    expect(within(footer).queryByRole("button", { name: "Release…" })).toBeNull();
  });
});
