// Proof for task/case-authoring/author-case-version-command: authorCaseVersion stores a case
// version exactly when it holds against every structural and coherence rule, answering with its
// slug and version, and refuses once — naming every violated rule together — before anything is
// stored, whichever half (structural or coherence) produced the violations
// (rules/knowledge/validation-runs-at-every-read). All three ports this service composes —
// ICaseStore, IGlossaryQuery and ICapabilityQuery — are stood in for by small mutable in-memory
// fakes (contracts/knowledge/author-case-version, contracts/glossary/glossary-query,
// contracts/integration/capability-registry), the same fake shapes case-query.service.spec.ts's
// own proof already establishes for the read side (TST-03: a stand-in stands in for a boundary,
// never for business logic) — FakeCaseStore below additionally mimics the real store's own
// write-once refusal (rules/knowledge/a-case-version-is-written-once), since this service's own
// criterion 2 is exactly that it propagates that refusal rather than merging.
import { expect, it } from 'vitest';
import type { CapabilityResolution, ICapabilityQuery } from '../../../capability-registry/capability-query.port.js';
import type { Capability } from '../../../capability-registry/capability.js';
import { AuthorCaseVersionService } from '../../../case/author-case-version.service.js';
import type { ICaseStore, StoredCaseVersion } from '../../../case/case-store.port.js';
import { CaseNotValidError } from '../../../errors/case-not-valid.error.js';
import { CaseVersionAlreadyStoredError } from '../../../errors/case-version-already-stored.error.js';
import { DuplicateConceptAnswerError } from '../../../errors/duplicate-concept-answer.error.js';
import { InvalidCaseDocumentError } from '../../../errors/invalid-case-document.error.js';
import type { ConceptResolution, IGlossaryQuery, TermResolution } from '../../../glossary/glossary-query.port.js';
import type { Concept, TermVocabulary } from '../../../glossary/terms.js';

/** The fixture case's identity and the version every test addresses unless it says otherwise. */
const SLUG = 'a-case';
const VERSION = 1;

/** The fixture's subject type, accepted by the one concept the fixture case collects. */
const SUBJECT = 'contract';

/** The one concept the fixture case's one hypothesis collects. */
const CONCEPT = 'equipment-state';

/** The vocabulary terms the fixture names, each distinct from its fallback counterpart. */
const OUTCOME = 'issue-resolved';
const FALLBACK_OUTCOME = 'inconclusive';
const ACTION = 'notify-customer';
const FALLBACK_ACTION = 'escalate';
const RECIPIENT = 'support-queue';
const FALLBACK_RECIPIENT = 'escalation-queue';

/** The one nature that registers, spelled here rather than imported so a drift in the source fails. */
const READ_ONLY = 'read-only';

/**
 * A raw case document — every attribute parseCaseDocument requires — for a test to depart from
 * one attribute at a time. The same fixture shape case-query.service.spec.ts's own
 * validCaseDocument builds, since this task's own AuthorCaseVersionService is proven against the
 * same aggregate shape (case-and-investigation-model/case-aggregate-shape), only submitted rather
 * than read.
 */
function validCaseDocument(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    slug: SLUG,
    title: 'A case',
    when_to_use: 'when a curator submits a case version for author-case-version to store',
    version: VERSION,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: SUBJECT,
    fallback: {
      outcome: FALLBACK_OUTCOME,
      referral: { action: FALLBACK_ACTION, recipient: FALLBACK_RECIPIENT },
    },
    hypotheses: [
      {
        name: 'h1',
        position: 1,
        criterion: 'prose no check in this composition ever reads',
        collects: [CONCEPT],
        resolution: { outcome: OUTCOME, referral: { action: ACTION, recipient: RECIPIENT } },
      },
    ],
    ...overrides,
  };
}

/**
 * Stands in for the case-store boundary (contracts/knowledge/author-case-version): a mutable
 * holding, additionally mimicking the real store's own write-once refusal
 * (rules/knowledge/a-case-version-is-written-once) — the one piece of store behavior this
 * service's own criterion 2 depends on propagating rather than reimplementing. writeCalls
 * records every call this service actually made, so a test can assert nothing reached the store
 * at all (criterion 10).
 */
