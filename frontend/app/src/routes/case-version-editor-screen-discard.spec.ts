import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  apiErrorResponse,
  createFetchStub,
  deleteCallCount,
  deletePostInit,
  discardConfirmButton,
  discardHandlers,
  DRAFT_RECORD,
  jsonResponse,
  keepDraftButton,
  LOADED_RECORD,
  mountForDiscard,
  noContentResponse,
  openDiscardDialog,
  RELEASED_RECORD,
  SLUG,
  typeSlugConfirmation,
  VERSION_PATH,
} from "./case-version-editor-screen-discard.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseVersionEditorScreen — the Discard draft control's own visibility (criterion 1)", () => {
  it("renders the Discard draft control once the loaded version's own state is draft", async () => {
    const fetchMock = createFetchStub(discardHandlers());
    await mountForDiscard(fetchMock);

    expect(await screen.findByRole("button", { name: "Discard draft" })).toBeTruthy();
  });

  it("renders no Discard control when the loaded version's own state is released", async () => {
    const fetchMock = createFetchStub(
      discardHandlers({ [`GET ${VERSION_PATH}`]: () => jsonResponse(RELEASED_RECORD) }),
    );
    await mountForDiscard(fetchMock);

    await screen.findByDisplayValue(LOADED_RECORD.title);
    expect(screen.queryByRole("button", { name: "Discard draft" })).toBeNull();
  });

  it("renders no Discard control when the loaded version carries no state field at all", async () => {

    const fetchMock = createFetchStub(
      discardHandlers({ [`GET ${VERSION_PATH}`]: () => jsonResponse(LOADED_RECORD) }),
    );
    await mountForDiscard(fetchMock);

    await screen.findByDisplayValue(LOADED_RECORD.title);
    expect(screen.queryByRole("button", { name: "Discard draft" })).toBeNull();
  });

  it("disables the Discard trigger while a Save to the same version is in flight", async () => {
    let resolvePatch: (response: Response) => void = () => {};
    const patchPromise = new Promise<Response>((resolve) => {
      resolvePatch = resolve;
    });
    const fetchMock = createFetchStub(
      discardHandlers({ [`PATCH ${VERSION_PATH}`]: () => patchPromise }),
    );
    await mountForDiscard(fetchMock);

    const titleInput = await screen.findByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "Mid-flight edit" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Discard draft" }).hasAttribute("disabled")).toBe(
        true,
      );
    });

    await act(async () => {
      resolvePatch(jsonResponse({ ...DRAFT_RECORD, title: "Mid-flight edit" }));
    });
  });
});

describe("CaseVersionEditorScreen — opening the Discard Dialog (criterion 2)", () => {
  it("opens an in-place Dialog (no navigation) stating that hypotheses keep their content and only this draft and its manifest are removed", async () => {
    const fetchMock = createFetchStub(discardHandlers());
    const router = await mountForDiscard(fetchMock);

    await openDiscardDialog();

    expect(router.state.location.pathname).toBe(`/cases/${SLUG}/versions/3`);

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(
        "This case's own hypotheses keep their content — only this draft and its manifest are removed. This cannot be undone.",
      ),
    ).toBeTruthy();
  });
});

describe("CaseVersionEditorScreen — the Dialog's own confirm barrier (criterion 3)", () => {
  it("keeps the confirm control disabled while the confirmation field is empty", async () => {
    const fetchMock = createFetchStub(discardHandlers());
    await mountForDiscard(fetchMock);

    await openDiscardDialog();

    expect(discardConfirmButton().hasAttribute("disabled")).toBe(true);
  });

  it("keeps the confirm control disabled for a typed value that is not an exact match", async () => {
    const fetchMock = createFetchStub(discardHandlers());
    await mountForDiscard(fetchMock);

    await openDiscardDialog();

    typeSlugConfirmation(SLUG.toUpperCase());
    expect(discardConfirmButton().hasAttribute("disabled")).toBe(true);

    typeSlugConfirmation(`${SLUG} `);
    expect(discardConfirmButton().hasAttribute("disabled")).toBe(true);
  });

  it("enables the confirm control once the confirmation field holds the slug typed exactly", async () => {
    const fetchMock = createFetchStub(discardHandlers());
    await mountForDiscard(fetchMock);

    await openDiscardDialog();
    typeSlugConfirmation(SLUG);

    expect(discardConfirmButton().hasAttribute("disabled")).toBe(false);
  });
});

describe("CaseVersionEditorScreen — confirming Discard (criterion 4)", () => {
  it("issues exactly one DELETE against this version with no body when confirmed with the slug typed exactly", async () => {
    const fetchMock = createFetchStub(
      discardHandlers({ [`DELETE ${VERSION_PATH}`]: () => noContentResponse() }),
    );
    await mountForDiscard(fetchMock);

    await openDiscardDialog();
    typeSlugConfirmation(SLUG);
    fireEvent.click(discardConfirmButton());

    await waitFor(() => expect(deleteCallCount(fetchMock)).toBe(1));
    expect(deletePostInit(fetchMock)?.body).toBeUndefined();
  });

  it("issues exactly one DELETE even when confirm is clicked twice in quick succession", async () => {
    let resolveDelete: (response: Response) => void = () => {};
    const deletePromise = new Promise<Response>((resolve) => {
      resolveDelete = resolve;
    });
    const fetchMock = createFetchStub(
      discardHandlers({ [`DELETE ${VERSION_PATH}`]: () => deletePromise }),
    );
    await mountForDiscard(fetchMock);

    await openDiscardDialog();
    typeSlugConfirmation(SLUG);
    const confirmButton = discardConfirmButton();
    fireEvent.click(confirmButton);
    await waitFor(() => expect(confirmButton.hasAttribute("disabled")).toBe(true));
    fireEvent.click(confirmButton);

    await act(async () => {
      resolveDelete(noContentResponse());
    });
    expect(deleteCallCount(fetchMock)).toBe(1);
  });
});

