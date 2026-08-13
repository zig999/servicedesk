// Proof for the knowledge context's one published read
// (task/case-store/read-case): read-case answers a case whole and pinned by
// content only while every structural and coherence rule holds for it right
// now, refusing otherwise with every violated rule of the half that produced
// them named together in the one CaseNotValidError; a case that validated
// once is refused again once the glossary or the capability registry it
// depends on stops satisfying it; replay-case answers a pinned version's
// exact content without running the coherence checks at all; and no
// publication gate exists anywhere in this composition — a version a store
// holds is a case at its very next read. All three ports this task composes
// — ICaseStore, IGlossaryQuery and ICapabilityQuery — are stood in for by
// small mutable in-memory fakes (contracts/knowledge/case-query,
// contracts/glossary/glossary-query, contracts/integration/capability-registry),
// never the file-backed services, so the composition is proven against the
// published reads alone.
import { expect, it } from 'vitest';
import type {
  CapabilityResolution,
  ICapabilityQuery,
} from '../../../capability-registry/capability-query.port.js';
import type { Capability } from '../../../capability-registry/capability.js';
import { CaseQueryService, replayCase } from '../../../case/case-query.service.js';
import type { ICaseStore, StoredCaseVersion } from '../../../case/case-store.port.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseNotValidError } from '../../../errors/case-not-valid.error.js';
import { DuplicateConceptAnswerError } from '../../../errors/duplicate-concept-answer.error.js';
import { IncoherentCaseError } from '../../../errors/incoherent-case.error.js';
import type {
  ConceptResolution,
  IGlossaryQuery,
  TermResolution,
} from '../../../glossary/glossary-query.port.js';
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
 * A raw case document — every attribute parseCaseDocument requires — for a
 * test to depart from one attribute at a time. Declares no hash at all: the
 * case aggregate no longer admits one
 * (task/case-and-investigation-model/case-aggregate-shape); the store's own
 * content-identity hash a StoredCaseVersion answers is a wholly separate
 * value, seeded explicitly through FakeCaseStore.seed's own second argument
 * throughout this file, which is why it is always given visibly distinct
 * values from anything here.
 */
function validCaseDocument(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    slug: SLUG,
    title: 'A case',
    when_to_use: 'when a curator needs a case to test read-case composition over',
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
 * Stands in for the case-store boundary (contracts/knowledge/case-query): a
 * mutable holding a test seeds directly, with an explicit hash independent
 * of the document's own content, so a test can tell whether read-case
 * answers exactly the hash this store attached to the version it read,
 * rather than a value read-case computed on its own.
 */
class FakeCaseStore implements ICaseStore {
  private readonly versions = new Map<string, Map<number, StoredCaseVersion>>();

  public seed(slug: string, version: number, stored: { document: unknown; hash: string }): void {
    const bySlug = this.versions.get(slug) ?? new Map<number, StoredCaseVersion>();
    bySlug.set(version, stored);
    this.versions.set(slug, bySlug);
  }

  public async writeVersion(slug: string, version: number, document: unknown): Promise<void> {
    this.seed(slug, version, { document, hash: `hash-of:${JSON.stringify(document)}` });
  }

  public async readVersion(slug: string, version: number): Promise<StoredCaseVersion | undefined> {
    return this.versions.get(slug)?.get(version);
  }

  public async listVersions(slug: string): Promise<readonly number[]> {
    return [...(this.versions.get(slug)?.keys() ?? [])].sort((left, right) => left - right);
  }
}

/** Stands in for the glossary boundary, the same fake shape validate-case-coherence.spec.ts already uses. */
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

/** A glossary holding every term and the one concept the fixture case names, accepting only contract. */
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

it('answers the case whole, matching exactly what the document holds, when every structural and coherence rule holds for it', async () => {
  const store = new FakeCaseStore();
  const document = validCaseDocument();
  store.seed(SLUG, VERSION, { document, hash: 'pinned-hash-token' });
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const result = await service.readCase(SLUG, VERSION);

  expect(result.case).toEqual({
    slug: SLUG,
    title: 'A case',
    when_to_use: 'when a curator needs a case to test read-case composition over',
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
  });
});

// ---- task/case-and-investigation-model/case-query-drops-the-document-hash

it('answers a case with no hash property at all, since read-case no longer pins by content', async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, VERSION, { document: validCaseDocument(), hash: 'a-store-level-hash-unrelated-to-the-answer' });
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const result = await service.readCase(SLUG, VERSION);

  expect(result).not.toHaveProperty('hash');
});

