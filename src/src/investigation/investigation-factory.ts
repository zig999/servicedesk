import { collectionPlan, requiresEvaluationOf } from '../case/case-resolution.js';
import type { Case } from '../case/case.js';
import { InvestigationNotBuildableError } from '../errors/investigation-not-buildable.error.js';
import { SubjectAttributeNotInGlossaryError } from '../errors/subject-attribute-not-in-glossary.error.js';
import { WrittenAtRequiredError } from '../errors/written-at-required.error.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { Assessment } from './assessment.js';
import type { Cost } from './cost.js';
import type { Durations } from './durations.js';
import type { Evaluation } from './evaluation.js';
import type { Evidence } from './evidence.js';
import type { Investigation, PinnedCase } from './investigation.js';
import { buildSubject, type Subject } from './subject.js';
import type { SubjectAttributeValue } from './subject-attribute-value.js';

export type BuildInvestigationOptions = {
  readonly id: string;
  readonly requester: string;

  readonly ticket_ref?: string;
  readonly narrative: string;

  readonly subjectType: string;

  readonly subjectAttributes: readonly SubjectAttributeValue[];

  readonly case: Case;
  readonly prompt_version: string;
  readonly model: string;
  readonly evidence: readonly Evidence[];
  readonly evaluations: readonly Evaluation[];
  readonly assessment: Assessment;
  readonly cost: Cost;
  readonly durations: Durations;

  readonly written_at: string;

  readonly glossary: IGlossaryQuery;
};

export async function buildInvestigation(options: BuildInvestigationOptions): Promise<Investigation> {
  const { case: theCase, evidence, evaluations, subjectType, subjectAttributes, glossary } = options;
  refuseMissingWrittenAt(options.written_at);
  const subject = buildSubject(subjectType, subjectAttributes);
  await refuseAttributesNotInGlossary(subject, glossary);
  refuseTotalityViolations(theCase, evidence, evaluations);
  return {
    id: options.id,
    requester: options.requester,
    ticket_ref: options.ticket_ref,
    narrative: options.narrative,
    subject,
    pinned_case: pinnedCaseOf(theCase),
    prompt_version: options.prompt_version,
    model: options.model,
    evidence: [...evidence],
    evaluations: [...evaluations],
    assessment: options.assessment,
    cost: options.cost,
    durations: options.durations,
    written_at: options.written_at,
  };
}

export async function refuseAttributesNotInGlossary(subject: Subject, glossary: IGlossaryQuery): Promise<void> {
  const missing: string[] = [];
  for (const name of new Set(subject.attributes.map((pair) => pair.attribute))) {
    const resolution = await glossary.readVocabularyTerm('subject-attribute', name);
    if (!resolution.held) {
      missing.push(name);
    }
  }
  if (missing.length > 0) {
    throw new SubjectAttributeNotInGlossaryError(subject.type, missing);
  }
}

function refuseMissingWrittenAt(writtenAt: string | undefined): void {
  if (writtenAt === undefined) {
    throw new WrittenAtRequiredError(writtenAt);
  }
}

function pinnedCaseOf(theCase: Case): PinnedCase {
  return { slug: theCase.slug, version: theCase.version };
}

function refuseTotalityViolations(
  theCase: Case,
  evidence: readonly Evidence[],
  evaluations: readonly Evaluation[],
): void {
  const violations = [
    ...evidenceTotalityViolations(theCase, evidence),
    ...evaluationTotalityViolations(theCase, evaluations),
  ];
  if (violations.length > 0) {
    throw new InvestigationNotBuildableError(theCase.slug, violations);
  }
}

function evidenceTotalityViolations(theCase: Case, evidence: readonly Evidence[]): string[] {
  const plan = collectionPlan(theCase);
  const counts = countsByKey(evidence.map((item) => item.concept));
  const violations: string[] = [];
  for (const concept of plan) {
    const count = counts.get(concept) ?? 0;
    if (count === 0) {
      violations.push(`the collection plan's concept "${concept}" has no matching evidence`);
    } else if (count > 1) {
      violations.push(`the collection plan's concept "${concept}" has ${count} evidence entries; exactly one is required`);
    }
  }
  const planConcepts = new Set(plan);
  for (const concept of counts.keys()) {
    if (!planConcepts.has(concept)) {
      violations.push(`evidence names the concept "${concept}", which the collection plan does not hold`);
    }
  }
  return violations;
}

function evaluationTotalityViolations(theCase: Case, evaluations: readonly Evaluation[]): string[] {
  const required = requiresEvaluationOf(theCase);
  const counts = countsByKey(evaluations.map((item) => item.hypothesis));
  const violations: string[] = [];
  for (const name of required) {
    const count = counts.get(name) ?? 0;
    if (count === 0) {
      violations.push(`the required hypothesis "${name}" has no matching evaluation`);
    } else if (count > 1) {
      violations.push(`the required hypothesis "${name}" has ${count} evaluations; exactly one is required`);
    }
  }
  const requiredNames = new Set(required);
  for (const name of counts.keys()) {
    if (!requiredNames.has(name)) {
      violations.push(`an evaluation names the hypothesis "${name}", which the case does not require`);
    }
  }
  return violations;
}

function countsByKey(keys: readonly string[]): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const key of keys) {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
