import { describe, expect, it } from "vitest";
import type { SimulateEvaluationReason } from "./use-simulate-case";

type KnownEvaluationReason =
  | "no-data"
  | "judgment-failure"
  | "deadline-exceeded"
  | "not-grounded";

function withinKnownReasons(reason: SimulateEvaluationReason): KnownEvaluationReason {
  return reason;
}

describe("SimulateEvaluationReason (criterion 1)", () => {
  it("admits not-grounded, the fourth cause domain/investigation/evaluation-reason declares", () => {
    const reason: SimulateEvaluationReason = "not-grounded";
    expect(reason).toBe("not-grounded");
  });

  it("admits no cause beyond the specification's four-value enumeration", () => {
    expect(withinKnownReasons("not-grounded")).toBe("not-grounded");
  });
});
