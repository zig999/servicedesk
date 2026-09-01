import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  createFetchStub,
  DRAFT_RECORD,
  jsonResponse,
  LOADED_RECORD,
  mountCaseVersionEditor,
  openReleaseDialog,
  releaseCallCount,
  releaseCancelButton,
  releaseConfirmButton,
  releaseHandlers,
  RELEASED_RECORD,
  RELEASE_PATH,
  SLUG,
  VERSION_PATH,
} from "./case-version-editor-release.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseVersionEditorScreen — the Release… control's own visibility (criterion 1)", () => {
  it("renders the Release… control once the loaded version's own state is draft", async () => {
    const fetchMock = createFetchStub(releaseHandlers());
    await mountCaseVersionEditor(fetchMock);

    expect(await screen.findByRole("button", { name: "Release…" })).toBeTruthy();
  });

  it("renders no Release control when the loaded version's own state is released", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({ [`GET ${VERSION_PATH}`]: () => jsonResponse(RELEASED_RECORD) }),
    );
    await mountCaseVersionEditor(fetchMock);

    await screen.findByDisplayValue(LOADED_RECORD.title);
    expect(screen.queryByRole("button", { name: "Release…" })).toBeNull();
  });

  it("renders no Release control when the loaded version carries no state field at all", async () => {

    const fetchMock = createFetchStub(releaseHandlers({ [`GET ${VERSION_PATH}`]: () => jsonResponse(LOADED_RECORD) }));
    await mountCaseVersionEditor(fetchMock);

    await screen.findByDisplayValue(LOADED_RECORD.title);
    expect(screen.queryByRole("button", { name: "Release…" })).toBeNull();
  });

  it("disables the Release trigger while a Save to the same version is in flight", async () => {
    let resolvePatch: (response: Response) => void = () => {};
    const patchPromise = new Promise<Response>((resolve) => {
      resolvePatch = resolve;
    });
    const fetchMock = createFetchStub(
      releaseHandlers({ [`PATCH ${VERSION_PATH}`]: () => patchPromise }),
    );
    await mountCaseVersionEditor(fetchMock);

    const titleInput = await screen.findByLabelText("Title");
    fireEvent.change(titleInput, { target: { value: "Mid-flight edit" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Release…" }).hasAttribute("disabled")).toBe(
        true,
      );
    });

    await act(async () => {
      resolvePatch(jsonResponse({ ...DRAFT_RECORD, title: "Mid-flight edit" }));
    });
  });
});

describe("CaseVersionEditorScreen — opening the Release Dialog (criteria 2 and 3)", () => {
  it("opens an in-place Dialog (no navigation) listing exactly the three checklist items, every one satisfied by already-loaded data", async () => {
    const fetchMock = createFetchStub(releaseHandlers());
    const router = await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();

    expect(router.state.location.pathname).toBe(`/cases/${SLUG}/versions/3`);

    const dialog = screen.getByRole("dialog");
    const items = within(dialog).getAllByRole("listitem");

    expect(items).toHaveLength(3);
    expect(within(dialog).getByText(/✓\s*Manifest holds at least one hypothesis \(1\)/)).toBeTruthy();
    expect(within(dialog).getByText(/✓\s*Fallback resolution is set/)).toBeTruthy();
    expect(
      within(dialog).getByText(/✓\s*Every collected concept accepts the case subject/),
    ).toBeTruthy();
  });

  it("closes the Dialog and issues no request when Cancel is clicked", async () => {
    const fetchMock = createFetchStub(releaseHandlers());
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    fireEvent.click(releaseCancelButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(releaseCallCount(fetchMock)).toBe(0);
  });

  it("disables the Dialog's own Cancel control while a confirm is in flight", async () => {
    let resolveRelease: (response: Response) => void = () => {};
    const releasePromise = new Promise<Response>((resolve) => {
      resolveRelease = resolve;
    });
    const fetchMock = createFetchStub(
      releaseHandlers({ [`POST ${RELEASE_PATH}`]: () => releasePromise }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    fireEvent.click(releaseConfirmButton());

    await waitFor(() => {
      expect(releaseCancelButton().hasAttribute("disabled")).toBe(true);
    });

    await act(async () => {
      resolveRelease(jsonResponse({ ...RELEASED_RECORD }));
    });
  });

  it("never styles the Release trigger or its Dialog confirm as the destructive variant", async () => {
    const fetchMock = createFetchStub(releaseHandlers());
    await mountCaseVersionEditor(fetchMock);

    const trigger = await screen.findByRole("button", { name: "Release…" });
    expect(trigger.className).not.toMatch(/destructive/);

    await openReleaseDialog();
    expect(releaseConfirmButton().className).not.toMatch(/destructive/);
  });
});
