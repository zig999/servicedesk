import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseSimulationCaseResultCompare } from "./case-simulation-case-result-compare";
import type {
  CaseResultRun,
  CaseResultRunHypothesisVerdict,
} from "./case-simulation-case-result-types";

// task/simulation-cockpit/case-result-panel's own criterion 4: two runs from the in-memory
// history shown side by side, hypothesis by hypothesis. This component is presentational and
// props-driven -- no router, no query client, no fetch -- so (mirroring
// case-simulation-status-dot.spec.ts's own established convention) it is rendered directly.
// The panel's own wiring of which two runs reach this component (selection, gating) is proven
// in case-simulation-case-result-panel-compare.spec.ts; this file proves the comparison itself.
//
// Every row this component renders carries no role or label of its own (a plain grid `<div>`),
// so "which side a verdict landed on" is read through Testing Library's own query-ordering
// guarantee instead of raw DOM traversal: screen.getAllByText(...) returns its matches in
// document order, which is exactly the left-to-right column order this component's own JSX
// renders (first run's own column, then second's). Each test below picks a hypothesis whose
// possible cell contents (a verdict word or the "—" placeholder) are unique within the rendered
// output, so the pair returned identifies "first side" and "second side" without ever reading
// `.children`, `.parentElement` or `container.querySelector(...)`.

function makeRun(overrides: Partial<CaseResultRun> = {}): CaseResultRun {
  return {
    id: "run-1",
    ranAt: "2024-01-01T00:00:00.000Z",
    outcome: "resolved",
    referral: { action: "notify", recipient: "customer" },
    text: "Thanks for reaching out.",
    register: "formal",
    hypotheses: [],
    stale: false,
    ...overrides,
  };
}

function makeVerdict(
  overrides: Partial<CaseResultRunHypothesisVerdict> = {},
): CaseResultRunHypothesisVerdict {
  return { hypothesis: "H1", verdict: "confirmed", ...overrides };
}

describe("CaseSimulationCaseResultCompare -- side-by-side verdicts (criterion 4)", () => {
  it("shows both runs' own verdict for a hypothesis both of them judged", () => {
    const first = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "H1", verdict: "confirmed" })],
    });
    const second = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "H1", verdict: "refuted" })],
    });

    render(createElement(CaseSimulationCaseResultCompare, { runs: [first, second] }));

    const [firstSide, secondSide] = screen.getAllByText(/^(confirmed|refuted)$/);
    expect(firstSide.textContent).toBe("confirmed");
    expect(secondSide.textContent).toBe("refuted");
  });

  it("shows a plain placeholder on the second run's own side for a hypothesis only the first run judged", () => {
    const first = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "H2", verdict: "inconclusive" })],
    });
    const second = makeRun({ hypotheses: [] });

    render(createElement(CaseSimulationCaseResultCompare, { runs: [first, second] }));

    const [firstSide, secondSide] = screen.getAllByText(/^(inconclusive|—)$/);
    expect(firstSide.textContent).toBe("inconclusive");
    expect(secondSide.textContent).toBe("—");
  });

  it("shows a plain placeholder on the first run's own side for a hypothesis only the second run judged", () => {
    const first = makeRun({ hypotheses: [] });
    const second = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "H3", verdict: "refuted" })],
    });

    render(createElement(CaseSimulationCaseResultCompare, { runs: [first, second] }));

    const [firstSide, secondSide] = screen.getAllByText(/^(—|refuted)$/);
    expect(firstSide.textContent).toBe("—");
    expect(secondSide.textContent).toBe("refuted");
  });

  it("shows one row per hypothesis either run judged, deduplicating a hypothesis both of them judged", () => {
    const first = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "A" }), makeVerdict({ hypothesis: "B" })],
    });
    const second = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "B" }), makeVerdict({ hypothesis: "C" })],
    });

    render(createElement(CaseSimulationCaseResultCompare, { runs: [first, second] }));

    // Each hypothesis name renders exactly once per row (screen.getByText below would itself
    // throw on an unexpected duplicate), so the count and order of these single-letter labels
    // is the count and order of the rendered rows -- deduplicated, since "B" (judged by both
    // runs) still names only one row -- without counting any DOM element directly.
    const hypothesisLabels = screen.getAllByText(/^[A-Z]$/);
    expect(hypothesisLabels.map((label) => label.textContent)).toEqual(["A", "B", "C"]);
    expect(screen.getByText("A")).toBeTruthy();
    expect(screen.getByText("B")).toBeTruthy();
    expect(screen.getByText("C")).toBeTruthy();
  });

  it("shows an explicit empty message, rather than an empty list, when neither run judged any hypothesis", () => {
    const first = makeRun({ hypotheses: [] });
    const second = makeRun({ hypotheses: [] });

    render(createElement(CaseSimulationCaseResultCompare, { runs: [first, second] }));

    expect(screen.getByText("Neither run judged a hypothesis.")).toBeTruthy();
    // No row renders any verdict word or placeholder when there is no hypothesis to show one
    // for -- the same fact "dataRows).toHaveLength(0)" would have shown, read here through the
    // absence of any of the row's own possible cell contents rather than a DOM element count.
    expect(screen.queryAllByText(/^(confirmed|refuted|inconclusive|—)$/)).toHaveLength(0);
  });

  it("never shows a reason alongside a hypothesis's verdict, even when the underlying data happens to carry one", () => {
    // CaseResultRunHypothesisVerdict carries no `reason` field at all -- this widens the value's
    // own static type (through a plain function return, never a literal assigned to the typed
    // slot, so no excess-property check would catch it) to prove the renderer itself never reads
    // or displays such a field even when the object passed to it happens to carry one.
    function verdictWithExtraReason(): CaseResultRunHypothesisVerdict & { reason: string } {
      return { hypothesis: "H1", verdict: "inconclusive", reason: "no-data" };
    }

    const first = makeRun({ hypotheses: [verdictWithExtraReason()] });
    const second = makeRun({ hypotheses: [] });

    render(createElement(CaseSimulationCaseResultCompare, { runs: [first, second] }));

    // Only one run judged H1, so its own verdict word is the only one rendered for this
    // hypothesis -- no row-scoping is needed to tell which side it landed on here.
    expect(screen.getByText("inconclusive")).toBeTruthy();
    expect(screen.queryByText(/no.data/i)).toBeNull();
  });
});
