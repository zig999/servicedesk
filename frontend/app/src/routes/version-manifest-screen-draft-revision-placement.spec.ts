import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  clickRemoveTrigger,
  createFetchStub,
  deleteCallCount,
  dialogConfirmRemoveButton,
  entry,
  findRow,
  jsonResponse,
  manifestPath,
  mountManifestScreen,
  noContentResponse,
  parsedPutBody,
  putCallCount,
  sequentialGetHandler,
  SLUG,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function revisionsPath(hypothesisName: string): string {
  return `/v1/cases/${SLUG}/hypotheses/${hypothesisName}/revisions`;
}

function revisionsPage(
  revisions: readonly { revision: number; state: "draft" | "released" }[],
): { data: { revision: number; state: "draft" | "released" }[]; total: number } {
  return { data: revisions.map((item) => ({ ...item })), total: revisions.length };
}

describe("VersionManifestScreen — the revision selector's own options, over a revision listing carrying state (criterion 1)", () => {
  it("offers a revision whose own state is draft as a selectable option, exactly like a released one", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 2)] }),
      [`GET ${revisionsPath("H1")}`]: () =>
        jsonResponse(
          revisionsPage([
            { revision: 2, state: "released" },
            { revision: 4, state: "draft" },
          ]),
        ),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");
    fireEvent.click(trigger);

    const draftOption = within(screen.getByRole("listbox")).getByRole("option", { name: "4" });
    expect(draftOption.getAttribute("aria-disabled")).not.toBe("true");
  });
});

describe("VersionManifestScreen — choosing a revision whose own state is draft (criteria 2 and 5)", () => {
  it("issues the place request for the chosen draft revision, with no client-side refusal shown before the server answers", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([
        { manifest: [entry(1, "H1", 2)] },
        { manifest: [entry(1, "H1", 4)] },
      ]),
      [`GET ${revisionsPath("H1")}`]: () =>
        jsonResponse(
          revisionsPage([
            { revision: 2, state: "released" },
            { revision: 4, state: "draft" },
          ]),
        ),
      [`PUT ${manifestPath("H1")}`]: () => noContentResponse(),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");
    fireEvent.click(trigger);
    fireEvent.mouseDown(within(screen.getByRole("listbox")).getByRole("option", { name: "4" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    expect(parsedPutBody(fetchMock)).toEqual({ revision: 4, position: 1 });
    expect(screen.queryByText("This version was released by someone else")).toBeNull();
    expect(within(findRow("H1")).queryByRole("alert")).toBeNull();
  });
});

describe("VersionManifestScreen — an entry's own removal and repin controls, held against its pinned revision's own state (criterion 3)", () => {
  it("leaves the Select and Remove controls enabled on a row pinning a draft revision, exactly as on a row pinning a released one", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () =>
        jsonResponse({ manifest: [entry(1, "H1", 1), entry(2, "H2", 5)] }),
      [`GET ${revisionsPath("H1")}`]: () =>
        jsonResponse(revisionsPage([{ revision: 1, state: "draft" }])),
      [`GET ${revisionsPath("H2")}`]: () =>
        jsonResponse(revisionsPage([{ revision: 5, state: "released" }])),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByLabelText("H1");
    await screen.findByLabelText("H2");

    expect(screen.getByLabelText("H1").hasAttribute("disabled")).toBe(false);
    expect(screen.getByLabelText("H2").hasAttribute("disabled")).toBe(false);
    expect(
      within(findRow("H1")).getByRole("button", { name: "Remove" }).hasAttribute("disabled"),
    ).toBe(false);
    expect(
      within(findRow("H2")).getByRole("button", { name: "Remove" }).hasAttribute("disabled"),
    ).toBe(false);
  });
});

describe("VersionManifestScreen — removing an entry whose pinned revision's own state is draft (criterion 4)", () => {
  it("issues the DELETE and removes the entry on the same terms as any other entry, once confirmed", async () => {
    const AFTER_REMOVE = {
      manifest: [entry(1, "H2", 5)],
    };
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([
        { manifest: [entry(1, "H1", 1), entry(2, "H2", 5)] },
        AFTER_REMOVE,
      ]),
      [`GET ${revisionsPath("H1")}`]: () =>
        jsonResponse(revisionsPage([{ revision: 1, state: "draft" }])),
      [`GET ${revisionsPath("H2")}`]: () =>
        jsonResponse(revisionsPage([{ revision: 5, state: "released" }])),
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
