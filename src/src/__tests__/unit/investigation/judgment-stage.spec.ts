// Proof for task/hypothesis-judgment/judgment-stage: judgeHypotheses answers
// exactly one Evaluation per requiresEvaluationOf(theCase) name, in that
// order — an immediate no-data for a hypothesis whose evidence is not all
// ok, otherwise one isolated evaluate() call under a caller-configured
// in-process pool, racing the one shared deadline signal timed once from
// now/deadline, retrying exactly once on a structurally invalid citation set
// where that deadline still admits it, and degrading every other path to
// deadline-exceeded or judgment-failure. Fake timers stand in for wall-clock
// time throughout, since the stage races both a pool acquisition and an
// evaluate() call against a real setTimeout-based deadline internally — the
// same discipline evidence-collection-stage.spec.ts already establishes for
// its own race, including its settled-flag-between-advances technique for
// observing an in-flight state before a later advance resolves it.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Capability } from '../../../capability-registry/capability.js';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { Case, Hypothesis, ManifestEntry } from '../../../case/case.js';
import type { Citation } from '../../../investigation/citation.js';
import type { Evidence } from '../../../investigation/evidence.js';
import type { CaseContext, EvaluationOutcome, EvidenceItem, IHypothesisEvaluator } from '../../../investigation/hypothesis-evaluator.port.js';
import { judgeHypotheses } from '../../../investigation/judgment-stage.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/** One hypothesis, defaulted so a test states only its name and what it collects. */
function aHypothesis(name: string, collects: readonly string[]): Hypothesis {
  return {
    name,
    criterion: `${name} criterion`,
    collects,
    resolution: { outcome: 'an-outcome', referral: { action: 'refer', recipient: 'a-queue' } },
  };
}

/** One manifest entry mirroring one flat Hypothesis fixture, position assigned from array order — requiresEvaluationOf reads theCase.manifest exclusively (task/case-lifecycle-domain-model/aggregate-types-and-structural-validation), while hypothesisNamed still reads theCase.hypotheses to find the named one. */
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

/** A minimally valid Case holding exactly the given hypotheses, in the order given — each one's own manifest position set to match that order, and its flat .hypotheses projection built from the same declared hypotheses, never independently. */
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

/**
 * A Case whose manifest names a required hypothesis its own flat
 * .hypotheses projection does not carry — a hostile double, never something
 * a real case parse produces (parse-case-document.ts's own heldCase always
 * derives .hypotheses from .manifest, so the two never disagree there),
 * built only to exercise hypothesisNamed's own caller-contract fault:
 * requiresEvaluationOf(theCase) names a required hypothesis from the
 * manifest alone, and hypothesisNamed then searches .hypotheses for it — a
 * case whose two fields disagree is the only way to make a name
 * requiresEvaluationOf just named absent from what hypothesisNamed then
 * finds. (Fixture rework, task/case-lifecycle-domain-model/aggregate-types-and-structural-validation:
 * requiresEvaluationOf moved from reading .hypotheses to reading .manifest,
 * so the volatile-getter-on-.hypotheses trick this fixture previously used
 * to fake that same disagreement across two reads of one field no longer
 * applies — only hypothesisNamed still reads .hypotheses at all, so a case
 * whose manifest and .hypotheses simply disagree from the start reaches
 * the same fault deterministically.)
 */
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

/** One collected concept's whole Evidence record, defaulted so a test states only what it is about. */
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
    ...overrides,
  };
}

/** A JSON-Schema-shaped output_schema declaring exactly the given field names as top-level `properties` keys. */
function schemaDeclaring(...fields: readonly string[]): string {
  return JSON.stringify({
    type: 'object',
    properties: Object.fromEntries(fields.map((field) => [field, { type: 'string' }])),
  });
}

/** A capability registered for exactly one concept, every other attribute defaulted so a test states only what it is about. */
function aCapability(overrides: Partial<Capability> & { readonly concept: string }): Capability {
  return {
    name: `capability-for-${overrides.concept}`,
    version: '1.0.0',
    nature: 'read-only',
    input_schema: 'input-schema',
    output_schema: schemaDeclaring(),
    timeout: 60_000,
    connector: `connector-for-${overrides.concept}`,
    ...overrides,
  };
}

