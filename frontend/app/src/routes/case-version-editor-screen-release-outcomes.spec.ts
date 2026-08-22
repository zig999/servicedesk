import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  createFetchStub,
  jsonResponse,
  mountCaseVersionEditor,
  openReleaseDialog,
  releaseCallCount,
  releaseCancelButton,
  releaseConfirmButton,
  releaseHandlers,
  releasePostInit,
  RELEASED_RECORD,
  RELEASE_PATH,
  versionGetCallCount,
} from "./case-version-editor-release.test-support";

// POST-outcome coverage for task/version-editor/release-draft-version (criteria 4, 5, 6
// and 7): confirming Release, and rendering the 200/409/422 responses that POST
// .../release can answer with. Control-visibility and checklist coverage live in the two
// sibling spec files this task's own proof splits across, to stay under this project's
// own max-lines rule; all three share case-version-editor-release.test-support.ts's own
// fixtures.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CaseVersionEditorScreen — confirming Release (criterion 4)", () => {
  it("issues exactly one POST to .../release with no body when Release is confirmed", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({ [`POST ${RELEASE_PATH}`]: () => jsonResponse(RELEASED_RECORD) }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    fireEvent.click(releaseConfirmButton());

    await waitFor(() => expect(releaseCallCount(fetchMock)).toBe(1));
    expect(releasePostInit(fetchMock)?.body).toBeUndefined();
  });

  it("issues exactly one POST even when Release is confirmed twice in quick succession", async () => {
    let resolveRelease: (response: Response) => void = () => {};
    const releasePromise = new Promise<Response>((resolve) => {
      resolveRelease = resolve;
    });
    const fetchMock = createFetchStub(
      releaseHandlers({ [`POST ${RELEASE_PATH}`]: () => releasePromise }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    const confirmButton = releaseConfirmButton();
    fireEvent.click(confirmButton);
    await waitFor(() => expect(confirmButton.hasAttribute("disabled")).toBe(true));
    fireEvent.click(confirmButton);

    await act(async () => {
      resolveRelease(jsonResponse(RELEASED_RECORD));
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(releaseCallCount(fetchMock)).toBe(1);
  });
});

describe("CaseVersionEditorScreen — a 200 response to Release (criterion 5)", () => {
  it("moves the loaded version to released: hides the Release control and disables every field and Save", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({ [`POST ${RELEASE_PATH}`]: () => jsonResponse(RELEASED_RECORD) }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    fireEvent.click(releaseConfirmButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.queryByRole("button", { name: "Release…" })).toBeNull();
    expect(screen.getByLabelText("Title").hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Save changes" }).hasAttribute("disabled")).toBe(
      true,
    );
  });
});

describe("CaseVersionEditorScreen — a 422 CaseVersionNotReleasableError response (criterion 6)", () => {
  it("renders every violation the response's own array holds, verbatim, in place of the checklist", async () => {
    const violations = [
      "Fallback recipient no longer exists in the glossary",
      "Concept 'late-payment' does not accept subject 'billing-dispute'",
    ];
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`POST ${RELEASE_PATH}`]: () =>
          jsonResponse(
            { error: { code: "CaseVersionNotReleasableError", message: "not releasable", details: { violations } } },
            422,
          ),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    fireEvent.click(releaseConfirmButton());

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByRole("alert")).toBeTruthy());
    const alert = within(dialog).getByRole("alert");

    violations.forEach((violation) => {
      expect(within(alert).getByText((content) => content.includes(violation))).toBeTruthy();
    });
    expect(within(alert).getAllByRole("listitem")).toHaveLength(violations.length);
    expect(within(dialog).queryByText(/Manifest holds at least one hypothesis/)).toBeNull();
  });

  it("renders an empty violations view rather than the checklist when the response's own violations array is empty", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`POST ${RELEASE_PATH}`]: () =>
          jsonResponse(
            {
              error: {
                code: "CaseVersionNotReleasableError",
                message: "not releasable",
                details: { violations: [] },
              },
            },
            422,
          ),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    fireEvent.click(releaseConfirmButton());

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByRole("alert")).toBeTruthy());
    expect(within(within(dialog).getByRole("alert")).queryAllByRole("listitem")).toHaveLength(0);
    expect(within(dialog).queryByText(/Manifest holds at least one hypothesis/)).toBeNull();
  });
});

describe("CaseVersionEditorScreen — a 409 CaseVersionNotDraftAtReleaseError response (criterion 7)", () => {
  it("closes the Dialog and re-fetches the version rather than showing a violations list, resetting for the next open", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`POST ${RELEASE_PATH}`]: () =>
          jsonResponse(
            { error: { code: "CaseVersionNotDraftAtReleaseError", message: "no longer a draft" } },
            409,
          ),
      }),
    );
    await mountCaseVersionEditor(fetchMock);
    expect(versionGetCallCount(fetchMock)).toBe(1);

    await openReleaseDialog();
    fireEvent.click(releaseConfirmButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(versionGetCallCount(fetchMock)).toBe(2));

    // Reopening starts from the checklist again, never a stale violations list.
    await openReleaseDialog();
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByRole("alert")).toBeNull();
    expect(within(dialog).getByText(/Manifest holds at least one hypothesis \(1\)/)).toBeTruthy();
  });
});

describe("CaseVersionEditorScreen — resetting the Dialog after Cancel closes a violations view", () => {
  it("shows the checklist again, never the previous violations list, once Cancel closes a Dialog that had shown a 422's violations", async () => {
    const violations = ["Some violation from the backend"];
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`POST ${RELEASE_PATH}`]: () =>
          jsonResponse(
            { error: { code: "CaseVersionNotReleasableError", message: "not releasable", details: { violations } } },
            422,
          ),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    fireEvent.click(releaseConfirmButton());
    await waitFor(() =>
      expect(within(screen.getByRole("dialog")).getByRole("alert")).toBeTruthy(),
    );

    fireEvent.click(releaseCancelButton());
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await openReleaseDialog();
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByRole("alert")).toBeNull();
    expect(within(dialog).getByText(/Manifest holds at least one hypothesis \(1\)/)).toBeTruthy();
  });
});

describe("CaseVersionEditorScreen — a Release failure outside 409 and 422", () => {
  it("leaves the Dialog open with the checklist intact and the confirm control usable again", async () => {
    const fetchMock = createFetchStub(
      releaseHandlers({
        [`POST ${RELEASE_PATH}`]: () =>
          jsonResponse({ error: { code: "SomeUnmappedError", message: "internal error" } }, 500),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await openReleaseDialog();
    fireEvent.click(releaseConfirmButton());

    await waitFor(() => {
      expect(releaseConfirmButton().hasAttribute("disabled")).toBe(false);
    });
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/Manifest holds at least one hypothesis \(1\)/)).toBeTruthy();
    expect(within(dialog).queryByRole("alert")).toBeNull();
  });
});
