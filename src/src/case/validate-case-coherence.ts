import type {
  CapabilityResolution,
  ICapabilityQuery,
} from '../capability-registry/capability-query.port.js';
import { READ_ONLY_NATURE } from '../capability-registry/capability.js';
import { IncoherentCaseError } from '../errors/incoherent-case.error.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { TermVocabulary } from '../glossary/terms.js';
import { collectionPlan } from './case-resolution.js';
import type { Case, Resolution } from './case.js';

const VOCABULARY_ROLES: Readonly<Record<TermVocabulary, string>> = {
  'subject-type': 'subject type',

  'subject-attribute': 'subject attribute',
  outcome: 'outcome',
  action: 'action',
  recipient: 'recipient',
};

type NamedTerm = {
  readonly vocabulary: TermVocabulary;
  readonly name: string;
};

export async function caseCoherenceViolations(
  theCase: Case,
  glossary: IGlossaryQuery,
  capabilities: ICapabilityQuery,
): Promise<readonly string[]> {
  return [
    ...(await vocabularyViolations(theCase, glossary)),
    ...(await conceptViolations(theCase, glossary)),
    ...(await capabilityViolations(theCase, capabilities)),
  ];
}

export async function validateCaseCoherence(
  theCase: Case,
  glossary: IGlossaryQuery,
  capabilities: ICapabilityQuery,
): Promise<void> {
  const violations = await caseCoherenceViolations(theCase, glossary, capabilities);
  if (violations.length > 0) {
    throw new IncoherentCaseError(theCase.slug, violations);
  }
}

async function vocabularyViolations(theCase: Case, glossary: IGlossaryQuery): Promise<string[]> {
  const violations: string[] = [];
  for (const { vocabulary, name } of namedVocabularyTerms(theCase)) {
    const resolution = await glossary.readVocabularyTerm(vocabulary, name);
    if (!resolution.held) {
      violations.push(`the ${VOCABULARY_ROLES[vocabulary]} "${name}" does not exist in the glossary`);
    }
  }
  return violations;
}

function namedVocabularyTerms(theCase: Case): readonly NamedTerm[] {
  const resolutions = declaredResolutions(theCase);
  return [
    { vocabulary: 'subject-type', name: theCase.subject },
    ...termsOf('outcome', resolutions.map((resolution) => resolution.outcome)),
    ...termsOf('action', resolutions.map((resolution) => resolution.referral.action)),
    ...termsOf('recipient', resolutions.map((resolution) => resolution.referral.recipient)),
  ];
}

function declaredResolutions(theCase: Case): readonly Resolution[] {
  return [...theCase.hypotheses.map((hypothesis) => hypothesis.resolution), theCase.fallback];
}

function termsOf(vocabulary: TermVocabulary, names: readonly string[]): readonly NamedTerm[] {
  return [...new Set(names)].map((name) => ({ vocabulary, name }));
}

async function conceptViolations(theCase: Case, glossary: IGlossaryQuery): Promise<string[]> {
  const violations: string[] = [];
  for (const name of collectionPlan(theCase)) {
    const resolution = await glossary.readConcept(name);
    if (!resolution.held) {
      violations.push(`the concept "${name}" does not exist in the glossary`);
    } else if (!resolution.concept.accepts.includes(theCase.subject)) {
      violations.push(
        `the concept "${name}" does not accept the subject type "${theCase.subject}" the case declares`,
      );
    }
  }
  return violations;
}

async function capabilityViolations(
  theCase: Case,
  capabilities: ICapabilityQuery,
): Promise<string[]> {
  const violations: string[] = [];
  for (const name of collectionPlan(theCase)) {
    violations.push(...answerGaps(name, await capabilities.readCapability(name)));
  }
  return violations;
}

function answerGaps(concept: string, resolution: CapabilityResolution): string[] {
  if (!resolution.held) {
    return [`no read-only capability currently answers the concept "${concept}"`];
  }
  const { capability } = resolution;
  const gaps: string[] = [];
  if (capability.nature !== READ_ONLY_NATURE) {
    gaps.push(answeringGap(concept, 'is not read-only'));
  }
  if (!declaresText(capability.output_schema)) {
    gaps.push(answeringGap(concept, 'declares no output schema'));
  }
  if (!declaresTimeout(capability.timeout)) {
    gaps.push(answeringGap(concept, 'declares no timeout'));
  }
  return gaps;
}

function answeringGap(concept: string, lacks: string): string {
  return `the capability answering the concept "${concept}" ${lacks}`;
}

function declaresText(value: unknown): boolean {
  return typeof value === 'string' && value !== '';
}

function declaresTimeout(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value);
}
