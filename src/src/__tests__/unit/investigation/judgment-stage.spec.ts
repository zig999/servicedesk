import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Case, Hypothesis, ManifestEntry } from '../../../case/case.js';
import type { Citation } from '../../../investigation/citation.js';
import type { Evidence } from '../../../investigation/evidence.js';
import type { FieldSemantics } from '../../../investigation/field-semantics.js';
import type { CaseContext, EvaluationOutcome, EvidenceItem, IHypothesisEvaluator } from '../../../investigation/hypothesis-evaluator.port.js';
import { judgeHypotheses } from '../../../investigation/judgment-stage.js';
import type { Usage } from '../../../investigation/usage.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function aHypothesis(name: string, collects: readonly string[]): Hypothesis {
  return {
    name,
    criterion: `${name} criterion`,
    collects,
    resolution: { outcome: 'an-outcome', referral: { action: 'refer', recipient: 'a-queue' } },
  };
}

function manifestEntryOf(hypothesis: Hypothesis, position: number): ManifestEntry {
  return {
    position,
    hypothesis_revision: {
      hypothesis: { name: hypothesis.name },
      revision: 1,
      criterion: hypothesis.criterion,
      collects: hypothesis.collects,
      resolution: hypothesis.resolution,
    },
  };
}

function aCase(hypotheses: ReadonlyArray<{ readonly name: string; readonly collects: readonly string[] }>): Case {
  const declared = hypotheses.map((h) => aHypothesis(h.name, h.collects));
  return {
    slug: 'a-case',
    title: 'A case',
    when_to_use: 'when testing judgment',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'ont',
    fallback: { outcome: 'no-data', referral: { action: 'refer', recipient: 'a-queue' } },
    state: 'released',
    manifest: declared.map((hypothesis, index) => manifestEntryOf(hypothesis, index + 1)),
    hypotheses: declared,
  };
}

function aCaseWithMismatchedHypotheses(
  requiredHypotheses: readonly Hypothesis[],
  actualHypotheses: readonly Hypothesis[],
): Case {
  return {
    slug: 'a-mismatched-case',
    title: 'A mismatched case',
    when_to_use: 'when testing judgment',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: 'ont',
    fallback: { outcome: 'no-data', referral: { action: 'refer', recipient: 'a-queue' } },
    state: 'released',
    manifest: requiredHypotheses.map((hypothesis, index) => manifestEntryOf(hypothesis, index + 1)),
    hypotheses: actualHypotheses,
  };
}

function anEvidence(overrides: Partial<Evidence> & { readonly concept: string }): Evidence {
  return {
    inputs: 'an-input',
    observation: 'an-observation',
    observed_at: '2024-01-01T00:00:00.000Z',
    ttl: 60,
    origin: 'a-connector',
    result: 'ok',
    capability_name: `capability-for-${overrides.concept}`,
    capability_version: '1.0.0',
    elapsed_ms: 12,
    fields: [],
    concept_description: '',
    ...overrides,
  };
}

function fieldsDeclaring(...names: readonly string[]): readonly FieldSemantics[] {
  return names.map((name) => ({ name }));
}

type RecordedCall = {
  readonly criterion: string;
  readonly evidence: readonly EvidenceItem[];
  readonly caseContext: CaseContext;
};

type ScriptedAnswer = () => Promise<EvaluationOutcome>;

class ScriptedHypothesisEvaluator implements IHypothesisEvaluator {
  public readonly calls: RecordedCall[] = [];
  private readonly queues = new Map<string, ScriptedAnswer[]>();

  public script(criterion: string, ...answers: readonly ScriptedAnswer[]): void {
    this.queues.set(criterion, [...answers]);
  }

  public async evaluate(criterion: string, evidence: readonly EvidenceItem[], caseContext: CaseContext): Promise<EvaluationOutcome> {
    this.calls.push({ criterion, evidence, caseContext });
    const queue = this.queues.get(criterion);
    const answer = queue?.shift();
    if (answer === undefined) {
      throw new Error(`ScriptedHypothesisEvaluator has no answer scripted for criterion ${JSON.stringify(criterion)}`);
    }
    return answer();
  }
}

