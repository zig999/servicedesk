import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  apiErrorResponse,
  baseHandlers,
  createFetchStub,
  jsonResponse,
  LOADED_RECORD,
  mountCaseVersionEditor,
  SLUG,
  VERSION_PATH,
} from "./case-version-editor-screen.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

function revisionsPath(hypothesisName: string): string {
  return `/v1/cases/${SLUG}/hypotheses/${encodeURIComponent(hypothesisName)}/revisions`;
}

function revisionsPage(
  revisions: readonly { revision: number; state: "draft" | "released" }[],
): { data: { revision: number; state: "draft" | "released" }[]; total: number } {
  return { data: revisions.map((item) => ({ ...item })), total: revisions.length };
}

const RELEASED_MANIFEST = [
  {
    position: 1,
    hypothesis_revision: {
      hypothesis: { name: "Delayed payment history" },
      revision: 4,
      criterion: "At least two late payments in the last 90 days",
      collects: ["late-payment"],
    },
  },
  {
    position: 2,
    hypothesis_revision: {
      hypothesis: { name: "Disputed invoice pattern" },
      revision: 2,
      criterion: "Three or more disputes filed against the same invoice",
      collects: [],
    },
  },
];

const RELEASED_RECORD_WITH_MANIFEST = {
  ...LOADED_RECORD,
  state: "released" as const,
  manifest: RELEASED_MANIFEST,
};

describe("CaseVersionEditorScreen — the released manifest table's own State column (criteria 1 and 4)", () => {
  it("states each entry's own pinned-revision state, released or draft, read from that hypothesis's own revisions listing", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(RELEASED_RECORD_WITH_MANIFEST),
        [`GET ${revisionsPath("Delayed payment history")}`]: () =>
          jsonResponse(revisionsPage([{ revision: 4, state: "released" }])),
        [`GET ${revisionsPath("Disputed invoice pattern")}`]: () =>
          jsonResponse(revisionsPage([{ revision: 2, state: "draft" }])),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(3);

    expect(within(rows[1]).getByText("Released")).toBeTruthy();
    expect(within(rows[1]).queryByText("Draft")).toBeNull();
    expect(within(rows[2]).getByText("Draft")).toBeTruthy();
    expect(within(rows[2]).queryByText("Released")).toBeNull();
  });

  it("leaves the position, hypothesis, revision and criterion cells exactly as before, alongside the new state cell", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () => jsonResponse(RELEASED_RECORD_WITH_MANIFEST),
        [`GET ${revisionsPath("Delayed payment history")}`]: () =>
          jsonResponse(revisionsPage([{ revision: 4, state: "released" }])),
        [`GET ${revisionsPath("Disputed invoice pattern")}`]: () =>
          jsonResponse(revisionsPage([{ revision: 2, state: "draft" }])),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const table = await screen.findByRole("table");
    const firstRow = within(table).getAllByRole("row")[1];

    expect(within(firstRow).getByText("1")).toBeTruthy();
    expect(within(firstRow).getByText("Delayed payment history")).toBeTruthy();
    expect(within(firstRow).getByText("4")).toBeTruthy();
    expect(
      within(firstRow).getByText("At least two late payments in the last 90 days"),
    ).toBeTruthy();
  });
});

describe("CaseVersionEditorScreen — the released manifest table's state cell when the pin is absent from the answered page (this task's own inference)", () => {
  it("shows no state cell for an entry whose pinned revision is absent from the page its hypothesis's revisions listing answered, while its other fields still render", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({
            ...LOADED_RECORD,
            state: "released" as const,
            manifest: [RELEASED_MANIFEST[0]],
          }),
        [`GET ${revisionsPath("Delayed payment history")}`]: () =>
          jsonResponse(revisionsPage([{ revision: 9, state: "released" }])),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const table = await screen.findByRole("table");
    const row = within(table).getAllByRole("row")[1];

    expect(within(row).getByText("Delayed payment history")).toBeTruthy();
    expect(within(row).getByText("4")).toBeTruthy();
    expect(within(row).queryByText("Draft")).toBeNull();
    expect(within(row).queryByText("Released")).toBeNull();
  });
});

describe("CaseVersionEditorScreen — the released manifest table before any revisions listing has answered (edge case)", () => {
  it("renders the manifest table's other fields immediately, with no state cell, before any hypothesis's revisions listing has answered", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({
            ...LOADED_RECORD,
            state: "released" as const,
            manifest: [RELEASED_MANIFEST[0]],
          }),
        [`GET ${revisionsPath("Delayed payment history")}`]: () => new Promise<Response>(() => {}),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const table = await screen.findByRole("table");
    const row = within(table).getAllByRole("row")[1];

    expect(within(row).getByText("Delayed payment history")).toBeTruthy();
    expect(within(row).queryByText("Draft")).toBeNull();
    expect(within(row).queryByText("Released")).toBeNull();
  });
});

describe("CaseVersionEditorScreen — the released manifest table's state cell when a revisions listing fails (edge case)", () => {
  it("shows no state cell, and no crash, for an entry whose hypothesis's revisions listing answered with an error, while its other fields still render", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({
            ...LOADED_RECORD,
            state: "released" as const,
            manifest: [RELEASED_MANIFEST[0]],
          }),
        [`GET ${revisionsPath("Delayed payment history")}`]: () =>
          apiErrorResponse("SomeUnexpectedError", 500, "internal error"),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    const table = await screen.findByRole("table");
    const row = within(table).getAllByRole("row")[1];

    expect(within(row).getByText("Delayed payment history")).toBeTruthy();
    expect(within(row).queryByText("Draft")).toBeNull();
    expect(within(row).queryByText("Released")).toBeNull();
  });
});

describe("CaseVersionEditorScreen — the draft-version load with a malformed manifest fixture (this task's own inference)", () => {
  it("renders no Manifest section, and issues no request for any hypothesis's revisions, for a draft version's own load whose manifest entries carry no hypothesis field at all", async () => {
    const fetchMock = createFetchStub(
      baseHandlers({
        [`GET ${VERSION_PATH}`]: () =>
          jsonResponse({
            ...LOADED_RECORD,
            state: "draft" as const,
            manifest: [{ position: 1, hypothesis_revision: { revision: 1 } }],
          }),
      }),
    );
    await mountCaseVersionEditor(fetchMock);

    await screen.findByDisplayValue(LOADED_RECORD.title);

    expect(screen.queryByText("Manifest")).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeTruthy();
    expect(
      fetchMock.mock.calls.some(([input]) =>
        (typeof input === "string" ? input : input.toString()).includes("/revisions"),
      ),
    ).toBe(false);
  });
});
