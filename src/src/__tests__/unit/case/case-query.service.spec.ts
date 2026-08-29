// Proof for the knowledge context's one published read (task/case-store/read-case): read-case
// answers a case whole and validated only while every structural and coherence rule holds for it
// right now, refusing otherwise with every violated rule of the half that produced them named
// together in the one CaseNotValidError; a case that validated once is refused again once the
// glossary or the capability registry it depends on stops satisfying it; replay-case answers a
// pinned version's exact content without running the coherence checks at all; and no publication
// gate exists anywhere in this composition — a version a store holds is a case at its very next
// read. All three ports this task composes — ICaseStore, IGlossaryQuery and ICapabilityQuery — are
// stood in for by small mutable in-memory fakes (contracts/knowledge/case-query,
// contracts/glossary/glossary-query, contracts/integration/capability-registry), never the
// file-backed or relational services, so the composition is proven against the published reads
// alone.
//
// Rewritten against ICaseStore's own rebuilt shape (task/case-lifecycle-persistence/
// relational-case-store-for-lifecycle): readVersion/writeVersion/listVersions and StoredCaseVersion
// are gone, replaced below by assembleVersion, createDraft, insertHypothesisRevision,
// placeHypothesis, removeManifestEntry, release and discard. FakeCaseStore now implements every one
// of the seven, backed by mutable maps rather than a single (document, hash) pair; seedCase()
// replaces this file's own previous store.seed(slug, version, {document, hash}) call, originating
// one case version through the same lifecycle primitives a real author would call — createDraft,
// one insertHypothesisRevision plus one placeHypothesis per hypothesis, and (by default) release —
// since the new port has no single write call and no store-level content-identity hash left to
// seed at all (case-store.port.ts's own header comment: "the aggregate they answered for ... is no
// longer what this store persists or reads"). Every assertion this file's own previous version made
// about readCase/replayCase's structural refusal, coherence refusal and replay-without-revalidation
// is kept exactly as strict; two, whose own premise no longer exists under the new shape, are
// dropped rather than adapted, and are explained where they sat.
import { expect, it } from 'vitest';
import type {
  CapabilityResolution,
  ICapabilityQuery,
} from '../../../capability-registry/capability-query.port.js';
import type { Capability } from '../../../capability-registry/capability.js';
import type { Resolution } from '../../../case/case.js';
import { CaseQueryService, replayCase } from '../../../case/case-query.service.js';
import type {
  AssembledCaseVersion,
  CaseIdentity,
  CaseVersionListItem,
  CaseVersionState,
  CreateDraftInput,
  HypothesisIdentity,
  HypothesisRevisionContent,
  HypothesisRevisionInput,
  HypothesisRevisionListItem,
  ICaseStore,
  ManifestEntry,
  PlaceHypothesisInput,
  UpdateDraftInput,
} from '../../../case/case-store.port.js';
import { CaseAlreadyHasDraftError } from '../../../errors/case-already-has-draft.error.js';
import { CaseNotFoundError } from '../../../errors/case-not-found.error.js';
import { CaseNotValidError } from '../../../errors/case-not-valid.error.js';
import { DuplicateConceptAnswerError } from '../../../errors/duplicate-concept-answer.error.js';
import { IncoherentCaseError } from '../../../errors/incoherent-case.error.js';
import { ManifestPositionOccupiedError } from '../../../errors/manifest-position-occupied.error.js';
import type {
  ConceptResolution,
  IGlossaryQuery,
  TermResolution,
} from '../../../glossary/glossary-query.port.js';
import type { Concept, TermVocabulary } from '../../../glossary/terms.js';
import type { PaginatedResponse, PaginationRequest } from '../../../types/pagination.js';

/** The fixture case's identity, unless a test names another slug of its own. */
const SLUG = 'a-case';

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

interface IStoredVersion {
  readonly title: string;
  readonly when_to_use: string;
  readonly authored_at: string;
  readonly subject: string;
  readonly fallback: Resolution;
  state: CaseVersionState;
  released_at?: string;
  manifest: ManifestEntry[];
}

interface ICaseRecord {
  nextVersion: number;
  draftVersion?: number;
  readonly versions: Map<number, IStoredVersion>;
}