function immediately(outcome: EvaluationOutcome): ScriptedAnswer {
  return () => Promise.resolve(outcome);
}

function resolvesAfter(delayMs: number, outcome: EvaluationOutcome): ScriptedAnswer {
  return () => new Promise((resolve) => setTimeout(() => resolve(outcome), delayMs));
}

function neverSettles(): Promise<EvaluationOutcome> {
  return new Promise(() => {});
}

it("answers exactly one evaluation per required hypothesis, in the case's declared order, none omitted or duplicated", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('hyp-decided criterion', immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] }));
  evaluator.script('hyp-inconclusive criterion', immediately({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }));
  const theCase = aCase([
    { name: 'hyp-no-data', collects: ['concept-x'] },
    { name: 'hyp-decided', collects: ['concept-a'] },
    { name: 'hyp-inconclusive', collects: ['concept-c'] },
  ]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['hyp-no-data', [anEvidence({ concept: 'concept-x', result: 'denied' })]],
    ['hyp-decided', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a') })]],
    ['hyp-inconclusive', [anEvidence({ concept: 'concept-c' })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 2, now: 0, deadline: 10_000,
  });

  expect(result.map((evaluation) => evaluation.hypothesis)).toEqual(['hyp-no-data', 'hyp-decided', 'hyp-inconclusive']);
  expect(result.map((evaluation) => evaluation.verdict)).toEqual(['inconclusive', 'confirmed', 'inconclusive']);
});

it("calls evaluate() with only the judged hypothesis's own criterion and its own matched evidence, never another hypothesis's", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', immediately({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }));
  evaluator.script('h2 criterion', immediately({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }));
  const theCase = aCase([
    { name: 'h1', collects: ['concept-a'] },
    { name: 'h2', collects: ['concept-b'] },
  ]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', observation: 'observed-a' })]],
    ['h2', [anEvidence({ concept: 'concept-b', observation: 'observed-b' })]],
  ]);

  await judgeHypotheses({ case: theCase, evidenceByHypothesis, evaluator, poolSize: 2, now: 0, deadline: 10_000 });

  expect(evaluator.calls).toHaveLength(2);
  const forH1 = evaluator.calls.find((call) => call.criterion === 'h1 criterion');
  const forH2 = evaluator.calls.find((call) => call.criterion === 'h2 criterion');
  expect(forH1?.evidence).toEqual([{ concept: 'concept-a', result: 'ok', observation: 'observed-a', fields: [], concept_description: '' }]);
  expect(forH2?.evidence).toEqual([{ concept: 'concept-b', result: 'ok', observation: 'observed-b', fields: [], concept_description: '' }]);
});

it("passes each evidence item's own snapshotted field semantics and concept description to evaluate() — read straight from the evidence it was given, never resolved live — before the first call is ever made, never only after a decided answer", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', immediately({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }));
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a', 'field-b'), concept_description: 'a concept description' })]],
  ]);

  await judgeHypotheses({ case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000 });

  expect(evaluator.calls[0]?.evidence).toEqual([
    {
      concept: 'concept-a',
      result: 'ok',
      observation: 'an-observation',
      fields: fieldsDeclaring('field-a', 'field-b'),
      concept_description: 'a concept description',
    },
  ]);
});

it("passes the same pinned case's own title and when_to_use, grouped as CaseContext, to every hypothesis judged in one judgeHypotheses() call — never a different context per hypothesis", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', immediately({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }));
  evaluator.script('h2 criterion', immediately({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }));
  const theCase = aCase([
    { name: 'h1', collects: ['concept-a'] },
    { name: 'h2', collects: ['concept-b'] },
  ]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a' })]],
    ['h2', [anEvidence({ concept: 'concept-b' })]],
  ]);

  await judgeHypotheses({ case: theCase, evidenceByHypothesis, evaluator, poolSize: 2, now: 0, deadline: 10_000 });

  expect(evaluator.calls).toHaveLength(2);
  const expectedContext: CaseContext = { title: theCase.title, whenToUse: theCase.when_to_use };
  expect(evaluator.calls[0].caseContext).toEqual(expectedContext);
  expect(evaluator.calls[1].caseContext).toEqual(expectedContext);
});

