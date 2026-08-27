import { describe, expect, it } from "vitest";
import {
  costCell,
  hypothesisLabel,
  verdictCell,
  type SimulationHypothesisEvaluation,
  type SimulationManifestRow,
} from "./case-simulation-hypotheses-table-row";

// task/simulation-cockpit/hypotheses-table's own criterion 3 ("A row whose last
// run resolved inconclusive always shows its reason alongside the verdict; a
// row that has not run this session shows no verdict") and this task's own
// disclosed inference that a row's own displayed Hypothesis-column text is
// sourced from its evaluation, never its routing-only hypothesisName, and is
// blank when this session produced no evaluation for that row -- proven here
// directly against the two exported pure helpers that decide both facts,
// mirroring error-ui-state.spec.ts's own established convention for unit
// testing an exported pure mapping module without rendering anything.
// Rendering-level coverage of these same facts reaching the actual table
// lives in case-simulation-hypotheses-table.spec.ts; these are the narrower,
// single-reason tests over the two functions themselves.

const ROW_WITHOUT_EVALUATION: SimulationManifestRow = {
  position: 1,
  hypothesisName: "H1",
  collects: [],
};

function rowWithEvaluation(evaluation: SimulationHypothesisEvaluation): SimulationManifestRow {
  return { position: 1, hypothesisName: "H1", collects: [], evaluation };
}

/**
 * Narrows verdictCell's own `{ color, label } | string` return type down to
 * the status-cell branch through a guard (never a bare assertion), for tests
 * below that read `.label` -- every call site here always supplies an
 * `evaluation`, so verdictCell never actually returns the plain placeholder
 * string in these tests, but the guard is what lets TypeScript know it.
 */
function verdictLabel(evaluation: SimulationHypothesisEvaluation): string {
  const cell = verdictCell(evaluation);
  if (typeof cell === "string") {
    throw new Error(
      "case-simulation-hypotheses-table-row.spec.ts: expected a status cell, got the no-evaluation placeholder",
    );
  }
  return cell.label;
}

describe("hypothesisLabel", () => {
  it("returns the evaluation's own hypothesis text when this session produced one", () => {
    expect(
      hypothesisLabel(
        rowWithEvaluation({ hypothesis: "The refund was already issued", verdict: "confirmed" }),
      ),
    ).toBe("The refund was already issued");
  });

  it("returns the blank placeholder, never the row's own routing-only hypothesisName, when no evaluation is present", () => {
    expect(hypothesisLabel(ROW_WITHOUT_EVALUATION)).toBe("—");
  });
});

describe("verdictCell (criterion 3)", () => {
  it("returns the plain placeholder when the row has not run this session", () => {
    expect(verdictCell(undefined)).toBe("—");
  });

  it("combines the verdict label with its reason label when the verdict resolved inconclusive with a reason", () => {
    expect(
      verdictLabel({ hypothesis: "H1", verdict: "inconclusive", reason: "judgment-failure" }),
    ).toBe("Inconclusive · judgment failed");
  });

  it("returns the plain verdict word, with no reason suffix, when the verdict resolved inconclusive but carries no reason", () => {
    expect(verdictLabel({ hypothesis: "H1", verdict: "inconclusive" })).toBe("Inconclusive");
  });

  it("never attaches a reason to a confirmed verdict, even where a reason value happens to be present", () => {
    expect(verdictLabel({ hypothesis: "H1", verdict: "confirmed", reason: "no-data" })).toBe(
      "Confirmed",
    );
  });

  it("never attaches a reason to a refuted verdict, even where a reason value happens to be present", () => {
    expect(
      verdictLabel({ hypothesis: "H1", verdict: "refuted", reason: "deadline-exceeded" }),
    ).toBe("Refuted");
  });
});

// This task's own disclosed inference ("Verdict colors ... for the StatusTable cell"):
// no node this task implements names a color for any of the three verdict values, so the
// mapping is this delivery's own choice, pinned here rather than left free to drift.
describe("verdictCell's own inferred color per verdict", () => {
  it("colors a confirmed verdict bg-success", () => {
    const cell = verdictCell({ hypothesis: "H1", verdict: "confirmed" });
    if (typeof cell === "string") {
      throw new Error("expected a status cell, got the no-evaluation placeholder");
    }
    expect(cell.color).toBe("bg-success");
  });

  it("colors a refuted verdict bg-destructive", () => {
    const cell = verdictCell({ hypothesis: "H1", verdict: "refuted" });
    if (typeof cell === "string") {
      throw new Error("expected a status cell, got the no-evaluation placeholder");
    }
    expect(cell.color).toBe("bg-destructive");
  });

  it("colors an inconclusive verdict bg-warning, whether or not a reason is attached", () => {
    const cell = verdictCell({ hypothesis: "H1", verdict: "inconclusive", reason: "no-data" });
    if (typeof cell === "string") {
      throw new Error("expected a status cell, got the no-evaluation placeholder");
    }
    expect(cell.color).toBe("bg-warning");
  });
});

// This task's own disclosed inference ("Token cost renders as a plain integer sum
// (input_tokens + output_tokens), not a compacted/locale-formatted string").
describe("costCell", () => {
  it("returns the plain placeholder when the row has not run this session", () => {
    expect(costCell(undefined)).toBe("—");
  });

  it("returns the plain placeholder when an evaluation is present but no call actually happened", () => {
    expect(costCell({ hypothesis: "H1", verdict: "confirmed" })).toBe("—");
  });

  it("returns the input-plus-output token sum as a plain integer string, never comma-grouped or compacted", () => {
    expect(
      costCell({
        hypothesis: "H1",
        verdict: "confirmed",
        usage: { input_tokens: 1200, output_tokens: 40 },
      }),
    ).toBe("1240");
  });
});
