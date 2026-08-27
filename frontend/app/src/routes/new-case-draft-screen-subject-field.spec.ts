import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  baseHandlers,
  CREATE_PATH,
  createFetchStub,
  fillValidForm,
  mountNewCaseDraft,
} from "./new-case-draft-screen.test-support";

// Independent coverage this task's own four corrections did not supply: those
// four assertions (new-case-draft-screen-seed.spec.ts,
// new-case-draft-screen.spec.ts) all pin the subject input enabled while the
// create form sits idle -- correct, since useNewDraftVersionForm's own
// isBlocked reads createMutation.isPending (false at every point those tests
// mount) -- but none of NewCaseDraftScreen's own spec files exercised the one
// state where that same isBlocked actually is true here: the create POST
// itself in flight. Mirrors case-version-editor-screen-subject-field.spec.ts's
// own "Save in flight" case for the sibling screen (task/subject-field-fixed-bug/
// subject-follows-isblocked), which proves the same isBlocked wiring in
// case-version-editor-form-fields.tsx from the sibling screen's own save path
// -- a path this screen's own create-POST path never shares, so that proof
// does not stand in for this one.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NewCaseDraftScreen — subject field, blocked by the create Save in flight", () => {
  it("disables the subject input while the create POST is in flight", async () => {
    // Never resolves within this test: the point is to observe the pending
    // state itself, not what follows a 201 (already covered by
    // new-case-draft-screen-save.spec.ts's own switch-to-edit-mode tests).
    const postPromise = new Promise<Response>(() => {});
    const fetchMock = createFetchStub(
      baseHandlers({ [`POST ${CREATE_PATH}`]: () => postPromise }),
    );
    await mountNewCaseDraft(fetchMock);
    await fillValidForm();

    const subjectInput = await screen.findByLabelText<HTMLInputElement>("Subject type");
    expect(subjectInput.hasAttribute("disabled")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(subjectInput.hasAttribute("disabled")).toBe(true);
    });
  });
});
