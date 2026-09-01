import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import {
  apiErrorResponse,
  baseHandlers,
  createFetchStub,
  jsonResponse,
  LOADED_RECORD,
  mountCaseVersionEditor,
  VERSION_PATH,
} from "./case-version-editor-screen.test-support";
import {
  openReleaseDialog,
  releaseConfirmButton,
  releaseHandlers,
  RELEASED_RECORD,
  RELEASE_PATH,
} from "./case-version-editor-release.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseVersionEditorScreen — subject field, blocked by a Save in flight (criterion 2)", () => {
  it("disables the subject input while a Save PATCH request is in flight, and re-enables it once the save completes", async () => {
    let resolvePatch: (response: Response) => void = () => {};
    const patchPromise = new Promise<Response>((resolve) => {
      resolvePatch = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers({ [`PATCH ${VERSION_PATH}`]: () => patchPromise }),
    );
    await mountCaseVersionEditor(fetchMock);

    const titleInput = await screen.findByLabelText("Title");
    const subjectInput = screen.getByLabelText("Subject type");
    expect(subjectInput.hasAttribute("disabled")).toBe(false);

    fireEvent.change(titleInput, { target: { value: "Mid-flight edit" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(subjectInput.hasAttribute("disabled")).toBe(true);
    });

    await act(async () => {
      resolvePatch(jsonResponse({ ...LOADED_RECORD, title: "Mid-flight edit" }));
    });
    await waitFor(() => {
      expect(subjectInput.hasAttribute("disabled")).toBe(false);
    });
  });
});

describe("CaseVersionEditorScreen — subject field, blocked by a conflict (criterion 2)", () => {
  it("disables the subject input once Save answers 409 CaseVersionNotDraftError", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`PATCH ${VERSION_PATH}`]: () =>
          apiErrorResponse("CaseVersionNotDraftError", 409, "the version is no longer a draft"),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const titleInput = await screen.findByLabelText("Title");
    const subjectInput = screen.getByLabelText("Subject type");
    fireEvent.change(titleInput, { target: { value: "Conflicting edit" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(subjectInput.hasAttribute("disabled")).toBe(true);
    });
  });
});

describe("CaseVersionEditorScreen — subject field, blocked by a mid-session release (criterion 2)", () => {
  it("disables the subject input once Release is confirmed in this same session", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({ [`POST ${RELEASE_PATH}`]: () => jsonResponse(RELEASED_RECORD) }),
    );
    await mountCaseVersionEditor(fetchMock);

    const subjectInput = await screen.findByLabelText("Subject type");
    expect(subjectInput.hasAttribute("disabled")).toBe(false);

    await openReleaseDialog();
    fireEvent.click(releaseConfirmButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(subjectInput.hasAttribute("disabled")).toBe(true);
  });
});

describe("CaseVersionEditorScreen — subject field's label (criterion 3)", () => {
  it("shows no label text implying the subject field cannot be edited", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCaseVersionEditor(fetchMock);

    await screen.findByDisplayValue(LOADED_RECORD.subject);
    expect(screen.queryByText(/fixed/i)).toBeNull();
  });

  it("labels the subject field exactly 'Subject type', with no parenthetical qualifier", async () => {
    const fetchMock = createFetchStub(baseHandlers());
    await mountCaseVersionEditor(fetchMock);

    await screen.findByDisplayValue(LOADED_RECORD.subject);

    expect(screen.getByLabelText("Subject type")).toBeTruthy();
  });
});
