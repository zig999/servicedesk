import { describe, expect, it } from "vitest";
import {
  fromHypothesisEvaluation,
  toDetailJudgmentCall,
  type CockpitEvaluation,
} from "./case-simulation-cockpit-adapters";
import type {
  Evaluation as HypothesisEvaluation,
  Evidence as HypothesisEvidenceItem,
} from "../hooks/use-simulate-hypothesis";

// task/simulation-detail-hypothesis-hotfix/wire-hypothesis-evidence-and-prompt (a corrective
// increment): proves the two data-transformation halves of this fix directly against the
// adapters -- fromHypothesisEvaluation now routing a single-hypothesis run's own evidence onto
// its normalized evaluation, and toDetailJudgmentCall now reading a normalized evaluation's own
// usage/elapsed_ms/prompt instead of unconditionally answering { called: false }. The rendered
// half of each criterion (what the Evidence/Prompt tab actually shows) is proven separately in
// case-simulation-detail-panel-hypothesis-evidence-and-prompt.spec.ts and
// use-case-simulation-cockpit-hypothesis-evidence-and-prompt.spec.ts, per this task's own reference
// to how this codebase already splits adapter-level proof from rendered-tab proof.

describe("fromHypothesisEvaluation -- carries the run's own evidence onto the normalized evaluation (criterion 1)", () => {
  it("carries a single-hypothesis run's own collected evidence item through, narrowed to the Detail region's own shape", () => {
    const evaluation: HypothesisEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [{ concept: "billing-history", field: "observation" }],
    };
    const evidence: readonly HypothesisEvidenceItem[] = [
      {
        concept: "billing-history",
        inputs: "{}",
        observation: "the account shows one authorized charge",
        observed_at: "2026-08-01T00:00:00.000Z",
        ttl: 3600,
        origin: "billing-connector",
        result: "ok",
        capability_name: "fetch-billing-account",
        capability_version: "1",
        elapsed_ms: 120,
      },
    ];

    const normalized = fromHypothesisEvaluation(evaluation, evidence);

    expect(normalized.evidence).toEqual([
      {
        concept: "billing-history",
        result: "ok",
        resultDetail: undefined,
        elapsedMs: 120,
        observation: "the account shows one authorized charge",
        capabilityName: "fetch-billing-account",
        capabilityVersion: "1",
        connector: "billing-connector",
        fields: undefined,
        conceptDescription: undefined,
      },
    ]);
  });
});

describe("fromHypothesisEvaluation -- an empty run leaves the normalized evaluation's evidence an empty array (criterion 2)", () => {
  it("normalizes an empty evidence array to an empty array rather than leaving the field undefined", () => {
    const evaluation: HypothesisEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [],
    };

    const normalized = fromHypothesisEvaluation(evaluation, []);

    expect(normalized.evidence).toEqual([]);
  });
});

describe("toDetailJudgmentCall -- a real judgment call reaches the normalized evaluation (criterion 3)", () => {
  it("answers called:true with the evaluation's own usage, elapsedMs and prompt when a hypothesis-sourced evaluation carries all three", () => {
    const evaluation: CockpitEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [],
      usage: { input_tokens: 12, output_tokens: 34 },
      elapsed_ms: 567,
      prompt: "SYSTEM: judge hypothesis-a",
      source: "hypothesis",
      raw: {},
    };

    expect(toDetailJudgmentCall(evaluation)).toEqual({
      called: true,
      usage: { inputTokens: 12, outputTokens: 34 },
      elapsedMs: 567,
      prompt: "SYSTEM: judge hypothesis-a",
    });
  });
});

describe("toDetailJudgmentCall -- the no-data case still answers called:false (criterion 4)", () => {
  it("answers called:false when a hypothesis-sourced evaluation carries none of usage, elapsed_ms and prompt", () => {
    const evaluation: CockpitEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "inconclusive",
      reason: "no-data",
      citations: [],
      source: "hypothesis",
      raw: {},
    };

    expect(toDetailJudgmentCall(evaluation)).toEqual({ called: false });
  });

  it("answers called:false when only some of usage, elapsed_ms and prompt are present, never a partial called:true (edge case: the co-occurrence check is strict about all three)", () => {
    const evaluation: CockpitEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [],
      usage: { input_tokens: 12, output_tokens: 34 },
      // elapsed_ms and prompt both absent
      source: "hypothesis",
      raw: {},
    };

    expect(toDetailJudgmentCall(evaluation)).toEqual({ called: false });
  });
});

describe("toDetailJudgmentCall -- the same fix reaches a case-sourced evaluation too, since this adapter carries no source-specific branch (criterion 5)", () => {
  it("answers called:true for a case-sourced evaluation carrying usage, elapsed_ms and prompt, exactly as it would for a hypothesis-sourced one", () => {
    const evaluation: CockpitEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "refuted",
      citations: [{ concept: "billing-history", field: "observation" }],
      usage: { input_tokens: 200, output_tokens: 90 },
      elapsed_ms: 950,
      prompt: "consolidate the case-level judgment",
      source: "case",
      raw: {},
    };

    expect(toDetailJudgmentCall(evaluation)).toEqual({
      called: true,
      usage: { inputTokens: 200, outputTokens: 90 },
      elapsedMs: 950,
      prompt: "consolidate the case-level judgment",
    });
  });
});