it('never starts more evaluate() calls at once than the configured pool size, granting a queued hypothesis its call only once an earlier one frees a slot', async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const inconclusive: EvaluationOutcome = { verdict: 'inconclusive', reason: 'judgment-failure', citations: [] };
  evaluator.script('h1 criterion', resolvesAfter(10, inconclusive));
  evaluator.script('h2 criterion', resolvesAfter(1_000, inconclusive));
  evaluator.script('h3 criterion', resolvesAfter(10, inconclusive));
  const theCase = aCase([
    { name: 'h1', collects: ['concept-a'] },
    { name: 'h2', collects: ['concept-b'] },
    { name: 'h3', collects: ['concept-c'] },
  ]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a' })]],
    ['h2', [anEvidence({ concept: 'concept-b' })]],
    ['h3', [anEvidence({ concept: 'concept-c' })]],
  ]);

  const resultPromise = judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 2, now: 0, deadline: 100_000,
  });

  await vi.advanceTimersByTimeAsync(1);
  expect(evaluator.calls.map((call) => call.criterion).sort()).toEqual(['h1 criterion', 'h2 criterion']);

  await vi.advanceTimersByTimeAsync(9);
  expect(evaluator.calls.map((call) => call.criterion).sort()).toEqual(['h1 criterion', 'h2 criterion', 'h3 criterion']);

  await vi.advanceTimersByTimeAsync(1_000);
  const result = await resultPromise;
  expect(result.map((evaluation) => evaluation.hypothesis)).toEqual(['h1', 'h2', 'h3']);
});

it("retries once on a decided answer whose citations fail structural validation, and returns the retry's valid decided answer", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script(
    'h1 criterion',
    immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-foreign', field: 'field-a' }] }),
    immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] }),
  );
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a') })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] }]);
  expect(evaluator.calls).toHaveLength(2);
});

it("passes the pinned case's own title and when_to_use, unchanged, to both the first evaluate() call and the retry it forces", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script(
    'h1 criterion',
    immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-foreign', field: 'field-a' }] }), // invalid citation forces a retry
    immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] }),
  );
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a') })]],
  ]);

  await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(evaluator.calls).toHaveLength(2);
  const expectedContext: CaseContext = { title: theCase.title, whenToUse: theCase.when_to_use };
  expect(evaluator.calls[0].caseContext).toEqual(expectedContext);
  expect(evaluator.calls[1].caseContext).toEqual(expectedContext);
});

it("falls back to inconclusive judgment-failure when the retry's citations are also structurally invalid", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const invalidCitation: readonly [Citation, ...Citation[]] = [{ concept: 'concept-foreign', field: 'field-a' }];
  evaluator.script(
    'h1 criterion',
    immediately({ verdict: 'confirmed', citations: invalidCitation }),
    immediately({ verdict: 'refuted', citations: invalidCitation }),
  );
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a') })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }]);
  expect(evaluator.calls).toHaveLength(2);
});

it("records deadline-exceeded, never judgment-failure, for a call that has not returned by the stage's deadline", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', neverSettles);
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([['h1', [anEvidence({ concept: 'concept-a' })]]]);

  const resultPromise = judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 5,
  });
  await vi.advanceTimersByTimeAsync(5);
  const result = await resultPromise;

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'inconclusive', reason: 'deadline-exceeded', citations: [] }]);
  expect(evaluator.calls).toHaveLength(1);
});

it('records deadline-exceeded for a hypothesis denied a pool slot before the deadline, and never calls evaluate() for it at all', async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', neverSettles);
  const theCase = aCase([
    { name: 'h1', collects: ['concept-a'] },
    { name: 'h2', collects: ['concept-b'] },
  ]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a' })]],
    ['h2', [anEvidence({ concept: 'concept-b' })]],
  ]);

  const resultPromise = judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 5,
  });
  await vi.advanceTimersByTimeAsync(5);
  const result = await resultPromise;

  expect(result).toEqual([
    { hypothesis: 'h1', verdict: 'inconclusive', reason: 'deadline-exceeded', citations: [] },
    { hypothesis: 'h2', verdict: 'inconclusive', reason: 'deadline-exceeded', citations: [] },
  ]);
  expect(evaluator.calls.map((call) => call.criterion)).toEqual(['h1 criterion']);
});

