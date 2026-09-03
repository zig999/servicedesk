import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
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

const REVISIONS = {
  data: [
    {
      revision: 1,
      criterion: "Earliest criterion",
      collects: ["ConceptA"],
      resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
    },
    {
      revision: 3,
      criterion: "Middle criterion",
      collects: ["ConceptB"],
      resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
    },
    {
      revision: 7,
      criterion: "Latest criterion",
      collects: ["ConceptC"],
      resolution: { outcome: "pending", referral: { action: "notify", recipient: "customer" } },
    },
  ],
  total: 3,
};

const TARGET_VERSION = 9;

function findRow(rows: readonly HTMLElement[], revision: number): HTMLElement {
  const match = rows.find((row) => within(row).queryByText(String(revision)) !== null);
  if (!match) {
    throw new Error(
      `hypothesis-revision-history-current-pin.spec.ts: no row found for revision ${revision}`,
    );
  }
  return match;
}

async function mountWithPin(pinnedRevision: number | null): Promise<void> {
  const fetchMock = createFetchStub({
    [revisionsPath(HYPOTHESIS_NAME)]: () => jsonResponse(REVISIONS),
    [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: TARGET_VERSION, state: "draft" }] }),
    [manifestPath(TARGET_VERSION)]: () =>
      jsonResponse(
        pinnedRevision === null ? emptyManifest() : manifestPinning(HYPOTHESIS_NAME, pinnedRevision),
      ),
  });
  await mountHypothesisRevisionHistory(fetchMock, {
    slug: SLUG,
    hypothesisName: HYPOTHESIS_NAME,
    onBack: vi.fn(),
  });
}

describe("HypothesisRevisionHistory -- current reads from the highest-numbered version's manifest pin", () => {
  it("marks the row for the manifest's pinned revision current, not the hypothesis's own highest revision, when the pin is lower than that highest revision", async () => {
    await mountWithPin(3);

    const rows = await screen.findAllByRole("row");
    expect(within(findRow(rows, 3)).getByText("current")).toBeTruthy();
    expect(within(findRow(rows, 1)).queryByText("current")).toBeNull();
    expect(within(findRow(rows, 7)).queryByText("current")).toBeNull();
  });

  it("marks the pinned revision's row current when that pin is the hypothesis's own highest existing revision", async () => {
    await mountWithPin(7);

    const rows = await screen.findAllByRole("row");
    expect(within(findRow(rows, 7)).getByText("current")).toBeTruthy();
    expect(within(findRow(rows, 1)).queryByText("current")).toBeNull();
    expect(within(findRow(rows, 3)).queryByText("current")).toBeNull();
  });

  it("marks at most one row current -- exactly the row the manifest pins -- even though three revisions are shown", async () => {
    await mountWithPin(3);

    await screen.findAllByRole("row");
    expect(screen.getAllByText("current")).toHaveLength(1);
  });

  it("renders the Revise action only on the row marked current, addressed at the case's highest-numbered version, even when that row is not the highest revision", async () => {
    await mountWithPin(3);

    const rows = await screen.findAllByRole("row");
    const reviseLinks = screen.getAllByRole("link", { name: "Revise →" });
    expect(reviseLinks).toHaveLength(1);
    const link = within(findRow(rows, 3)).getByRole("link", { name: "Revise →" });
    expect(link.getAttribute("href")).toBe(
      `/cases/${SLUG}/versions/${TARGET_VERSION}/manifest/hypotheses/${HYPOTHESIS_NAME}`,
    );
    expect(within(findRow(rows, 1)).queryByRole("link", { name: "Revise →" })).toBeNull();
    expect(within(findRow(rows, 7)).queryByRole("link", { name: "Revise →" })).toBeNull();
  });

  it("states explicitly that the case currently uses no revision of this hypothesis when the highest-numbered version's manifest holds no entry for it, rather than marking nothing and saying nothing", async () => {
    await mountWithPin(null);

    await screen.findAllByRole("row");
    expect(screen.queryAllByText("current")).toHaveLength(0);
    expect(screen.getByText(/uses no revision/i)).toBeTruthy();
  });
});

describe("HypothesisRevisionHistory -- the highest-numbered version's manifest failing to load", () => {
  it("shows the failure state with a retry action when reading the highest-numbered version's manifest fails, even though the revisions and the case's versions both loaded", async () => {
    let manifestShouldFail = true;
    const fetchMock = createFetchStub({
      [revisionsPath(HYPOTHESIS_NAME)]: () => jsonResponse(REVISIONS),
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: TARGET_VERSION, state: "draft" }] }),
      [manifestPath(TARGET_VERSION)]: () => {
        if (manifestShouldFail) {
          throw new Error("network down");
        }
        return jsonResponse(manifestPinning(HYPOTHESIS_NAME, 3));
      },
    });

    await mountHypothesisRevisionHistory(fetchMock, {
      slug: SLUG,
      hypothesisName: HYPOTHESIS_NAME,
      onBack: vi.fn(),
    });

    expect(
      await screen.findByText("Unable to load this hypothesis's revision history."),
    ).toBeTruthy();

    manifestShouldFail = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    const rows = await screen.findAllByRole("row");
    expect(within(findRow(rows, 3)).getByText("current")).toBeTruthy();
  });
});
