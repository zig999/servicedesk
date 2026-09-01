import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import type {
  CapabilityResolution,
  ICapabilityQuery,
} from '../../../capability-registry/capability-query.port.js';
import type { Capability } from '../../../capability-registry/capability.js';
import type { Case, Hypothesis, ManifestEntry, Resolution } from '../../../case/case.js';
import { caseCoherenceViolations, validateCaseCoherence } from '../../../case/validate-case-coherence.js';
import { DuplicateConceptAnswerError } from '../../../errors/duplicate-concept-answer.error.js';
import { IncoherentCaseError } from '../../../errors/incoherent-case.error.js';
import type {
  ConceptResolution,
  IGlossaryQuery,
  TermResolution,
} from '../../../glossary/glossary-query.port.js';
import type { Concept, TermVocabulary } from '../../../glossary/terms.js';

const READ_ONLY = 'read-only';

const MUTATING = 'mutating';

const SUBJECT_CONTRACT = 'contract';
const SUBJECT_CUSTOMER = 'customer';

const CONCEPT = 'equipment-state';

const OUTCOME = 'issue-resolved';
const FALLBACK_OUTCOME = 'inconclusive';
const ACTION = 'notify-customer';
const FALLBACK_ACTION = 'escalate';
const RECIPIENT = 'support-queue';
const FALLBACK_RECIPIENT = 'escalation-queue';

const UNCONSULTED_CRITERION = 'prose the coherence checks never read';

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

  public async listVocabularyTerms(): Promise<never> {
    throw new Error('FakeGlossaryQuery.listVocabularyTerms is not scripted for this file');
  }

  public async listConcepts(): Promise<never> {
    throw new Error('FakeGlossaryQuery.listConcepts is not scripted for this file');
  }
}

function termKey(vocabulary: TermVocabulary, name: string): string {
  return `${vocabulary}:${name}`;
}

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

  public async listCapabilities(): Promise<never> {
    throw new Error('FakeCapabilityQuery.listCapabilities is not scripted for this file');
  }
}

function resolutionOf(outcome: string, action: string, recipient: string): Resolution {
  return { outcome, referral: { action, recipient } };
}

function hypothesisOf(name: string, collects: readonly string[], resolution: Resolution): Hypothesis {
  return { name, criterion: UNCONSULTED_CRITERION, collects, resolution };
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

function caseOf(overrides: Partial<Case> = {}): Case {
  const hypotheses =
    overrides.hypotheses ?? [hypothesisOf('h1', [CONCEPT], resolutionOf(OUTCOME, ACTION, RECIPIENT))];
  return {
    slug: 'a-case',
    title: 'A case',
    when_to_use: 'when a curator needs a case to test coherence over',
    version: 1,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: SUBJECT_CONTRACT,
    fallback: resolutionOf(FALLBACK_OUTCOME, FALLBACK_ACTION, FALLBACK_RECIPIENT),
    state: 'released',
    manifest: hypotheses.map((hypothesis, index) => manifestEntryOf(hypothesis, index + 1)),
    hypotheses,
    ...overrides,
  };
}

function coherentGlossary(): FakeGlossaryQuery {
  const glossary = new FakeGlossaryQuery();
  glossary.holdTerm('subject-type', SUBJECT_CONTRACT);
  glossary.holdTerm('outcome', OUTCOME);
  glossary.holdTerm('outcome', FALLBACK_OUTCOME);
  glossary.holdTerm('action', ACTION);
  glossary.holdTerm('action', FALLBACK_ACTION);
  glossary.holdTerm('recipient', RECIPIENT);
  glossary.holdTerm('recipient', FALLBACK_RECIPIENT);
  glossary.holdConcept({ name: CONCEPT, accepts: [SUBJECT_CONTRACT], ttl: 60, description: 'a fixture concept' });
  return glossary;
}

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

function coherentCapabilities(): FakeCapabilityQuery {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(coherentCapability());
  return capabilities;
}

function missingTermViolation(role: string, name: string): string {
  return `the ${role} "${name}" does not exist in the glossary`;
}

function missingConceptViolation(name: string): string {
  return `the concept "${name}" does not exist in the glossary`;
}

function mismatchViolation(concept: string, subject: string): string {
  return `the concept "${concept}" does not accept the subject type "${subject}" the case declares`;
}

function noCapabilityViolation(concept: string): string {
  return `no read-only capability currently answers the concept "${concept}"`;
}

function capabilityGapViolation(concept: string, lacks: string): string {
  return `the capability answering the concept "${concept}" ${lacks}`;
}

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

  const violations = await caseCoherenceViolations(theCase, glossary, coherentCapabilities());

  expect(violations).toEqual([missingConceptViolation(CONCEPT)]);
});

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