/**
 * Stands in for the case-store boundary (contracts/knowledge/case-query), implementing every one
 * of ICaseStore's own seven storage primitives over mutable maps: a per-case version counter and
 * draft flag, a hypothesis's own identity per case, and its revisions numbered independently of any
 * other hypothesis's own — the same facts the relational adapter this store stands in for keeps,
 * just held in memory instead of a real database (TST-03).
 */
class FakeCaseStore implements ICaseStore {
  private readonly cases = new Map<string, ICaseRecord>();
  private readonly revisionsByHypothesis = new Map<string, Map<number, HypothesisRevisionContent>>();

  public async assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion | undefined> {
    const stored = this.cases.get(slug)?.versions.get(version);
    if (stored === undefined) {
      return undefined;
    }
    return {
      slug,
      version,
      title: stored.title,
      when_to_use: stored.when_to_use,
      authored_at: stored.authored_at,
      subject: stored.subject,
      fallback: stored.fallback,
      state: stored.state,
      ...(stored.released_at !== undefined ? { released_at: stored.released_at } : {}),
      manifest: [...stored.manifest].sort((left, right) => left.position - right.position),
    };
  }

  public async findDraftVersion(slug: string): Promise<number | undefined> {
    return this.cases.get(slug)?.draftVersion;
  }

  /**
   * A minimal stand-in for listCases: every slug this fake currently tracks, paginated the same way
   * the real store's own pageCountOf computes a page count — sufficient because no test in this file
   * exercises listCases at all; it exists only so this class keeps satisfying ICaseStore in full
   * (this delivery's own inference — the task that adds listCases did not touch this file's own
   * fixture).
   */
  public async listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseIdentity>> {
    const slugs = [...this.cases.keys()].sort();
    const total = slugs.length;
    const page = slugs.slice(pagination.offset, pagination.offset + pagination.limit);
    return {
      data: page.map((slug) => ({ slug })),
      total,
      limit: pagination.limit,
      offset: pagination.offset,
      pageCount: pagination.limit > 0 ? Math.ceil(total / pagination.limit) : 0,
    };
  }

