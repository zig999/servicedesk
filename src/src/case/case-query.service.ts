// Composes the case document model with its two upstream published reads
// into the knowledge context's one published read
// (contracts/knowledge/case-query): every validator rule — structural and
// coherence alike — holds at the moment of reading, or the read refuses
// once with every violated rule named together
// (rules/knowledge/validation-runs-at-every-read,
// contracts/system/case-authoring). This module reaches every dependency
// through its published port alone — the case store, the glossary and the
// capability registry are never touched directly, and no framework, driver
// or client is imported here — so it stays testable against port fakes
// (constraints/the-domain-depends-on-no-infrastructure). replay-case is the
// declared exception to validation-runs-at-every-read in full: it answers
// the pinned version's exact stored content without running either the
// structural parse's own refusal or the coherence checks — reproducibility
// pins content, not current validity — and it resolves that content
// without reading any digest over it at all, since slug and version alone
// name one content (rules/investigation/replay-is-pinned). read-case alone
// runs that validation, at every one of its own readings.
//
// Rewired against the case store's own rebuilt port
// (task/case-lifecycle-operations/wire-and-retire-author-case-version): the
// single readVersion/writeVersion pair and its StoredCaseVersion answer are
// gone, replaced by assembleVersion's own whole-version read
// (case-store.port.ts). assembleVersion answers the manifest with each
// entry's own adopted hypothesis-revision content flattened onto the entry
// (HypothesisRevisionContent), the same flattening convention
// parse-case-document.ts's own ManifestEntryDocument already keeps for a raw
// document — so read-case projects the assembled version into that same
// flat raw shape (assembledAsRawDocument below) and hands it to
// parseCaseDocument unchanged, exactly the adapter release.operation.ts
// already built for the same gap (this module's own duplicate of that
// adapter, disclosed as a divergence from MNT-03 in this task's delivery
// record, since sharing it would mean editing release.operation.ts, a
// sibling task's already-delivered file, which reaches past what this task
// touches). replay-case instead reshapes the assembled version directly into
// Case's own nested ManifestEntry/HypothesisRevision/HypothesisIdentity
// shape, trusting its content the same way this module's own trustedCase
// always did for a whole document — never running parseCaseDocument's
// structural refusal at all, which is exactly what "without revalidation"
// means for replay.

import type { ICapabilityQuery } from '../capability-registry/capability-query.port.js';
import { CaseNotFoundError } from '../errors/case-not-found.error.js';
import { CaseNotValidError } from '../errors/case-not-valid.error.js';
import { InvalidCaseDocumentError } from '../errors/invalid-case-document.error.js';
import type { IGlossaryQuery } from '../glossary/glossary-query.port.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import {
  deriveCaseInputRequirements,
  everyRegisteredCapability,
  type CaseInputRequirementsResult,
} from './case-input-requirements.js';
import type { ICaseInputRequirementsQuery } from './case-input-requirements.port.js';
import type { Case, Hypothesis, ManifestEntry } from './case.js';
import type { ICaseQuery, ReadCaseResult } from './case-query.port.js';
import type {
  AssembledCaseVersion,
  CaseIdentity,
  CaseVersionListItem,
  HypothesisIdentity,
  HypothesisRevisionListItem,
  ICaseStore,
  ManifestEntry as StoredManifestEntry,
} from './case-store.port.js';
import { parseCaseDocument } from './parse-case-document.js';
import { caseCoherenceViolations } from './validate-case-coherence.js';

/**
 * The published case-query contract's one implementation: composes the case
 * store with the two upstream published reads, so a consumer holding
 * ICaseQuery answers a validated case without depending on any of the three
 * or on how each is persisted.
 */
export class CaseQueryService implements ICaseQuery, ICaseInputRequirementsQuery {
  public constructor(
    private readonly caseStore: ICaseStore,
    private readonly glossary: IGlossaryQuery,
    private readonly capabilities: ICapabilityQuery,
  ) {}

  /**
   * read-case: refuses once, naming every violated rule together, where the
   * version is unstored (CaseNotFoundError), where the assembled version
   * fails a structural rule, or where the parsed case fails a coherence rule
   * against the glossary and the capability registry as they stand right
   * now (CaseNotValidError either way) — and otherwise answers the case
   * whole, validated as of this reading.
   */
  public async readCase(slug: string, version: number): Promise<ReadCaseResult> {
    const assembled = await heldVersion(this.caseStore, slug, version);
    const theCase = structuralCase(assembled, slug, version);
    await this.refuseIncoherence(theCase, version);
    return { case: theCase };
  }

