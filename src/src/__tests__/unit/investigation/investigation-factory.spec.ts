import { expect, it } from 'vitest';
import type { Case, Hypothesis, ManifestEntry } from '../../../case/case.js';
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

const CASE_SLUG = 'a-case';
const CASE_VERSION = 3;
const CASE_AUTHORED_AT = '2024-01-01T00:00:00.000Z';

const WRITTEN_AT = '2024-06-01T12:00:00.000Z';

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

  public async listVocabularyTerms(): Promise<never> {
    throw new Error('FakeGlossaryQuery.listVocabularyTerms is not scripted for this file');
  }

  public async listConcepts(): Promise<never> {
    throw new Error('FakeGlossaryQuery.listConcepts is not scripted for this file');
  }
}

function glossaryHolding(...names: readonly string[]): FakeGlossaryQuery {
  const glossary = new FakeGlossaryQuery();
  for (const name of names) {
    glossary.holdAttribute(name);
  }
  return glossary;
}

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

function aCase(overrides: Partial<Case> = {}): Case {
  const hypotheses = overrides.hypotheses ?? [aHypothesis('h1', ['concept-a']), aHypothesis('h2', ['concept-b'])];
  return {
    slug: CASE_SLUG,
    title: 'A case for the factory to pin',
    when_to_use: 'when testing the investigation factory',
    version: CASE_VERSION,
    authored_at: CASE_AUTHORED_AT,
    subject: 'ont',
    fallback: { outcome: 'no-data', referral: { action: 'refer', recipient: 'a-queue' } },
    state: 'released',
    manifest: hypotheses.map((hypothesis, index) => manifestEntryOf(hypothesis, index + 1)),
    hypotheses,
    ...overrides,
  };
}

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
    elapsed_ms: 12,
    fields: [],
    concept_description: '',
    ...overrides,
  };
}

function aConfirmedEvaluation(hypothesis: string): Evaluation {
  return { hypothesis, verdict: 'confirmed', citations: [{ concept: 'concept-a', field: 'a-field' }] };
}

function anAssessment(overrides: Partial<Assessment> = {}): Assessment {
  return {
    outcome: 'an-outcome',
    referral: { action: 'refer', recipient: 'a-queue' },
    determining_hypothesis: 'h1',
    text: 'the drafted assessment text',
    register: 'plain',
    usage: { input_tokens: 1, output_tokens: 1 },
    elapsed_ms: 1,
    prompt: 'a consolidation prompt',
    ...overrides,
  };
}

function aCost(overrides: Partial<Cost> = {}): Cost {
  return { calls: 3, input_tokens: 100, output_tokens: 50, ...overrides };
}

function aDurations(overrides: Partial<Durations> = {}): Durations {
  return { collection: 10, judgment: 20, writing: 5, total: 35, ...overrides };
}

const DEFAULT_SUBJECT_ATTRIBUTES: readonly SubjectAttributeValue[] = [{ attribute: 'id', value: 'subject-1' }];

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

function validOptionsWithout(field: keyof BuildInvestigationOptions): BuildInvestigationOptions {
  const options: Record<string, unknown> = { ...validOptions() };
  delete options[field];
  return options as unknown as BuildInvestigationOptions;
}

function noEvidenceViolation(concept: string): string {
  return `the collection plan's concept "${concept}" has no matching evidence`;
}

function duplicateEvidenceViolation(concept: string, count: number): string {
  return `the collection plan's concept "${concept}" has ${count} evidence entries; exactly one is required`;
}

function extraneousEvidenceViolation(concept: string): string {
  return `evidence names the concept "${concept}", which the collection plan does not hold`;
}

function noEvaluationViolation(name: string): string {
  return `the required hypothesis "${name}" has no matching evaluation`;
}

function duplicateEvaluationViolation(name: string, count: number): string {
  return `the required hypothesis "${name}" has ${count} evaluations; exactly one is required`;
}

function extraneousEvaluationViolation(name: string): string {
  return `an evaluation names the hypothesis "${name}", which the case does not require`;
}

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

