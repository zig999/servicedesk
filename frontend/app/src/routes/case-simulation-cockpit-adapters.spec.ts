import { describe, expect, it } from "vitest";
import {
  fromCaseEvaluation,
  fromHypothesisEvaluation,
  toDetailEvaluation,
  toDetailEvidence,
  toDetailJudgmentCall,
  toDurations,
  toHypothesisRevisionSummary,
  toManifestRows,
  toNewCaseResultRun,
  toRowEvaluation,
  toRunSummary,
  type CockpitEvaluation,
} from "./case-simulation-cockpit-adapters";
import type { SimulateCaseResult, SimulateEvidenceItem } from "../hooks/use-simulate-case";
import type { Evaluation as HypothesisEvaluation } from "../hooks/use-simulate-hypothesis";
import type { CaseVersionManifestEntry } from "../services/case-version-record";

const MANIFEST: readonly CaseVersionManifestEntry[] = [
  {
    position: 1,
    hypothesis_revision: {
      hypothesis: { name: "hypothesis-a" },
      revision: 1,
      criterion: "The customer disputes a charge the account never authorized.",
      collects: ["billing-history"],
    },
  },
  {
    position: 2,
    hypothesis_revision: {
      hypothesis: { name: "hypothesis-b" },
      revision: 2,
      criterion: "The account shows a duplicate charge.",
      collects: [],
    },
  },
];

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

describe("fromCaseEvaluation -- normalizing a full-case run's own evaluation", () => {
  it("carries citations and no reason through for a decided (confirmed/refuted) evaluation, tagged with its own case source", () => {
    const normalized = fromCaseEvaluation({
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [{ concept: "billing-history", field: "observation" }],
      usage: { input_tokens: 100, output_tokens: 40 },
      elapsed_ms: 800,
      prompt: "judge hypothesis-a",
    });

    expect(normalized.source).toBe("case");
    expect(normalized.verdict).toBe("confirmed");
    expect(normalized.citations).toEqual([{ concept: "billing-history", field: "observation" }]);
    expect(normalized.reason).toBeUndefined();
  });

  it("carries the reason through for an inconclusive evaluation, and keeps the raw response reachable verbatim", () => {
    const source = {
      hypothesis: "hypothesis-b",
      verdict: "inconclusive" as const,
      citations: [],
      reason: "judgment-failure" as const,
    };

    const normalized = fromCaseEvaluation(source);

    expect(normalized.reason).toBe("judgment-failure");
    expect(normalized.raw).toBe(source);
  });
});

describe("fromHypothesisEvaluation -- normalizing a single-hypothesis run's own evaluation", () => {
  it("tags the normalized evaluation with the hypothesis source, distinguishing it from a case-level one", () => {
    const evaluation: HypothesisEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [{ concept: "billing-history", field: "observation" }],
    };

    const normalized = fromHypothesisEvaluation(evaluation, []);

    expect(normalized.source).toBe("hypothesis");
    expect(normalized.citations).toEqual([{ concept: "billing-history", field: "observation" }]);
  });

  it("normalizes an inconclusive hypothesis-level evaluation to an empty citations array, discarding whatever the response itself carried for that branch", () => {
    const evaluation: HypothesisEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "inconclusive",
      reason: "no-data",
      citations: [{ concept: "billing-history", field: "observation" }],
    };

    const normalized = fromHypothesisEvaluation(evaluation, []);

    expect(normalized.citations).toEqual([]);
    expect(normalized.reason).toBe("no-data");
  });
});

describe("toRowEvaluation -- narrowing a normalized evaluation to what a Hypotheses-table row reads", () => {
  it("keeps only the hypothesis, verdict, reason and usage a row reads, dropping citations, elapsed_ms and prompt", () => {
    const evaluation: CockpitEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [{ concept: "billing-history", field: "observation" }],
      usage: { input_tokens: 100, output_tokens: 40 },
      elapsed_ms: 800,
      prompt: "judge hypothesis-a",
      source: "case",
      raw: {},
    };

    expect(toRowEvaluation(evaluation)).toEqual({
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      reason: undefined,
      usage: { input_tokens: 100, output_tokens: 40 },
    });
  });
});

describe("toManifestRows -- one row per manifest entry, carrying whichever evaluation this session currently holds for it", () => {
  it("returns an empty list when the version carries no manifest", () => {
    expect(toManifestRows(undefined, {})).toEqual([]);
  });

  it("attaches no evaluation to a manifest entry this session has not produced one for yet", () => {
    const rows = toManifestRows(MANIFEST, {});

    expect(rows).toHaveLength(2);
    expect(rows.find((row) => row.hypothesisName === "hypothesis-b")?.evaluation).toBeUndefined();
  });

  it("attaches the currently-held evaluation to the manifest entry it names, by hypothesis name", () => {
    const evaluations: Readonly<Record<string, CockpitEvaluation>> = {
      "hypothesis-a": {
        hypothesis: "hypothesis-a",
        verdict: "refuted",
        citations: [],
        source: "hypothesis",
        raw: {},
      },
    };

    const rows = toManifestRows(MANIFEST, evaluations);

    const rowA = rows.find((row) => row.hypothesisName === "hypothesis-a");
    expect(rowA?.evaluation?.verdict).toBe("refuted");
    expect(rowA?.collects).toEqual(["billing-history"]);
  });
});

