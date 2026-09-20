import { describe, expect, it } from "vitest";
import type { CockpitEvaluation } from "./case-simulation-cockpit-adapters";

type CockpitReason = NonNullable<CockpitEvaluation["reason"]>;

type KnownEvaluationReason =
  | "no-data"
  | "judgment-failure"
  | "deadline-exceeded"
  | "not-grounded";

function withinKnownReasons(reason: CockpitReason): KnownEvaluationReason {
  return reason;
}

describe("CockpitEvaluation's reason (criterion 3)", () => {
  it("admits not-grounded, the fourth cause domain/investigation/evaluation-reason declares", () => {
    const reason: CockpitReason = "not-grounded";
    expect(reason).toBe("not-grounded");
  });

  it("admits no cause beyond the specification's four-value enumeration", () => {
    expect(withinKnownReasons("not-grounded")).toBe("not-grounded");
  });
});