it('records inconclusive no-data citing every non-ok evidence item, and never enters the pool for that hypothesis', async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const theCase = aCase([{ name: 'h1', collects: ['concept-ok', 'concept-denied', 'concept-timeout'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    [
      'h1',
      [
        anEvidence({ concept: 'concept-ok', result: 'ok' }),
        anEvidence({ concept: 'concept-denied', result: 'denied' }),
        anEvidence({ concept: 'concept-timeout', result: 'timeout' }),
      ],
    ],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([
    {
      hypothesis: 'h1',
      verdict: 'inconclusive',
      reason: 'no-data',
      citations: [{ concept: 'concept-denied' }, { concept: 'concept-timeout' }],
    },
  ]);
  expect(evaluator.calls).toHaveLength(0);
});

it("omits the field key entirely from each citation a no-data evaluation constructs for its non-ok evidence — never field: '' — so 'field' in citation is false for every one of them", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const theCase = aCase([{ name: 'h1', collects: ['concept-denied', 'concept-timeout'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    [
      'h1',
      [
        anEvidence({ concept: 'concept-denied', result: 'denied' }),
        anEvidence({ concept: 'concept-timeout', result: 'timeout' }),
      ],
    ],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  const citations = result[0]!.citations;
  expect(citations).toHaveLength(2);
  for (const citation of citations) {
    expect('field' in citation).toBe(false);
  }
  expect(citations).toEqual([{ concept: 'concept-denied' }, { concept: 'concept-timeout' }]);
});

it("leaves a confirmed evaluation's citation carrying both concept and field exactly as the evaluator answered it — 'field' in citation stays true, unaffected by the no-data citation shape now omitting it", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] }));
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a') })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  const citation = result[0]!.citations[0]!;
  expect('field' in citation).toBe(true);
  expect(citation).toEqual({ concept: 'concept-a', field: 'field-a' });
});

it("leaves a refuted evaluation's citation carrying both concept and field exactly as the evaluator answered it — 'field' in citation stays true, unaffected by the no-data citation shape now omitting it", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', immediately({ verdict: 'refuted', citations: [{ concept: 'concept-a', field: 'field-a' }] }));
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a') })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  const citation = result[0]!.citations[0]!;
  expect('field' in citation).toBe(true);
  expect(citation).toEqual({ concept: 'concept-a', field: 'field-a' });
});

it('passes through a confirmed answer with at least one citation unchanged', async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] }));
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a') })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] }]);
});

it('never returns confirmed or refuted for a decided answer carrying zero citations, even across a retry that also carries none', async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const zeroCitationConfirmed = { verdict: 'confirmed', citations: [] } as unknown as EvaluationOutcome;
  evaluator.script('h1 criterion', immediately(zeroCitationConfirmed), immediately(zeroCitationConfirmed));
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([['h1', [anEvidence({ concept: 'concept-a' })]]]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }]);
  expect(evaluator.calls).toHaveLength(2);
});

function retrySameSlotFixture(): {
  readonly evaluator: ScriptedHypothesisEvaluator;
  readonly theCase: Case;
  readonly evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>;
} {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script(
    'h1 criterion',
    resolvesAfter(1, { verdict: 'confirmed', citations: [{ concept: 'concept-b', field: 'field-a' }] }), // foreign concept: invalid
    resolvesAfter(50, { verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] }), // valid retry
  );
  evaluator.script('h2 criterion', resolvesAfter(5, { verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }));
  const theCase = aCase([
    { name: 'h1', collects: ['concept-a'] },
    { name: 'h2', collects: ['concept-b'] },
  ]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a') })]],
    ['h2', [anEvidence({ concept: 'concept-b', fields: fieldsDeclaring('field-b') })]],
  ]);
  return { evaluator, theCase, evidenceByHypothesis };
}