  /**
   * A minimal stand-in for listCaseVersions: no test in this file exercises it at all, so this
   * fake answers an empty page unconditionally — sufficient only to keep FakeCaseStore satisfying
   * ICaseStore in full, the same reason the listCases stub just above already gives (this
   * delivery's own inference — the task that adds listCaseVersions did not touch this file's own
   * fixture).
   */
  public async listCaseVersions(_slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>> {
    return { data: [], total: 0, limit: pagination.limit, offset: pagination.offset, pageCount: 0 };
  }

  /**
   * A minimal stand-in for listHypotheses: no test in this file exercises it at all, so this fake
   * answers an empty page unconditionally — sufficient only to keep FakeCaseStore satisfying
   * ICaseStore in full, the same reason the listCaseVersions stub just above already gives (this
   * delivery's own inference — the task that adds listHypotheses did not touch this file's own
   * fixture).
   */
  public async listHypotheses(_slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisIdentity>> {
    return { data: [], total: 0, limit: pagination.limit, offset: pagination.offset, pageCount: 0 };
  }

  /**
   * A minimal stand-in for listHypothesisRevisions: no test in this file exercises it at all, so this
   * fake answers an empty page unconditionally — sufficient only to keep FakeCaseStore satisfying
   * ICaseStore in full, the same reason the listHypotheses stub just above already gives (this
   * delivery's own inference — the task that adds listHypothesisRevisions did not touch this file's
   * own fixture).
   */
  public async listHypothesisRevisions(
    _slug: string,
    _hypothesisName: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<HypothesisRevisionListItem>> {
    return { data: [], total: 0, limit: pagination.limit, offset: pagination.offset, pageCount: 0 };
  }

  public async createDraft(input: CreateDraftInput): Promise<number> {
    const record = this.cases.get(input.slug) ?? { nextVersion: 1, versions: new Map<number, IStoredVersion>() };
    if (record.draftVersion !== undefined) {
      throw new CaseAlreadyHasDraftError(input.slug);
    }
    const version = record.nextVersion;
    record.nextVersion += 1;
    const sourceVersion = input.source_version ?? this.latestReleasedVersion(record);
    const manifest = sourceVersion !== undefined ? [...(record.versions.get(sourceVersion)?.manifest ?? [])] : [];
    record.versions.set(version, {
      title: input.title,
      when_to_use: input.when_to_use,
      authored_at: input.authored_at,
      subject: input.subject,
      fallback: input.fallback,
      state: 'draft',
      manifest,
    });
    record.draftVersion = version;
    this.cases.set(input.slug, record);
    return version;
  }

  private latestReleasedVersion(record: ICaseRecord): number | undefined {
    const released = [...record.versions.entries()].filter(([, stored]) => stored.state === 'released').map(([version]) => version);
    return released.length > 0 ? Math.max(...released) : undefined;
  }

  public async insertHypothesisRevision(input: HypothesisRevisionInput): Promise<number> {
    const key = `${input.slug}:${input.hypothesis_name}`;
    const byRevision = this.revisionsByHypothesis.get(key) ?? new Map<number, HypothesisRevisionContent>();
    const revision = byRevision.size > 0 ? Math.max(...byRevision.keys()) + 1 : 1;
    byRevision.set(revision, {
      hypothesis_name: input.hypothesis_name,
      revision,
      criterion: input.criterion,
      collects: input.collects,
      resolution: input.resolution,
    });
    this.revisionsByHypothesis.set(key, byRevision);
    return revision;
  }

  public async placeHypothesis(input: PlaceHypothesisInput): Promise<void> {
    const stored = this.cases.get(input.slug)?.versions.get(input.version);
    if (stored === undefined) {
      return;
    }
    const occupant = stored.manifest.find((entry) => entry.position === input.position);
    if (occupant !== undefined && occupant.hypothesis_revision.hypothesis_name !== input.hypothesis_name) {
      throw new ManifestPositionOccupiedError(input.slug, input.version, input.position);
    }
    const content = this.revisionsByHypothesis.get(`${input.slug}:${input.hypothesis_name}`)?.get(input.revision);
    if (content === undefined) {
      throw new Error(`no hypothesis-revision ${input.hypothesis_name}#${input.revision} was ever inserted for "${input.slug}"`);
    }
    stored.manifest = [
      ...stored.manifest.filter((entry) => entry.hypothesis_revision.hypothesis_name !== input.hypothesis_name),
      { position: input.position, hypothesis_revision: content },
    ];
  }

  public async removeManifestEntry(slug: string, version: number, hypothesisName: string): Promise<void> {
    const stored = this.cases.get(slug)?.versions.get(version);
    if (stored === undefined || stored.state === 'released') {
      return;
    }
    stored.manifest = stored.manifest.filter((entry) => entry.hypothesis_revision.hypothesis_name !== hypothesisName);
  }

  public async release(slug: string, version: number): Promise<void> {
    const record = this.cases.get(slug);
    const stored = record?.versions.get(version);
    if (stored === undefined || stored.state === 'released') {
      return;
    }
    stored.state = 'released';
    stored.released_at = new Date().toISOString();
    if (record?.draftVersion === version) {
      record.draftVersion = undefined;
    }
  }

  public async discard(slug: string, version: number): Promise<void> {
    const record = this.cases.get(slug);
    const stored = record?.versions.get(version);
    if (stored === undefined || stored.state === 'released') {
      return;
    }
    record?.versions.delete(version);
    if (record?.draftVersion === version) {
      record.draftVersion = undefined;
    }
  }

  /**
   * A minimal stand-in for updateDraft: no test in this file exercises it at all, so this fake
   * takes no action — sufficient only to keep FakeCaseStore satisfying ICaseStore in full, the same
   * reason every list* stub above already gives (this delivery's own inference — the task that adds
   * updateDraft did not touch this file's own fixture).
   */
  public async updateDraft(_slug: string, _version: number, _attributes: UpdateDraftInput): Promise<void> {
    return;
  }
}

interface IHypothesisFixture {
  readonly name: string;
  readonly position: number;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: Resolution;
}

/** The one hypothesis every seedCase() call places unless a test names its own — exactly the shape this file's own previous validCaseDocument() default hypothesis held. */
function defaultHypothesis(): IHypothesisFixture {
  return {
    name: 'h1',
    position: 1,
    criterion: 'prose no check in this composition ever reads',
    collects: [CONCEPT],
    resolution: { outcome: OUTCOME, referral: { action: ACTION, recipient: RECIPIENT } },
  };
}

/** The manifest read-case/replay-case answer for exactly one defaultHypothesis() placed at revision 1 — the shape a full-equality assertion below compares its own answer's manifest against. */
function expectedDefaultManifest(revision = 1): unknown[] {
  const hypothesis = defaultHypothesis();
  return [
    {
      position: hypothesis.position,
      hypothesis_revision: {
        hypothesis: { name: hypothesis.name },
        revision,
        criterion: hypothesis.criterion,
        collects: hypothesis.collects,
        resolution: hypothesis.resolution,
      },
    },
  ];
}

interface ISeedOptions {
  readonly slug?: string;
  readonly title?: string;
  readonly hypotheses?: readonly IHypothesisFixture[];
  /** Defaults to true. A test proving criterion 5's "no separate publish step" seeds a draft on purpose. */
  readonly release?: boolean;
}

/**
 * Originates one case version through the store's own lifecycle primitives — createDraft, one
 * insertHypothesisRevision plus one placeHypothesis per hypothesis, and (unless told not to)
 * release — answering the version number the store assigned. Replaces this file's own previous
 * store.seed(slug, version, {document, hash}): the new ICaseStore has no single write call and no
 * store-level hash to seed, so a fixture is built the same way a real author would build one.
 */
async function seedCase(store: FakeCaseStore, options: ISeedOptions = {}): Promise<number> {
  const slug = options.slug ?? SLUG;
  const hypotheses = options.hypotheses ?? [defaultHypothesis()];
  const version = await store.createDraft({
    slug,
    title: options.title ?? 'A case',
    when_to_use: 'when a curator needs a case to test read-case composition over',
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: SUBJECT,
    fallback: { outcome: FALLBACK_OUTCOME, referral: { action: FALLBACK_ACTION, recipient: FALLBACK_RECIPIENT } },
  });
  for (const hypothesis of hypotheses) {
    const revision = await store.insertHypothesisRevision({
      slug,
      hypothesis_name: hypothesis.name,
      criterion: hypothesis.criterion,
      collects: hypothesis.collects,
      resolution: hypothesis.resolution,
    });
    await store.placeHypothesis({ slug, version, hypothesis_name: hypothesis.name, revision, position: hypothesis.position });
  }
  if (options.release ?? true) {
    await store.release(slug, version);
  }
  return version;
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

  // Minimal stubs kept only to satisfy the widened IGlossaryQuery interface
  // (task/glossary-query-http/list-vocabulary-terms-query-extension,
  // task/glossary-query-http/list-concepts-query-extension): this file's own
  // scenarios never call either.
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

  /**
   * Answers from the same held-capabilities map hold()/forget() already maintain — the same map
   * readCapability already reads from — windowed and paginated the same way the real
   * CapabilityRegistryService.listCapabilities computes it in memory over its own store's full
   * read (capability-registry.service.ts): slice by offset/limit, total the full held count, and
   * a page count of 0 for a non-positive limit rather than dividing by it. Read fresh from the map
   * on every call, never remembered, since readCaseInputRequirements (task/case-input-requirements
   * -and-diagnose-gate/derive-case-input-requirements) depends on exactly that freshness.
   */
  public async listCapabilities(pagination: PaginationRequest): Promise<PaginatedResponse<Capability>> {
    const held = [...this.capabilities.values()];
    const total = held.length;
    const data = held.slice(pagination.offset, pagination.offset + pagination.limit);
    return {
      data,
      total,
      limit: pagination.limit,
      offset: pagination.offset,
      pageCount: pagination.limit > 0 ? Math.ceil(total / pagination.limit) : 0,
    };
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
  glossary.holdConcept({ name: CONCEPT, accepts: [SUBJECT], ttl: 60, description: 'a fixture concept' });
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
  const version = await seedCase(store);
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const result = await service.readCase(SLUG, version);

  expect(result.case).toEqual({
    slug: SLUG,
    title: 'A case',
    when_to_use: 'when a curator needs a case to test read-case composition over',
    version,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: SUBJECT,
    fallback: { outcome: FALLBACK_OUTCOME, referral: { action: FALLBACK_ACTION, recipient: FALLBACK_RECIPIENT } },
    state: 'released',
    released_at: expect.any(String),
    manifest: expectedDefaultManifest(),
    hypotheses: [
      {
        name: 'h1',
        criterion: 'prose no check in this composition ever reads',
        collects: [CONCEPT],
        resolution: { outcome: OUTCOME, referral: { action: ACTION, recipient: RECIPIENT } },
      },
    ],
  });
});

it('answers a case with no hash property at all, since read-case no longer pins by content', async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store);
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const result = await service.readCase(SLUG, version);

  expect(result).not.toHaveProperty('hash');
});

it("answers each version by its own content, never another version's", async () => {
  const store = new FakeCaseStore();
  await seedCase(store, { title: 'version one' });
  const secondVersion = await seedCase(store, { title: 'version two' });
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const result = await service.readCase(SLUG, secondVersion);

  expect(result.case).toMatchObject({ version: secondVersion, title: 'version two' });
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
  const version = await seedCase(store, { hypotheses: [] });
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const refusal = await readAsError(service.readCase(SLUG, version));

  expect(refusal).toBeInstanceOf(CaseNotValidError);
  expect((refusal as CaseNotValidError).context).toEqual({
    slug: SLUG,
    version,
    violations: ['the case declares no hypothesis'],
  });
});

it('joins several structural violations into the one CaseNotValidError', async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store, { title: '', hypotheses: [] });
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const refusal = await readAsError(service.readCase(SLUG, version));