/** Holds whatever capabilities a test registers, resolving every other concept as unheld — outputSchemasFor's own upstream, standing in for the capability registry. */
class FakeCapabilityQuery implements ICapabilityQuery {
  private readonly held = new Map<string, Capability>();

  public hold(capability: Capability): void {
    this.held.set(capability.concept, capability);
  }

  public async readCapability(concept: string): Promise<CapabilityResolution> {
    const capability = this.held.get(concept);
    return capability === undefined ? { held: false, concept } : { held: true, capability };
  }

  // Minimal stub kept only to satisfy the widened ICapabilityQuery interface
  // (task/capability-registry-http/list-capabilities-query-extension): this
  // file's own scenarios never call listCapabilities.
  public async listCapabilities(): Promise<never> {
    throw new Error('FakeCapabilityQuery.listCapabilities is not scripted for this file');
  }
}

/** One call ScriptedHypothesisEvaluator answered, recorded exactly as evaluate() received it. */
type RecordedCall = {
  readonly criterion: string;
  readonly evidence: readonly EvidenceItem[];
  readonly caseContext: CaseContext;
};

/** One scripted answer for one evaluate() call. */
type ScriptedAnswer = () => Promise<EvaluationOutcome>;

/**
 * Answers, for each criterion, the next scripted answer in that criterion's
 * own queue — first the first call's, then the retry's, in order — never
 * inventing one of its own, and recording every call it received so a test
 * can assert exactly which hypotheses' own criterion and evidence reached
 * it, and how many times. Asking for a criterion with an empty or unscripted
 * queue is a test setup fault, not one of the three verdicts, so it throws
 * rather than answering a default — the same convention FakeHypothesisEvaluator
 * already keeps for a criterion nothing seeded.
 */
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

/** A ScriptedHypothesisEvaluator answer resolving immediately with the given outcome. */
function immediately(outcome: EvaluationOutcome): ScriptedAnswer {
  return () => Promise.resolve(outcome);
}

/** A ScriptedHypothesisEvaluator answer resolving with the given outcome after delayMs — for a call whose own settling a test controls precisely. */
function resolvesAfter(delayMs: number, outcome: EvaluationOutcome): ScriptedAnswer {
  return () => new Promise((resolve) => setTimeout(() => resolve(outcome), delayMs));
}

/** A ScriptedHypothesisEvaluator answer that never settles — for a call a test forces to reach the stage's own deadline. */
function neverSettles(): Promise<EvaluationOutcome> {
  return new Promise(() => {});
}

it("answers exactly one evaluation per required hypothesis, in the case's declared order, none omitted or duplicated", async () => {
  const capA = aCapability({ concept: 'concept-a', output_schema: schemaDeclaring('field-a') });
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(capA);
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
    ['hyp-decided', [anEvidence({ concept: 'concept-a', capability_name: capA.name, capability_version: capA.version })]],
    ['hyp-inconclusive', [anEvidence({ concept: 'concept-c' })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 2, now: 0, deadline: 10_000,
  });

  expect(result.map((evaluation) => evaluation.hypothesis)).toEqual(['hyp-no-data', 'hyp-decided', 'hyp-inconclusive']);
  expect(result.map((evaluation) => evaluation.verdict)).toEqual(['inconclusive', 'confirmed', 'inconclusive']);
});

it("calls evaluate() with only the judged hypothesis's own criterion and its own matched evidence, never another hypothesis's", async () => {
  const capabilities = new FakeCapabilityQuery();
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

  await judgeHypotheses({ case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 2, now: 0, deadline: 10_000 });

  expect(evaluator.calls).toHaveLength(2);
  const forH1 = evaluator.calls.find((call) => call.criterion === 'h1 criterion');
  const forH2 = evaluator.calls.find((call) => call.criterion === 'h2 criterion');
  expect(forH1?.evidence).toEqual([{ concept: 'concept-a', result: 'ok', observation: 'observed-a', declaredFields: [] }]);
  expect(forH2?.evidence).toEqual([{ concept: 'concept-b', result: 'ok', observation: 'observed-b', declaredFields: [] }]);
});

