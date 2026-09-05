import { describe, expect, it } from "vitest";
import {
  costCell,
  hypothesisLabel,
  verdictCell,
  type SimulationHypothesisEvaluation,
  type SimulationManifestRow,
} from "./case-simulation-hypotheses-table-row";

const ROW_WITHOUT_EVALUATION: SimulationManifestRow = {
  position: 1,
  hypothesisName: "H1",
  revision: 1,
  collects: [],
};

function rowWithEvaluation(evaluation: SimulationHypothesisEvaluation): SimulationManifestRow {
  return { position: 1, hypothesisName: "H1", revision: 1, collects: [], evaluation };
}

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
  it("returns the row's own hypothesisName from the manifest, before any evaluation ran", () => {
    expect(hypothesisLabel(ROW_WITHOUT_EVALUATION)).toBe("H1");
  });

  it("still returns the row's own hypothesisName once this session produced an evaluation", () => {
    expect(
      hypothesisLabel(rowWithEvaluation({ hypothesis: "H1", verdict: "confirmed" })),
    ).toBe("H1");
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
