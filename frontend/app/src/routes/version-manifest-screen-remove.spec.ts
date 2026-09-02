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
  jsonResponse,
  manifestPath,
  mountManifestScreen,
  noContentResponse,
  ONE_ENTRY_MANIFEST,
  sequentialGetHandler,
  TWO_ENTRY_MANIFEST,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function manifestGetCallCount(fetchMock: ReturnType<typeof createFetchStub>): number {
  return fetchMock.mock.calls.filter(([input, init]) => {
    const url = typeof input === "string" ? input : input.toString();
    return url === VERSION_PATH && (init?.method ?? "GET").toUpperCase() === "GET";
  }).length;
}

describe("VersionManifestScreen — the Remove control's tooltip and disabled state (criterion 6)", () => {
  it("disables Remove and carries the stated tooltip when the manifest holds exactly one entry", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(ONE_ENTRY_MANIFEST),
    });
    await mountManifestScreen(fetchMock);
    await screen.findByLabelText("Solo");

    const removeButton = within(findRow("Solo")).getByRole("button", { name: "Remove" });
    expect(removeButton.hasAttribute("disabled")).toBe(true);

    // eslint-disable-next-line testing-library/no-node-access -- see comment above
    const wrapper = removeButton.parentElement;
    expect(wrapper?.tagName).toBe("SPAN");

    fireEvent.focusIn(wrapper!);

    expect(
      (await screen.findAllByText("A case must keep at least one hypothesis")).length,
    ).toBeGreaterThan(0);
  });

  it("enables Remove and carries no tooltip when the manifest holds more than one entry", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse(TWO_ENTRY_MANIFEST),
    });
    await mountManifestScreen(fetchMock);
    await screen.findByLabelText("H1");

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
    await screen.findByLabelText("H1");

    clickRemoveTrigger("H1");
    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect(deleteCallCount(fetchMock)).toBe(0);

    fireEvent.click(dialogCancelButton());

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(deleteCallCount(fetchMock)).toBe(0);
    expect(screen.getByLabelText("H1").textContent).toBe("2");
  });
});

describe("VersionManifestScreen — removing an entry (criterion 7)", () => {
  it("issues one DELETE against that hypothesis's own manifest entry once the confirmation dialog is confirmed, and a 204 removes it from the list", async () => {

    const ONE_ENTRY_AFTER_REMOVE = { manifest: [{ position: 1, hypothesis_revision: { hypothesis: { name: "H2" }, revision: 5 } }] };
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([TWO_ENTRY_MANIFEST, ONE_ENTRY_AFTER_REMOVE]),
      [`DELETE ${manifestPath("H1")}`]: () => noContentResponse(),
    });
    await mountManifestScreen(fetchMock);
    await screen.findByLabelText("H1");

    clickRemoveTrigger("H1");
    await screen.findByRole("dialog");
    fireEvent.click(dialogConfirmRemoveButton());

    await waitFor(() => expect(deleteCallCount(fetchMock)).toBe(1));
    await waitFor(() => expect(screen.queryByLabelText("H1")).toBeNull());
    expect(screen.getByLabelText("H2").textContent).toBe("5");
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
    await screen.findByLabelText("H1");
    expect(manifestGetCallCount(fetchMock)).toBe(1);

    clickRemoveTrigger("H1");
    await screen.findByRole("dialog");
    fireEvent.click(dialogConfirmRemoveButton());

    await waitFor(() => expect(deleteCallCount(fetchMock)).toBe(1));

    await waitFor(() => expect(manifestGetCallCount(fetchMock)).toBe(2));
    expect(screen.getByLabelText("H1").textContent).toBe("2");
  });
});