it("passes each evidence item's own declared field names, read from its producing capability's own output schema, to evaluate() — before the first call is ever made, never only after a decided answer", async () => {
  const capA = aCapability({ concept: 'concept-a', output_schema: schemaDeclaring('field-a', 'field-b') });
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(capA);
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', immediately({ verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }));
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', capability_name: capA.name, capability_version: capA.version })]],
  ]);

  await judgeHypotheses({ case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 10_000 });

  expect(evaluator.calls[0]?.evidence).toEqual([
    { concept: 'concept-a', result: 'ok', observation: 'an-observation', declaredFields: ['field-a', 'field-b'] },
  ]);
});

it("passes the same pinned case's own title and when_to_use, grouped as CaseContext, to every hypothesis judged in one judgeHypotheses() call — never a different context per hypothesis", async () => {
  const capabilities = new FakeCapabilityQuery();
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

  await judgeHypotheses({ case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 2, now: 0, deadline: 10_000 });

  expect(evaluator.calls).toHaveLength(2);
  const expectedContext: CaseContext = { title: theCase.title, whenToUse: theCase.when_to_use };
  expect(evaluator.calls[0].caseContext).toEqual(expectedContext);
  expect(evaluator.calls[1].caseContext).toEqual(expectedContext);
});

it('never starts more evaluate() calls at once than the configured pool size, granting a queued hypothesis its call only once an earlier one frees a slot', async () => {
  const capabilities = new FakeCapabilityQuery();
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
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 2, now: 0, deadline: 100_000,
  });

  await vi.advanceTimersByTimeAsync(1);
  expect(evaluator.calls.map((call) => call.criterion).sort()).toEqual(['h1 criterion', 'h2 criterion']);

  await vi.advanceTimersByTimeAsync(9); // total 10ms: h1 resolves, frees a slot for h3
  expect(evaluator.calls.map((call) => call.criterion).sort()).toEqual(['h1 criterion', 'h2 criterion', 'h3 criterion']);

  await vi.advanceTimersByTimeAsync(1_000); // total 1010ms: h3 (due at 20ms) and h2 (due at 1000ms) both resolve
  const result = await resultPromise;
  expect(result.map((evaluation) => evaluation.hypothesis)).toEqual(['h1', 'h2', 'h3']);
});

it("retries once on a decided answer whose citations fail structural validation, and returns the retry's valid decided answer", async () => {
  const capA = aCapability({ concept: 'concept-a', output_schema: schemaDeclaring('field-a') });
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(capA);
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script(
    'h1 criterion',
    immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-foreign', field: 'field-a' }] }),
    immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] }),
  );
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', capability_name: capA.name, capability_version: capA.version })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] }]);
  expect(evaluator.calls).toHaveLength(2);
});

it("passes the pinned case's own title and when_to_use, unchanged, to both the first evaluate() call and the retry it forces", async () => {
  const capA = aCapability({ concept: 'concept-a', output_schema: schemaDeclaring('field-a') });
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(capA);
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script(
    'h1 criterion',
    immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-foreign', field: 'field-a' }] }), // invalid citation forces a retry
    immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] }),
  );
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', capability_name: capA.name, capability_version: capA.version })]],
  ]);

  await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(evaluator.calls).toHaveLength(2);
  const expectedContext: CaseContext = { title: theCase.title, whenToUse: theCase.when_to_use };
  expect(evaluator.calls[0].caseContext).toEqual(expectedContext);
  expect(evaluator.calls[1].caseContext).toEqual(expectedContext);
});

it("falls back to inconclusive judgment-failure when the retry's citations are also structurally invalid", async () => {
  const capA = aCapability({ concept: 'concept-a', output_schema: schemaDeclaring('field-a') });
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(capA);
  const evaluator = new ScriptedHypothesisEvaluator();
  const invalidCitation: readonly [Citation, ...Citation[]] = [{ concept: 'concept-foreign', field: 'field-a' }];
  evaluator.script(
    'h1 criterion',
    immediately({ verdict: 'confirmed', citations: invalidCitation }),
    immediately({ verdict: 'refuted', citations: invalidCitation }),
  );
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', capability_name: capA.name, capability_version: capA.version })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }]);
  expect(evaluator.calls).toHaveLength(2);
});

