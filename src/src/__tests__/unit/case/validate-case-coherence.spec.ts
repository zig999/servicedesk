// Proof for the coherence rules a structurally valid case answers to at
// reading (task/case-model/case-coherence-validation): every named term
// exists in the glossary (rules/knowledge/case-terms-exist-in-the-glossary),
// every collected concept accepts the declared subject type
// (rules/knowledge/a-concept-accepts-the-declared-subject-type,
// scenarios/knowledge/a-subject-mismatch-refuses-the-case), every collected
// concept is answered by a current read-only capability declaring its
// contract (rules/knowledge/every-collected-concept-has-a-read-only-capability),
// the capability check reads the registration as it stands right now
// (rules/knowledge/the-contract-check-reads-the-current-registration), and a
// case violating several rules is refused once with every violation named
// (contracts/system/case-authoring, scoped here to coherence over a
// structurally valid case — the joint refusal that also carries structural
// problems is read-case's own proof; caseCoherenceViolations resolving
// rather than throwing, exercised throughout this file, is what lets that
// composition exist). Both ports are stood in for by small mutable
// in-memory fakes (contracts/knowledge/vocabulary-terms,
// contracts/knowledge/capability-check) — never the glossary or capability
// registry services — so the checks are proven against the published reads
// alone.
import { expect, it } from 'vitest';
import type {
  CapabilityResolution,
  ICapabilityQuery,
} from '../../../capability-registry/capability-query.port.js';
import type { Capability } from '../../../capability-registry/capability.js';
import type { Case, Hypothesis, Resolution } from '../../../case/case.js';
import { caseCoherenceViolations, validateCaseCoherence } from '../../../case/validate-case-coherence.js';
import { DuplicateConceptAnswerError } from '../../../errors/duplicate-concept-answer.error.js';
import { IncoherentCaseError } from '../../../errors/incoherent-case.error.js';
import type {
  ConceptResolution,
  IGlossaryQuery,
  TermResolution,
} from '../../../glossary/glossary-query.port.js';
import type { Concept, TermVocabulary } from '../../../glossary/terms.js';

/** The one nature that registers, spelled here rather than imported so a drift in the source fails. */
const READ_ONLY = 'read-only';
/** The nature the registry never lets answer a concept, for the capability-gap tests. */
const MUTATING = 'mutating';

/** The fixture's subject types: the accepted one, and the one the scenario's mismatch declares. */
const SUBJECT_CONTRACT = 'contract';
const SUBJECT_CUSTOMER = 'customer';

/** The one concept every fixture case collects, unless a test departs from it. */
const CONCEPT = 'equipment-state';

/** The vocabulary terms the coherent fixture names, each distinct from its fallback counterpart. */
const OUTCOME = 'issue-resolved';
const FALLBACK_OUTCOME = 'inconclusive';
const ACTION = 'notify-customer';
const FALLBACK_ACTION = 'escalate';
const RECIPIENT = 'support-queue';
const FALLBACK_RECIPIENT = 'escalation-queue';

/** The prose a hypothesis carries that no coherence check ever reads. */
const UNCONSULTED_CRITERION = 'prose the coherence checks never read';

/**
 * Stands in for the glossary boundary (contracts/knowledge/vocabulary-terms):
 * a holding a test seeds and un-seeds directly, so a term or a concept the
 * glossary does not hold is exactly what the test says it is — never derived
 * from a real store.
 */
class FakeGlossaryQuery implements IGlossaryQuery {
  private readonly terms = new Set<string>();
  private readonly concepts = new Map<string, Concept>();

  public holdTerm(vocabulary: TermVocabulary, name: string): void {
    this.terms.add(termKey(vocabulary, name));
  }

  public forgetTerm(vocabulary: TermVocabulary, name: string): void {
    this.terms.delete(termKey(vocabulary, name));
  }

  public holdConcept(concept: Concept): void {
    this.concepts.set(concept.name, concept);
  }

  public forgetConcept(name: string): void {
    this.concepts.delete(name);
  }

  public async readVocabularyTerm(vocabulary: TermVocabulary, name: string): Promise<TermResolution> {
    return this.terms.has(termKey(vocabulary, name))
      ? { held: true, term: { name } }
      : { held: false, vocabulary, name };
  }

  public async readConcept(name: string): Promise<ConceptResolution> {
    const concept = this.concepts.get(name);
    return concept === undefined ? { held: false, name } : { held: true, concept };
  }
}