it("keeps a hypothesis's retry under the same pool slot it already holds, never granting a queued sibling a slot while the retry is in flight", async () => {
  const { evaluator, theCase, evidenceByHypothesis } = retrySameSlotFixture();

  const resultPromise = judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 100_000,
  });

  await vi.advanceTimersByTimeAsync(2);
  expect(evaluator.calls.map((call) => call.criterion)).toEqual(['h1 criterion', 'h1 criterion']);

  await vi.advanceTimersByTimeAsync(60);
  expect(evaluator.calls.map((call) => call.criterion)).toEqual(['h1 criterion', 'h1 criterion', 'h2 criterion']);

  await vi.advanceTimersByTimeAsync(10);
  const result = await resultPromise;
  expect(result[0]).toEqual({ hypothesis: 'h1', verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] });
  expect(result[1]).toEqual({ hypothesis: 'h2', verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
});

it('retries an inconclusive first answer whose citation fails the collects-containment check, and falls back to judgment-failure when the retry citation fails it too', async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const citationToAnUndeclaredField = {
    verdict: 'inconclusive' as const,
    reason: 'judgment-failure' as const,
    citations: [{ concept: 'concept-a', field: 'a-field' }],
  };
  evaluator.script('h1 criterion', immediately(citationToAnUndeclaredField), immediately(citationToAnUndeclaredField));
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([['h1', [anEvidence({ concept: 'concept-a' })]]]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }]);
  expect(evaluator.calls).toHaveLength(2);
});

async function moduleSource(): Promise<string> {
  return readFile(fileURLToPath(new URL('../../../investigation/judgment-stage.ts', import.meta.url)), 'utf8');
}

it("falls back to inconclusive judgment-failure when the retry's own inconclusive answer carries a citation that fails the collects-containment check too", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script(
    'h1 criterion',
    immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-foreign', field: 'a-field' }] }), // invalid: foreign concept
    immediately({ verdict: 'inconclusive', reason: 'no-data', citations: [{ concept: 'concept-a', field: 'a-field' }] }), // invalid: field never declared
  );
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([['h1', [anEvidence({ concept: 'concept-a' })]]]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }]);
  expect(evaluator.calls).toHaveLength(2);
});

it("checks an inconclusive first answer's own citation against the hypothesis-revision's own collects, retrying when the cited concept falls outside them — the check is never skipped merely because the verdict is not confirmed or refuted", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script(
    'h1 criterion',
    immediately({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [{ concept: 'concept-foreign', field: 'a-field' }] }), // out of collects
    immediately({ verdict: 'inconclusive', reason: 'no-data', citations: [{ concept: 'concept-a', field: 'field-a' }] }), // within collects, field declared
  );
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a') })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(evaluator.calls).toHaveLength(2);
  expect(result).toEqual([{
    hypothesis: 'h1',
    verdict: 'inconclusive',
    reason: 'no-data',
    citations: [{ concept: 'concept-a', field: 'field-a' }],
  }]);
});

it('never records an inconclusive outcome carrying an out-of-collects citation as if it had passed — a first answer and its retry both citing a concept outside the collects fall back to judgment-failure', async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const foreignCitation = {
    verdict: 'inconclusive' as const,
    reason: 'judgment-failure' as const,
    citations: [{ concept: 'concept-foreign', field: 'a-field' }],
  };
  evaluator.script('h1 criterion', immediately(foreignCitation), immediately(foreignCitation));
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('a-field') })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }]);
  expect(evaluator.calls).toHaveLength(2);
});

it("attaches the usage, elapsed_ms and prompt a first call's own decided, structurally valid answer returned, onto the resulting Evaluation", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const usage: Usage = { input_tokens: 10, output_tokens: 20 };
  evaluator.script(
    'h1 criterion',
    immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }], usage, elapsed_ms: 321, prompt: 'the first-call prompt' }),
  );
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a') })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([
    { hypothesis: 'h1', verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }], usage, elapsed_ms: 321, prompt: 'the first-call prompt' },
  ]);
});

it("attaches the usage, elapsed_ms and prompt a first call's own inconclusive answer returned, passed through unchanged", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const usage: Usage = { input_tokens: 5, output_tokens: 7 };
  evaluator.script('h1 criterion', immediately({
    verdict: 'inconclusive',
    reason: 'judgment-failure',
    citations: [],
    usage,
    elapsed_ms: 99,
    prompt: 'the inconclusive-call prompt',
  }));
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([['h1', [anEvidence({ concept: 'concept-a' })]]]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([
    { hypothesis: 'h1', verdict: 'inconclusive', reason: 'judgment-failure', citations: [], usage, elapsed_ms: 99, prompt: 'the inconclusive-call prompt' },
  ]);
});

