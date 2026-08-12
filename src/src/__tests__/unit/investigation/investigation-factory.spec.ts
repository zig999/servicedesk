// Proof for task/subject-identity-rework/investigation-factory-assembles-and-validates-the-subject:
// buildInvestigation() assembles the Subject from the given raw subjectType
// and subjectAttributes rather than accepting an already-built one, refusing
// where the attribute-value set is empty
// (rules/investigation/a-subject-carries-at-least-one-attribute, enforced by
// subject.ts's own buildSubject and surfaced here as
// SubjectCarriesNoAttributeError) or where it names an attribute the
// glossary does not hold
// (rules/investigation/a-subject-attribute-is-drawn-from-the-glossary,
// checked through the consumed glossary-source port and surfaced as
// SubjectAttributeNotInGlossaryError) — and otherwise carries the assembled
// subject unchanged into the built Investigation. The glossary boundary
// (contracts/investigation/glossary-source) is stood in for by a small
// in-memory fake, the same convention validate-case-coherence.spec.ts
// already keeps for the sibling case-coherence checks, so the policy is
// proved against the published read alone.
//
// This file also carries the pre-existing proof for the totality checks
// buildInvestigation already performed before this task
// (task/investigation-lifecycle/investigation-factory,
// rules/investigation/one-evidence-per-collected-concept,
// rules/investigation/one-evaluation-per-required-hypothesis) and for its own
// replay pinning and plain-value shape — unchanged in substance, only made
// async because the factory itself now is.
import { expect, it } from 'vitest';
import type { Case, Hypothesis } from '../../../case/case.js';
import { InvestigationNotBuildableError } from '../../../errors/investigation-not-buildable.error.js';
import { SubjectAttributeNotInGlossaryError } from '../../../errors/subject-attribute-not-in-glossary.error.js';
import { SubjectCarriesNoAttributeError } from '../../../errors/subject-carries-no-attribute.error.js';
import type {
  ConceptResolution,
  IGlossaryQuery,
  TermResolution,
} from '../../../glossary/glossary-query.port.js';
import type { TermVocabulary } from '../../../glossary/terms.js';
import type { Assessment } from '../../../investigation/assessment.js';
import type { Cost } from '../../../investigation/cost.js';
import type { Durations } from '../../../investigation/durations.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import type { Evidence } from '../../../investigation/evidence.js';
import type { BuildInvestigationOptions } from '../../../investigation/investigation-factory.js';
import { buildInvestigation } from '../../../investigation/investigation-factory.js';
import type { SubjectAttributeValue } from '../../../investigation/subject-attribute-value.js';

/** The pinned case's own three identifying attributes — reused by the fixture and by the pin assertions, so a typo in either cannot fake a pass. */
const CASE_SLUG = 'a-case';
const CASE_VERSION = 3;
const CASE_HASH = 'a-hash';
/** The built investigation's own written_at, reused by the fixture and by the written_at assertions (task/case-and-investigation-model/investigation-record-shape). */
const WRITTEN_AT = '2024-06-01T12:00:00.000Z';

/**
 * Stands in for the consumed glossary-source port
 * (contracts/investigation/glossary-source): a holding a test seeds
 * directly, so an attribute the glossary does not hold is exactly what the
 * test says it is — never derived from a real store. Only the
 * subject-attribute vocabulary is ever exercised through this port by
 * investigation-factory.ts, but the whole interface is implemented so the
 * fake can stand in for it.
 */
class FakeGlossaryQuery implements IGlossaryQuery {
  private readonly attributes = new Set<string>();

  public holdAttribute(name: string): void {
    this.attributes.add(name);
  }

  public async readVocabularyTerm(vocabulary: TermVocabulary, name: string): Promise<TermResolution> {
    return this.attributes.has(name)
      ? { held: true, term: { name } }
      : { held: false, vocabulary, name };
  }

  public async readConcept(name: string): Promise<ConceptResolution> {
    return { held: false, name };
  }
}