  expect((refusal as CaseNotValidError).context.violations).toEqual([
    'title is empty',
    'the case declares no hypothesis',
  ]);
});

it("refuses a structurally valid case failing one coherence rule, as the composed CaseNotValidError rather than the coherence module's own IncoherentCaseError", async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store);
  const glossary = coherentGlossary();
  glossary.forgetConcept(CONCEPT);
  const service = new CaseQueryService(store, glossary, coherentCapabilities());

  const refusal = await readAsError(service.readCase(SLUG, version));

  expect(refusal).toBeInstanceOf(CaseNotValidError);
  expect(refusal).not.toBeInstanceOf(IncoherentCaseError);
  expect((refusal as CaseNotValidError).context).toEqual({
    slug: SLUG,
    version,
    violations: [`the concept "${CONCEPT}" does not exist in the glossary`],
  });
});

it('joins several coherence violations into the one CaseNotValidError', async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store);
  const glossary = coherentGlossary();
  glossary.forgetTerm('action', ACTION);
  glossary.forgetConcept(CONCEPT);
  const service = new CaseQueryService(store, glossary, coherentCapabilities());

  const refusal = await readAsError(service.readCase(SLUG, version));

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
    const version = await seedCase(store, { title: '' });
    const glossary = coherentGlossary();
    glossary.forgetConcept(CONCEPT);
    const service = new CaseQueryService(store, glossary, coherentCapabilities());

    const refusal = await readAsError(service.readCase(SLUG, version));

    expect(refusal).toBeInstanceOf(CaseNotValidError);
    expect((refusal as CaseNotValidError).context.violations).toEqual(['title is empty']);
  },
);