describe("CaseVersionEditorScreen — a 204 response to Discard (criterion 5)", () => {
  it("navigates the curator to that case's own Case Detail route", async () => {
    const fetchMock = createFetchStub(
      discardHandlers({ [`DELETE ${VERSION_PATH}`]: () => noContentResponse() }),
    );
    const router = await mountForDiscard(fetchMock);

    await openDiscardDialog();
    typeSlugConfirmation(SLUG);
    fireEvent.click(discardConfirmButton());

    await waitFor(() => expect(router.state.location.pathname).toBe(`/cases/${SLUG}`));
  });
});

describe("CaseVersionEditorScreen — an error response to Discard (criterion 6)", () => {
  it("keeps the Dialog open and renders that error's own message on a 404 response, rather than navigating away", async () => {
    const fetchMock = createFetchStub(
      discardHandlers({
        [`DELETE ${VERSION_PATH}`]: () =>
          apiErrorResponse("CaseNotFoundError", 404, "This case no longer exists"),
      }),
    );
    const router = await mountForDiscard(fetchMock);

    await openDiscardDialog();
    typeSlugConfirmation(SLUG);
    fireEvent.click(discardConfirmButton());

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByRole("alert")).toBeTruthy());
    expect(within(dialog).getByText("This case no longer exists")).toBeTruthy();
    expect(router.state.location.pathname).toBe(`/cases/${SLUG}/versions/3`);
  });

  it("renders a generic fallback message, rather than none at all, when the DELETE fails outside the backend's own typed error envelope", async () => {
    const fetchMock = createFetchStub(
      discardHandlers({
        [`DELETE ${VERSION_PATH}`]: () => Promise.reject(new Error("network down")),
      }),
    );
    await mountForDiscard(fetchMock);

    await openDiscardDialog();
    typeSlugConfirmation(SLUG);
    fireEvent.click(discardConfirmButton());

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByRole("alert")).toBeTruthy());
    expect(
      within(dialog).getByText("Something went wrong while discarding this draft. Try again."),
    ).toBeTruthy();
  });
});

describe("CaseVersionEditorScreen — the Dialog's own \"Keep draft\" control (criterion 7)", () => {
  it("closes the Dialog and issues no request when Keep draft is clicked", async () => {
    const fetchMock = createFetchStub(discardHandlers());
    await mountForDiscard(fetchMock);

    await openDiscardDialog();
    typeSlugConfirmation("something typed but not confirmed");
    fireEvent.click(keepDraftButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(deleteCallCount(fetchMock)).toBe(0);
  });

  it("disables Keep draft while a confirm is in flight", async () => {
    let resolveDelete: (response: Response) => void = () => {};
    const deletePromise = new Promise<Response>((resolve) => {
      resolveDelete = resolve;
    });
    const fetchMock = createFetchStub(
      discardHandlers({ [`DELETE ${VERSION_PATH}`]: () => deletePromise }),
    );
    await mountForDiscard(fetchMock);

    await openDiscardDialog();
    typeSlugConfirmation(SLUG);
    fireEvent.click(discardConfirmButton());

    await waitFor(() => {
      expect(keepDraftButton().hasAttribute("disabled")).toBe(true);
    });

    await act(async () => {
      resolveDelete(noContentResponse());
    });
  });
});

describe("CaseVersionEditorScreen — reopening the Dialog after a failed Discard", () => {
  it("clears the typed confirmation and the previous error once the Dialog is closed and reopened", async () => {
    const fetchMock = createFetchStub(
      discardHandlers({
        [`DELETE ${VERSION_PATH}`]: () =>
          apiErrorResponse("CaseVersionNotDraftError", 409, "no longer a draft"),
      }),
    );
    await mountForDiscard(fetchMock);

    await openDiscardDialog();
    typeSlugConfirmation(SLUG);
    fireEvent.click(discardConfirmButton());

    const firstDialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(firstDialog).getByRole("alert")).toBeTruthy());

    fireEvent.click(keepDraftButton());
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await openDiscardDialog();
    const reopenedDialog = screen.getByRole("dialog");
    expect(within(reopenedDialog).queryByRole("alert")).toBeNull();
    const confirmationInput = screen.getByLabelText(`Type ${SLUG} to confirm`);
    if (!(confirmationInput instanceof HTMLInputElement)) {
      throw new Error("expected the confirmation field to be an <input> element");
    }
    expect(confirmationInput.value).toBe("");
  });
});