  /**
   * read-case-input-requirements
   * (contracts/knowledge/case-input-requirements): resolves the named
   * version's own structurally valid case through the same
   * heldVersion/structuralCase pipeline readCase uses above, but never runs
   * refuseIncoherence — a draft not yet coherent against the glossary or the
   * capability registry is exactly what a curator composing it still wants
   * this read to answer for (case-input-requirements.port.ts's own header
   * comment) — and derives its input requirements
   * (case-input-requirements.ts's own deriveCaseInputRequirements) over
   * every capability currently registered, read fresh on every call
   * (rules/knowledge/the-contract-check-reads-the-current-registration).
   * Available for either state, draft or released, unchanged: only a
   * diagnose itself ever refuses a draft.
   */
  public async readCaseInputRequirements(slug: string, version: number): Promise<CaseInputRequirementsResult> {
    const assembled = await heldVersion(this.caseStore, slug, version);
    const theCase = structuralCase(assembled, slug, version);
    const registeredCapabilities = await everyRegisteredCapability(this.capabilities);
    return deriveCaseInputRequirements(theCase, registeredCapabilities);
  }

  /**
   * list-cases: a direct pass-through onto the case store's own listCases
   * (case-store.port.ts) — a bare identity listing carries no structural or
   * coherence rule to run, unlike readCase's own assembled version, so
   * nothing here composes the glossary or the capability registry the way
   * readCase does.
   */
  public async listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseIdentity>> {
    return this.caseStore.listCases(pagination);
  }