it("attaches the retry's own usage, elapsed_ms and prompt — never the discarded first call's — onto the decided answer the retry accepted", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const firstCallUsage: Usage = { input_tokens: 1, output_tokens: 1 };
  const retryUsage: Usage = { input_tokens: 999, output_tokens: 888 };
  const invalidFirst: EvaluationOutcome = { verdict: 'confirmed', citations: [{ concept: 'concept-foreign', field: 'field-a' }], usage: firstCallUsage, elapsed_ms: 1, prompt: 'discarded' };
  const validRetry: EvaluationOutcome = { verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }], usage: retryUsage, elapsed_ms: 456, prompt: 'the retry prompt' };
  evaluator.script('h1 criterion', immediately(invalidFirst), immediately(validRetry));
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a') })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', ...validRetry }]);
});

it('a no-data evaluation carries no usage, elapsed_ms or prompt key at all — judgment was never called for it', async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const theCase = aCase([{ name: 'h1', collects: ['concept-denied'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-denied', result: 'denied' })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result[0]).not.toHaveProperty('usage');
  expect(result[0]).not.toHaveProperty('elapsed_ms');
  expect(result[0]).not.toHaveProperty('prompt');
});

it('a deadline-exceeded evaluation carries no usage, elapsed_ms or prompt key, for a call that never settled before the deadline', async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', neverSettles);
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([['h1', [anEvidence({ concept: 'concept-a' })]]]);

  const resultPromise = judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 5,
  });
  await vi.advanceTimersByTimeAsync(5);
  const result = await resultPromise;

  expect(result[0]).not.toHaveProperty('usage');
  expect(result[0]).not.toHaveProperty('elapsed_ms');
  expect(result[0]).not.toHaveProperty('prompt');
});

it("attaches the retry's own usage, elapsed_ms and prompt — never the discarded first call's, and never a usage summed across both attempts — onto a judgment-failure evaluation when the retry also fails citation validation", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const invalidCitation: readonly [Citation, ...Citation[]] = [{ concept: 'concept-foreign', field: 'field-a' }];
  const firstCallUsage: Usage = { input_tokens: 1, output_tokens: 2 };
  const retryUsage: Usage = { input_tokens: 999, output_tokens: 888 };
  evaluator.script(
    'h1 criterion',
    immediately({ verdict: 'confirmed', citations: invalidCitation, usage: firstCallUsage, elapsed_ms: 12, prompt: 'the discarded first-call prompt' }),
    immediately({ verdict: 'refuted', citations: invalidCitation, usage: retryUsage, elapsed_ms: 34, prompt: 'the retry prompt' }),
  );
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', fields: fieldsDeclaring('field-a') })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{
    hypothesis: 'h1',
    verdict: 'inconclusive',
    reason: 'judgment-failure',
    citations: [],
    usage: retryUsage,
    elapsed_ms: 34,
    prompt: 'the retry prompt',
  }]);
});

it("accepts a citation naming a field the evidence item's own snapshot declared at collection, even though a capability now re-registered at that same name and version would declare a different set of fields entirely", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', immediately({ verdict: 'confirmed', citations: [{ concept: 'a-concept', field: 'field-collected' }] }));
  const theCase = aCase([{ name: 'h1', collects: ['a-concept'] }]);

  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'a-concept', capability_name: 'cap-x', capability_version: '1.0.0', fields: fieldsDeclaring('field-collected') })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'confirmed', citations: [{ concept: 'a-concept', field: 'field-collected' }] }]);
});

it("refuses a citation naming a field only a capability re-registered after collection would declare — a field absent from the evidence item's own snapshot taken at collection — never letting a live-resolved schema leak into an already-collected item's judgment", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const wouldOnlyExistAfterReregistration: readonly [Citation, ...Citation[]] = [{ concept: 'a-concept', field: 'field-after-reregistration' }];
  evaluator.script(
    'h1 criterion',
    immediately({ verdict: 'confirmed', citations: wouldOnlyExistAfterReregistration }),
    immediately({ verdict: 'confirmed', citations: wouldOnlyExistAfterReregistration }),
  );
  const theCase = aCase([{ name: 'h1', collects: ['a-concept'] }]);

  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'a-concept', capability_name: 'cap-x', capability_version: '1.0.0', fields: fieldsDeclaring('field-collected') })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }]);
  expect(evaluator.calls).toHaveLength(2);
});