/** The one key a term is held or forgotten under: its vocabulary paired with its name. */
function termKey(vocabulary: TermVocabulary, name: string): string {
  return `${vocabulary}:${name}`;
}

/**
 * Stands in for the capability-registry boundary
 * (contracts/knowledge/capability-check): a mutable holding, so criterion 4
 * can validate the same case before and after a registration changes what
 * the port answers, and an injectable failure, so an upstream integrity
 * error can be observed reaching the caller rather than becoming a
 * violation of the case.
 */
class FakeCapabilityQuery implements ICapabilityQuery {
  private readonly capabilities = new Map<string, Capability>();
  private readonly failures = new Map<string, Error>();

  public hold(capability: Capability): void {
    this.capabilities.set(capability.concept, capability);
  }

  public failOn(concept: string, failure: Error): void {
    this.failures.set(concept, failure);
  }

  public async readCapability(concept: string): Promise<CapabilityResolution> {
    const failure = this.failures.get(concept);
    if (failure !== undefined) {
      throw failure;
    }
    const capability = this.capabilities.get(concept);
    return capability === undefined ? { held: false, concept } : { held: true, capability };
  }
}

/** One resolution as the aggregate holds it: an outcome paired with its referral. */
function resolutionOf(outcome: string, action: string, recipient: string): Resolution {
  return { outcome, referral: { action, recipient } };
}

/** One hypothesis carrying exactly what the coherence checks consult. */
function hypothesisOf(name: string, collects: readonly string[], resolution: Resolution): Hypothesis {
  return { name, criterion: UNCONSULTED_CRITERION, collects, resolution };
}

/**
 * A structurally valid case declaring subject contract, one hypothesis
 * collecting the one fixture concept, and a fallback naming its own
 * distinct terms — every attribute the coherence checks read, for a test to
 * depart from one at a time.
 */
function caseOf(overrides: Partial<Case> = {}): Case {
  return {
    slug: 'a-case',
    title: 'A case',
    when_to_use: 'when a curator needs a case to test coherence over',
    version: 1,
    hash: 'deadbeef',
    subject: SUBJECT_CONTRACT,
    fallback: resolutionOf(FALLBACK_OUTCOME, FALLBACK_ACTION, FALLBACK_RECIPIENT),
    hypotheses: [hypothesisOf('h1', [CONCEPT], resolutionOf(OUTCOME, ACTION, RECIPIENT))],
    ...overrides,
  };
}

/** A glossary holding every term and the one concept the fixture case names, accepting only contract. */
function coherentGlossary(): FakeGlossaryQuery {
  const glossary = new FakeGlossaryQuery();
  glossary.holdTerm('subject-type', SUBJECT_CONTRACT);
  glossary.holdTerm('outcome', OUTCOME);
  glossary.holdTerm('outcome', FALLBACK_OUTCOME);
  glossary.holdTerm('action', ACTION);
  glossary.holdTerm('action', FALLBACK_ACTION);
  glossary.holdTerm('recipient', RECIPIENT);
  glossary.holdTerm('recipient', FALLBACK_RECIPIENT);
  glossary.holdConcept({ name: CONCEPT, accepts: [SUBJECT_CONTRACT], ttl: 60 });
  return glossary;
}

/** A capability answering the fixture concept, declaring its whole contract, for tests to depart from. */
function coherentCapability(overrides: Partial<Capability> = {}): Capability {
  return {
    name: 'equipment-state-reader',
    version: '1.0.0',
    nature: READ_ONLY,
    input_schema: 'an-input-schema',
    output_schema: 'an-output-schema',
    timeout: 5_000,
    connector: 'a-connector',
    concept: CONCEPT,
    ...overrides,
  };
}

/** A registry answering the fixture concept with a complete, current, read-only capability. */
function coherentCapabilities(): FakeCapabilityQuery {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(coherentCapability());
  return capabilities;
}

/** How a refusal names a vocabulary term the glossary does not hold, exactly as the module states it. */
function missingTermViolation(role: string, name: string): string {
  return `the ${role} "${name}" does not exist in the glossary`;
}

/** How a refusal names a collected concept the glossary does not hold, exactly as the module states it. */
function missingConceptViolation(name: string): string {
  return `the concept "${name}" does not exist in the glossary`;
}