  /**
   * list-case-versions: a direct pass-through onto the case store's own
   * listCaseVersions (case-store.port.ts) — a bare number-and-state listing
   * carries no structural or coherence rule to run, unlike readCase's own
   * assembled version, so nothing here composes the glossary or the
   * capability registry either. The store itself raises CaseNotFoundError
   * where the named slug names no case at all (case-store.port.ts's own
   * header comment); this method neither catches nor re-raises it, since
   * it is already the exact typed error this contract's own consumers
   * expect.
   */
  public async listCaseVersions(
    slug: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<CaseVersionListItem>> {
    return this.caseStore.listCaseVersions(slug, pagination);
  }

  /**
   * list-hypotheses: a direct pass-through onto the case store's own
   * listHypotheses (case-store.port.ts) — a bare name listing carries no
   * structural or coherence rule to run, unlike readCase's own assembled
   * version, so nothing here composes the glossary or the capability
   * registry either. The store itself raises CaseNotFoundError where the
   * named slug names no case at all (case-store.port.ts's own header
   * comment); this method neither catches nor re-raises it, since it is
   * already the exact typed error this contract's own consumers expect.
   */
  public async listHypotheses(
    slug: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<HypothesisIdentity>> {
    return this.caseStore.listHypotheses(slug, pagination);
  }

  /**
   * list-hypothesis-revisions: a direct pass-through onto the case store's
   * own listHypothesisRevisions (case-store.port.ts) — a full-content
   * listing scoped to one already-named hypothesis carries no structural or
   * coherence rule to run, unlike readCase's own assembled version, so
   * nothing here composes the glossary or the capability registry either.
   * The store itself raises CaseNotFoundError where the named slug or the
   * named hypothesis (or both) name nothing this case has originated
   * (case-store.port.ts's own header comment); this method neither catches
   * nor re-raises it, since it is already the exact typed error this
   * contract's own consumers expect. This is this task's own inference,
   * disclosed here rather than left silent: CaseNotFoundError collapses two
   * distinct absences into one refusal — an unknown slug, and a known slug
   * that never originated a hypothesis of this name — because the store's
   * own existence check reads the hypotheses identity row for
   * (case_slug, name) alone, and a row there can only exist for a slug the
   * cases table already holds; no specification node states a separate
   * "hypothesis not found under this case" outcome for this method to
   * distinguish, and none is invented here.
   */
  public async listHypothesisRevisions(
    slug: string,
    hypothesisName: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<HypothesisRevisionListItem>> {
    return this.caseStore.listHypothesisRevisions(slug, hypothesisName, pagination);
  }

  /** Refuses a coherence violation, naming every one together, joining the same error type the structural refusal raises. */
  private async refuseIncoherence(theCase: Case, version: number): Promise<void> {
    const violations = await caseCoherenceViolations(theCase, this.glossary, this.capabilities);
    if (violations.length > 0) {
      throw new CaseNotValidError(theCase.slug, version, violations);
    }
  }
}

/**
 * replay-case: answers the pinned version's exact stored content as the
 * case it already was, running neither the structural parse's own refusal
 * (parse-case-document.ts) nor the coherence checks against the glossary
 * or the capability registry — reproducibility pins content, not
 * current validity (rules/knowledge/validation-runs-at-every-read), so an
 * old investigation reads the exact version it pinned even where the
 * document would now fail a rule, or where either upstream context has
 * since moved on. Resolves without reading any digest over the case's
 * content at all: slug and version alone name one content, because a
 * version is written once and never altered
 * (rules/investigation/replay-is-pinned), so the store's own
 * content-identity hash on the version this call reads is never consulted
 * — read-case's own answer carries no such hash either, so neither
 * function's shape is pinned by anything but slug and version. Still
 * refuses a version nothing stored, through the same CaseNotFoundError
 * read-case raises.
 */
export async function replayCase(slug: string, version: number, caseStore: ICaseStore): Promise<Case> {
  const assembled = await heldVersion(caseStore, slug, version);
  return trustedCaseOf(assembled);
}

/**
 * Reshapes an assembled version into the aggregate whole, trusting its
 * content rather than checking it — the one place this module departs from
 * TYP-02's guard-alongside-every-assertion convention, disclosed in this
 * task's own delivery record rather than silently, the same departure this
 * module's own trustedCase always carried for a whole document before this
 * task's rewiring. A guard thorough enough to narrow the assembled version's
 * own content here would have to test the same structural facts
 * parseCaseDocument's own refusal already tests, which is exactly the
 * validation replay exists to skip. A version is written once and never
 * altered (rules/knowledge/a-case-version-is-written-once), so the row
 * this call reads is the exact content an investigation once pinned, and
 * reshaping it without running any refusal is what "without revalidation"
 * means for replay.
 */
function trustedCaseOf(assembled: AssembledCaseVersion): Case {
  const manifest = assembled.manifest.map(trustedManifestEntryOf);
  return {
    slug: assembled.slug,
    title: assembled.title,
    when_to_use: assembled.when_to_use,
    version: assembled.version,
    authored_at: assembled.authored_at,
    subject: assembled.subject,
    fallback: assembled.fallback,
    ...(assembled.consolidation_register !== undefined
      ? { consolidation_register: assembled.consolidation_register }
      : {}),
    state: assembled.state,
    ...(assembled.released_at !== undefined ? { released_at: assembled.released_at } : {}),
    manifest,
    hypotheses: manifest.map(trustedHypothesisOf),
  };
}

/** One stored manifest entry, reshaped into the aggregate's own nested ManifestEntry/HypothesisRevision/HypothesisIdentity shape (domain/knowledge/manifest-entry, domain/knowledge/hypothesis-revision, domain/knowledge/hypothesis) — trusted rather than reasserted, the store's own flat hypothesis_revision content nested under the hypothesis identity it names. */
function trustedManifestEntryOf(entry: StoredManifestEntry): ManifestEntry {
  const content = entry.hypothesis_revision;
  return {
    position: entry.position,
    hypothesis_revision: {
      hypothesis: { name: content.hypothesis_name },
      revision: content.revision,
      criterion: content.criterion,
      collects: content.collects,
      resolution: content.resolution,
    },
  };
}

/** One reshaped manifest entry's own adopted hypothesis-revision, flattened into case.ts's own out-of-scope Hypothesis projection (case.ts's own header comment) — the same flattening parse-case-document.ts's own flatHypothesisOf keeps for a freshly parsed document, never independently declared. */
function trustedHypothesisOf(entry: ManifestEntry): Hypothesis {
  const revision = entry.hypothesis_revision;
  return {
    name: revision.hypothesis.name,
    criterion: revision.criterion,
    collects: revision.collects,
    resolution: revision.resolution,
  };
}

/** Answers the assembled version, refusing an unstored one through the typed not-found error read-case and replay-case share. */
async function heldVersion(store: ICaseStore, slug: string, version: number): Promise<AssembledCaseVersion> {
  const assembled = await store.assembleVersion(slug, version);
  if (assembled === undefined) {
    throw new CaseNotFoundError(slug, version);
  }
  return assembled;
}

/**
 * Parses the assembled version for read-case, joining a structural refusal
 * into the one joint error type read-case promises
 * (contracts/system/case-authoring) — every violated structural rule named
 * together, exactly as InvalidCaseDocumentError already collected them.
 */
function structuralCase(assembled: AssembledCaseVersion, slug: string, version: number): Case {
  try {
    return parseCaseDocument(assembledAsRawDocument(assembled), slug);
  } catch (error) {
    if (error instanceof InvalidCaseDocumentError) {
      throw new CaseNotValidError(slug, version, error.context.problems);
    }
    throw error;
  }
}

/**
 * Projects the assembled version into the flat raw shape parseCaseDocument
 * accepts: each manifest entry's own adopted hypothesis-revision content
 * flattened onto the entry itself (hypothesis_name, revision, criterion,
 * collects, resolution) rather than nested under hypothesis_revision, the
 * document shape parse-case-document.ts's own ManifestEntryDocument
 * declares — the same projection release.operation.ts's own
 * assembledAsDocument already builds for the same gap, duplicated here
 * rather than shared (this module's own header comment, disclosed as a
 * divergence from MNT-03 in this task's delivery record).
 */
function assembledAsRawDocument(assembled: AssembledCaseVersion): unknown {
  return {
    slug: assembled.slug,
    title: assembled.title,
    when_to_use: assembled.when_to_use,
    version: assembled.version,
    authored_at: assembled.authored_at,
    subject: assembled.subject,
    fallback: assembled.fallback,
    ...(assembled.consolidation_register !== undefined
      ? { consolidation_register: assembled.consolidation_register }
      : {}),
    state: assembled.state,
    ...(assembled.released_at !== undefined ? { released_at: assembled.released_at } : {}),
    manifest: assembled.manifest.map((entry) => ({
      position: entry.position,
      hypothesis_name: entry.hypothesis_revision.hypothesis_name,
      revision: entry.hypothesis_revision.revision,
      criterion: entry.hypothesis_revision.criterion,
      collects: entry.hypothesis_revision.collects,
      resolution: entry.hypothesis_revision.resolution,
    })),
  };
}