it("answers each version by its own content, never another version's", async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, 1, {
    document: validCaseDocument({ version: 1, title: 'version one' }),
    hash: 'irrelevant-hash-1',
  });
  store.seed(SLUG, 2, {
    document: validCaseDocument({ version: 2, title: 'version two' }),
    hash: 'irrelevant-hash-2',
  });
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const result = await service.readCase(SLUG, 2);

  expect(result.case).toMatchObject({ version: 2, title: 'version two' });
});

it('refuses with CaseNotFoundError, naming the slug and version, when no version is stored at all', async () => {
  const service = new CaseQueryService(new FakeCaseStore(), coherentGlossary(), coherentCapabilities());

  const refusal = await readAsError(service.readCase('never-authored', 7));

  expect(refusal).toBeInstanceOf(CaseNotFoundError);
  expect((refusal as CaseNotFoundError).context).toEqual({ slug: 'never-authored', version: 7 });
});

// -------------------------------------------------------------------------------- criterion 2

it('refuses a case failing one structural rule, naming the violation in a CaseNotValidError', async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, VERSION, { document: validCaseDocument({ hypotheses: [] }), hash: 'irrelevant-hash' });
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const refusal = await readAsError(service.readCase(SLUG, VERSION));

  expect(refusal).toBeInstanceOf(CaseNotValidError);
  expect((refusal as CaseNotValidError).context).toEqual({
    slug: SLUG,
    version: VERSION,
    violations: ['the case declares no hypothesis'],
  });
});

it('joins several structural violations into the one CaseNotValidError', async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, VERSION, {
    document: validCaseDocument({ title: '', hypotheses: [] }),
    hash: 'irrelevant-hash',
  });
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const refusal = await readAsError(service.readCase(SLUG, VERSION));

  expect((refusal as CaseNotValidError).context.violations).toEqual([
    'title is empty',
    'the case declares no hypothesis',
  ]);
});

it("refuses a structurally valid case failing one coherence rule, as the composed CaseNotValidError rather than the coherence module's own IncoherentCaseError", async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, VERSION, { document: validCaseDocument(), hash: 'irrelevant-hash' });
  const glossary = coherentGlossary();
  glossary.forgetConcept(CONCEPT);
  const service = new CaseQueryService(store, glossary, coherentCapabilities());

  const refusal = await readAsError(service.readCase(SLUG, VERSION));

  expect(refusal).toBeInstanceOf(CaseNotValidError);
  expect(refusal).not.toBeInstanceOf(IncoherentCaseError);
  expect((refusal as CaseNotValidError).context).toEqual({
    slug: SLUG,
    version: VERSION,
    violations: [`the concept "${CONCEPT}" does not exist in the glossary`],
  });
});

it('joins several coherence violations into the one CaseNotValidError', async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, VERSION, { document: validCaseDocument(), hash: 'irrelevant-hash' });
  const glossary = coherentGlossary();
  glossary.forgetTerm('action', ACTION);
  glossary.forgetConcept(CONCEPT);
  const service = new CaseQueryService(store, glossary, coherentCapabilities());

  const refusal = await readAsError(service.readCase(SLUG, VERSION));

  expect((refusal as CaseNotValidError).context.violations).toEqual([
    `the action "${ACTION}" does not exist in the glossary`,
    `the concept "${CONCEPT}" does not exist in the glossary`,
  ]);
});

