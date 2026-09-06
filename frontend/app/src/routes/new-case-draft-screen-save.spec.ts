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

    fireEvent.focusOut(titleInput);

    expect(postCallCount(fetchMock)).toBe(0);
  });
});

describe("NewCaseDraftScreen — switching into edit mode after a 201", () => {
  const CREATED_VERSION_RECORD = {
    title: VALID_FORM_INPUT.title,
    when_to_use: VALID_FORM_INPUT.when_to_use,
    subject: SUBJECT_TYPE_TERMS.data[0].name,
    fallback: {
      outcome: VALID_FORM_INPUT.outcome,
      referral: {
        action: VALID_FORM_INPUT.action,
        recipient: VALID_FORM_INPUT.recipient,
      },
    },
    state: "draft",
  };

  it("states the draft is still being read, showing none of the just-submitted content, until a follow-up GET to the created version's own URL resolves", async () => {
    let resolveGet: (response: Response) => void = () => {};
    const getPromise = new Promise<Response>((resolve) => {
      resolveGet = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: 9 }, 201),
        [`GET ${versionPath(9)}`]: () => getPromise,
      }),
    );
    await mountNewCaseDraft(fetchMock);
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(wasCalledWith(fetchMock, "GET", versionPath(9))).toBe(true);
    });
    expect(screen.getByText("Loading…")).toBeTruthy();
    expect(screen.queryByDisplayValue(VALID_FORM_INPUT.title)).toBeNull();
    expect(screen.queryByLabelText("Title")).toBeNull();

    await act(async () => {
      resolveGet(jsonResponse(CREATED_VERSION_RECORD));
    });
    expect(await screen.findByDisplayValue(VALID_FORM_INPUT.title)).toBeTruthy();
  });

  it("stays addressable at the New Draft route after a successful create, rather than navigating to the created version's own URL", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: 9 }, 201),
        [`GET ${versionPath(9)}`]: () => jsonResponse(CREATED_VERSION_RECORD),
      }),
    );
    const router = await mountNewCaseDraft(fetchMock);
    await fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await screen.findByDisplayValue(VALID_FORM_INPUT.title);
    expect(router.state.location.pathname).toBe(`/cases/${SLUG}/versions/new`);
  });

  it("issues a PATCH to the created version's own URL, not another POST, when Save is clicked again after switching into edit mode", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`POST ${CREATE_PATH}`]: () => jsonResponse({ slug: SLUG, version: 9 }, 201),
        [`GET ${versionPath(9)}`]: () => jsonResponse(CREATED_VERSION_RECORD),
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