/** A glossary holding exactly the given subject-attribute names, none other. */
function glossaryHolding(...names: readonly string[]): FakeGlossaryQuery {
  const glossary = new FakeGlossaryQuery();
  for (const name of names) {
    glossary.holdAttribute(name);
  }
  return glossary;
}

/** One hypothesis, defaulted so a test states only its name and what it collects. */
function aHypothesis(name: string, collects: readonly string[]): Hypothesis {
  return {
    name,
    criterion: `${name} criterion`,
    collects,
    resolution: { outcome: 'an-outcome', referral: { action: 'refer', recipient: 'a-queue' } },
  };
}

/**
 * A structurally valid Case declaring exactly two hypotheses — h1 collecting
 * concept-a, h2 collecting concept-b — so collectionPlan and
 * requiresEvaluationOf both answer two names, the smallest fixture that lets
 * a totality test remove or duplicate exactly one without touching the other.
 */
function aCase(overrides: Partial<Case> = {}): Case {
  return {
    slug: CASE_SLUG,
    title: 'A case for the factory to pin',
    when_to_use: 'when testing the investigation factory',
    version: CASE_VERSION,
    hash: CASE_HASH,
    subject: 'ont',
    fallback: { outcome: 'no-data', referral: { action: 'refer', recipient: 'a-queue' } },
    hypotheses: [aHypothesis('h1', ['concept-a']), aHypothesis('h2', ['concept-b'])],
    ...overrides,
  };
}

/** One collected concept's whole Evidence record, defaulted so a test states only which concept it is about. */
function anEvidence(concept: string, overrides: Partial<Evidence> = {}): Evidence {
  return {
    concept,
    inputs: 'an-input',
    observation: 'an-observation',
    observed_at: '2024-01-01T00:00:00.000Z',
    ttl: 60,
    origin: 'a-connector',
    result: 'ok',
    capability_name: `capability-for-${concept}`,
    capability_version: '1.0.0',
    ...overrides,
  };
}

/** One decided, confirmed Evaluation for the given hypothesis, carrying the one citation a confirmed verdict requires. */
function aConfirmedEvaluation(hypothesis: string): Evaluation {
  return { hypothesis, verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'a-field' }] };
}

/** A whole Assessment, defaulted so a test states only what it departs from. */
function anAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    outcome: 'an-outcome',
    referral: { action: 'refer', recipient: 'a-queue' },
    determining_hypothesis: 'h1',
    text: 'the drafted assessment text',
    ...overrides,
  };
}

/** A whole Cost, defaulted so a test states only what it departs from. */
function aCost(overrides: Partial<Cost> = {}): Cost {
  return { calls: 3, input_tokens: 100, output_tokens: 50, ...overrides };
}

/** A whole Durations, defaulted so a test states only what it departs from. */
function aDurations(overrides: Partial<Durations> = {}): Durations {
  return { collection: 10, judgment: 20, writing: 5, total: 35, ...overrides };
}

/** The one attribute-value pair the default fixture's subject carries, and the glossary that holds its name. */
const DEFAULT_SUBJECT_ATTRIBUTES: readonly SubjectAttributeValue[] = [{ attribute: 'id', value: 'subject-1' }];

/**
 * The whole BuildInvestigationOptions, valid by default — a subject naming
 * one attribute the default glossary holds, evidence covering aCase()'s own
 * collection plan exactly once per concept, evaluations covering its
 * required hypotheses exactly once each — so a test states only what it
 * departs from.
 */
function validOptions(overrides: Partial<BuildInvestigationOptions> = {}): BuildInvestigationOptions {
  return {
    id: 'investigation-1',
    requester: 'requester-1',
    ticket_ref: 'TICKET-1',
    narrative: 'the narrative the requester submitted',
    subjectType: 'ont',
    subjectAttributes: DEFAULT_SUBJECT_ATTRIBUTES,
    glossary: glossaryHolding('id'),
    case: aCase(),
    prompt_version: 'prompt-v1',
    model: 'model-x',
    evidence: [anEvidence('concept-a'), anEvidence('concept-b')],
    evaluations: [aConfirmedEvaluation('h1'), aConfirmedEvaluation('h2')],
    assessment: anAssessment(),
    cost: aCost(),
    durations: aDurations(),
    written_at: WRITTEN_AT,
    ...overrides,
  };
}