class FakeCaseStore implements ICaseStore {
  public readonly writeCalls: { slug: string; version: number; document: unknown }[] = [];
  private readonly versions = new Map<string, Set<number>>();

  public async writeVersion(slug: string, version: number, document: unknown): Promise<void> {
    this.writeCalls.push({ slug, version, document });
    const held = this.versions.get(slug) ?? new Set<number>();
    if (held.has(version)) {
      throw new CaseVersionAlreadyStoredError(slug, version);
    }
    held.add(version);
    this.versions.set(slug, held);
  }

  public async readVersion(): Promise<StoredCaseVersion | undefined> {
    return undefined;
  }

  public async listVersions(): Promise<readonly number[]> {
    return [];
  }
}

/** Stands in for the glossary boundary, the same fake shape validate-case-coherence.spec.ts and case-query.service.spec.ts already use. */
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

function termKey(vocabulary: TermVocabulary, name: string): string {
  return `${vocabulary}:${name}`;
}

/** Stands in for the capability-registry boundary, with an injectable failure for the propagation edge case. */
class FakeCapabilityQuery implements ICapabilityQuery {
  private readonly capabilities = new Map<string, Capability>();
  private readonly failures = new Map<string, Error>();

  public hold(capability: Capability): void {
    this.capabilities.set(capability.concept, capability);
  }