it('reads the capability registration as it stands at the moment of validation, not a remembered one', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();
  const capabilities = new FakeCapabilityQuery();

  await expect(validateCaseCoherence(theCase, glossary, capabilities)).rejects.toBeInstanceOf(
    IncoherentCaseError,
  );

  capabilities.hold(coherentCapability());

  await expect(validateCaseCoherence(theCase, glossary, capabilities)).resolves.toBeUndefined();
});

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

it('does not refuse a case that violates no coherence rule', async () => {
  const theCase = caseOf();

  await expect(
    validateCaseCoherence(theCase, coherentGlossary(), coherentCapabilities()),
  ).resolves.toBeUndefined();
});

it('names an absent term once no matter how many positions of the case name it', async () => {
  const theCase = caseOf({

    fallback: resolutionOf(FALLBACK_OUTCOME, ACTION, FALLBACK_RECIPIENT),
  });
  const glossary = coherentGlossary();
  glossary.forgetTerm('action', ACTION);

  const violations = await caseCoherenceViolations(theCase, glossary, coherentCapabilities());

  expect(violations).toEqual([missingTermViolation('action', ACTION)]);
});

it('names an unregistered concept once for the glossary and once for the capability, independently', async () => {
  const theCase = caseOf();
  const glossary = coherentGlossary();
  glossary.forgetConcept(CONCEPT);
  const capabilities = new FakeCapabilityQuery();

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
  glossary.forgetTerm('recipient', RECIPIENT);
  const capabilities = new FakeCapabilityQuery();

  const violations = await caseCoherenceViolations(theCase, glossary, capabilities);

  expect(violations).toEqual([
    missingTermViolation('recipient', RECIPIENT),
    missingConceptViolation('first-missing-concept'),
    missingConceptViolation('second-missing-concept'),
    noCapabilityViolation('first-missing-concept'),
    noCapabilityViolation('second-missing-concept'),
  ]);
});

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

async function moduleSource(): Promise<string> {
  return readFile(fileURLToPath(new URL('../../../case/validate-case-coherence.ts', import.meta.url)), 'utf8');
}

function docCommentBefore(source: string, marker: string): string {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`marker ${JSON.stringify(marker)} not found in source`);
  }
  const before = source.slice(0, markerIndex);
  const commentEnd = before.lastIndexOf('*/');
  const commentStart = before.lastIndexOf('/**', commentEnd);
  return before.slice(commentStart, commentEnd + 2);
}

function normalizedProse(commentBlock: string): string {
  return commentBlock
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s*\/\*\*\s?/, '')
        .replace(/^\s*\*\/\s*$/, '')
        .replace(/^\s*\*\s?/, '')
        .replace(/\s*\*\/\s*$/, '')
        .trim(),
    )
    .filter((line) => line.length > 0)
    .join(' ');
}

it("namedVocabularyTerms()'s doc comment cites domain/knowledge/case-version for the declared subject and the fallback's own resolution, not domain/knowledge/case", async () => {
  const comment = normalizedProse(docCommentBefore(await moduleSource(), 'function namedVocabularyTerms'));

  expect(comment).toContain('domain/knowledge/case-version');
  expect(comment).not.toMatch(/domain\/knowledge\/case(?!-version)/);
});

it("namedVocabularyTerms()'s doc comment cites domain/knowledge/hypothesis-revision for every hypothesis's own resolution, not domain/knowledge/hypothesis", async () => {
  const comment = normalizedProse(docCommentBefore(await moduleSource(), 'function namedVocabularyTerms'));

  expect(comment).toContain('domain/knowledge/hypothesis-revision');
  expect(comment).not.toMatch(/domain\/knowledge\/hypothesis(?!-revision)/);
});

it("conceptViolations()'s doc comment cites domain/knowledge/case-version for the case's own collection plan, not domain/knowledge/case", async () => {
  const comment = normalizedProse(docCommentBefore(await moduleSource(), 'async function conceptViolations'));

  expect(comment).toContain('domain/knowledge/case-version');
  expect(comment).not.toMatch(/domain\/knowledge\/case(?!-version)/);
});