it('lets a capability-registry integrity failure reach the caller rather than becoming a coherence violation of the case', async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store);
  const capabilities = new FakeCapabilityQuery();
  const failure = new DuplicateConceptAnswerError(CONCEPT, [
    { name: 'a-capability', version: '1.0.0' },
    { name: 'another-capability', version: '1.0.0' },
  ]);
  capabilities.failOn(CONCEPT, failure);
  const service = new CaseQueryService(store, coherentGlossary(), capabilities);

  await expect(service.readCase(SLUG, version)).rejects.toBe(failure);
});

// -------------------------------------------------------------------------------- criterion 3

it('refuses at a later read a case that validated earlier, once the glossary no longer holds a concept it depends on', async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store);
  const glossary = coherentGlossary();
  const service = new CaseQueryService(store, glossary, coherentCapabilities());
  await expect(service.readCase(SLUG, version)).resolves.toMatchObject({ case: { slug: SLUG } });

  glossary.forgetConcept(CONCEPT);

  const refusal = await readAsError(service.readCase(SLUG, version));
  expect(refusal).toBeInstanceOf(CaseNotValidError);
});

it('refuses at a later read a case that validated earlier, once the capability registry no longer answers a concept it depends on', async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store);
  const capabilities = coherentCapabilities();
  const service = new CaseQueryService(store, coherentGlossary(), capabilities);
  await expect(service.readCase(SLUG, version)).resolves.toMatchObject({ case: { slug: SLUG } });

  capabilities.forget(CONCEPT);

  const refusal = await readAsError(service.readCase(SLUG, version));
  expect(refusal).toBeInstanceOf(CaseNotValidError);
});

