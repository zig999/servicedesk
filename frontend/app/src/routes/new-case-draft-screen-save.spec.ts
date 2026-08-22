import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import {
  apiErrorResponse,
  baseHandlers,
  CREATE_PATH,
  createFetchStub,
  fillValidForm,
  jsonResponse,
  mountNewCaseDraft,
  parsedPostBody,
  patchCallCount,
  postCallCount,
  postedAuthoredAt,
  SLUG,
  SUBJECT_TYPE_TERMS,
  VALID_FORM_INPUT,
  versionPath,
  wasCalledWith,
} from "./new-case-draft-screen.test-support";

// POST-body, switch-to-edit-mode and save-concurrency coverage for
// task/version-editor/new-draft-creation. Blank-form coverage lives in
// new-case-draft-screen.spec.ts and 409-conflict coverage lives in
// new-case-draft-screen-conflict.spec.ts, split out to stay under this
// project's own max-lines rule; all three share the fixtures and mounting
// helpers in new-case-draft-screen.test-support.ts.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NewCaseDraftScreen — Save issues POST /v1/cases", () => {
  it("issues POST /v1/cases with slug, the curator's entered content and a client-side authored_at timestamp when Save is clicked", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: 9 }, 201),
      }),
    );
    await mountNewCaseDraft(fetchMock);
    await fillValidForm();

    const before = Date.now();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => {
      expect(postCallCount(fetchMock)).toBe(1);
    });
    const after = Date.now();

    expect(parsedPostBody(fetchMock)).toEqual({
      slug: SLUG,
      title: VALID_FORM_INPUT.title,
      when_to_use: VALID_FORM_INPUT.when_to_use,
      authored_at: expect.any(String),
      subject: SUBJECT_TYPE_TERMS.data[0].name,
      fallback: {
        outcome: VALID_FORM_INPUT.outcome,
        referral: {
          action: VALID_FORM_INPUT.action,
          recipient: VALID_FORM_INPUT.recipient,
        },
      },
    });

    const authoredAtMillis = new Date(postedAuthoredAt(fetchMock)).getTime();
    expect(authoredAtMillis).toBeGreaterThanOrEqual(before);
    expect(authoredAtMillis).toBeLessThanOrEqual(after);
  });

  it("issues exactly one POST when Save is clicked twice in quick succession", async () => {
    let resolvePost: (response: Response) => void = () => {};
    const postPromise = new Promise<Response>((resolve) => {
      resolvePost = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers({ [`POST ${CREATE_PATH}`]: () => postPromise }),
    );
    await mountNewCaseDraft(fetchMock);
    await fillValidForm();

    const saveButton = screen.getByRole("button", { name: "Save changes" });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    await act(async () => {
      resolvePost(jsonResponse({ slug: SLUG, version: 1 }, 201));
    });
    await waitFor(() => {
      expect(postCallCount(fetchMock)).toBe(1);
    });
  });

  it("leaves the curator on the blank form, re-enabled and still switched into create mode, when Save fails for a reason other than a 409", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => apiErrorResponse("SomeUnmappedError", 500, "internal error"),
      }),
    );
    await mountNewCaseDraft(fetchMock);
    await fillValidForm();

    const saveButton = screen.getByRole("button", { name: "Save changes" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(postCallCount(fetchMock)).toBe(1);
    });
    expect(saveButton.hasAttribute("disabled")).toBe(false);

    // Clicking Save again still issues a second POST rather than a PATCH --
    // proof that `created` was never set on a non-201 response, so the hook
    // never switched into edit mode behind the still-blank-looking form.
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(postCallCount(fetchMock)).toBe(2);
    });
    expect(patchCallCount(fetchMock)).toBe(0);
  });

  it("does not issue POST /v1/cases when a field is blurred, unlike edit-draft-version's own blur-triggered auto-save", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: 1 }, 201),
      }),
    );
    await mountNewCaseDraft(fetchMock);
    await fillValidForm();

    const titleInput = screen.getByLabelText<HTMLInputElement>("Title");
    // React implements onBlur through the native, bubbling "focusout" event
    // (see case-version-editor-screen-save.spec.ts's own comment on the same
    // point) -- fireEvent.blur alone would never reach the form's own onBlur
    // handler in this React 19 setup.
    fireEvent.focusOut(titleInput);

    // No waitFor here on purpose: there is no async transition to await for
    // a no-op, so this asserts the immediate, synchronous state instead.
    expect(postCallCount(fetchMock)).toBe(0);
  });
});

describe("NewCaseDraftScreen — switching into edit mode after a 201", () => {
  it("seeds the switched-in form from the content just submitted and the returned version, issuing no follow-up GET, and leaves Save disabled (nothing new to save yet)", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: 9 }, 201),
      }),
    );
    await mountNewCaseDraft(fetchMock);
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByDisplayValue(VALID_FORM_INPUT.title)).toBeTruthy();
    expect(wasCalledWith(fetchMock, "GET", versionPath(9))).toBe(false);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save changes" }).hasAttribute("disabled")).toBe(
        true,
      );
    });
  });

  it("stays addressable at the New Draft route after a successful create, rather than navigating to the created version's own URL", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: 9 }, 201),
      }),
    );
    const router = await mountNewCaseDraft(fetchMock);
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    // Pins the implementation's own disclosed inference: a refresh at
    // "/cases/$slug/versions/9" would re-mount CaseVersionEditorScreen, which
    // always issues the version GET this whole flow exists to avoid (this
    // task's own Notes on the manifest.min(1) read-back gap), so the browser
    // deliberately never lands there even once a draft exists.
    await screen.findByDisplayValue(VALID_FORM_INPUT.title);
    expect(router.state.location.pathname).toBe(`/cases/${SLUG}/versions/new`);
  });

  it("issues a PATCH to the created version's own URL, not another POST, when Save is clicked again after switching into edit mode", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: 9 }, 201),
        [`PATCH ${versionPath(9)}`]: () =>
          jsonResponse({
            title: "Edited after create",
            when_to_use: VALID_FORM_INPUT.when_to_use,
            subject: SUBJECT_TYPE_TERMS.data[0].name,
            fallback: {
              outcome: VALID_FORM_INPUT.outcome,
              referral: {
                action: VALID_FORM_INPUT.action,
                recipient: VALID_FORM_INPUT.recipient,
              },
            },
          }),
      }),
    );
    await mountNewCaseDraft(fetchMock);
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByDisplayValue(VALID_FORM_INPUT.title);

    const titleInput = await screen.findByLabelText<HTMLInputElement>("Title");
    fireEvent.change(titleInput, { target: { value: "Edited after create" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(patchCallCount(fetchMock)).toBe(1);
    });
    expect(wasCalledWith(fetchMock, "PATCH", versionPath(9))).toBe(true);
    expect(postCallCount(fetchMock)).toBe(1);
  });
});
