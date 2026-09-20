import { describe, expect, it } from "vitest";
import {
  REASON_LABEL,
  verdictCell,
  type SimulationEvaluationReason,
  type SimulationHypothesisEvaluation,
} from "./case-simulation-hypotheses-table-row";

type KnownEvaluationReason =
  | "no-data"
  | "judgment-failure"
  | "deadline-exceeded"
  | "not-grounded";

function withinKnownReasons(reason: SimulationEvaluationReason): KnownEvaluationReason {
  return reason;
}

function verdictLabel(evaluation: SimulationHypothesisEvaluation): string {
  const cell = verdictCell(evaluation);
  if (typeof cell === "string") {
    throw new Error(
      "case-simulation-hypotheses-table-row-not-grounded-reason.spec.ts: expected a status cell, got the no-evaluation placeholder",
    );
  }
  return cell.label;
}

describe("SimulationEvaluationReason (criterion 4)", () => {
  it("admits not-grounded, the fourth cause domain/investigation/evaluation-reason declares", () => {
    const reason: SimulationEvaluationReason = "not-grounded";
    expect(reason).toBe("not-grounded");
  });

  it("admits no cause beyond the specification's four-value enumeration", () => {
    expect(withinKnownReasons("not-grounded")).toBe("not-grounded");
  });
});

describe("REASON_LABEL (criterion 5)", () => {
  it("holds a non-empty label for not-grounded, rather than leaving the lookup absent", () => {
    expect(typeof REASON_LABEL["not-grounded"]).toBe("string");
    expect(REASON_LABEL["not-grounded"].length).toBeGreaterThan(0);
  });

  it("is keyed on exactly the four causes domain/investigation/evaluation-reason declares, no more and no fewer", () => {
    expect(Object.keys(REASON_LABEL).sort()).toEqual([
      "deadline-exceeded",
      "judgment-failure",
      "no-data",
      "not-grounded",
    ]);
  });

  it("labels not-grounded with wording distinct from judgment-failure's and no-data's own entries, rather than repeating one of the other three distinct causes", () => {
    expect(REASON_LABEL["not-grounded"]).not.toBe(REASON_LABEL["no-data"]);
    expect(REASON_LABEL["not-grounded"]).not.toBe(REASON_LABEL["judgment-failure"]);
  });
});

describe("verdictCell (criterion 6)", () => {
  it("resolves a label for an inconclusive evaluation whose reason is not-grounded, rather than an absent lookup", () => {
    const label = verdictLabel({
      hypothesis: "H1",
      verdict: "inconclusive",
      reason: "not-grounded",
    });
    expect(label).toBe(`Inconclusive · ${REASON_LABEL["not-grounded"]}`);
  });
});
