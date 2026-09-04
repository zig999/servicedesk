import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  apiErrorResponse,
  createFetchStub,
  entry,
  findRow,
  jsonResponse,
  mountManifestScreen,
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

describe("VersionManifestScreen — a row's pinned-revision state (criteria 1 and 4)", () => {
  it("states released for a row whose pinned revision is released in its hypothesis's revisions listing", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 1)] }),
      [`GET ${revisionsPath("H1")}`]: () =>
        jsonResponse(
          revisionsPage([
            { revision: 1, state: "released" },
            { revision: 2, state: "draft" },
          ]),
        ),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByLabelText("H1");
    const row = findRow("H1");

    expect(within(row).getByText("Released")).toBeTruthy();
    expect(within(row).queryByText("Draft")).toBeNull();
  });

  it("states draft for a row whose pinned revision is draft in its hypothesis's revisions listing", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 1)] }),
      [`GET ${revisionsPath("H1")}`]: () =>
        jsonResponse(
          revisionsPage([
            { revision: 1, state: "draft" },
            { revision: 2, state: "released" },
          ]),
        ),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByLabelText("H1");
    const row = findRow("H1");

    expect(within(row).getByText("Draft")).toBeTruthy();
    expect(within(row).queryByText("Released")).toBeNull();
  });
});

describe("VersionManifestScreen — the pinned-revision-state statement's visibility with the Select closed (criterion 3)", () => {
  it("keeps the state statement visible while the row's Select stands closed, without needing it opened", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 1)] }),
      [`GET ${revisionsPath("H1")}`]: () =>
        jsonResponse(revisionsPage([{ revision: 1, state: "draft" }])),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByLabelText("H1");

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(within(findRow("H1")).getByText("Draft")).toBeTruthy();
  });
});

describe("VersionManifestScreen — the pinned-revision-state statement on a released version (criterion 2)", () => {
  it("still states the pinned revision's own state when the case version itself is released", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () =>
        jsonResponse({ state: "released", manifest: [entry(1, "H1", 1)] }),
      [`GET ${revisionsPath("H1")}`]: () =>
        jsonResponse(revisionsPage([{ revision: 1, state: "released" }])),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByLabelText("H1");

    expect(within(findRow("H1")).getByText("Released")).toBeTruthy();
  });
});

describe("VersionManifestScreen — the pinned revision number stays exactly as before (criterion 5)", () => {
  it("keeps the Select's own value as the bare pinned revision number, unaffected by the state statement beside it", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 1)] }),
      [`GET ${revisionsPath("H1")}`]: () =>
        jsonResponse(revisionsPage([{ revision: 1, state: "draft" }])),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");

    expect(trigger.textContent).toBe("1");
  });
});

describe("VersionManifestScreen — the state statement when the pin is absent from the answered page (this task's own inference)", () => {
  it("shows no state statement for a row whose own pinned revision is absent from the page its revisions listing answered", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 2)] }),
      [`GET ${revisionsPath("H1")}`]: () =>
        jsonResponse(
          revisionsPage([
            { revision: 1, state: "draft" },
            { revision: 3, state: "released" },
          ]),
        ),
    });
    await mountManifestScreen(fetchMock);

    const trigger = await screen.findByLabelText("H1");
    expect(trigger.textContent).toBe("2");

    expect(within(findRow("H1")).queryByText("Draft")).toBeNull();
    expect(within(findRow("H1")).queryByText("Released")).toBeNull();
  });
});

describe("VersionManifestScreen — the state statement before the revisions listing has answered (edge case)", () => {
  it("shows no state statement on a row whose revisions listing has not yet answered", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 1)] }),
      [`GET ${revisionsPath("H1")}`]: () => new Promise<Response>(() => {}),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByText("H1");

    expect(screen.queryByText("Draft")).toBeNull();
    expect(screen.queryByText("Released")).toBeNull();
  });
});

describe("VersionManifestScreen — the state statement when the revisions listing fails (edge case)", () => {
  it("shows no state statement, and no crash, on a row whose revisions listing answered with an error", async () => {
    const fetchMock = createFetchStub({
      [`GET ${VERSION_PATH}`]: () => jsonResponse({ manifest: [entry(1, "H1", 1)] }),
      [`GET ${revisionsPath("H1")}`]: () =>
        apiErrorResponse("SomeUnexpectedError", 500, "internal error"),
    });
    await mountManifestScreen(fetchMock);

    await screen.findByLabelText("H1");

    expect(within(findRow("H1")).queryByText("Draft")).toBeNull();
    expect(within(findRow("H1")).queryByText("Released")).toBeNull();
  });
});