/**
 * validOptions() with the given field removed entirely, bypassing what the
 * type otherwise guarantees — for a test proving what happens when a caller
 * omits a required option altogether rather than merely typing it wrong
 * (task/case-and-investigation-model/investigation-record-shape's own
 * written_at and ticket_ref criteria).
 */
function validOptionsWithout(field: keyof BuildInvestigationOptions): BuildInvestigationOptions {
  const options: Record<string, unknown> = { ...validOptions() };
  delete options[field];
  return options as unknown as BuildInvestigationOptions;
}

/** How a refusal names a collection-plan concept with no matching evidence, exactly as investigation-factory.ts states it. */
function noEvidenceViolation(concept: string): string {
  return `the collection plan's concept "${concept}" has no matching evidence`;
}

/** How a refusal names a collection-plan concept with more than one matching evidence entry, exactly as investigation-factory.ts states it. */
function duplicateEvidenceViolation(concept: string, count: number): string {
  return `the collection plan's concept "${concept}" has ${count} evidence entries; exactly one is required`;
}

/** How a refusal names an evidence entry whose concept the collection plan does not hold, exactly as investigation-factory.ts states it. */
function extraneousEvidenceViolation(concept: string): string {
  return `evidence names the concept "${concept}", which the collection plan does not hold`;
}

/** How a refusal names a required hypothesis with no matching evaluation, exactly as investigation-factory.ts states it. */
function noEvaluationViolation(name: string): string {
  return `the required hypothesis "${name}" has no matching evaluation`;
}

/** How a refusal names a required hypothesis with more than one matching evaluation, exactly as investigation-factory.ts states it. */
function duplicateEvaluationViolation(name: string, count: number): string {
  return `the required hypothesis "${name}" has ${count} evaluations; exactly one is required`;
}

/** How a refusal names an evaluation whose hypothesis the case does not require, exactly as investigation-factory.ts states it. */
function extraneousEvaluationViolation(name: string): string {
  return `an evaluation names the hypothesis "${name}", which the case does not require`;
}

/** Every violation one build is refused with; fails the test where the build succeeds instead. */
async function violationsOf(options: BuildInvestigationOptions): Promise<readonly string[]> {
  let refusal: unknown;
  try {
    await buildInvestigation(options);
  } catch (error) {
    refusal = error;
  }
  if (!(refusal instanceof InvestigationNotBuildableError)) {
    throw new Error('expected the investigation-not-buildable refusal and the investigation built instead');
  }
  return refusal.context.violations;
}

// ------------------------------------- criterion 1: a-subject-carries-at-least-one-attribute

it('refuses to build when the subject carries no attribute-value at all, naming the violated invariant', async () => {
  const options = validOptions({ subjectType: 'ont', subjectAttributes: [] });

  const refusal = await buildInvestigation(options).catch((error: unknown) => error);

  if (!(refusal instanceof SubjectCarriesNoAttributeError)) {
    throw new Error('expected the subject-carries-no-attribute refusal and the investigation built instead');
  }
  expect(refusal.message).toBe('a subject of type "ont" carries no attribute-value; at least one is required');
  expect(refusal.context).toEqual({ type: 'ont' });
});

// -------------------------------- criterion 2: a-subject-attribute-is-drawn-from-the-glossary

it('refuses to build when the subject names an attribute the glossary does not hold, naming the violated policy', async () => {
  const options = validOptions({
    subjectAttributes: [{ attribute: 'id', value: 'subject-1' }],
    glossary: glossaryHolding(), // holds no attribute at all
  });

  const refusal = await buildInvestigation(options).catch((error: unknown) => error);

  if (!(refusal instanceof SubjectAttributeNotInGlossaryError)) {
    throw new Error('expected the subject-attribute-not-in-glossary refusal and the investigation built instead');
  }
  expect(refusal.message).toBe('a subject of type "ont" names an attribute the glossary does not hold: id');
  expect(refusal.context).toEqual({ type: 'ont', attributes: ['id'] });
});