// -------------------------------------------------------------------------------- criterion 4

it('answers replayCase with exactly the case readCase answers for the same pinned version, minus the content-identity pin read-case alone carries', async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store);
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const read = await service.readCase(SLUG, version);
  const replayed = await replayCase(SLUG, version, store);

  expect(replayed).toEqual(read.case);
});

it('replays a pinned version without running the coherence checks at all, answering the case even though the same content would refuse at read-case', async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store);
  const glossary = new FakeGlossaryQuery(); // holds nothing at all
  const capabilities = new FakeCapabilityQuery(); // answers nothing at all
  const service = new CaseQueryService(store, glossary, capabilities);
  await expect(service.readCase(SLUG, version)).rejects.toBeInstanceOf(CaseNotValidError);

  const replayed = await replayCase(SLUG, version, store);

  expect(replayed.slug).toBe(SLUG);
});

it('refuses replay with the same CaseNotFoundError as read-case when the pinned version was never stored', async () => {
  const store = new FakeCaseStore();

  await expect(replayCase('never-authored', 3, store)).rejects.toBeInstanceOf(CaseNotFoundError);
});

it('answers a document that would fail read-case structurally, rather than refusing it, because replay skips the structural refusal too', async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store, { hypotheses: [] });
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());
  await expect(service.readCase(SLUG, version)).rejects.toBeInstanceOf(CaseNotValidError);

  const replayed = await replayCase(SLUG, version, store);

  expect(replayed.hypotheses).toEqual([]);
});

// -------------------------------------------------- task/case-and-investigation-model/replay-by-slug-and-version

it('answers the replay whole, matching exactly what the document holds, including its hypotheses and their resolutions and referrals', async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store);

  const replayed = await replayCase(SLUG, version, store);

  expect(replayed).toEqual({
    slug: SLUG,
    title: 'A case',
    when_to_use: 'when a curator needs a case to test read-case composition over',
    version,
    authored_at: '2024-01-01T00:00:00.000Z',
    subject: SUBJECT,
    fallback: { outcome: FALLBACK_OUTCOME, referral: { action: FALLBACK_ACTION, recipient: FALLBACK_RECIPIENT } },
    state: 'released',
    released_at: expect.any(String),
    manifest: expectedDefaultManifest(),
    hypotheses: [
      {
        name: 'h1',
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
  const version = await seedCase(store, { title: 'the named slug is case' });
  await seedCase(store, { slug: otherSlug, title: 'the other slug is case' });

  const replayed = await replayCase(SLUG, version, store);

  expect(replayed).toMatchObject({ slug: SLUG, title: 'the named slug is case' });
});

it('answers the version a replay names, unaffected by a later version stored afterward under the same slug', async () => {
  const store = new FakeCaseStore();
  const firstVersion = await seedCase(store, { title: 'the first version' });
  await seedCase(store, { title: 'the second version' });

  const replayed = await replayCase(SLUG, firstVersion, store);

  expect(replayed).toMatchObject({ version: firstVersion, title: 'the first version' });
});

// -------------------------------------------------------------------------------- criterion 5

it('answers a version written directly to the store as its very next read, with no separate publish step anywhere in this composition', async () => {
  const store = new FakeCaseStore();
  // A draft, never released: read-case still answers it, since assembleVersion never filters by
  // state and this composition gates on nothing but the version existing at all.
  const version = await seedCase(store, { release: false });

  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());
  const result = await service.readCase(SLUG, version);

  expect(result.case.slug).toBe(SLUG);
  expect(result.case.state).toBe('draft');
});

// -------------------------------------------------------------------------------- task/case-input-requirements-and-diagnose-gate/derive-case-input-requirements

/** A capability answering the fixture concept with one declared subject attribute, carrying syntactically valid JSON in its own input_schema — unlike coherentCapability()'s own 'an-input-schema' placeholder, which readCaseInputRequirements's own hasWellFormedInputSchema would fail to JSON.parse. */
function inputSchemaCapability(overrides: Partial<Capability> = {}): Capability {
  return coherentCapability({ input_schema: '{"properties":{"an-attribute":{}}}', ...overrides });
}

// ---------------------------------------------------------------- criterion 6

it('answers identical input requirements for a draft version and the same version once released', async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store, { release: false });
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(inputSchemaCapability());
  const service = new CaseQueryService(store, coherentGlossary(), capabilities);

  const draftResult = await service.readCaseInputRequirements(SLUG, version);
  await store.release(SLUG, version);
  const releasedResult = await service.readCaseInputRequirements(SLUG, version);

  expect(draftResult.requirements.map((requirement) => requirement.attribute)).toEqual(['an-attribute']);
  expect(releasedResult).toEqual(draftResult);
});

