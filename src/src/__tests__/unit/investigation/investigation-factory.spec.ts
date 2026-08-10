// Proof for task/investigation-lifecycle/investigation-factory: buildInvestigation()
// refuses once, naming every totality violation together, where the given
// evidence does not cover the pinned case's own collection plan exactly once
// per concept (rules/investigation/one-evidence-per-collected-concept) or the
// given evaluations do not cover its required hypotheses exactly once each
// (rules/investigation/one-evaluation-per-required-hypothesis) — the "exactly
// once" of both rules read as its own two-sided boundary, a name with zero
// matches and a name with more than one, plus the third, symmetric category
// the implementation's own inference adds: an entry naming something neither
// rule declared at all. Otherwise it assembles the whole Investigation,
// pinning the case by slug, version and hash alone — never the whole case —
// alongside the model, the prompt version and the evidence
// (rules/investigation/replay-is-pinned), as one plain literal object with no
// method on it. Pure and synchronous throughout, so no fake timers or async
// handling is needed here; whether the factory module itself imports no
// framework, driver or provider client is proved separately by
// investigation-factory-modules.spec.ts, a fact about this module's own
// imports rather than about any input it is given at runtime.
import { expect, it } from 'vitest';
import type { Case, Hypothesis } from '../../../case/case.js';
import { InvestigationNotBuildableError } from '../../../errors/investigation-not-buildable.error.js';
import type { Assessment } from '../../../investigation/assessment.js';
import type { Cost } from '../../../investigation/cost.js';
import type { Durations } from '../../../investigation/durations.js';
import type { Evaluation } from '../../../investigation/evaluation.js';
import type { Evidence } from '../../../investigation/evidence.js';
import type { BuildInvestigationOptions } from '../../../investigation/investigation-factory.js';
import { buildInvestigation } from '../../../investigation/investigation-factory.js';
import type { Subject } from '../../../investigation/subject.js';

/** The pinned case's own three identifying attributes — reused by the fixture and by the pin assertions, so a typo in either cannot fake a pass. */
const CASE_SLUG = 'a-case';
const CASE_VERSION = 3;
const CASE_HASH = 'a-hash';

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

/** A whole Subject, defaulted so a test states only what it departs from. */
function aSubject(overrides: Partial<Subject> = {}): Subject {
  return { type: 'ont', id: 'subject-1', ...overrides };
}

/**
 * The whole BuildInvestigationOptions, valid by default — evidence covering
 * aCase()'s own collection plan exactly once per concept, evaluations
 * covering its required hypotheses exactly once each — so a test states only
 * what it departs from.
 */