it("records deadline-exceeded, never judgment-failure, for a call that has not returned by the stage's deadline", async () => {
  const capabilities = new FakeCapabilityQuery();
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', neverSettles);
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([['h1', [anEvidence({ concept: 'concept-a' })]]]);

  const resultPromise = judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 5,
  });
  await vi.advanceTimersByTimeAsync(5);
  const result = await resultPromise;

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'inconclusive', reason: 'deadline-exceeded', citations: [] }]);
  expect(evaluator.calls).toHaveLength(1);
});

it('records deadline-exceeded for a hypothesis denied a pool slot before the deadline, and never calls evaluate() for it at all', async () => {
  const capabilities = new FakeCapabilityQuery();
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
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 5,
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
  const capabilities = new FakeCapabilityQuery();
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
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([
    {
      hypothesis: 'h1',
      verdict: 'inconclusive',
      reason: 'no-data',
      citations: [{ concept: 'concept-denied', field: '' }, { concept: 'concept-timeout', field: '' }],
    },
  ]);
  expect(evaluator.calls).toHaveLength(0);
});

it('passes through a confirmed answer with at least one citation unchanged', async () => {
  const capA = aCapability({ concept: 'concept-a', output_schema: schemaDeclaring('field-a') });
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(capA);
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] }));
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    ['h1', [anEvidence({ concept: 'concept-a', capability_name: capA.name, capability_version: capA.version })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] }]);
});

it('never returns confirmed or refuted for a decided answer carrying zero citations, even across a retry that also carries none', async () => {
  const capabilities = new FakeCapabilityQuery();
  const evaluator = new ScriptedHypothesisEvaluator();
  const zeroCitationConfirmed = { verdict: 'confirmed', citations: [] } as unknown as EvaluationOutcome;
  evaluator.script('h1 criterion', immediately(zeroCitationConfirmed), immediately(zeroCitationConfirmed));
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([['h1', [anEvidence({ concept: 'concept-a' })]]]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }]);
  expect(evaluator.calls).toHaveLength(2);
});

/**
 * The registry, scripted evaluator, case and evidence for the retry-same-slot
 * test below: h1 holds the only pool slot, its first call is a structurally
 * invalid citation forcing a slower retry, and h2 queues behind it.
 */
function retrySameSlotFixture(): {
  readonly capabilities: FakeCapabilityQuery;
  readonly evaluator: ScriptedHypothesisEvaluator;
  readonly theCase: Case;
  readonly evidenceByHypothesis: ReadonlyMap<string, readonly Evidence[]>;
} {
  const capA = aCapability({ concept: 'concept-a', output_schema: schemaDeclaring('field-a') });
  const capB = aCapability({ concept: 'concept-b', output_schema: schemaDeclaring('field-b') });
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(capA);
  capabilities.hold(capB);
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
    ['h1', [anEvidence({ concept: 'concept-a', capability_name: capA.name, capability_version: capA.version })]],
    ['h2', [anEvidence({ concept: 'concept-b', capability_name: capB.name, capability_version: capB.version })]],
  ]);
  return { capabilities, evaluator, theCase, evidenceByHypothesis };
}

it("keeps a hypothesis's retry under the same pool slot it already holds, never granting a queued sibling a slot while the retry is in flight", async () => {
  const { capabilities, evaluator, theCase, evidenceByHypothesis } = retrySameSlotFixture();

  const resultPromise = judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 100_000,
  });

  await vi.advanceTimersByTimeAsync(2); // past h1's first (1ms), which starts the retry immediately
  expect(evaluator.calls.map((call) => call.criterion)).toEqual(['h1 criterion', 'h1 criterion']);

  await vi.advanceTimersByTimeAsync(60); // total 62ms, past h1's retry (due at ~51ms) — only then does the slot free
  expect(evaluator.calls.map((call) => call.criterion)).toEqual(['h1 criterion', 'h1 criterion', 'h2 criterion']);

  await vi.advanceTimersByTimeAsync(10);
  const result = await resultPromise;
  expect(result[0]).toEqual({ hypothesis: 'h1', verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'field-a' }] });
  expect(result[1]).toEqual({ hypothesis: 'h2', verdict: 'inconclusive', reason: 'judgment-failure', citations: [] });
});