it('names every attribute the glossary does not hold together, in one refusal', async () => {
  const options = validOptions({
    subjectAttributes: [
      { attribute: 'id', value: 'subject-1' },
      { attribute: 'phone', value: '555-0100' },
    ],
    glossary: glossaryHolding(), // holds neither
  });

  const refusal = await buildInvestigation(options).catch((error: unknown) => error);

  if (!(refusal instanceof SubjectAttributeNotInGlossaryError)) {
    throw new Error('expected the subject-attribute-not-in-glossary refusal and the investigation built instead');
  }
  expect(refusal.context.attributes).toEqual(['id', 'phone']);
});

it('names an attribute missing from the glossary once, no matter how many attribute-value pairs of the subject name it', async () => {
  const options = validOptions({
    subjectAttributes: [
      { attribute: 'id', value: 'subject-1' },
      { attribute: 'id', value: 'subject-2' },
    ],
    glossary: glossaryHolding(),
  });

  const refusal = await buildInvestigation(options).catch((error: unknown) => error);

  if (!(refusal instanceof SubjectAttributeNotInGlossaryError)) {
    throw new Error('expected the subject-attribute-not-in-glossary refusal and the investigation built instead');
  }
  expect(refusal.context.attributes).toEqual(['id']);
});

it('does not refuse a subject whose every named attribute the glossary holds', async () => {
  const options = validOptions({
    subjectAttributes: [
      { attribute: 'id', value: 'subject-1' },
      { attribute: 'phone', value: '555-0100' },
    ],
    glossary: glossaryHolding('id', 'phone'),
  });

  await expect(buildInvestigation(options)).resolves.toBeDefined();
});

it('lets a failure from the glossary port reach the caller rather than becoming a subject-attribute-not-in-glossary refusal', async () => {
  const failure = new Error('glossary temporarily unavailable');
  const glossary: IGlossaryQuery = {
    readVocabularyTerm: () => Promise.reject(failure),
    readConcept: () => Promise.resolve({ held: false, name: 'unused' }),
  };
  const options = validOptions({ glossary });

  await expect(buildInvestigation(options)).rejects.toBe(failure);
});

it('refuses over a subject-attribute-not-in-glossary violation before ever checking evidence or evaluation totality', async () => {
  // The evidence and evaluations below are both empty, which the totality
  // checks would also refuse — this asserts that the refusal actually
  // reaching the caller is the subject-attribute one, not a totality one,
  // so a subject is fully validated before anything about the case's
  // completed stages is even looked at.
  const options = validOptions({
    subjectAttributes: [{ attribute: 'unknown-attribute', value: 'x' }],
    glossary: glossaryHolding(),
    evidence: [],
    evaluations: [],
  });

  const refusal = await buildInvestigation(options).catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(SubjectAttributeNotInGlossaryError);
});

// ------------------------------------------ criterion 3: a valid subject is carried unchanged

it('carries a subject whose type and every attribute-value pair are valid, unchanged, into the built Investigation', async () => {
  const subjectAttributes: readonly SubjectAttributeValue[] = [
    { attribute: 'id', value: 'subject-1' },
    { attribute: 'phone', value: '555-0100' },
  ];
  const options = validOptions({
    subjectType: 'ont',
    subjectAttributes,
    glossary: glossaryHolding('id', 'phone'),
  });

  const investigation = await buildInvestigation(options);

  expect(investigation.subject).toEqual({ type: 'ont', attributes: subjectAttributes });
});

// ---------------------------------------------------------------- criterion 1 (pre-existing): evidence totality

it('refuses to build when a collection-plan concept has no matching evidence', async () => {
  // Also exercises the inference that buildInvestigation() reads the whole
  // Case rather than pre-extracted names: collectionPlan(theCase) is what
  // supplies "concept-b" here, from the given case alone.
  const options = validOptions({ evidence: [anEvidence('concept-a')] }); // concept-b missing

  const violations = await violationsOf(options);

  expect(violations).toEqual([noEvidenceViolation('concept-b')]);
});

