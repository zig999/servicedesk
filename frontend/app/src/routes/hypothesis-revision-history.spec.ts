import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import {
  createFetchStub,
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

const THREE_REVISIONS = {
  data: [
    {
      revision: 1,
      criterion: "Old criterion",
      collects: ["ConceptA", "ConceptB"],
      resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
    },
    {
      revision: 2,
      criterion: "Middle criterion",
      collects: ["ConceptC"],
      resolution: { outcome: "resolved", referral: { action: "escalate", recipient: "supervisor" } },
    },
    {
      revision: 5,
      criterion: "New criterion",
      collects: ["ConceptD"],
      resolution: { outcome: "pending", referral: { action: "notify", recipient: "customer" } },
    },
  ],
  total: 3,
};

function findRowByRevisionNumber(rows: readonly HTMLElement[], revision: number): HTMLElement {
  const match = rows.find((row) => within(row).queryByText(String(revision)) !== null);
  if (!match) {
    throw new Error(`hypothesis-revision-history.spec.ts: no row found for revision ${revision}`);
  }
  return match;
}

async function mount(overrides: Record<string, () => Response | Promise<Response>> = {}) {
  const fetchMock = createFetchStub({
    [revisionsPath(HYPOTHESIS_NAME)]: () => jsonResponse(THREE_REVISIONS),
    [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 1, state: "released" }] }),
    [manifestPath(1)]: () => jsonResponse(manifestPinning(HYPOTHESIS_NAME, 5)),
    ...overrides,
  });
  await mountHypothesisRevisionHistory(fetchMock, {
    slug: SLUG,
    hypothesisName: HYPOTHESIS_NAME,
    onBack: vi.fn(),
  });
}

describe("HypothesisRevisionHistory (criterion 5)", () => {
  it("lists every revision the endpoint returns, each showing its own revision number, criterion and collects, as a closed, non-editable block", async () => {
    await mount();

    const rows = await screen.findAllByRole("row");

    expect(rows).toHaveLength(4);

    const row1 = findRowByRevisionNumber(rows, 1);
    expect(within(row1).getByText("Old criterion")).toBeTruthy();
    expect(within(row1).getByText("ConceptA, ConceptB")).toBeTruthy();

    const row5 = findRowByRevisionNumber(rows, 5);
    expect(within(row5).getByText("New criterion")).toBeTruthy();
    expect(within(row5).getByText("ConceptD")).toBeTruthy();

    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
  });
});

describe("HypothesisRevisionHistory (criterion 6)", () => {
  it("labels the revision holding the highest revision number current and every other one frozen", async () => {
    await mount();

    const rows = await screen.findAllByRole("row");
    expect(within(findRowByRevisionNumber(rows, 5)).getByText("current")).toBeTruthy();
    expect(within(findRowByRevisionNumber(rows, 1)).getByText("frozen")).toBeTruthy();
    expect(within(findRowByRevisionNumber(rows, 2)).getByText("frozen")).toBeTruthy();
  });
});

describe("HypothesisRevisionHistory (criterion 7)", () => {
  it("renders \"Revise →\" only on the revision labeled current", async () => {
    await mount();

    const rows = await screen.findAllByRole("row");
    expect(screen.getAllByRole("link", { name: "Revise →" })).toHaveLength(1);
    expect(
      within(findRowByRevisionNumber(rows, 5)).getByRole("link", { name: "Revise →" }),
    ).toBeTruthy();
    expect(
      within(findRowByRevisionNumber(rows, 1)).queryByRole("link", { name: "Revise →" }),
    ).toBeNull();
    expect(
      within(findRowByRevisionNumber(rows, 2)).queryByRole("link", { name: "Revise →" }),
    ).toBeNull();
  });

  it("addresses the Revise link with this hypothesis's own name and the case's own highest version number, regardless of the order the versions were returned in or which one is a draft", async () => {
    await mount({
      [VERSIONS_PATH]: () =>
        jsonResponse({
          data: [
            { version: 1, state: "released" },
            { version: 5, state: "draft" },
            { version: 3, state: "released" },
          ],
        }),
      [manifestPath(5)]: () => jsonResponse(manifestPinning(HYPOTHESIS_NAME, 5)),
    });

    const link = await screen.findByRole("link", { name: "Revise →" });
    expect(link.getAttribute("href")).toBe(
      `/cases/${SLUG}/versions/5/manifest/hypotheses/${HYPOTHESIS_NAME}`,
    );
  });
});

describe("HypothesisRevisionHistory -- loading and failure states", () => {
  it("shows a loading placeholder before the revisions and the case's versions both arrive", async () => {
    await mount({
      [revisionsPath(HYPOTHESIS_NAME)]: () => new Promise<Response>(() => {}),
    });

    expect(screen.getByText("Loading revision history…")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("shows a failure placeholder with a retry action when loading revisions fails", async () => {
    await mount({
      [revisionsPath(HYPOTHESIS_NAME)]: () => {
        throw new Error("network down");
      },
    });

    expect(
      await screen.findByText("Unable to load this hypothesis's revision history."),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("treats a hypothesis with zero revisions as a load failure rather than an empty state", async () => {
    await mount({
      [revisionsPath(HYPOTHESIS_NAME)]: () => jsonResponse({ data: [], total: 0 }),
    });

    expect(
      await screen.findByText("Unable to load this hypothesis's revision history."),
    ).toBeTruthy();
  });

  it("treats a case with zero versions as a load failure rather than an empty state", async () => {
    await mount({
      [VERSIONS_PATH]: () => jsonResponse({ data: [] }),
    });

    expect(
      await screen.findByText("Unable to load this hypothesis's revision history."),
    ).toBeTruthy();
  });
});

describe("HypothesisRevisionHistory -- returning to the list", () => {
  it("calls onBack when Back to hypotheses is clicked", async () => {
    const onBack = vi.fn();
    const fetchMock = createFetchStub({
      [revisionsPath(HYPOTHESIS_NAME)]: () => jsonResponse(THREE_REVISIONS),
      [VERSIONS_PATH]: () => jsonResponse({ data: [{ version: 1, state: "released" }] }),
      [manifestPath(1)]: () => jsonResponse(manifestPinning(HYPOTHESIS_NAME, 5)),
    });
    await mountHypothesisRevisionHistory(fetchMock, { slug: SLUG, hypothesisName: HYPOTHESIS_NAME, onBack });

    fireEvent.click(await screen.findByRole("button", { name: "Back to hypotheses" }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
