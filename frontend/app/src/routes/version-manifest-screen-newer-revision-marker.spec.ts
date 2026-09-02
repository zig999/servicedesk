import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import {
  createFetchStub,
  entry,
  findRow,
  jsonResponse,
  manifestPath,
  mountManifestScreen,
  noContentResponse,
  putCallCount,
  sequentialGetHandler,
  SLUG,
  VERSION_PATH,
} from "./version-manifest-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const MARKER_TEXT = "Newer revision available";

function revisionsPath(hypothesisName: string): string {
  return `/v1/cases/${SLUG}/hypotheses/${hypothesisName}/revisions`;
}

function revisionsPage(revisions: readonly number[]): { data: { revision: number }[]; total: number } {
  return { data: revisions.map((revision) => ({ revision })), total: revisions.length };
}

describe("VersionManifestScreen — the newer-revision marker on a stale pin (criterion 1)", () => {
  it("shows the newer-revision marker when the row's pinned revision is below the highest revision its own hypothesis's revisions listing answered", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 1)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2])),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByLabelText("H1");

    expect(within(findRow("H1")).getByText(MARKER_TEXT)).toBeTruthy();
  });
});

describe("VersionManifestScreen — the newer-revision marker on a current pin (criterion 2)", () => {
  it("shows no marker when the row's pinned revision is the highest revision its revisions listing answered", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 2)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2])),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByLabelText("H1");

    expect(within(findRow("H1")).queryByText(MARKER_TEXT)).toBeNull();
  });
});

describe("VersionManifestScreen — the marker's readability with the Select closed (criterion 3)", () => {
  it("keeps the marker visible while the row's Select stands closed, without needing it opened", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 1)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2])),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByLabelText("H1");

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(within(findRow("H1")).getByText(MARKER_TEXT)).toBeTruthy();
  });
});

describe("VersionManifestScreen — the marker's comparison basis (criterion 4)", () => {
  it("decides each row's marker against that row's own hypothesis's answered highest, never against another row's revision or pin", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () =>
        jsonResponse({ manifest: [entry(1, "H1", 2), entry(2, "H2", 3)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2])),
      [`GET ${revisionsPath("H2")}`]: () => jsonResponse(revisionsPage([1, 2, 3, 5])),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByLabelText("H1");
    await screen.findByLabelText("H2");

    expect(within(findRow("H1")).queryByText(MARKER_TEXT)).toBeNull();
    expect(within(findRow("H2")).getByText(MARKER_TEXT)).toBeTruthy();
  });
});

describe("VersionManifestScreen — the marker before the listing answers (criterion 5)", () => {
  it("shows no marker on a row whose revisions listing has not yet answered", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 1)] }),
      [`GET ${revisionsPath("H1")}`]: () => new Promise<Response>(() => {}),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByText("H1");

    expect(screen.queryByText(MARKER_TEXT)).toBeNull();
  });
});

describe("VersionManifestScreen — the marker over an answered but empty listing (edge case)", () => {
  it("shows no marker once the revisions listing has answered with no revisions at all", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 1)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([])),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");

    expect(trigger.textContent).toBe("1");
    expect(within(findRow("H1")).queryByText(MARKER_TEXT)).toBeNull();
  });
});

describe("VersionManifestScreen — the marker when the pin is absent from the answered page (edge case)", () => {
  it("still shows the marker when the row's own pinned revision is absent from the page the listing answered but that page's highest exceeds it", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 2)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 3, 4])),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");

    expect(trigger.textContent).toBe("2");
    expect(within(findRow("H1")).getByText(MARKER_TEXT)).toBeTruthy();
  });
});

describe("VersionManifestScreen — the marker after a repin reaches the answered highest (edge case)", () => {
  it("removes the marker once the row is repinned to the revision the listing already answered as its highest", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: sequentialGetHandler([
        { manifest: [entry(1, "H1", 1)] },
        { manifest: [entry(1, "H1", 2)] },
      ]),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2])),
      [`PUT ${manifestPath("H1")}`]: () => noContentResponse(),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");
    expect(within(findRow("H1")).getByText(MARKER_TEXT)).toBeTruthy();

    fireEvent.click(trigger);
    fireEvent.mouseDown(within(screen.getByRole("listbox")).getByRole("option", { name: "2" }));

    await waitFor(() => expect(putCallCount(fetchMock)).toBe(1));
    await waitFor(() => expect(screen.getByLabelText("H1").textContent).toBe("2"));

    expect(within(findRow("H1")).queryByText(MARKER_TEXT)).toBeNull();
  });
});

describe("VersionManifestScreen — the marker's place beside the row's own Select (this task's own inference)", () => {
  it("renders the marker inside the same row as the row's own Select trigger, rather than somewhere else on the screen", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 1)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2])),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByLabelText("H1");
    const row = findRow("H1");

    expect(within(row).getByRole("combobox")).toBeTruthy();
    expect(within(row).getByText(MARKER_TEXT)).toBeTruthy();
  });
});

describe("VersionManifestScreen — the marker offers no adoption path on a released row (UNDERDETERMINED, from the specification)", () => {
  it("stays a plain disclosure with no button or link role, and changes nothing about the row's pin when clicked, on a row whose version is released", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () =>
        jsonResponse({ state: "released", manifest: [entry(1, "H1", 1)] }),
      [`GET ${revisionsPath("H1")}`]: () => jsonResponse(revisionsPage([1, 2])),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByLabelText("H1");
    const row = findRow("H1");
    const marker = within(row).getByText(MARKER_TEXT);

    expect(within(row).queryByRole("button", { name: new RegExp(MARKER_TEXT) })).toBeNull();
    expect(within(row).queryByRole("link", { name: new RegExp(MARKER_TEXT) })).toBeNull();

    fireEvent.click(marker);

    expect(putCallCount(fetchMock)).toBe(0);
    expect(screen.getByLabelText("H1").textContent).toBe("1");
  });
});
