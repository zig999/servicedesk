import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import {
  apiErrorResponse,
  baseHandlers,
  createFetchStub,
  jsonResponse,
  LOADED_RECORD,
  mountCaseVersionEditor,
  parsedPatchBody,
  patchCallCount,
  VERSION_PATH,
} from "./case-version-editor-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseVersionEditorScreen — save, conflict, 404 and the save state machine", () => {
  it("sends the entire form content as one PATCH request when Save is clicked, never only the changed field", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`PATCH ${VERSION_PATH}`]: () =>
          jsonResponse({ ...LOADED_RECORD, title: "Edited via Save button" }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const titleInput = await screen.findByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "Edited via Save button" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(patchCallCount(fetchMock)).toBe(1);
    });
    expect(parsedPatchBody(fetchMock)).toEqual({
      title: "Edited via Save button",
      when_to_use: LOADED_RECORD.when_to_use,
      subject: LOADED_RECORD.subject,
      fallback: LOADED_RECORD.fallback,
      consolidation_register: LOADED_RECORD.consolidation_register,
    });
  });

  it("sends the entire form content as one PATCH request when a field is blurred while dirty, never only the changed field", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`PATCH ${VERSION_PATH}`]: () => jsonResponse({ ...LOADED_RECORD, title: "Edited via blur" }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const titleInput = await screen.findByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "Edited via blur" } });

    fireEvent.focusOut(titleInput);

    await waitFor(() => {
      expect(patchCallCount(fetchMock)).toBe(1);
    });
    expect(parsedPatchBody(fetchMock)).toEqual({
      title: "Edited via blur",
      when_to_use: LOADED_RECORD.when_to_use,
      subject: LOADED_RECORD.subject,
      fallback: LOADED_RECORD.fallback,
      consolidation_register: LOADED_RECORD.consolidation_register,
    });
  });

  it("sends exactly one PATCH request when blur and the Save button both fire from one edit", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`PATCH ${VERSION_PATH}`]: () => jsonResponse({ ...LOADED_RECORD, title: "One save only" }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const titleInput = await screen.findByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "One save only" } });

    fireEvent.focusOut(titleInput);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(patchCallCount(fetchMock)).toBe(1);
    });
  });

  it("re-hydrates the form from the PATCH response and shows a 'Last saved HH:mm' indicator on a 200 response", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`PATCH ${VERSION_PATH}`]: () =>
          jsonResponse({ ...LOADED_RECORD, title: "Server-normalized title" }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const titleInput = await screen.findByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "Client-side edit" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByDisplayValue("Server-normalized title")).toBeTruthy();
    expect(screen.getByText(/^Last saved \d{2}:\d{2}$/)).toBeTruthy();
  });

  it("blocks further editing and shows the conflict banner on a 409 CaseVersionNotDraftError response to Save", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`PATCH ${VERSION_PATH}`]: () =>
          apiErrorResponse("CaseVersionNotDraftError", 409, "the version is no longer a draft"),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const titleInput = await screen.findByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "Conflicting edit" } });
    const saveButton = screen.getByRole("button", { name: "Save changes" });
    fireEvent.click(saveButton);

    expect(await screen.findByText("This version was released by someone else")).toBeTruthy();
    expect(
      screen.getByText(
        "Your changes were not saved. Reload to see the current state, or start a new draft.",
      ),
    ).toBeTruthy();
    expect(titleInput.hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Save changes" }).hasAttribute("disabled")).toBe(
      true,
    );
  });

  it("navigates to the Cases List route when loading the version answers 404 CaseNotFoundError", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => apiErrorResponse("CaseNotFoundError", 404, "case not found"),
      }),
    );
    const router = await mountCaseVersionEditor(fetchMock);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/cases");
    });
  });

  it("navigates to the Cases List route when saving answers 404 CaseNotFoundError", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`PATCH ${VERSION_PATH}`]: () =>
          apiErrorResponse("CaseNotFoundError", 404, "case not found"),
      }),
    );
    const router = await mountCaseVersionEditor(fetchMock);

    const titleInput = await screen.findByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "About to vanish" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/cases");
    });
  });

  it("moves clean to dirty on edit, dirty to saving while the PATCH is in flight, and saving back to clean on a 200 response", async () => {
    let resolvePatch: (response: Response) => void = () => {};
    const patchPromise = new Promise<Response>((resolve) => {
      resolvePatch = resolve;
    });
    const fetchMock = createFetchStub(
      baseHandlers({ [`PATCH ${VERSION_PATH}`]: () => patchPromise }),
    );
    await mountCaseVersionEditor(fetchMock);

    const titleInput = await screen.findByLabelText("Title");
    const saveButton = screen.getByRole("button", { name: "Save changes" });

    expect(saveButton.hasAttribute("disabled")).toBe(true);

    fireEvent.change(titleInput, { target: { value: "Mid-flight edit" } });
    expect(saveButton.hasAttribute("disabled")).toBe(false);

    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(saveButton.hasAttribute("disabled")).toBe(true);
    });
    expect(titleInput.hasAttribute("disabled")).toBe(true);

    await act(async () => {
      resolvePatch(jsonResponse({ ...LOADED_RECORD, title: "Mid-flight edit" }));
    });
    await waitFor(() => {
      expect(titleInput.hasAttribute("disabled")).toBe(false);
    });
    expect(saveButton.hasAttribute("disabled")).toBe(true);
  });

  it("returns the form to dirty, editable and unblocked when Save fails for a reason other than a 409 or 404", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`PATCH ${VERSION_PATH}`]: () =>
          apiErrorResponse("SomeUnmappedError", 500, "internal error"),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const titleInput = await screen.findByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "Edit that fails to save" } });
    const saveButton = screen.getByRole("button", { name: "Save changes" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveButton.hasAttribute("disabled")).toBe(false);
    });
    expect(titleInput.hasAttribute("disabled")).toBe(false);
    expect(screen.queryByText("This version was released by someone else")).toBeNull();
  });

  it("shows a loading placeholder before the version and its glossary vocabularies arrive", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    await mountCaseVersionEditor(fetchMock);

    expect(screen.getByText("Loading version 3…")).toBeTruthy();
    expect(screen.queryByLabelText("Title")).toBeNull();
  });

  it("shows a failure placeholder with a retry action when loading the version fails for a reason other than 404", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => {
          throw new Error("network down");
        },
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    expect(await screen.findByText("Unable to load this version right now.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("exposes the 'Last saved' save-status text through an aria-live=\"polite\" region once a save completes", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`PATCH ${VERSION_PATH}`]: () =>
          jsonResponse({ ...LOADED_RECORD, title: "Announced save" }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const titleInput = await screen.findByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "Announced save" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    const savedStatus = await screen.findByText(/^Last saved \d{2}:\d{2}$/);
    expect(savedStatus.getAttribute("aria-live")).toBe("polite");
  });
});
