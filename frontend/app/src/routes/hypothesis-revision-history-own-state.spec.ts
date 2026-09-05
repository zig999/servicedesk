import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import {
  createFetchStub,
  emptyManifest,
  jsonResponse,
  manifestPath,
  manifestPinning,
  mountHypothesisRevisionHistory,
  revisionsPath,
  SLUG,
  VERSIONS_PATH,
} from "./case-hypotheses-tab.test-support";

afterEach(() => {
  vi.unstubAllGlobals();
});

const HYPOTHESIS_NAME = "H1";
const TARGET_VERSION = 9;

function revisionItem(
  revision: number,
  state: "draft" | "released",
): Record<string, unknown> {
  return {
    revision,
    criterion: `Criterion ${revision}`,
    collects: ["ConceptA"],
    resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
    state,
  };
}

function findRow(rows: readonly HTMLElement[], revision: number): HTMLElement {
  const match = rows.find((row) => within(row).queryByText(String(revision)) !== null);
  if (!match) {
    throw new Error(
      `hypothesis-revision-history-own-state.spec.ts: no row found for revision ${revision}`,
    );
  }
  return match;
}

async function mount(
  revisions: readonly Record<string, unknown>[],
  pinnedRevision: number | null,
): Promise<void> {
  const fetchMock = createFetchStub({
    [revisionsPath(HYPOTHESIS_NAME)]: () =>
      jsonResponse({ data: revisions, total: revisions.length }),
    [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: TARGET_VERSION, state: "released" }] }),
    [manifestPath(TARGET_VERSION)]: () =>
      jsonResponse(
        pinnedRevision === null
          ? emptyManifest()
          : manifestPinning(HYPOTHESIS_NAME, pinnedRevision),
      ),
  });
  await mountHypothesisRevisionHistory(fetchMock, {
    slug: SLUG,
    hypothesisName: HYPOTHESIS_NAME,
    onBack: vi.fn(),
  });
}

describe("HypothesisRevisionHistory -- each row states its own revision's draft or released state", () => {
  it("renders Draft on a row whose revision answered draft and Released on a row whose revision answered released, in the same listing", async () => {
    await mount(
      [revisionItem(3, "draft"), revisionItem(5, "released"), revisionItem(7, "draft")],
      5,
    );

    const rows = await screen.findAllByRole("row");

    const row3 = findRow(rows, 3);
    expect(within(row3).getByText("Draft")).toBeTruthy();
    expect(within(row3).queryByText("Released")).toBeNull();

    const row5 = findRow(rows, 5);
    expect(within(row5).getByText("Released")).toBeTruthy();
    expect(within(row5).queryByText("Draft")).toBeNull();

    const row7 = findRow(rows, 7);
    expect(within(row7).getByText("Draft")).toBeTruthy();
    expect(within(row7).queryByText("Released")).toBeNull();
  });
});

describe("HypothesisRevisionHistory -- a row's own state and the case's current-pin indication are two separate facts", () => {
  it("shows a not-current revision as released, so a row reads released and frozen at the same time", async () => {
    await mount([revisionItem(3, "released"), revisionItem(9, "draft")], 9);

    const rows = await screen.findAllByRole("row");
    const row3 = findRow(rows, 3);

    expect(within(row3).getByText("Released")).toBeTruthy();
    expect(within(row3).getByText("frozen")).toBeTruthy();
  });

  it("shows the current revision as draft, so a row reads draft and current at the same time", async () => {
    await mount([revisionItem(3, "released"), revisionItem(9, "draft")], 9);

    const rows = await screen.findAllByRole("row");
    const row9 = findRow(rows, 9);

    expect(within(row9).getByText("Draft")).toBeTruthy();
    expect(within(row9).getByText("current")).toBeTruthy();
  });
});

describe("HypothesisRevisionHistory -- own-state indicator coloring (disclosed inference)", () => {
  it("paints a draft revision's own-state indicator bg-warning and a released revision's bg-success", async () => {
    await mount([revisionItem(3, "draft"), revisionItem(5, "released")], 5);

    const rows = await screen.findAllByRole("row");
    const stateCell3 = within(findRow(rows, 3)).getAllByRole("cell")[1];
    const stateCell5 = within(findRow(rows, 5)).getAllByRole("cell")[1];

    expect(stateCell3?.innerHTML).toContain("bg-warning");
    expect(stateCell5?.innerHTML).toContain("bg-success");
  });
});

describe("HypothesisRevisionHistory -- row ordering with the State column present", () => {
  it("keeps the rows ordered by revision number highest-first, regardless of the state column added", async () => {
    await mount(
      [revisionItem(2, "draft"), revisionItem(9, "released"), revisionItem(5, "draft")],
      9,
    );

    const rows = await screen.findAllByRole("row");
    const dataRows = rows.slice(1);
    const revisionCellTexts = dataRows.map(
      (row) => within(row).getAllByRole("cell")[0]?.textContent,
    );

    expect(revisionCellTexts).toEqual(["9", "5", "2"]);
  });
});
