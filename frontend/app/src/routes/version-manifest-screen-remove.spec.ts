import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  apiErrorResponse,
  clickRemoveTrigger,
  createFetchStub,
  deleteCallCount,
  dialogCancelButton,
  dialogConfirmRemoveButton,
  findRow,
  getCallCount,
  jsonResponse,
  manifestPath,
  mountManifestScreen,
  noContentResponse,
  ONE_ENTRY_MANIFEST,
  sequentialGetHandler,
  TWO_ENTRY_MANIFEST,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

// Remove coverage for task/manifest-hypothesis-authoring/manifest-builder (criteria 6, 7
// and 8), plus the confirmation-dialog edge case the implementation's own inference
// adds between clicking Remove and the DELETE actually firing (EDG-04). Load/ordering,
// reorder and conflict coverage live in the sibling spec files this task's own proof
// splits across, to stay under this project's own max-lines rule; all share
// version-manifest-screen.test-support.ts's own fixtures and mounting helpers.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("VersionManifestScreen — the Remove control's tooltip and disabled state (criterion 6)", () => {
  it("disables Remove and carries the stated tooltip when the manifest holds exactly one entry", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(ONE_ENTRY_MANIFEST),
    });
    await mountManifestScreen(fetchMock);
    await screen.findAllByText(/· rev/);

    const removeButton = within(findRow("Solo")).getByRole("button", { name: "Remove" });
    expect(removeButton.hasAttribute("disabled")).toBe(true);

    // The tooltip trigger is the wrapping <span> (not the disabled Button itself, which
    // carries `pointer-events: none` while disabled) -- see this task's own inference in
    // version-manifest-screen.tsx's RowActions header comment. No RTL query reaches a plain
    // wrapping element with no role or text of its own.
    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    const wrapper = removeButton.parentElement;
    expect(wrapper?.tagName).toBe("SPAN");
    // React implements onFocus exclusively through the native, bubbling "focusin" event,
    // never the native "focus" event itself (which does not bubble) -- the same react-dom
    // event-registration fact this project's own edit-draft-version proof already
    // documents for onBlur/"focusout". fireEvent.focus alone would never reach Radix
    // Tooltip's own onFocus handler in this React 19 setup.
    fireEvent.focusIn(wrapper!);

    // Radix Tooltip renders both the positioned, visible tooltip content and a visually-hidden
    // live-region copy of the same text for screen readers -- a real, intentional duplication,
    // not a bug -- so this queries for at least one match rather than the exact one
    // findByText/getByText would require.
    expect(
      (await screen.findAllByText("A case must keep at least one hypothesis")).length,
    ).toBeGreaterThan(0);
  });

  it("enables Remove and carries no tooltip when the manifest holds more than one entry", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
    });
    await mountManifestScreen(fetchMock);
    await screen.findAllByText(/· rev/);

    const removeButton = within(findRow("H1")).getByRole("button", { name: "Remove" });
    expect(removeButton.hasAttribute("disabled")).toBe(false);

    // eslint-disable-next-line testing-library/no-node-access -- see comment on the first test above
    const wrapper = removeButton.parentElement;
    fireEvent.focusIn(wrapper!);

    expect(screen.queryByText("A case must keep at least one hypothesis")).toBeNull();
  });
});

describe("VersionManifestScreen — the confirmation dialog (this task's own EDG-04 inference)", () => {
  it("opens a confirmation dialog on Remove without issuing the DELETE, and Cancel closes it without ever issuing one", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
    });
    await mountManifestScreen(fetchMock);
    await screen.findAllByText(/· rev/);

    clickRemoveTrigger("H1");
    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(deleteCallCount(fetchMock)).toBe(0);

    fireEvent.click(dialogCancelButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(deleteCallCount(fetchMock)).toBe(0);
    expect(screen.getByText("H1 · rev 2")).toBeTruthy();
  });
});

describe("VersionManifestScreen — removing an entry (criterion 7)", () => {
  it("issues one DELETE against that hypothesis's own manifest entry once the confirmation dialog is confirmed, and a 204 removes it from the list", async () => {
    // The implementation removes an entry by invalidating the shared manifest query and
    // refetching, never by removing the row from local state directly -- so the mock GET
    // must itself reflect the removal on its second call, the same way the reorder specs'
    // own sequentialGetHandler already simulates a PUT's server-side effect.
    const ONE_ENTRY_AFTER_REMOVE = { manifest: [{ position: 1, hypothesis_revision: { hypothesis: { name: "H2" }, revision: 5 } }] };
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([TWO_ENTRY_MANIFEST, ONE_ENTRY_AFTER_REMOVE]),
      [`DELETE ${manifestPath("H1")}`]: () => noContentResponse(),
    });
    await mountManifestScreen(fetchMock);
    await screen.findAllByText(/· rev/);

    clickRemoveTrigger("H1");
    await screen.findByRole("dialog");
    fireEvent.click(dialogConfirmRemoveButton());

    await waitFor(() => expect(deleteCallCount(fetchMock)).toBe(1));
    await waitFor(() => expect(screen.queryByText("H1 · rev 2")).toBeNull());
    expect(screen.getByText("H2 · rev 5")).toBeTruthy();
  });
});

describe("VersionManifestScreen — a removal that would empty the manifest (criterion 8)", () => {
  it("reloads the manifest from the real GET rather than trusting the client's own removed-entry state when the DELETE answers 422 ManifestWouldHoldNoHypothesisError", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
      [`DELETE ${manifestPath("H1")}`]: () =>
        apiErrorResponse("ManifestWouldHoldNoHypothesisError", 422, "would hold no hypothesis"),
    });
    await mountManifestScreen(fetchMock);
    await screen.findAllByText(/· rev/);
    expect(getCallCount(fetchMock)).toBe(1);

    clickRemoveTrigger("H1");
    await screen.findByRole("dialog");
    fireEvent.click(dialogConfirmRemoveButton());

    await waitFor(() => expect(deleteCallCount(fetchMock)).toBe(1));
    // The reload this criterion names, not merely "the row never disappeared" (which a
    // client that simply never removed anything would also satisfy vacuously).
    await waitFor(() => expect(getCallCount(fetchMock)).toBe(2));
    expect(screen.getByText("H1 · rev 2")).toBeTruthy();
  });
});
