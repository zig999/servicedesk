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

// task/subject-field-fixed-bug/subject-follows-isblocked: subject is a
// declared attribute like every other (domain/knowledge/case-version), so it
// disables through isBlocked -- never unconditionally -- and its label no
// longer states or implies the field is fixed. Split into its own file
// rather than added to case-version-editor-screen.spec.ts or
// case-version-editor-screen-save.spec.ts, mirroring this same screen's own
// established convention for splitting its proof by concern
// (case-version-editor-screen-release-outcomes.spec.ts,
// case-version-editor-screen-discard.spec.ts, and others beside it). Reuses
// case-version-editor-screen.test-support.ts's own fixtures and mounting
// helper -- this task corrects the very same form, never a second surface.
//
// Criterion 1 (enabled on an unblocked draft) is proven in
// case-version-editor-screen.spec.ts's own population test, which asserted
// the opposite before this task and is corrected there rather than
// duplicated here. Criterion 2's "already released on load" reason is
// already proven by case-version-editor-screen-view-released.spec.ts's own
// criterion-4 test, which already checked subject specifically; this file
// adds the three stated reasons that test does not cover -- a save in
// flight, a conflict, and a release confirmed mid-session -- so "for any of
// its stated reasons" is not left resting on one example.

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
    // getByLabelText matches exactly by default: this throws if the
    // accessible label carries anything beyond this string, including a
    // reverted "Subject type (fixed)" or any other parenthetical.
    expect(screen.getByLabelText("Subject type")).toBeTruthy();
  });
});
