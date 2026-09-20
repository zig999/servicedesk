import { describe, expect, it } from "vitest";
import type { EvaluationReason } from "./use-simulate-hypothesis";

type KnownEvaluationReason =
  | "no-data"
  | "judgment-failure"
  | "deadline-exceeded"
  | "not-grounded";

function withinKnownReasons(reason: EvaluationReason): KnownEvaluationReason {
  return reason;
}

describe("EvaluationReason (criterion 2)", () => {
  it("admits not-grounded, the fourth cause domain/investigation/evaluation-reason declares", () => {
    const reason: EvaluationReason = "not-grounded";
    expect(reason).toBe("not-grounded");
  });

  it("admits no cause beyond the specification's four-value enumeration", () => {
    expect(withinKnownReasons("not-grounded")).toBe("not-grounded");
  });
});