it('passes an inconclusive first answer through unchanged, with no retry attempted', async () => {
  const capabilities = new FakeCapabilityQuery();
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script('h1 criterion', immediately({
    verdict: 'inconclusive',
    reason: 'judgment-failure',
    citations: [{ concept: 'concept-a', field: 'a-field' }],
  }));
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([['h1', [anEvidence({ concept: 'concept-a' })]]]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{
    hypothesis: 'h1',
    verdict: 'inconclusive',
    reason: 'judgment-failure',
    citations: [{ concept: 'concept-a', field: 'a-field' }],
  }]);
  expect(evaluator.calls).toHaveLength(1);
});

it('passes an inconclusive retry answer through unchanged', async () => {
  const capabilities = new FakeCapabilityQuery();
  const evaluator = new ScriptedHypothesisEvaluator();
  evaluator.script(
    'h1 criterion',
    immediately({ verdict: 'confirmed', citations: [{ concept: 'concept-foreign', field: 'a-field' }] }), // invalid: foreign concept
    immediately({ verdict: 'inconclusive', reason: 'no-data', citations: [{ concept: 'concept-a', field: 'a-field' }] }),
  );
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([['h1', [anEvidence({ concept: 'concept-a' })]]]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{
    hypothesis: 'h1',
    verdict: 'inconclusive',
    reason: 'no-data',
    citations: [{ concept: 'concept-a', field: 'a-field' }],
  }]);
  expect(evaluator.calls).toHaveLength(2);
});

it("refuses a citation whose field is declared only under a capability output-schema key that does not match the cited evidence's own capability_name/capability_version", async () => {
  const currentlyRegistered = aCapability({
    concept: 'a-concept',
    name: 'cap-new',
    version: '2.0.0',
    output_schema: schemaDeclaring('a-field'),
  });
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(currentlyRegistered); // the registry's own CURRENT answer for this concept — not what produced the evidence
  const evaluator = new ScriptedHypothesisEvaluator();
  const mismatchedCitation: readonly [Citation, ...Citation[]] = [{ concept: 'a-concept', field: 'a-field' }];
  evaluator.script(
    'h1 criterion',
    immediately({ verdict: 'confirmed', citations: mismatchedCitation }),
    immediately({ verdict: 'confirmed', citations: mismatchedCitation }),
  );
  const theCase = aCase([{ name: 'h1', collects: ['a-concept'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([
    // the evidence's own producing capability is cap-old/1.0.0 — never the one the registry now answers
    ['h1', [anEvidence({ concept: 'a-concept', capability_name: 'cap-old', capability_version: '1.0.0' })]],
  ]);

  const result = await judgeHypotheses({
    case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 10_000,
  });

  expect(result).toEqual([{ hypothesis: 'h1', verdict: 'inconclusive', reason: 'judgment-failure', citations: [] }]);
  expect(evaluator.calls).toHaveLength(2);
});

it('throws naming the missing hypothesis when evidenceByHypothesis carries no entry for a required hypothesis', async () => {
  const capabilities = new FakeCapabilityQuery();
  const evaluator = new ScriptedHypothesisEvaluator();
  const theCase = aCase([{ name: 'h1', collects: ['concept-a'] }]);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>(); // no entry for h1 at all

  await expect(
    judgeHypotheses({ case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 10_000 }),
  ).rejects.toThrow(/h1/);
});

it("throws naming the hypothesis when a required name is not found among the case's own hypotheses", async () => {
  const capabilities = new FakeCapabilityQuery();
  const evaluator = new ScriptedHypothesisEvaluator();
  const theCase = aCaseWithMismatchedHypotheses([aHypothesis('h1', ['concept-a'])], []);
  const evidenceByHypothesis = new Map<string, readonly Evidence[]>([['h1', [anEvidence({ concept: 'concept-a' })]]]);

  await expect(
    judgeHypotheses({ case: theCase, evidenceByHypothesis, evaluator, capabilities, poolSize: 1, now: 0, deadline: 10_000 }),
  ).rejects.toThrow(/h1/);
});