/** How a refusal names a concept whose accepted subjects disagree with the declared one. */
function mismatchViolation(concept: string, subject: string): string {
  return `the concept "${concept}" does not accept the subject type "${subject}" the case declares`;
}

/** How a refusal names a concept no capability currently answers at all. */
function noCapabilityViolation(concept: string): string {
  return `no read-only capability currently answers the concept "${concept}"`;
}

/** How a refusal names a concept whose answering capability departs from the declared contract. */
function capabilityGapViolation(concept: string, lacks: string): string {
  return `the capability answering the concept "${concept}" ${lacks}`;
}

// ---------------------------------------------------------------- criterion 1: terms exist in the glossary

it('refuses a case naming a subject type the glossary does not hold, naming the term', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();
  glossary.forgetTerm('subject-type', SUBJECT_CONTRACT);

  const violations = await caseCoherenceViolations(theCase, glossary, coherentCapabilities());

  expect(violations).toEqual([missingTermViolation('subject type', SUBJECT_CONTRACT)]);
});

it('refuses a case naming an outcome the glossary does not hold, naming the term', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();
  glossary.forgetTerm('outcome', OUTCOME);

  const violations = await caseCoherenceViolations(theCase, glossary, coherentCapabilities());

  expect(violations).toEqual([missingTermViolation('outcome', OUTCOME)]);
});

it('refuses a case naming an action the glossary does not hold, naming the term', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();
  glossary.forgetTerm('action', ACTION);

  const violations = await caseCoherenceViolations(theCase, glossary, coherentCapabilities());

  expect(violations).toEqual([missingTermViolation('action', ACTION)]);
});

it('refuses a case naming a recipient the glossary does not hold, naming the term', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();
  glossary.forgetTerm('recipient', RECIPIENT);

  const violations = await caseCoherenceViolations(theCase, glossary, coherentCapabilities());

  expect(violations).toEqual([missingTermViolation('recipient', RECIPIENT)]);
});

it('refuses a case collecting a concept the glossary does not hold, naming the concept', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();
  glossary.forgetConcept(CONCEPT);

  // The capability registry still answers the concept, so the only
  // violation this case can hold is the concept's absence from the
  // glossary — isolating criterion 1 from criterion 3.
  const violations = await caseCoherenceViolations(theCase, glossary, coherentCapabilities());

  expect(violations).toEqual([missingConceptViolation(CONCEPT)]);
});

// ------------------------------------------- criterion 2: a concept accepts the declared subject type

it(
  'refuses a case whose collected concept does not accept the declared subject type, naming both ' +
    '(scenarios/knowledge/a-subject-mismatch-refuses-the-case)',
  async () => {
    const theCase = caseOf({ subject: SUBJECT_CUSTOMER });
    const glossary = coherentGlossary();
    glossary.holdTerm('subject-type', SUBJECT_CUSTOMER);

    const violations = await caseCoherenceViolations(theCase, glossary, coherentCapabilities());

    expect(violations).toEqual([mismatchViolation(CONCEPT, SUBJECT_CUSTOMER)]);
  },
);

// --------------------------------------- criterion 3: every collected concept has a read-only capability

it('refuses a case collecting a concept no capability currently answers, naming the concept', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();

  const violations = await caseCoherenceViolations(theCase, glossary, new FakeCapabilityQuery());

  expect(violations).toEqual([noCapabilityViolation(CONCEPT)]);
});

it('refuses a case whose collected concept is answered only by a mutating capability, naming the concept', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(coherentCapability({ nature: MUTATING }));

  const violations = await caseCoherenceViolations(theCase, glossary, capabilities);

  expect(violations).toEqual([capabilityGapViolation(CONCEPT, 'is not read-only')]);
});

it('refuses a case whose answering capability declares no output schema, naming the concept', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(coherentCapability({ output_schema: '' }));

  const violations = await caseCoherenceViolations(theCase, glossary, capabilities);

  expect(violations).toEqual([capabilityGapViolation(CONCEPT, 'declares no output schema')]);
});

it('refuses a case whose answering capability declares a non-integer timeout, naming the concept', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(coherentCapability({ timeout: 5_000.5 }));

  const violations = await caseCoherenceViolations(theCase, glossary, capabilities);

  expect(violations).toEqual([capabilityGapViolation(CONCEPT, 'declares no timeout')]);
});

// -------------------------------------------- criterion 4: reads the current registration, not a memory

