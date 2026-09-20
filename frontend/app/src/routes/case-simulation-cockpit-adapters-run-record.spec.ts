import { describe, expect, it } from "vitest";
import { toNewCaseResultRun } from "./case-simulation-cockpit-adapters";
import type { SimulateCaseResult } from "../hooks/use-simulate-case";

function caseResult(overrides: Partial<SimulateCaseResult> = {}): SimulateCaseResult {
  return {
    evidence: [],
    evaluations: [],
    assessment: {
      outcome: "resolved",
      referral: { action: "notify", recipient: "customer" },
      determining_hypothesis: "hypothesis-a",
      text: "The disputed charge was authorized.",
      register: "formal",
      usage: { input_tokens: 200, output_tokens: 90 },
      elapsed_ms: 950,
      prompt: "consolidate the assessment",
    },
    cost: { calls: 1, input_tokens: 200, output_tokens: 90 },
    durations: { collection: 1200, judgment: 800, writing: 300, total: 2300 },
    ...overrides,
  };
}

describe("toNewCaseResultRun -- shaping a completed full-case run into the widened run-entry shape (this task's criteria 1 and 2)", () => {
  it("carries the run's own outcome, referral, determining hypothesis, text, register and per-hypothesis verdicts, plus its own durations, cost, consolidation call and whole raw payload, all read from the response it is given", () => {
    const result = caseResult({
      evaluations: [
        { hypothesis: "hypothesis-a", verdict: "confirmed", citations: [] },
        { hypothesis: "hypothesis-b", verdict: "inconclusive", citations: [], reason: "no-data" },
      ],
    });

    const run = toNewCaseResultRun(result);

    expect(run).toEqual({
      hypotheses: [
        { hypothesis: "hypothesis-a", verdict: "confirmed" },
        { hypothesis: "hypothesis-b", verdict: "inconclusive" },
      ],
      durations: { collectionMs: 1200, judgmentMs: 800, writingMs: 300, totalMs: 2300 },
      cost: { calls: 1, inputTokens: 200, outputTokens: 90 },
      consolidationCall: {
        called: true,
        outcome: "resolved",
        referral: { action: "notify", recipient: "customer" },
        determiningHypothesis: "hypothesis-a",
        text: "The disputed charge was authorized.",
        register: "formal",
        usage: { inputTokens: 200, outputTokens: 90 },
        elapsedMs: 950,
        prompt: "consolidate the assessment",
      },
      rawResponse: result,
    });
    expect(run.rawResponse).toBe(result);
  });

  it("carries the consolidation call's own per-call usage through, distinct from the run's aggregate cost across every call", () => {
    const result = caseResult({
      cost: { calls: 3, input_tokens: 900, output_tokens: 400 },
      assessment: {
        ...caseResult().assessment,
        usage: { input_tokens: 200, output_tokens: 90 },
      },
    });

    const run = toNewCaseResultRun(result);

    expect(run.consolidationCall).toEqual({
      called: true,
      outcome: "resolved",
      referral: { action: "notify", recipient: "customer" },
      determiningHypothesis: "hypothesis-a",
      text: "The disputed charge was authorized.",
      register: "formal",
      usage: { inputTokens: 200, outputTokens: 90 },
      elapsedMs: 950,
      prompt: "consolidate the assessment",
    });
    expect(run.cost).toEqual({ calls: 3, inputTokens: 900, outputTokens: 400 });
  });

  it.each(["formal", "plain"] as const)(
    "carries a %s register through to the run entry unchanged, one of the only two registers a case's curator may ask for",
    (register) => {
      const result = caseResult({ assessment: { ...caseResult().assessment, register } });

      const run = toNewCaseResultRun(result);
      if (!run.consolidationCall.called) {
        throw new Error(
          "case-simulation-cockpit-adapters-run-record.spec.ts: expected a called consolidation call",
        );
      }
      expect(run.consolidationCall.register).toBe(register);
    },
  );
});