it(
  'names only the structural violations, never a coherence one, when a document fails both a structural ' +
    'rule and what would otherwise be a coherence rule — a document that fails to parse never reaches the ' +
    'coherence checks',
  async () => {
    const store = new FakeCaseStore();
    // Still collects CONCEPT through its one hypothesis, so a coherence
    // violation exists to be missed if the composition ever reached it.
    store.seed(SLUG, VERSION, { document: validCaseDocument({ title: '' }), hash: 'irrelevant-hash' });
    const glossary = coherentGlossary();
    glossary.forgetConcept(CONCEPT);
    const service = new CaseQueryService(store, glossary, coherentCapabilities());

    const refusal = await readAsError(service.readCase(SLUG, VERSION));

    expect(refusal).toBeInstanceOf(CaseNotValidError);
    expect((refusal as CaseNotValidError).context.violations).toEqual(['title is empty']);
  },
);

it('lets a capability-registry integrity failure reach the caller rather than becoming a coherence violation of the case', async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, VERSION, { document: validCaseDocument(), hash: 'irrelevant-hash' });
  const capabilities = new FakeCapabilityQuery();
  const failure = new DuplicateConceptAnswerError(CONCEPT, [
    { name: 'a-capability', version: '1.0.0' },
    { name: 'another-capability', version: '1.0.0' },
  ]);
  capabilities.failOn(CONCEPT, failure);
  const service = new CaseQueryService(store, coherentGlossary(), capabilities);

  await expect(service.readCase(SLUG, VERSION)).rejects.toBe(failure);
});

// -------------------------------------------------------------------------------- criterion 3

it('refuses at a later read a case that validated earlier, once the glossary no longer holds a concept it depends on', async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, VERSION, { document: validCaseDocument(), hash: 'a-hash' });
  const glossary = coherentGlossary();
  const service = new CaseQueryService(store, glossary, coherentCapabilities());
  await expect(service.readCase(SLUG, VERSION)).resolves.toMatchObject({ case: { slug: SLUG } });

  glossary.forgetConcept(CONCEPT);

  const refusal = await readAsError(service.readCase(SLUG, VERSION));
  expect(refusal).toBeInstanceOf(CaseNotValidError);
});

it('refuses at a later read a case that validated earlier, once the capability registry no longer answers a concept it depends on', async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, VERSION, { document: validCaseDocument(), hash: 'a-hash' });
  const capabilities = coherentCapabilities();
  const service = new CaseQueryService(store, coherentGlossary(), capabilities);
  await expect(service.readCase(SLUG, VERSION)).resolves.toMatchObject({ case: { slug: SLUG } });

  capabilities.forget(CONCEPT);

  const refusal = await readAsError(service.readCase(SLUG, VERSION));
  expect(refusal).toBeInstanceOf(CaseNotValidError);
});

// -------------------------------------------------------------------------------- criterion 4

it('answers replayCase with exactly the case readCase answers for the same pinned version, minus the content-identity pin read-case alone carries', async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, VERSION, { document: validCaseDocument(), hash: 'pinned-hash-token' });
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const read = await service.readCase(SLUG, VERSION);
  const replayed = await replayCase(SLUG, VERSION, store);

  expect(replayed).toEqual(read.case);
});

it('replays a pinned version without running the coherence checks at all, answering the case even though the same content would refuse at read-case', async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, VERSION, { document: validCaseDocument(), hash: 'pinned-hash-token' });
  const glossary = new FakeGlossaryQuery(); // holds nothing at all
  const capabilities = new FakeCapabilityQuery(); // answers nothing at all
  const service = new CaseQueryService(store, glossary, capabilities);
  await expect(service.readCase(SLUG, VERSION)).rejects.toBeInstanceOf(CaseNotValidError);

  const replayed = await replayCase(SLUG, VERSION, store);

  expect(replayed.slug).toBe(SLUG);
});