it('reads the capability registration as it stands at the moment of validation, not a remembered one', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();
  const capabilities = new FakeCapabilityQuery(); // nothing registered yet

  await expect(validateCaseCoherence(theCase, glossary, capabilities)).rejects.toBeInstanceOf(
    IncoherentCaseError,
  );

  capabilities.hold(coherentCapability()); // the concept registers between the two readings

  await expect(validateCaseCoherence(theCase, glossary, capabilities)).resolves.toBeUndefined();
});

// --------------------------------------------------- criterion 5: several violations, refused once

it('refuses a case violating several coherence rules at once, naming every violation', async () => {
  const theCase = caseOf({ subject: SUBJECT_CUSTOMER });
  const glossary = coherentGlossary();
  glossary.holdTerm('subject-type', SUBJECT_CUSTOMER);
  glossary.forgetTerm('action', ACTION);
  const capabilities = new FakeCapabilityQuery();

  const refusal = await validateCaseCoherence(theCase, glossary, capabilities).catch(
    (error: unknown) => error,
  );

  expect(refusal).toBeInstanceOf(IncoherentCaseError);
  expect((refusal as IncoherentCaseError).context).toEqual({
    slug: theCase.slug,
    violations: [
      missingTermViolation('action', ACTION),
      mismatchViolation(CONCEPT, SUBJECT_CUSTOMER),
      noCapabilityViolation(CONCEPT),
    ],
  });
});

// --------------------------------------------------- criterion 6: no coherence violation, no refusal

it('does not refuse a case that violates no coherence rule', async () => {
  const theCase = caseOf();

  await expect(
    validateCaseCoherence(theCase, coherentGlossary(), coherentCapabilities()),
  ).resolves.toBeUndefined();
});

// -------------------------------------------------------------- named-term deduplication (inference)

it('names an absent term once no matter how many positions of the case name it', async () => {
  const theCase = caseOf({
    // The fallback now names the same absent action as the one hypothesis.
    fallback: resolutionOf(FALLBACK_OUTCOME, ACTION, FALLBACK_RECIPIENT),
  });
  const glossary = coherentGlossary();
  glossary.forgetTerm('action', ACTION);

  const violations = await caseCoherenceViolations(theCase, glossary, coherentCapabilities());

  expect(violations).toEqual([missingTermViolation('action', ACTION)]);
});

// -------------------------------------------------- rule independence and stable order (inferences)

it('names an unregistered concept once for the glossary and once for the capability, independently', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();
  glossary.forgetConcept(CONCEPT);
  const capabilities = new FakeCapabilityQuery(); // answers nothing either

  const violations = await caseCoherenceViolations(theCase, glossary, capabilities);

  expect(violations).toEqual([missingConceptViolation(CONCEPT), noCapabilityViolation(CONCEPT)]);
});

it("answers violations in the case's declared order — vocabulary terms, then concepts, then capabilities, each in the order named", async () => {
  const theCase = caseOf({
    hypotheses: [
      hypothesisOf(
        'h1',
        ['first-missing-concept', 'second-missing-concept'],
        resolutionOf(OUTCOME, ACTION, RECIPIENT),
      ),
    ],
  });
  const glossary = coherentGlossary();
  glossary.forgetTerm('recipient', RECIPIENT); // one vocabulary violation
  const capabilities = new FakeCapabilityQuery(); // both concepts unanswered

  const violations = await caseCoherenceViolations(theCase, glossary, capabilities);

  expect(violations).toEqual([
    missingTermViolation('recipient', RECIPIENT),
    missingConceptViolation('first-missing-concept'),
    missingConceptViolation('second-missing-concept'),
    noCapabilityViolation('first-missing-concept'),
    noCapabilityViolation('second-missing-concept'),
  ]);
});

// --------------------------- an upstream registry integrity failure propagates (inference, edge case)

it('lets a duplicate-concept-answer failure from the capability port reach the caller rather than becoming a violation of the case', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();
  const capabilities = new FakeCapabilityQuery();
  const failure = new DuplicateConceptAnswerError(CONCEPT, [
    { name: 'a-capability', version: '1.0.0' },
    { name: 'another-capability', version: '1.0.0' },
  ]);
  capabilities.failOn(CONCEPT, failure);

  await expect(caseCoherenceViolations(theCase, glossary, capabilities)).rejects.toBe(failure);
});