describe("toRunSummary/toDurations -- the last full-case run's own summary and stage timings", () => {
  it("reads outcome, referral and determining_hypothesis straight off the run's own assessment", () => {
    expect(toRunSummary(caseResult())).toEqual({
      outcome: "resolved",
      referral: { action: "notify", recipient: "customer" },
      determiningHypothesis: "hypothesis-a",
    });
  });

  it("reads the run's own measured stage durations unchanged, including a writing figure when one exists", () => {
    expect(toDurations(caseResult())).toEqual({
      collectionMs: 1200,
      judgmentMs: 800,
      writingMs: 300,
      totalMs: 2300,
    });
  });
});

describe("toNewCaseResultRun -- shaping a completed full-case run into the Case result region's own new-run shape (criterion 5)", () => {
  it("carries the run's own outcome, referral, determining hypothesis, customer-facing text and register, plus one verdict entry per judged hypothesis", () => {
    const result = caseResult({
      evaluations: [
        { hypothesis: "hypothesis-a", verdict: "confirmed", citations: [] },
        { hypothesis: "hypothesis-b", verdict: "inconclusive", citations: [], reason: "no-data" },
      ],
    });

    expect(toNewCaseResultRun(result)).toEqual({
      outcome: "resolved",
      referral: { action: "notify", recipient: "customer" },
      determiningHypothesis: "hypothesis-a",
      text: "The disputed charge was authorized.",
      register: "formal",
      hypotheses: [
        { hypothesis: "hypothesis-a", verdict: "confirmed" },
        { hypothesis: "hypothesis-b", verdict: "inconclusive" },
      ],
    });
  });
});

describe("toDetailJudgmentCall -- always { called: false } (this task's own recorded inference)", () => {
  it("answers { called: false } regardless of anything about the evaluation, since neither dispatch hook ever returns a model or a prompt version", () => {
    expect(
      toDetailJudgmentCall({
        hypothesis: "hypothesis-a",
        verdict: "confirmed",
        citations: [],
        source: "case",
        raw: {},
      }),
    ).toEqual({ called: false });
  });
});

describe("toDetailEvaluation -- narrowing a normalized evaluation to what the Detail region reads", () => {
  it("carries the judgmentCall this task's own inference always supplies, even for a decided verdict whose evaluation carries usage/elapsed_ms/prompt implying a call happened", () => {
    const evaluation: CockpitEvaluation = {
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [{ concept: "billing-history", field: "observation" }],
      usage: { input_tokens: 100, output_tokens: 40 },
      elapsed_ms: 800,
      prompt: "judge hypothesis-a",
      source: "case",
      raw: {},
    };

    expect(toDetailEvaluation(evaluation)).toEqual({
      hypothesis: "hypothesis-a",
      verdict: "confirmed",
      citations: [{ concept: "billing-history", field: "observation" }],
      judgmentCall: {
        called: true,
        usage: { inputTokens: 100, outputTokens: 40 },
        elapsedMs: 800,
        prompt: "judge hypothesis-a",
      },
    });
  });
});

describe("toDetailEvidence -- shaping a full-case run's own evidence for the Detail region's Evidence tab", () => {
  it("carries every field through, renaming the run's own `origin` to the Detail region's own `connector`", () => {
    const evidence: readonly SimulateEvidenceItem[] = [
      {
        concept: "billing-history",
        inputs: "{}",
        observation: "the account shows one authorized charge",
        observed_at: "2026-08-01T00:00:00.000Z",
        ttl: 3600,
        origin: "billing-connector",
        result: "ok",
        result_detail: "cached",
        elapsed_ms: 120,
        capability_name: "fetch-billing-account",
        capability_version: "1",
      },
    ];

    expect(toDetailEvidence(evidence)).toEqual([
      {
        concept: "billing-history",
        result: "ok",
        resultDetail: "cached",
        elapsedMs: 120,
        observation: "the account shows one authorized charge",
        capabilityName: "fetch-billing-account",
        capabilityVersion: "1",
        connector: "billing-connector",
      },
    ]);
  });
});

describe("toHypothesisRevisionSummary -- the selected hypothesis's own criterion text and collects", () => {
  it("finds the named hypothesis's own revision summary in the manifest", () => {
    expect(toHypothesisRevisionSummary(MANIFEST, "hypothesis-b")).toEqual({
      criterion: "The account shows a duplicate charge.",
      collects: [],
    });
  });

  it("returns undefined for a hypothesis name the manifest does not carry", () => {
    expect(toHypothesisRevisionSummary(MANIFEST, "no-such-hypothesis")).toBeUndefined();
  });

  it("returns undefined when the version carries no manifest at all", () => {
    expect(toHypothesisRevisionSummary(undefined, "hypothesis-a")).toBeUndefined();
  });
});