it('refuses to build when an evidence entry names a concept the collection plan does not hold', async () => {
  const options = validOptions({
    evidence: [anEvidence('concept-a'), anEvidence('concept-b'), anEvidence('concept-x')],
  });

  const violations = await violationsOf(options);

  expect(violations).toEqual([extraneousEvidenceViolation('concept-x')]);
});

it('refuses to build when a collection-plan concept has more than one matching evidence entry', async () => {
  const options = validOptions({
    evidence: [anEvidence('concept-a'), anEvidence('concept-a'), anEvidence('concept-b')],
  });

  const violations = await violationsOf(options);

  expect(violations).toEqual([duplicateEvidenceViolation('concept-a', 2)]);
});

// ---------------------------------------------------------------- criterion 2 (pre-existing): evaluation totality

it('refuses to build when a required hypothesis has no matching evaluation', async () => {
  const options = validOptions({ evaluations: [aConfirmedEvaluation('h1')] }); // h2 missing

  const violations = await violationsOf(options);

  expect(violations).toEqual([noEvaluationViolation('h2')]);
});

it('refuses to build when an evaluation names a hypothesis the case does not require', async () => {
  const options = validOptions({
    evaluations: [aConfirmedEvaluation('h1'), aConfirmedEvaluation('h2'), aConfirmedEvaluation('h-foreign')],
  });

  const violations = await violationsOf(options);

  expect(violations).toEqual([extraneousEvaluationViolation('h-foreign')]);
});

it('refuses to build when a required hypothesis has more than one matching evaluation', async () => {
  const options = validOptions({
    evaluations: [aConfirmedEvaluation('h1'), aConfirmedEvaluation('h1'), aConfirmedEvaluation('h2')],
  });

  const violations = await violationsOf(options);

  expect(violations).toEqual([duplicateEvaluationViolation('h1', 2)]);
});

// ------------------------------------------------- edge case: both totalities violated together

it('refuses once, naming every violation from both the evidence and the evaluation totality checks together', async () => {
  const options = validOptions({
    evidence: [anEvidence('concept-a')], // concept-b missing
    evaluations: [aConfirmedEvaluation('h1')], // h2 missing
  });

  const violations = await violationsOf(options);

  expect(violations).toEqual([noEvidenceViolation('concept-b'), noEvaluationViolation('h2')]);
});

// ------------------------------- record-shape criterion 1: the pinned case carries exactly slug and version

it('pins the case by exactly slug and version, never a hash and never the whole case', async () => {
  // Narrowed from the three-field pin (slug, version, hash) an earlier
  // delivery carried down to exactly two
  // (task/case-and-investigation-model/investigation-record-shape): the
  // pinned case no longer carries the case's own hash at all.
  const investigation = await buildInvestigation(validOptions());

  expect(investigation.pinned_case).toEqual({ slug: CASE_SLUG, version: CASE_VERSION });
  expect(investigation.pinned_case).not.toHaveProperty('hash');
  expect(investigation.pinned_case).not.toHaveProperty('title');
  expect(investigation.pinned_case).not.toHaveProperty('hypotheses');
});

// ------------------------------------- record-shape criterion 2: no digest read over the case's content

it("pins the same slug and version regardless of what the case's own hash holds, deriving or reading no digest over its content", async () => {
  const withHashOne = await buildInvestigation(validOptions({ case: aCase({ hash: 'hash-one' }) }));
  const withHashTwo = await buildInvestigation(validOptions({ case: aCase({ hash: 'hash-two' }) }));

  expect(withHashOne.pinned_case).toEqual({ slug: CASE_SLUG, version: CASE_VERSION });
  expect(withHashOne.pinned_case).toEqual(withHashTwo.pinned_case);
});

// --------------------------------------------------------------- record-shape criterion 3: written_at

it('carries written_at from the given options, unchanged', async () => {
  const options = validOptions({ written_at: '2025-01-02T03:04:05.000Z' });

  const investigation = await buildInvestigation(options);

  expect(investigation.written_at).toBe('2025-01-02T03:04:05.000Z');
});