  public forget(concept: string): void {
    this.capabilities.delete(concept);
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

/** A glossary holding every term and the one concept the fixture case names, accepting only contract, with the ttl a registration stating none resolves to (rules/knowledge/a-collected-concept-declares-a-ttl). */
function coherentGlossary(): FakeGlossaryQuery {
  const glossary = new FakeGlossaryQuery();
  glossary.holdTerm('subject-type', SUBJECT);
  glossary.holdTerm('outcome', OUTCOME);
  glossary.holdTerm('outcome', FALLBACK_OUTCOME);
  glossary.holdTerm('action', ACTION);
  glossary.holdTerm('action', FALLBACK_ACTION);
  glossary.holdTerm('recipient', RECIPIENT);
  glossary.holdTerm('recipient', FALLBACK_RECIPIENT);
  glossary.holdConcept({ name: CONCEPT, accepts: [SUBJECT], ttl: 60 });
  return glossary;
}

/** A capability answering the fixture concept, declaring its whole contract. */
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

/** Reads a rejected promise's reason as an ordinary value, for asserting on a refusal's type and context. */
function readAsError(promise: Promise<unknown>): Promise<unknown> {
  return promise.catch((error: unknown) => error);
}

// -------------------------------------------------------------------------------- criterion 1

it('stores a submission of one valid case version and answers with its slug and version', async () => {
  const store = new FakeCaseStore();
  const service = new AuthorCaseVersionService(store, coherentGlossary(), coherentCapabilities());

  const result = await service.authorCaseVersion(validCaseDocument());

  expect(result).toEqual({ slug: SLUG, version: VERSION });
  expect(store.writeCalls).toHaveLength(1);
  expect(store.writeCalls[0]).toMatchObject({ slug: SLUG, version: VERSION });
});

// -------------------------------------------------------------------------------- criterion 2

it('refuses a submission naming a slug and version already stored, propagating the store\'s own write-once refusal rather than merging', async () => {
  const store = new FakeCaseStore();
  const service = new AuthorCaseVersionService(store, coherentGlossary(), coherentCapabilities());
  await service.authorCaseVersion(validCaseDocument());

  const refusal = await readAsError(service.authorCaseVersion(validCaseDocument()));

  expect(refusal).toBeInstanceOf(CaseVersionAlreadyStoredError);
  expect((refusal as CaseVersionAlreadyStoredError).context).toEqual({ slug: SLUG, version: VERSION });
});

// -------------------------------------------------------------------------------- criterion 3

it('does not refuse a submission that holds against every validator rule, even carrying an optional consolidation register', async () => {
  const store = new FakeCaseStore();
  const service = new AuthorCaseVersionService(store, coherentGlossary(), coherentCapabilities());

  const result = await service.authorCaseVersion(validCaseDocument({ consolidation_register: 'formal' }));

  expect(result).toEqual({ slug: SLUG, version: VERSION });
});

// -------------------------------------------------------------------------------- criterion 4

it('refuses a submission whose collected concept the glossary does not hold, naming the concept', async () => {
  const glossary = coherentGlossary();
  glossary.forgetConcept(CONCEPT);
  const store = new FakeCaseStore();
  const service = new AuthorCaseVersionService(store, glossary, coherentCapabilities());

  const refusal = await readAsError(service.authorCaseVersion(validCaseDocument()));

  expect(refusal).toBeInstanceOf(CaseNotValidError);
  expect((refusal as CaseNotValidError).context.violations).toEqual([
    `the concept "${CONCEPT}" does not exist in the glossary`,
  ]);
  expect(store.writeCalls).toEqual([]);
});

it('refuses a submission naming an outcome the glossary does not hold, naming the outcome', async () => {
  const glossary = coherentGlossary();
  glossary.forgetTerm('outcome', OUTCOME);
  const service = new AuthorCaseVersionService(new FakeCaseStore(), glossary, coherentCapabilities());

  const refusal = await readAsError(service.authorCaseVersion(validCaseDocument()));

  expect(refusal).toBeInstanceOf(CaseNotValidError);
  expect((refusal as CaseNotValidError).context.violations).toEqual([
    `the outcome "${OUTCOME}" does not exist in the glossary`,
  ]);
});

// -------------------------------------------------------------------------------- criterion 5

it('refuses a submission whose hypothesis collects a concept that does not accept the case\'s declared subject type, naming the concept and the subject type', async () => {
  const glossary = coherentGlossary();
  glossary.holdConcept({ name: CONCEPT, accepts: ['a-different-subject-type'], ttl: 60 });
  const store = new FakeCaseStore();
  const service = new AuthorCaseVersionService(store, glossary, coherentCapabilities());

  const refusal = await readAsError(service.authorCaseVersion(validCaseDocument()));

  expect(refusal).toBeInstanceOf(CaseNotValidError);
  expect((refusal as CaseNotValidError).context.violations).toEqual([
    `the concept "${CONCEPT}" does not accept the subject type "${SUBJECT}" the case declares`,
  ]);
  expect(store.writeCalls).toEqual([]);
});

// -------------------------------------------------------------------------------- criterion 6

it('refuses a submission whose collected concept has no registered read-only capability at all, naming the concept', async () => {
  const store = new FakeCaseStore();
  const service = new AuthorCaseVersionService(store, coherentGlossary(), new FakeCapabilityQuery());

  const refusal = await readAsError(service.authorCaseVersion(validCaseDocument()));

  expect(refusal).toBeInstanceOf(CaseNotValidError);
  expect((refusal as CaseNotValidError).context.violations).toEqual([
    `no read-only capability currently answers the concept "${CONCEPT}"`,
  ]);
  expect(store.writeCalls).toEqual([]);
});

it('refuses a submission whose collected concept\'s capability declares no output schema, naming the concept', async () => {
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(coherentCapability({ output_schema: '' }));
  const service = new AuthorCaseVersionService(new FakeCaseStore(), coherentGlossary(), capabilities);

  const refusal = await readAsError(service.authorCaseVersion(validCaseDocument()));

  expect((refusal as CaseNotValidError).context.violations).toEqual([
    `the capability answering the concept "${CONCEPT}" declares no output schema`,
  ]);
});

// -------------------------------------------------------------------------------- criterion 7

it('never refuses a submission on account of its collected concept\'s ttl, whether that ttl is the sixty-second default a registration stating none resolves to or a value a registration declares explicitly', async () => {
  const glossaryAtDefault = coherentGlossary(); // holds ttl: 60, the value a registration stating none resolves to
  const glossaryAtDeclaredValue = coherentGlossary();
  glossaryAtDeclaredValue.holdConcept({ name: CONCEPT, accepts: [SUBJECT], ttl: 3_600 });

  const atDefault = new AuthorCaseVersionService(new FakeCaseStore(), glossaryAtDefault, coherentCapabilities());
  const atDeclaredValue = new AuthorCaseVersionService(new FakeCaseStore(), glossaryAtDeclaredValue, coherentCapabilities());

  await expect(atDefault.authorCaseVersion(validCaseDocument())).resolves.toEqual({ slug: SLUG, version: VERSION });
  await expect(atDeclaredValue.authorCaseVersion(validCaseDocument())).resolves.toEqual({ slug: SLUG, version: VERSION });
});

// -------------------------------------------------------------------------------- criterion 8

it('answers the capability check from the registration as it stands at this submission, refusing a later submission once an earlier one\'s capability is no longer held', async () => {
  const store = new FakeCaseStore();
  const capabilities = coherentCapabilities();
  const service = new AuthorCaseVersionService(store, coherentGlossary(), capabilities);
  await expect(service.authorCaseVersion(validCaseDocument({ version: 1 }))).resolves.toEqual({
    slug: SLUG,
    version: 1,
  });

  capabilities.forget(CONCEPT);

  const refusal = await readAsError(service.authorCaseVersion(validCaseDocument({ version: 2 })));
  expect(refusal).toBeInstanceOf(CaseNotValidError);
  expect(store.writeCalls).toHaveLength(1); // the second, refused submission never reached the store
});

// -------------------------------------------------------------------------------- criterion 9

it('joins several coherence violations into the one CaseNotValidError, naming every one of them together', async () => {
  const glossary = coherentGlossary();
  glossary.forgetTerm('action', ACTION);
  glossary.forgetConcept(CONCEPT);
  const store = new FakeCaseStore();
  const service = new AuthorCaseVersionService(store, glossary, coherentCapabilities());

  const refusal = await readAsError(service.authorCaseVersion(validCaseDocument()));

  expect((refusal as CaseNotValidError).context.violations).toEqual([
    `the action "${ACTION}" does not exist in the glossary`,
    `the concept "${CONCEPT}" does not exist in the glossary`,
  ]);
  expect(store.writeCalls).toEqual([]);
});

it('joins several structural violations into the one InvalidCaseDocumentError, propagated unwrapped from the delegated structural validator', async () => {
  const store = new FakeCaseStore();
  const service = new AuthorCaseVersionService(store, coherentGlossary(), coherentCapabilities());

  const refusal = await readAsError(service.authorCaseVersion(validCaseDocument({ title: '', hypotheses: [] })));

  expect(refusal).toBeInstanceOf(InvalidCaseDocumentError);
  expect((refusal as InvalidCaseDocumentError).context.problems).toEqual([
    'title is empty',
    'the case declares no hypothesis',
  ]);
  expect(store.writeCalls).toEqual([]);
});

// ---------------------------------------------------- this task's own UNDERDETERMINED note: criterion 3's
// totality rests on the five candidate cross-context rules alone, and a command answering only those five
// while storing a structurally invalid case would pass every criterion as written. This test fails over
// exactly that candidate: a submission violating one of case-aggregate-shape's own structural rules outside
// the five candidates (a-hypothesis-name-is-unique-within-its-case) must still be refused here, never stored.

it(
  "refuses, through the delegated structural validator, a submission whose hypotheses share a declared " +
    'name — one of case-aggregate-shape\'s own structural rules, outside the five cross-context candidate ' +
    'rules, that this command must not bypass',
  async () => {
    const store = new FakeCaseStore();
    const service = new AuthorCaseVersionService(store, coherentGlossary(), coherentCapabilities());
    const document = validCaseDocument({
      hypotheses: [
        {
          name: 'shared-name',
          position: 1,
          criterion: 'first',
          collects: [CONCEPT],
          resolution: { outcome: OUTCOME, referral: { action: ACTION, recipient: RECIPIENT } },
        },
        {
          name: 'shared-name',
          position: 2,
          criterion: 'second',
          collects: [CONCEPT],
          resolution: { outcome: OUTCOME, referral: { action: ACTION, recipient: RECIPIENT } },
        },
      ],
    });

    const refusal = await readAsError(service.authorCaseVersion(document));

    expect(refusal).toBeInstanceOf(InvalidCaseDocumentError);
    expect((refusal as InvalidCaseDocumentError).context.problems).toEqual([
      'hypotheses 1, 2 share the name "shared-name"',
    ]);
    expect(store.writeCalls).toEqual([]);
  },
);

it(
  'names only the structural violations, never a coherence one, when a document fails both a structural ' +
    'rule and what would otherwise be a coherence rule — a document that fails to parse never reaches ' +
    'the coherence checks',
  async () => {
    const glossary = coherentGlossary();
    glossary.forgetConcept(CONCEPT); // still collected by the one hypothesis, so a coherence violation exists to be missed if this ever reached it
    const store = new FakeCaseStore();
    const service = new AuthorCaseVersionService(store, glossary, coherentCapabilities());

    const refusal = await readAsError(service.authorCaseVersion(validCaseDocument({ title: '' })));

    expect(refusal).toBeInstanceOf(InvalidCaseDocumentError);
    expect(refusal).not.toBeInstanceOf(CaseNotValidError);
    expect((refusal as InvalidCaseDocumentError).context.problems).toEqual(['title is empty']);
    expect(store.writeCalls).toEqual([]);
  },
);

// -------------------------------------------------------------------------------- criterion 10

it('never calls into the store when a submission is refused for a structural violation', async () => {
  const store = new FakeCaseStore();
  const service = new AuthorCaseVersionService(store, coherentGlossary(), coherentCapabilities());

  await readAsError(service.authorCaseVersion(validCaseDocument({ hypotheses: [] })));

  expect(store.writeCalls).toEqual([]);
});

it('never calls into the store when a submission is refused for a coherence violation', async () => {
  const glossary = coherentGlossary();
  glossary.forgetConcept(CONCEPT);
  const store = new FakeCaseStore();
  const service = new AuthorCaseVersionService(store, glossary, coherentCapabilities());

  await readAsError(service.authorCaseVersion(validCaseDocument()));

  expect(store.writeCalls).toEqual([]);
});

// ---------------------------------------------------- inference: the document arrives as unknown and is parsed here

it('parses and validates the submitted document itself, refusing a document that is not one JSON object structurally rather than assuming a typed Case', async () => {
  const service = new AuthorCaseVersionService(new FakeCaseStore(), coherentGlossary(), coherentCapabilities());

  const refusal = await readAsError(service.authorCaseVersion('not an object at all'));

  expect(refusal).toBeInstanceOf(InvalidCaseDocumentError);
  expect((refusal as InvalidCaseDocumentError).context.problems).toEqual(['the document is not one JSON object']);
});

// ---------------------------------------------------- inference: the declared slug stands in for the file name, whatever it is

it('never refuses on the slug/file-name rule, whatever slug the document declares, since the file-name stand-in is built from that same slug', async () => {
  const slug = 'a-slug-of-any-shape-at-all';
  const service = new AuthorCaseVersionService(new FakeCaseStore(), coherentGlossary(), coherentCapabilities());

  const result = await service.authorCaseVersion(validCaseDocument({ slug }));

  expect(result).toEqual({ slug, version: VERSION });
});

// ---------------------------------------------------- inference: the canonically-parsed case travels into storage, not the raw document

it('passes the canonically-parsed case into the store, not the raw submitted document, so nothing undeclared travels into storage', async () => {
  const store = new FakeCaseStore();
  const service = new AuthorCaseVersionService(store, coherentGlossary(), coherentCapabilities());
  const document = { ...validCaseDocument(), extraneous: 'must never travel into storage' };

  await service.authorCaseVersion(document);

  expect(store.writeCalls[0]?.document).not.toHaveProperty('extraneous');
});

// ---------------------------------------------------- edge case: an upstream dependency failing with something other than a coherence violation

it('lets a capability-registry integrity failure reach the caller rather than becoming a coherence violation of the case', async () => {
  const capabilities = new FakeCapabilityQuery();
  const failure = new DuplicateConceptAnswerError(CONCEPT, [
    { name: 'a-capability', version: '1.0.0' },
    { name: 'another-capability', version: '1.0.0' },
  ]);
  capabilities.failOn(CONCEPT, failure);
  const store = new FakeCaseStore();
  const service = new AuthorCaseVersionService(store, coherentGlossary(), capabilities);

  await expect(service.authorCaseVersion(validCaseDocument())).rejects.toBe(failure);
  expect(store.writeCalls).toEqual([]);
});
