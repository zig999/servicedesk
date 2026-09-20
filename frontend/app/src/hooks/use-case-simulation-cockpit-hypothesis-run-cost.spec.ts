import { describe, expect, it } from "vitest";
import { simulateHypothesisResult } from "./use-case-simulation-cockpit.test-support";

describe("simulateHypothesisResult (use-case-simulation-cockpit.test-support.ts) returns a SimulateHypothesisResult carrying a cost (criterion 7)", () => {
  it("returns a cost carrying exactly calls, input_tokens and output_tokens, alongside evidence, evaluation and durations", () => {
    const built = simulateHypothesisResult();

    expect(built.cost).toBeDefined();
    expect(Object.keys(built.cost).sort()).toEqual(["calls", "input_tokens", "output_tokens"]);
    expect(Object.keys(built).sort()).toEqual(["cost", "durations", "evaluation", "evidence"]);
  });
});
