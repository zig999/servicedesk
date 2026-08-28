import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import {
  CaseSimulationHypothesesTable,
  type CaseSimulationHypothesesTableProps,
} from "./case-simulation-hypotheses-table";
import type { SimulationManifestRow } from "./case-simulation-hypotheses-table-row";

// task/simulation-cockpit/hypotheses-table's own six criteria, proven
// directly against CaseSimulationHypothesesTable -- a presentational
// component taking every fact as a prop, so (unlike
// case-hypotheses-tab.test-support.ts's own mount helpers) no fetch stub or
// QueryClientProvider is needed here: this component issues no request of
// its own. It renders a TanStack Router Link (its own Edit action), so
// (mirroring case-hypotheses-tab.test-support.ts's own
// mountHypothesisRevisionHistory and case-detail-screen.spec.ts's own
// buildTestRouter) it needs a real router context; the sibling leaf route
// below exists solely so that Link has a real destination to resolve an href
// against, addressed by the same route pattern
// case-hypotheses-tab.test-support.ts's own REVISE_ROUTE_PATTERN names.

const EDIT_ROUTE_PATTERN = "/cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName";

async function mount(props: CaseSimulationHypothesesTableProps): Promise<void> {
  const rootRoute = createRootRoute({
    component: () => createElement(CaseSimulationHypothesesTable, props),
  });
  const editRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: EDIT_ROUTE_PATTERN,
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([editRoute]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  render(createElement(RouterProvider, { router }));
}

/** Locates a data row by its own rendered "#" (position) column value. */
function findRowByPosition(rows: readonly HTMLElement[], position: number): HTMLElement {
  const match = rows.find(
    (row) => within(row).getAllByRole("cell")[0].textContent === String(position),
  );
  if (!match) {
    throw new Error(`case-simulation-hypotheses-table.spec.ts: no row found for position ${position}`);
  }
  return match;
}

const NOT_RUN_ROW: SimulationManifestRow = {
  position: 2,
  hypothesisName: "H2",
  collects: ["ConceptX"],
};

const CONFIRMED_ROW: SimulationManifestRow = {
  position: 1,
  hypothesisName: "H1",
  collects: ["ConceptA", "ConceptB"],
  evaluation: {
    hypothesis: "The customer overpaid",
    verdict: "confirmed",
    usage: { input_tokens: 120, output_tokens: 40 },
  },
};

const INCONCLUSIVE_ROW: SimulationManifestRow = {
  position: 3,
  hypothesisName: "H3",
  collects: [],
  evaluation: {
    hypothesis: "The refund was already issued",
    verdict: "inconclusive",
    reason: "no-data",
  },
};

function baseProps(
  overrides: Partial<CaseSimulationHypothesesTableProps> = {},
): CaseSimulationHypothesesTableProps {
  return {
    slug: "acme-widgets",
    version: 7,
    // Deliberately out of the manifest's own precedence order (2, 1, 3) so
    // ordering assertions below cannot pass by accident of array order.
    rows: [NOT_RUN_ROW, CONFIRMED_ROW, INCONCLUSIVE_ROW],
    onSimulateHypothesis: vi.fn(),
    ...overrides,
  };
}

describe("CaseSimulationHypothesesTable -- one row per manifest entry, in precedence order (criterion 1)", () => {
  it("renders exactly one row per manifest entry, ordered by position, whether or not each has run this session, regardless of the caller's own array order", async () => {
    await mount(baseProps());

    const rows = await screen.findAllByRole("row");
    // header + one row per of the three manifest entries, nothing collapsed and nothing extra.
    expect(rows).toHaveLength(4);

    const dataRows = rows.slice(1);
    const positionsInDomOrder = dataRows.map((row) => within(row).getAllByRole("cell")[0].textContent);
    expect(positionsInDomOrder).toEqual(["1", "2", "3"]);
  });
});

describe("CaseSimulationHypothesesTable -- concepts collected (criterion 2)", () => {
  it("shows the number of concepts collected per row, independent of whether that row has an evaluation", async () => {
    await mount(baseProps());
    const rows = (await screen.findAllByRole("row")).slice(1);

    expect(within(findRowByPosition(rows, 1)).getAllByRole("cell")[2].textContent).toBe("2");
    expect(within(findRowByPosition(rows, 2)).getAllByRole("cell")[2].textContent).toBe("1");
    expect(within(findRowByPosition(rows, 3)).getAllByRole("cell")[2].textContent).toBe("0");
  });
});

describe("CaseSimulationHypothesesTable -- verdict and reason (criterion 3)", () => {
  it("shows the reason alongside the verdict for a row whose last run resolved inconclusive", async () => {
    await mount(baseProps());
    const rows = (await screen.findAllByRole("row")).slice(1);

    expect(within(findRowByPosition(rows, 3)).getByText("Inconclusive · no data")).toBeTruthy();
  });

  it("shows no verdict at all for a row that has not run this session", async () => {
    await mount(baseProps());
    const rows = (await screen.findAllByRole("row")).slice(1);
    const notRunRow = findRowByPosition(rows, 2);

    expect(within(notRunRow).getAllByRole("cell")[3].textContent).toBe("—");
    expect(within(notRunRow).queryByText(/Confirmed|Refuted|Inconclusive/)).toBeNull();
  });

  it("shows the plain verdict word alone, with no reason suffix, for an inconclusive row that carries no reason", async () => {
    const inconclusiveNoReason: SimulationManifestRow = {
      position: 1,
      hypothesisName: "H1",
      collects: [],
      evaluation: { hypothesis: "x", verdict: "inconclusive" },
    };
    await mount(baseProps({ rows: [inconclusiveNoReason] }));

    expect(screen.getByText("Inconclusive")).toBeTruthy();
  });

  it("never shows a reason for a row whose verdict resolved confirmed, even where a reason value is present", async () => {
    const confirmedWithReason: SimulationManifestRow = {
      position: 1,
      hypothesisName: "H1",
      collects: [],
      evaluation: { hypothesis: "x", verdict: "confirmed", reason: "no-data" },
    };
    await mount(baseProps({ rows: [confirmedWithReason] }));

    expect(screen.getByText("Confirmed")).toBeTruthy();
    expect(screen.queryByText(/no data/)).toBeNull();
  });
});

// This task's own disclosed inference ("Token cost renders as a plain integer sum
// (input_tokens + output_tokens), not a compacted/locale-formatted string") -- proven here
// against the actual rendered "Cost (tok)" column, complementing the narrower unit tests
// over costCell itself in case-simulation-hypotheses-table-row.spec.ts.
describe("CaseSimulationHypothesesTable -- token cost column", () => {
  it("shows the input-plus-output token sum for a row whose call has run this session", async () => {
    await mount(baseProps());
    const rows = (await screen.findAllByRole("row")).slice(1);

    expect(within(findRowByPosition(rows, 1)).getAllByRole("cell")[4].textContent).toBe("160");
  });

  it("shows the plain placeholder in the cost column for a row that has not run this session", async () => {
    await mount(baseProps());
    const rows = (await screen.findAllByRole("row")).slice(1);

    expect(within(findRowByPosition(rows, 2)).getAllByRole("cell")[4].textContent).toBe("—");
  });
});

describe("CaseSimulationHypothesesTable -- the Stale indicator (rules/investigation/a-simulation-result-is-stale-once-its-source-changes)", () => {
  it('shows a "Stale" indicator for a row whose evaluation is marked stale', async () => {
    const staleRow: SimulationManifestRow = {
      position: 1,
      hypothesisName: "H1",
      collects: [],
      evaluation: { hypothesis: "The customer overpaid", verdict: "confirmed", stale: true },
    };
    await mount(baseProps({ rows: [staleRow] }));
    const rows = (await screen.findAllByRole("row")).slice(1);

    expect(within(findRowByPosition(rows, 1)).getByText("Stale")).toBeTruthy();
  });

  it('shows no "Stale" indicator for a row whose evaluation has run this session but is not marked stale', async () => {
    await mount(baseProps({ rows: [CONFIRMED_ROW] }));
    const rows = (await screen.findAllByRole("row")).slice(1);

    expect(within(findRowByPosition(rows, 1)).queryByText("Stale")).toBeNull();
  });

  it('shows no "Stale" indicator for a row that has not run this session at all', async () => {
    await mount(baseProps({ rows: [NOT_RUN_ROW] }));
    const rows = (await screen.findAllByRole("row")).slice(1);

    expect(within(findRowByPosition(rows, 2)).queryByText("Stale")).toBeNull();
  });
});

describe("CaseSimulationHypothesesTable -- the edit action's own route (criterion 4)", () => {
  it("addresses a row's own Edit link to that hypothesis's manifest-hypothesis route with ?back=simulate", async () => {
    await mount(baseProps({ slug: "acme-widgets", version: 7 }));
    const rows = (await screen.findAllByRole("row")).slice(1);
    const editLink = within(findRowByPosition(rows, 1)).getByRole("link", {
      name: "Edit hypothesis at position 1",
    });

    const url = new URL(editLink.getAttribute("href") ?? "", "http://localhost");
    expect(url.pathname).toBe("/cases/acme-widgets/versions/7/manifest/hypotheses/H1");
    expect(url.searchParams.get("back")).toBe("simulate");
  });

  it("addresses a row with no evaluation this session's own Edit link the same way, using its routing identity rather than any evaluation-derived name", async () => {
    await mount(baseProps({ slug: "acme-widgets", version: 7 }));
    const rows = (await screen.findAllByRole("row")).slice(1);
    const editLink = within(findRowByPosition(rows, 2)).getByRole("link", {
      name: "Edit hypothesis at position 2",
    });

    const url = new URL(editLink.getAttribute("href") ?? "", "http://localhost");
    expect(url.pathname).toBe("/cases/acme-widgets/versions/7/manifest/hypotheses/H2");
    expect(url.searchParams.get("back")).toBe("simulate");
  });
});

describe("CaseSimulationHypothesesTable -- the determining/outcome/referral summary line (criterion 5)", () => {
  it("shows the determining hypothesis, outcome and referral from the last full-case run's own summary", async () => {
    await mount(
      baseProps({
        summary: {
          outcome: "resolved",
          referral: { action: "escalate", recipient: "supervisor" },
          determiningHypothesis: "H1",
        },
      }),
    );

    const summaryParagraph = await screen.findByText(/Determining:/);
    expect(summaryParagraph.textContent).toBe(
      "Determining: H1 · Outcome resolved · Referral escalate / supervisor",
    );
  });

  it('shows the literal word "Fallback" for the determining hypothesis when nothing confirmed and the fallback answered', async () => {
    await mount(
      baseProps({
        summary: { outcome: "resolved", referral: { action: "notify", recipient: "customer" } },
      }),
    );

    const summaryParagraph = await screen.findByText(/Determining:/);
    expect(summaryParagraph.textContent).toBe(
      "Determining: Fallback · Outcome resolved · Referral notify / customer",
    );
  });

  it("shows no summary line when no full-case run has completed this session", async () => {
    await mount(baseProps({ summary: undefined }));

    expect(screen.queryByText(/Determining:/)).toBeNull();
  });
});

describe("CaseSimulationHypothesesTable -- the simulate action is a callback this region never dispatches (criterion 6)", () => {
  it("calls the caller's own onSimulateHypothesis with the clicked row's own hypothesis name", async () => {
    const onSimulateHypothesis = vi.fn();
    await mount(baseProps({ rows: [CONFIRMED_ROW], onSimulateHypothesis }));

    fireEvent.click(screen.getByRole("button", { name: "Simulate hypothesis at position 1" }));

    expect(onSimulateHypothesis).toHaveBeenCalledTimes(1);
    expect(onSimulateHypothesis).toHaveBeenCalledWith("H1");
  });

  it("passes the clicked row's own hypothesis name, not another row's, when several rows are shown", async () => {
    const onSimulateHypothesis = vi.fn();
    await mount(baseProps({ onSimulateHypothesis }));

    fireEvent.click(screen.getByRole("button", { name: "Simulate hypothesis at position 2" }));

    expect(onSimulateHypothesis).toHaveBeenCalledTimes(1);
    expect(onSimulateHypothesis).toHaveBeenCalledWith("H2");
  });
});

// This task's own disclosed inference ("A last-run stage-durations line (DurationsLine) is
// built even though no numbered criterion tests it"), sourced from this task's own Notes
// ("The bar shows the last run's measured durations without a budget comparison").
describe("CaseSimulationHypothesesTable -- the last-run stage-durations line", () => {
  it("shows the last run's own measured collection, judgment, writing and total durations when supplied", async () => {
    await mount(
      baseProps({
        lastRunDurations: { collectionMs: 1200, judgmentMs: 800, writingMs: 300, totalMs: 2300 },
      }),
    );

    const durationsParagraph = await screen.findByText(/Last run/);
    expect(durationsParagraph.textContent).toBe(
      "Last run · collection 1200ms · judgment 800ms · writing 300ms · total 2300ms",
    );
  });

  it("omits the writing figure when the last run carried none, as a single-hypothesis run never reaches writing", async () => {
    await mount(
      baseProps({
        lastRunDurations: { collectionMs: 900, judgmentMs: 500, totalMs: 1400 },
      }),
    );

    const durationsParagraph = await screen.findByText(/Last run/);
    expect(durationsParagraph.textContent).toBe(
      "Last run · collection 900ms · judgment 500ms · total 1400ms",
    );
  });

  it("shows no durations line when no run's durations were supplied", async () => {
    await mount(baseProps({ lastRunDurations: undefined }));

    expect(screen.queryByText(/Last run/)).toBeNull();
  });
});

describe("CaseSimulationHypothesesTable -- an empty manifest (edge case)", () => {
  it("renders an explicit empty state, rather than an empty table, for a version whose manifest holds no hypothesis", async () => {
    await mount(baseProps({ rows: [] }));

    expect(await screen.findByText("This version's manifest holds no hypothesis.")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});