it('answers a replay from just the case store, with no glossary or capability dependency for it to call at all', async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, VERSION, { document: validCaseDocument(), hash: 'a-hash' });

  const replayed = await replayCase(SLUG, VERSION, store);

  expect(replayed.slug).toBe(SLUG);
});

it('refuses replay with the same CaseNotFoundError as read-case when the pinned version was never stored', async () => {
  const store = new FakeCaseStore();

  await expect(replayCase('never-authored', 3, store)).rejects.toBeInstanceOf(CaseNotFoundError);
});

it('answers a document that would fail read-case structurally, rather than refusing it, because replay skips the structural refusal too', async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, VERSION, { document: validCaseDocument({ hypotheses: [] }), hash: 'irrelevant-hash' });
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());
  await expect(service.readCase(SLUG, VERSION)).rejects.toBeInstanceOf(CaseNotValidError);

  const replayed = await replayCase(SLUG, VERSION, store);

  expect(replayed.hypotheses).toEqual([]);
});

// -------------------------------------------------- task/case-and-investigation-model/replay-by-slug-and-version

it('answers the replay whole, matching exactly what the document holds, including its hypotheses and their resolutions and referrals', async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, VERSION, { document: validCaseDocument(), hash: 'irrelevant-hash' });

  const replayed = await replayCase(SLUG, VERSION, store);

  expect(replayed).toEqual({
    slug: SLUG,
    title: 'A case',
    when_to_use: 'when a curator needs a case to test read-case composition over',
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
  });
});

it('answers the version stored under the named slug, never the same version number stored under a different slug', async () => {
  const store = new FakeCaseStore();
  const otherSlug = 'another-case';
  store.seed(SLUG, VERSION, { document: validCaseDocument({ title: 'the named slug is case' }), hash: 'hash-a' });
  store.seed(otherSlug, VERSION, {
    document: validCaseDocument({ slug: otherSlug, title: 'the other slug is case' }),
    hash: 'hash-b',
  });

  const replayed = await replayCase(SLUG, VERSION, store);

  expect(replayed).toMatchObject({ slug: SLUG, title: 'the named slug is case' });
});

it('answers the version a replay names, unaffected by a later version stored afterward under the same slug', async () => {
  const store = new FakeCaseStore();
  store.seed(SLUG, 1, { document: validCaseDocument({ version: 1, title: 'the first version' }), hash: 'hash-1' });
  store.seed(SLUG, 2, { document: validCaseDocument({ version: 2, title: 'the second version' }), hash: 'hash-2' });

  const replayed = await replayCase(SLUG, 1, store);

  expect(replayed).toMatchObject({ version: 1, title: 'the first version' });
});

it("resolves its case without ever reading the store's content-identity digest, even where doing so would throw", async () => {
  const store = new FakeCaseStore();
  const poisoned: StoredCaseVersion = {
    document: validCaseDocument(),
    get hash(): string {
      throw new Error('replay must never read the digest over the case content');
    },
  };
  store.seed(SLUG, VERSION, poisoned);

  const replayed = await replayCase(SLUG, VERSION, store);

  expect(replayed.slug).toBe(SLUG);
});

// -------------------------------------------------------------------------------- criterion 5

it('answers a version written directly to the store as its very next read, with no separate publish step anywhere in this composition', async () => {
  const store = new FakeCaseStore();
  await store.writeVersion(SLUG, VERSION, validCaseDocument()); // the only call an author has: write the version

  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());
  const result = await service.readCase(SLUG, VERSION);

  expect(result.case.slug).toBe(SLUG);
});

// ------------------------------------------------------------ inference: version is never cross-checked

it('answers a case whose document declares a version different from the version number it is addressed by, since read-case never cross-checks the two', async () => {
  const store = new FakeCaseStore();
  // stored/addressed as version 2, declares version 1
  store.seed(SLUG, 2, { document: validCaseDocument({ version: 1 }), hash: 'a-hash' });
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const result = await service.readCase(SLUG, 2);

  expect(result.case.version).toBe(1);
});