function functionBodyOf(source: string, functionName: string): string {
  const pattern = new RegExp(`function ${functionName}\\([^)]*\\)[^{]*\\{([\\s\\S]*?)\\n\\}`);
  const match = source.match(pattern);
  if (match === null) {
    throw new Error(`${functionName} was not found in judgment-stage.ts`);
  }
  return match[1];
}

it("hypothesisNamed's declared return type stays the non-optional Hypothesis, never Hypothesis | undefined, so a silent fallback cannot type-check for a name absent from the case's hypotheses", async () => {
  const source = await moduleSource();

  expect(source).toMatch(/function hypothesisNamed\(theCase: Case, name: string\): Hypothesis \{/);
  expect(source).not.toMatch(/function hypothesisNamed\([^)]*\): Hypothesis \| undefined/);
});

it("evidenceFor's declared return type stays the non-optional readonly Evidence[], never readonly Evidence[] | undefined, so a silent fallback cannot type-check for a hypothesis absent from evidenceByHypothesis", async () => {
  const source = await moduleSource();

  expect(source).toMatch(/function evidenceFor\(name: string, evidenceByHypothesis: ReadonlyMap<string, readonly Evidence\[\]>\): readonly Evidence\[\] \{/);
  expect(source).not.toMatch(/function evidenceFor\([^)]*\): readonly Evidence\[\] \| undefined/);
});

it("hypothesisNamed's body no longer contains a throw for a name absent from the case's own hypotheses", async () => {
  const source = await moduleSource();

  const body = functionBodyOf(source, 'hypothesisNamed');

  expect(body).not.toMatch(/throw/);
});

it("evidenceFor's body no longer contains a throw for a required hypothesis absent from evidenceByHypothesis", async () => {
  const source = await moduleSource();

  const body = functionBodyOf(source, 'evidenceFor');

  expect(body).not.toMatch(/throw/);
});

it("hypothesisNamed introduces no fallback or default value in the removed throw's place", async () => {
  const source = await moduleSource();

  const body = functionBodyOf(source, 'hypothesisNamed');

  expect(body).not.toMatch(/\?\?/);
  expect(body).not.toMatch(/\|\|/);
});

it("evidenceFor introduces no fallback or default value in the removed throw's place", async () => {
  const source = await moduleSource();

  const body = functionBodyOf(source, 'evidenceFor');

  expect(body).not.toMatch(/\?\?/);
  expect(body).not.toMatch(/\|\|/);
});

it("no longer rejects naming the missing hypothesis when a required name is not found among the case's own hypotheses — only the unguarded property access fails, with no message naming it", async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const theCase = aCaseWithMismatchedHypotheses([aHypothesis('h1', ['concept-a'])], []);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([['h1', [anEvidence({ concept: 'concept-a' })]]]);

  const result = judgeHypotheses({ case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000 });

  await expect(result).rejects.toBeInstanceOf(TypeError);
  await expect(result).rejects.not.toThrow(/h1/);
});

it('no longer rejects naming the missing hypothesis when evidenceByHypothesis carries no entry for a required hypothesis — only the unguarded property access fails, with no message naming it', async () => {
  const evaluator = new ScriptedHypothesisEvaluator();
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>();

  const result = judgeHypotheses({ case: theCase, evidenceByHypothesis, evaluator, poolSize: 1, now: 0, deadline: 10_000 });

  await expect(result).rejects.toBeInstanceOf(TypeError);
  await expect(result).rejects.not.toThrow(/h1/);
});

it('imports no ICapabilityQuery and reads no capability-registry port at all — judgeHypotheses takes only evidence already collected, never a registry to resolve live', async () => {
  const source = await moduleSource();

  expect(source).not.toMatch(/ICapabilityQuery/);
  expect(source).not.toMatch(/capability-query\.port/);
  expect(source).not.toMatch(/outputSchemasFor/);
});
