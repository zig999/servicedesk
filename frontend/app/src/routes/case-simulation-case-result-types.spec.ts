import { describe, expect, it } from "vitest";
import {
  VERDICT_CELL,
  hypothesisNamesAcross,
  resolveCompareRuns,
  toggleCompareSelection,
  verdictForHypothesis,
  type CaseResultRun,
  type CaseResultRunHypothesisVerdict,
} from "./case-simulation-case-result-types";

// task/simulation-cockpit/case-result-panel's own pure types/helpers module -- proven directly,
// with no rendering, mirroring case-simulation-hypotheses-table-row.spec.ts's own established
// convention for a sibling task's identically-shaped pure-helper file. Rendering-level coverage
// of the same facts, wired through CaseSimulationCaseResultCompare and
// CaseSimulationCaseResultPanel, lives in case-simulation-case-result-compare.spec.ts,
// case-simulation-case-result-panel.spec.ts and case-simulation-case-result-panel-compare.spec.ts.

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

describe("toggleCompareSelection -- this task's own inferred selection mechanism", () => {
  it("adds a run's id to an empty selection", () => {
    expect(toggleCompareSelection([], "a")).toEqual(["a"]);
  });

  it("adds a second run's id alongside the first, rather than replacing it", () => {
    expect(toggleCompareSelection(["a"], "b")).toEqual(["a", "b"]);
  });

  it("removes a run's id already selected, rather than adding a duplicate", () => {
    expect(toggleCompareSelection(["a", "b"], "a")).toEqual(["b"]);
  });

  it("drops the oldest of two already-selected ids and adds the third one picked, instead of growing past two", () => {
    expect(toggleCompareSelection(["a", "b"], "c")).toEqual(["b", "c"]);
  });
});

describe("resolveCompareRuns -- criterion 4's own two-run resolution", () => {
  it("resolves the two selected runs in this history's own chronological (array) order, never the order the two were selected", () => {
    const first = makeRun({ id: "r1" });
    const second = makeRun({ id: "r2" });

    // Deliberately selected in reverse order (r2 before r1) so an implementation that resolved
    // by selection order, rather than by history order, would be caught here.
    expect(resolveCompareRuns([first, second], ["r2", "r1"])).toEqual([first, second]);
  });

  it("returns undefined when only one selected id matches a run currently in history", () => {
    const first = makeRun({ id: "r1" });

    expect(resolveCompareRuns([first], ["r1", "gone"])).toBeUndefined();
  });

  it("returns undefined when no id is selected at all", () => {
    const first = makeRun({ id: "r1" });
    const second = makeRun({ id: "r2" });

    expect(resolveCompareRuns([first, second], [])).toBeUndefined();
  });
});

describe("verdictForHypothesis", () => {
  it("returns the verdict entry for a hypothesis the run judged", () => {
    const run = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "H1", verdict: "refuted" })],
    });

    expect(verdictForHypothesis(run, "H1")).toEqual({ hypothesis: "H1", verdict: "refuted" });
  });

  it("returns undefined for a hypothesis the run never judged", () => {
    const run = makeRun({ hypotheses: [makeVerdict({ hypothesis: "H1" })] });

    expect(verdictForHypothesis(run, "H2")).toBeUndefined();
  });
});

describe("hypothesisNamesAcross -- criterion 4's own 'hypothesis by hypothesis' union", () => {
  it("returns every hypothesis either run judged, without duplicating one both runs judged", () => {
    const first = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "A" }), makeVerdict({ hypothesis: "B" })],
    });
    const second = makeRun({
      hypotheses: [makeVerdict({ hypothesis: "B" }), makeVerdict({ hypothesis: "C" })],
    });

    const names = hypothesisNamesAcross([first, second]);

    expect(new Set(names)).toEqual(new Set(["A", "B", "C"]));
    expect(names).toHaveLength(3);
  });

  it("returns no hypothesis name when neither run judged any", () => {
    const first = makeRun({ hypotheses: [] });
    const second = makeRun({ hypotheses: [] });

    expect(hypothesisNamesAcross([first, second])).toEqual([]);
  });
});

describe("VERDICT_CELL -- the color/label pairing the Compare view renders each verdict through", () => {
  it("maps a confirmed verdict to bg-success, labeled 'confirmed'", () => {
    expect(VERDICT_CELL.confirmed).toEqual({ color: "bg-success", label: "confirmed" });
  });

  it("maps a refuted verdict to bg-destructive, labeled 'refuted'", () => {
    expect(VERDICT_CELL.refuted).toEqual({ color: "bg-destructive", label: "refuted" });
  });

  it("maps an inconclusive verdict to bg-warning, labeled 'inconclusive'", () => {
    expect(VERDICT_CELL.inconclusive).toEqual({ color: "bg-warning", label: "inconclusive" });
  });
});
