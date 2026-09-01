import { describe, expect, it } from "vitest";
import {
  fromCaseEvaluation,
  fromHypothesisEvaluation,
  toDetailEvaluation,
  toRowEvaluation,
  type CockpitEvaluation,
} from "./case-simulation-cockpit-adapters";
import type { Evaluation as HypothesisEvaluation } from "../hooks/use-simulate-hypothesis";

describe("fromCaseEvaluation -- always `stale: false` on a freshly-normalized evaluation", () => {
  it("always sets `stale: false` on a freshly-normalized decided evaluation", () => {
    const normalized = fromCaseEvaluation({
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [],
    });

    expect(normalized.stale).toBe(false);
  });

  it("always sets `stale: false` on a freshly-normalized inconclusive evaluation", () => {
    const normalized = fromCaseEvaluation({
      hypothesis: "hypothesis-b",
      verdict: "inconclusive",
      citations: [],
      reason: "no-data",
    });

    expect(normalized.stale).toBe(false);
  });
});

describe("fromHypothesisEvaluation -- always `stale: false` on a freshly-normalized evaluation", () => {
  it("always sets `stale: false` on a freshly-normalized decided evaluation", () => {
    const evaluation: HypothesisEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [],
    };

    expect(fromHypothesisEvaluation(evaluation, []).stale).toBe(false);
  });

  it("always sets `stale: false` on a freshly-normalized inconclusive evaluation", () => {
    const evaluation: HypothesisEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "inconclusive",
      reason: "no-data",
      citations: [],
    };

    expect(fromHypothesisEvaluation(evaluation, []).stale).toBe(false);
  });
});

describe("toRowEvaluation -- carries `stale` through unchanged, never coercing an absent value", () => {
  it("carries `stale: true` through unchanged when the source evaluation is marked stale", () => {
    const evaluation: CockpitEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [],
      source: "case",
      raw: {},
      stale: true,
    };

    expect(toRowEvaluation(evaluation).stale).toBe(true);
  });

  it("carries `stale: false` through unchanged when the source evaluation is fresh", () => {
    const evaluation: CockpitEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [],
      source: "case",
      raw: {},
      stale: false,
    };

    expect(toRowEvaluation(evaluation).stale).toBe(false);
  });

  it("leaves `stale` absent, rather than coerced to false, when the source evaluation carries none", () => {
    const evaluation: CockpitEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [],
      source: "case",
      raw: {},
    };

    expect(toRowEvaluation(evaluation).stale).toBeUndefined();
  });
});

describe("toDetailEvaluation -- carries `stale` through unchanged, never coercing an absent value", () => {
  it("carries `stale: true` through unchanged when the source evaluation is marked stale", () => {
    const evaluation: CockpitEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [],
      source: "case",
      raw: {},
      stale: true,
    };

    expect(toDetailEvaluation(evaluation).stale).toBe(true);
  });

  it("carries `stale: false` through unchanged when the source evaluation is fresh", () => {
    const evaluation: CockpitEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [],
      source: "case",
      raw: {},
      stale: false,
    };

    expect(toDetailEvaluation(evaluation).stale).toBe(false);
  });

  it("leaves `stale` absent, rather than coerced to false, when the source evaluation carries none", () => {
    const evaluation: CockpitEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [],
      source: "case",
      raw: {},
    };

    expect(toDetailEvaluation(evaluation).stale).toBeUndefined();
  });
});