// ------------------------------------------------- record-shape criterion 4: refuses without written_at

it('refuses to build when written_at is missing entirely, rather than building a record with no datetime of its own write', async () => {
  const options = validOptionsWithout('written_at');

  await expect(buildInvestigation(options)).rejects.toThrow();
});

// ---------- excludes UNDERDETERMINED: refusing to build without ticket_ref, which the specification declares optional

it('does not refuse to build when ticket_ref is absent, since domain/investigation/investigation declares it optional', async () => {
  const options = validOptionsWithout('ticket_ref');

  await expect(buildInvestigation(options)).resolves.toBeDefined();
});

// ---- excludes UNDERDETERMINED: a factory storing only written_at, the pinned slug/version, model, prompt_version and evidence

it('carries id, requester, narrative, evaluations, assessment, cost and durations from the given options, unchanged — not only the four replay pins and written_at', async () => {
  const evaluations = [aConfirmedEvaluation('h1'), aConfirmedEvaluation('h2')];
  const assessment = anAssessment({ text: 'a distinctive assessment text' });
  const cost = aCost({ calls: 9 });
  const durations = aDurations({ total: 99 });
  const options = validOptions({
    id: 'investigation-42',
    requester: 'requester-42',
    narrative: 'a distinctive narrative',
    evaluations,
    assessment,
    cost,
    durations,
  });

  const investigation = await buildInvestigation(options);

  expect(investigation.id).toBe('investigation-42');
  expect(investigation.requester).toBe('requester-42');
  expect(investigation.narrative).toBe('a distinctive narrative');
  expect(investigation.evaluations).toEqual(evaluations);
  expect(investigation.assessment).toEqual(assessment);
  expect(investigation.cost).toEqual(cost);
  expect(investigation.durations).toEqual(durations);
});

it('copies model, prompt_version and evidence straight from the given options, unchanged', async () => {
  const evidence = [anEvidence('concept-a'), anEvidence('concept-b')];
  const options = validOptions({ model: 'model-y', prompt_version: 'prompt-v2', evidence });

  const investigation = await buildInvestigation(options);

  expect(investigation.model).toBe('model-y');
  expect(investigation.prompt_version).toBe('prompt-v2');
  expect(investigation.evidence).toEqual(evidence);
});

// ---------------------------------------------------------------- criterion 4 (pre-existing): a plain value, no method

it('answers a plain data object carrying no method, so nothing on the value itself could mutate it after construction', async () => {
  const investigation = await buildInvestigation(validOptions());

  expect(Object.getPrototypeOf(investigation)).toBe(Object.prototype);
  expect(Object.values(investigation).some((value) => typeof value === 'function')).toBe(false);
});

// ---------------------------------------------------- edge case: a valid build does not throw

it('does not throw when the subject is valid, the evidence covers the collection plan and the evaluations cover the required hypotheses exactly once each', async () => {
  const options = validOptions();

  await expect(buildInvestigation(options)).resolves.toBeDefined();
});

// ---------------------------------------------------------- edge case: defensive copies

it('copies the given evidence array rather than holding onto it, so mutating the original array afterwards leaves the built value unchanged', async () => {
  const evidence: Evidence[] = [anEvidence('concept-a'), anEvidence('concept-b')];
  const options = validOptions({ evidence });

  const investigation = await buildInvestigation(options);
  evidence.push(anEvidence('concept-x'));

  expect(investigation.evidence).toHaveLength(2);
  expect(investigation.evidence.map((item) => item.concept)).toEqual(['concept-a', 'concept-b']);
});

it('copies the given evaluations array rather than holding onto it, so mutating the original array afterwards leaves the built value unchanged', async () => {
  const evaluations: Evaluation[] = [aConfirmedEvaluation('h1'), aConfirmedEvaluation('h2')];
  const options = validOptions({ evaluations });

  const investigation = await buildInvestigation(options);
  evaluations.push(aConfirmedEvaluation('h-foreign'));

  expect(investigation.evaluations).toHaveLength(2);
  expect(investigation.evaluations.map((item) => item.hypothesis)).toEqual(['h1', 'h2']);
});