// ---------------------------------------------------------------- contracts/knowledge/case-input-requirements, rules/knowledge/a-case-versions-input-requirements-are-derived

it("answers a draft version's input requirements even though the same content currently fails read-case's own coherence check", async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store, { release: false });
  const glossary = coherentGlossary();
  glossary.forgetConcept(CONCEPT);
  const capabilities = new FakeCapabilityQuery();
  capabilities.hold(inputSchemaCapability());
  const service = new CaseQueryService(store, glossary, capabilities);
  await expect(service.readCase(SLUG, version)).rejects.toBeInstanceOf(CaseNotValidError);

  const result = await service.readCaseInputRequirements(SLUG, version);

  expect(result.requirements.map((requirement) => requirement.attribute)).toEqual(['an-attribute']);
});

// ---------------------------------------------------------------- criterion 7

it('derives from the currently registered capabilities read fresh at every call, answering differently once a capability is registered between two calls for the same version', async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store);
  const capabilities = new FakeCapabilityQuery(); // answers nothing yet
  const service = new CaseQueryService(store, coherentGlossary(), capabilities);

  const before = await service.readCaseInputRequirements(SLUG, version);
  capabilities.hold(inputSchemaCapability());
  const after = await service.readCaseInputRequirements(SLUG, version);

  expect(before.requirements).toEqual([]);
  expect(after.requirements.map((requirement) => requirement.attribute)).toEqual(['an-attribute']);
});

// ---------------------------------------------------------------- inference: reuses read-case's own not-found/not-valid refusals

it('refuses with CaseNotFoundError, naming the slug and version, when no version is stored at all', async () => {
  const service = new CaseQueryService(new FakeCaseStore(), coherentGlossary(), coherentCapabilities());

  const refusal = await readAsError(service.readCaseInputRequirements('never-authored', 7));

  expect(refusal).toBeInstanceOf(CaseNotFoundError);
  expect((refusal as CaseNotFoundError).context).toEqual({ slug: 'never-authored', version: 7 });
});

it('refuses a structurally invalid case version the same way read-case does, naming the violation in a CaseNotValidError', async () => {
  const store = new FakeCaseStore();
  const version = await seedCase(store, { hypotheses: [] });
  const service = new CaseQueryService(store, coherentGlossary(), coherentCapabilities());

  const refusal = await readAsError(service.readCaseInputRequirements(SLUG, version));

  expect(refusal).toBeInstanceOf(CaseNotValidError);
  expect((refusal as CaseNotValidError).context).toEqual({
    slug: SLUG,
    version,
    violations: ['the case declares no hypothesis'],
  });
});
