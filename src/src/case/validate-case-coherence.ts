// The coherence rules a structurally valid case answers to at reading
// (contracts/system/case-authoring): every term it names exists in the
// glossary (rules/knowledge/case-terms-exist-in-the-glossary), every
// collected concept accepts the declared subject type
// (rules/knowledge/a-concept-accepts-the-declared-subject-type), and every
// collected concept is answered by a current read-only capability that
// declares its contract
// (rules/knowledge/every-collected-concept-has-a-read-only-capability). The
// checks reach the two upstream contexts only through the published query
// ports (contracts/knowledge/vocabulary-terms,
// contracts/knowledge/capability-check), so this module imports no
// framework, no driver and no client and stays testable against port fakes
// (constraints/the-domain-depends-on-no-infrastructure).

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

/**
 * How a refusal names each term vocabulary's role in the case
 * (rules/knowledge/case-terms-exist-in-the-glossary).
 */
const VOCABULARY_ROLES: Readonly<Record<TermVocabulary, string>> = {
  'subject-type': 'subject type',
  outcome: 'outcome',
  action: 'action',
  recipient: 'recipient',
};

/** One term the case names, by the vocabulary that must hold it. */
type NamedTerm = {
  readonly vocabulary: TermVocabulary;
  readonly name: string;
};

/**
 * Every coherence violation one structurally valid case holds against the
 * glossary and the capability registry as both stand on this call, collected
 * whole so a reading refuses the case once, with every violation named
 * (contracts/system/case-authoring) — and exported on its own so the reading
 * that also holds structural problems can join both lists into one refusal.
 * An empty answer is a case violating no coherence rule, which these checks
 * never refuse.
 */
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

/**
 * Refuses a case violating any coherence rule, once, with every violation
 * named in the one typed error (contracts/system/case-authoring), and lets
 * a case violating none pass untouched.
 */
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

/**
 * How the case departs from the published language
 * (rules/knowledge/case-terms-exist-in-the-glossary): every named vocabulary
 * term the glossary does not hold at this reading, each refusal naming the
 * term — resolved through the port's read-vocabulary-term on every call
 * (contracts/knowledge/vocabulary-terms), so the answer is the glossary's
 * current holding.
 */
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

/**
 * Every term the case names against the four term vocabularies, each
 * distinct name once: the declared subject, and every outcome, action and
 * recipient of every declared resolution — the hypotheses' and the
 * fallback's alike (domain/knowledge/case, domain/knowledge/hypothesis,
 * domain/knowledge/resolution, domain/knowledge/referral).
 */
function namedVocabularyTerms(theCase: Case): readonly NamedTerm[] {
  const resolutions = declaredResolutions(theCase);
  return [
    { vocabulary: 'subject-type', name: theCase.subject },
    ...termsOf('outcome', resolutions.map((resolution) => resolution.outcome)),
    ...termsOf('action', resolutions.map((resolution) => resolution.referral.action)),
    ...termsOf('recipient', resolutions.map((resolution) => resolution.referral.recipient)),
  ];
}

/** Every resolution the case declares: each hypothesis's in declared order, then the fallback's. */
function declaredResolutions(theCase: Case): readonly Resolution[] {
  return [...theCase.hypotheses.map((hypothesis) => hypothesis.resolution), theCase.fallback];
}

/** One vocabulary's named terms, each distinct name once, in first-named order. */
function termsOf(vocabulary: TermVocabulary, names: readonly string[]): readonly NamedTerm[] {
  return [...new Set(names)].map((name) => ({ vocabulary, name }));
}

/**
 * How the case's collected concepts depart from the glossary, each distinct
 * concept read once through the port's read-concept — deduplicated the way
 * the case's own collection plan deduplicates them (domain/knowledge/case):
 * a concept the glossary does not hold is named
 * (rules/knowledge/case-terms-exist-in-the-glossary), and a held concept
 * whose accepts does not carry the declared subject type is named with both
 * disagreeing terms
 * (rules/knowledge/a-concept-accepts-the-declared-subject-type,
 * scenarios/knowledge/a-subject-mismatch-refuses-the-case).
 */
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

/**
 * How the case's collected concepts depart from the capability registry
 * (rules/knowledge/every-collected-concept-has-a-read-only-capability), each
 * distinct concept resolved through the port's read-capability inside this
 * very call and never remembered between calls
 * (rules/knowledge/the-contract-check-reads-the-current-registration,
 * contracts/knowledge/capability-check) — so the same case refused before a
 * capability registers is answered by that registration at the next reading.
 */
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

/**
 * How one concept's current answer departs from what the rule demands: a
 * capability answering at all, read-only, and declaring an output schema and
 * a timeout (rules/knowledge/every-collected-concept-has-a-read-only-capability)
 * — each clause asserted over what the resolved capability itself declares,
 * never assumed from what the registry refuses at registration.
 */
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

/** Names how the capability answering one concept departs from the declared contract. */
function answeringGap(concept: string, lacks: string): string {
  return `the capability answering the concept "${concept}" ${lacks}`;
}

/** Whether the resolved capability declares one textual attribute: present and non-empty, since an empty attribute declares nothing. */
function declaresText(value: unknown): boolean {
  return typeof value === 'string' && value !== '';
}

/** Whether the resolved capability declares its timeout: the integer count of milliseconds the capability element states (domain/integration/capability). */
function declaresTimeout(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value);
}