function validOptions(overrides: Partial<BuildInvestigationOptions> = {}): BuildInvestigationOptions {
  return {
    id: 'investigation-1',
    requester: 'requester-1',
    ticket_ref: 'TICKET-1',
    narrative: 'the narrative the requester submitted',
    subject: aSubject(),
    case: aCase(),
    prompt_version: 'prompt-v1',
    model: 'model-x',
    evidence: [anEvidence('concept-a'), anEvidence('concept-b')],
    evaluations: [aConfirmedEvaluation('h1'), aConfirmedEvaluation('h2')],
    assessment: anAssessment(),
    cost: aCost(),
    durations: aDurations(),
    ...overrides,
  };
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
function violationsOf(options: BuildInvestigationOptions): readonly string[] {
  let refusal: unknown;
  try {
    buildInvestigation(options);
  } catch (error) {
    refusal = error;
  }
  if (!(refusal instanceof InvestigationNotBuildableError)) {
    throw new Error('expected the investigation-not-buildable refusal and the investigation built instead');
  }
  return refusal.context.violations;
}

// ---------------------------------------------------------------- criterion 1: evidence totality

it('refuses to build when a collection-plan concept has no matching evidence', () => {
  // Also exercises the inference that buildInvestigation() takes the whole
  // Case rather than pre-extracted names: collectionPlan(theCase) is what
  // supplies "concept-b" here, from the given case alone.
  const options = validOptions({ evidence: [anEvidence('concept-a')] }); // concept-b missing

  const violations = violationsOf(options);

  expect(violations).toEqual([noEvidenceViolation('concept-b')]);
});

it('refuses to build when an evidence entry names a concept the collection plan does not hold', () => {
  const options = validOptions({
    evidence: [anEvidence('concept-a'), anEvidence('concept-b'), anEvidence('concept-x')],
  });

  const violations = violationsOf(options);

  expect(violations).toEqual([extraneousEvidenceViolation('concept-x')]);
});

it('refuses to build when a collection-plan concept has more than one matching evidence entry', () => {
  const options = validOptions({
    evidence: [anEvidence('concept-a'), anEvidence('concept-a'), anEvidence('concept-b')],
  });

  const violations = violationsOf(options);

  expect(violations).toEqual([duplicateEvidenceViolation('concept-a', 2)]);
});

// ---------------------------------------------------------------- criterion 2: evaluation totality

it('refuses to build when a required hypothesis has no matching evaluation', () => {
  const options = validOptions({ evaluations: [aConfirmedEvaluation('h1')] }); // h2 missing

  const violations = violationsOf(options);

  expect(violations).toEqual([noEvaluationViolation('h2')]);
});

it('refuses to build when an evaluation names a hypothesis the case does not require', () => {
  const options = validOptions({
    evaluations: [aConfirmedEvaluation('h1'), aConfirmedEvaluation('h2'), aConfirmedEvaluation('h-foreign')],
  });

  const violations = violationsOf(options);

  expect(violations).toEqual([extraneousEvaluationViolation('h-foreign')]);
});

it('refuses to build when a required hypothesis has more than one matching evaluation', () => {
  const options = validOptions({
    evaluations: [aConfirmedEvaluation('h1'), aConfirmedEvaluation('h1'), aConfirmedEvaluation('h2')],
  });

  const violations = violationsOf(options);

  expect(violations).toEqual([duplicateEvaluationViolation('h1', 2)]);
});

// ------------------------------------------------- edge case: both totalities violated together

it('refuses once, naming every violation from both the evidence and the evaluation totality checks together', () => {
  const options = validOptions({
    evidence: [anEvidence('concept-a')], // concept-b missing
    evaluations: [aConfirmedEvaluation('h1')], // h2 missing
  });

  const violations = violationsOf(options);

  expect(violations).toEqual([noEvidenceViolation('concept-b'), noEvaluationViolation('h2')]);
});

// ---------------------------------------------------------------- criterion 3: replay pinning

it('pins the case by exactly slug, version and hash, never the whole case', () => {
  // Also exercises the two inferences behind pinned_case's own shape: a
  // nested { slug, version, hash } value rather than three flat fields, and
  // spelled pinned_case (snake_case) rather than pinnedCase.
  const investigation = buildInvestigation(validOptions());

  expect(investigation.pinned_case).toEqual({ slug: CASE_SLUG, version: CASE_VERSION, hash: CASE_HASH });
  expect(investigation.pinned_case).not.toHaveProperty('title');
  expect(investigation.pinned_case).not.toHaveProperty('hypotheses');
});

it('copies model, prompt_version and evidence straight from the given options, unchanged', () => {
  const evidence = [anEvidence('concept-a'), anEvidence('concept-b')];
  const options = validOptions({ model: 'model-y', prompt_version: 'prompt-v2', evidence });

  const investigation = buildInvestigation(options);

  expect(investigation.model).toBe('model-y');
  expect(investigation.prompt_version).toBe('prompt-v2');
  expect(investigation.evidence).toEqual(evidence);
});

// ---------------------------------------------------------------- criterion 4: a plain value, no method

it('answers a plain data object carrying no method, so nothing on the value itself could mutate it after construction', () => {
  const investigation = buildInvestigation(validOptions());

  expect(Object.getPrototypeOf(investigation)).toBe(Object.prototype);
  expect(Object.values(investigation).some((value) => typeof value === 'function')).toBe(false);
});

// ---------------------------------------------------- edge case: a valid build does not throw

it('does not throw when the evidence covers the collection plan and the evaluations cover the required hypotheses exactly once each', () => {
  const options = validOptions();

  expect(() => buildInvestigation(options)).not.toThrow();
});

// ---------------------------------------------------------- edge case: defensive copies

it('copies the given evidence array rather than holding onto it, so mutating the original array afterwards leaves the built value unchanged', () => {
  const evidence: Evidence[] = [anEvidence('concept-a'), anEvidence('concept-b')];
  const options = validOptions({ evidence });

  const investigation = buildInvestigation(options);
  evidence.push(anEvidence('concept-x'));

  expect(investigation.evidence).toHaveLength(2);
  expect(investigation.evidence.map((item) => item.concept)).toEqual(['concept-a', 'concept-b']);
});

it('copies the given evaluations array rather than holding onto it, so mutating the original array afterwards leaves the built value unchanged', () => {
  const evaluations: Evaluation[] = [aConfirmedEvaluation('h1'), aConfirmedEvaluation('h2')];
  const options = validOptions({ evaluations });

  const investigation = buildInvestigation(options);
  evaluations.push(aConfirmedEvaluation('h-foreign'));

  expect(investigation.evaluations).toHaveLength(2);
  expect(investigation.evaluations.map((item) => item.hypothesis)).toEqual(['h1', 'h2']);
});