it('refuses to build when the subject carries no attribute-value at all, naming the violated invariant', async () => {
  const options = validOptions({ subjectType: 'ont', subjectAttributes: [] });

  const refusal = await buildInvestigation(options).catch((error: unknown) => error);

  if (!(refusal instanceof SubjectCarriesNoAttributeError)) {
    throw new Error('expected the subject-carries-no-attribute refusal and the investigation built instead');
  }
  expect(refusal.message).toBe('a subject of type "ont" carries no attribute-value; at least one is required');
  expect(refusal.context).toEqual({ type: 'ont' });
});

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

    listVocabularyTerms: () => Promise.reject(new Error('listVocabularyTerms is not scripted for this file')),
    listConcepts: () => Promise.reject(new Error('listConcepts is not scripted for this file')),
  };
  const options = validOptions({ glossary });

  await expect(buildInvestigation(options)).rejects.toBe(failure);
});

it('refuses over a subject-attribute-not-in-glossary violation before ever checking evidence or evaluation totality', async () => {

  const options = validOptions({
    subjectAttributes: [{ attribute: 'unknown-attribute', value: 'x' }],
    glossary: glossaryHolding(),
    evidence: [],
    evaluations: [],
  });

  const refusal = await buildInvestigation(options).catch((error: unknown) => error);

  expect(refusal).toBeInstanceOf(SubjectAttributeNotInGlossaryError);
});

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

it('refuses to build when a collection-plan concept has no matching evidence', async () => {

  const options = validOptions({ evidence: [anEvidence('concept-a')] });

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

it('refuses to build when a required hypothesis has no matching evaluation', async () => {
  const options = validOptions({ evaluations: [aConfirmedEvaluation('h1')] });

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

it('refuses once, naming every violation from both the evidence and the evaluation totality checks together', async () => {
  const options = validOptions({
    evidence: [anEvidence('concept-a')], // concept-b missing
    evaluations: [aConfirmedEvaluation('h1')], // h2 missing
  });

  const violations = await violationsOf(options);

  expect(violations).toEqual([noEvidenceViolation('concept-b'), noEvaluationViolation('h2')]);
});

it('pins the case by exactly slug and version, never a hash and never the whole case', async () => {

  const investigation = await buildInvestigation(validOptions());

  expect(investigation.pinned_case).toEqual({ slug: CASE_SLUG, version: CASE_VERSION });
  expect(investigation.pinned_case).not.toHaveProperty('hash');
  expect(investigation.pinned_case).not.toHaveProperty('title');
  expect(investigation.pinned_case).not.toHaveProperty('hypotheses');
});

it('carries written_at from the given options, unchanged', async () => {
  const options = validOptions({ written_at: '2025-01-02T03:04:05.000Z' });

  const investigation = await buildInvestigation(options);

  expect(investigation.written_at).toBe('2025-01-02T03:04:05.000Z');
});

it('builds an Investigation carrying no written_at, rather than refusing, when written_at is missing entirely from the given options — the store decides that value later, at settle', async () => {
  const options = validOptionsWithout('written_at');

  const investigation = await buildInvestigation(options);

  expect(investigation.written_at).toBeUndefined();
});

it('does not refuse to build when ticket_ref is absent, since domain/investigation/investigation declares it optional', async () => {
  const options = validOptionsWithout('ticket_ref');

  await expect(buildInvestigation(options)).resolves.toBeDefined();
});

function optionsOmittingTicketRef(): BuildInvestigationOptions {
  const full = validOptions();
  return {
    id: full.id,
    requester: full.requester,
    narrative: full.narrative,
    subjectType: full.subjectType,
    subjectAttributes: full.subjectAttributes,
    case: full.case,
    prompt_version: full.prompt_version,
    model: full.model,
    evidence: full.evidence,
    evaluations: full.evaluations,
    assessment: full.assessment,
    cost: full.cost,
    durations: full.durations,
    written_at: full.written_at,
    glossary: full.glossary,
  };
}

it('builds an Investigation whose own ticket_ref is undefined, not an invented placeholder, when the given options carry no ticket_ref at all', async () => {
  const investigation = await buildInvestigation(optionsOmittingTicketRef());

  expect(investigation.ticket_ref).toBeUndefined();
});

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

it('answers a plain data object carrying no method, so nothing on the value itself could mutate it after construction', async () => {
  const investigation = await buildInvestigation(validOptions());

  expect(Object.getPrototypeOf(investigation)).toBe(Object.prototype);
  expect(Object.values(investigation).some((value) => typeof value === 'function')).toBe(false);
});

it('does not throw when the subject is valid, the evidence covers the collection plan and the evaluations cover the required hypotheses exactly once each', async () => {
  const options = validOptions();

  await expect(buildInvestigation(options)).resolves.toBeDefined();
});

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
