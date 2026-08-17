// The port through which every case-lifecycle fact reaches its persistence
// (task/case-lifecycle-persistence/relational-case-store-for-lifecycle),
// rebuilt against the schema task/case-lifecycle-persistence/case-version-lifecycle-schema
// added: a hypothesis's own stable identity (domain/knowledge/hypothesis),
// split from its numbered content (domain/knowledge/hypothesis-revision),
// adopted into a case version's manifest at a declared position
// (domain/knowledge/manifest-entry) — replacing the flat, per-version
// hypotheses shape and the single writeVersion/readVersion pair this port
// used to declare. The case module declares it and infrastructure
// implements it (constraints/the-domain-depends-on-no-infrastructure): no
// case module opens a file or imports a driver here.
//
// This is a full replacement of the port's previous shape, not an
// extension of it: readVersion/writeVersion/listVersions and
// StoredCaseVersion are gone, because the aggregate they answered for —
// one whole per-version document — is no longer what this store persists
// or reads. A caller still built against that shape (case-query.service.ts,
// author-case-version.service.ts, and whatever wires either) needs its own
// rewiring against the shape below; that rewiring is a later task's, not
// this one's (task/case-lifecycle-operations/wire-and-retire-author-case-version).
//
// One storage primitive per lifecycle mutation, mirroring
// domain/knowledge/case-version's own declared operations
// (place-hypothesis, remove-hypothesis, release, discard) and
// domain/knowledge/case's own (create-draft) and
// domain/knowledge/hypothesis's own (revise): this port states no
// validation and no business refusal beyond what a schema constraint
// already decides — assembling a whole version, whether or not one exists,
// is the one read this port still composes end to end
// (constraints/a-case-is-read-whole).
//
// findDraftVersion is this file's one later addition
// (work/revise-hypothesis-draft-gate/task/revise-hypothesis-draft-gate/refuse-without-draft),
// closing the UNDERDETERMINED note revise-hypothesis.operation.ts's own
// header disclosed: no read existed here answering "which version, if any,
// of this case is currently in draft" without already knowing the version
// number, and rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
// needs exactly that read before a hypothesis is revised.
//
// listCases is this file's next later addition
// (task/case-query-http/list-cases-store-extension), answering
// contracts/knowledge/case-query's own list-cases operation: every case
// currently held, paginated per src/types/pagination.ts's own
// PaginationRequest/PaginatedResponse<T>. It carries no filter and no new
// refusal — an empty store answers an empty page, never an error or
// undefined, the same absence-as-data rule every other read in this port
// already keeps.
//
// listCaseVersions is this file's next later addition
// (task/case-query-http/list-case-versions-store-extension), answering
// contracts/knowledge/case-query's own list-case-versions operation: every
// version a named case currently holds, paginated the same way listCases
// already is. Refused, through CaseNotFoundError, only where the named slug
// names no case at all — the same typed error assembleVersion's own callers
// already raise for the matching absence (case-query.service.ts,
// release.operation.ts, discard.operation.ts, manifest-composition.operations.ts),
// raised here directly by the store itself instead, since this is the one
// place that already knows whether the case's own identity row exists
// before any version is ever read. A case currently holding no version — every
// one of its own discarded and none yet drafted or released — answers an
// empty page instead, never this refusal: domain/knowledge/case's own
// next_version is a fact of the case's identity that survives every one of
// its versions being discarded, so the case itself does not stop existing
// just because it currently holds none. CaseVersionListItem is this port's
// own inference for what a listing item carries, disclosed in this task's
// delivery record: the version number and its own declared state alone,
// lighter than assembleVersion's own whole-version read.

import type { ConsolidationRegister } from '../investigation/consolidation-register.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import type { Resolution } from './case.js';

/**
 * The one state domain/knowledge/case-version-state names, restricting a
 * case version to exactly the two values its lifecycle ever holds
 * (rules/knowledge/a-case-version-moves-through-its-declared-lifecycle).
 */
export type CaseVersionState = 'draft' | 'released';

/**
 * One numbered state of a hypothesis's own content, adopted by a manifest
 * entry (domain/knowledge/hypothesis-revision): hypothesis_name is the
 * identity this revision belongs to (domain/knowledge/hypothesis), carried
 * flat here the same way PinnedCase flattens a case's own identifying
 * fields (src/investigation/investigation.ts) rather than nesting a further
 * reference.
 */
export type HypothesisRevisionContent = {
  readonly hypothesis_name: string;
  readonly revision: number;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

/**
 * One line of a case version's manifest (domain/knowledge/manifest-entry):
 * the precedence position this version places one hypothesis at, and
 * exactly which revision of that hypothesis's content it uses.
 */
export type ManifestEntry = {
  readonly position: number;
  readonly hypothesis_revision: HypothesisRevisionContent;
};

/**
 * One version of a case, assembled whole (domain/knowledge/case-version):
 * every declared attribute, its manifest in declared-position order and
 * each manifest entry's own adopted hypothesis-revision and its collects
 * (constraints/a-case-is-read-whole). slug identifies the case this version
 * belongs to, carried flat the same way PinnedCase carries a case's slug
 * and version together rather than nesting a further reference to Case —
 * no node names a field for this relationship, so this is this port's own
 * choice, disclosed in its delivery record.
 */
export type AssembledCaseVersion = {
  readonly slug: string;
  readonly version: number;
  readonly title: string;
  readonly when_to_use: string;
  readonly authored_at: string;
  readonly subject: string;
  readonly fallback: Resolution;
  readonly consolidation_register?: ConsolidationRegister;
  readonly state: CaseVersionState;
  /** Present only once released (domain/knowledge/case-version's own "released_at is present only once released"). */
  readonly released_at?: string;
  readonly manifest: readonly ManifestEntry[];
};

/**
 * What create-draft needs to originate a new draft version
 * (domain/knowledge/case's own create-draft): every attribute the new
 * version's own row requires, and which existing version's manifest to
 * copy into the new draft's own manifest — a specific version, or, naming
 * none, the case's own latest released version
 * (rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version).
 * Bundled as one object because the field count already exceeds the
 * standard's three-positional-parameter limit (MNT-01).
 */
export type CreateDraftInput = {
  readonly slug: string;
  readonly title: string;
  readonly when_to_use: string;
  readonly authored_at: string;
  readonly subject: string;
  readonly fallback: Resolution;
  readonly consolidation_register?: ConsolidationRegister;
  /** Naming none copies the case's own latest released version's manifest instead, empty where the case holds none yet. */
  readonly source_version?: number;
};

/**
 * What revise needs to originate one new hypothesis-revision
 * (domain/knowledge/hypothesis's own revise): the hypothesis's own name —
 * identity, created only the first time this case ever uses it
 * (rules/knowledge/a-hypothesis-name-is-unique-within-its-case) — and the
 * revision's own content.
 */
export type HypothesisRevisionInput = {
  readonly slug: string;
  readonly hypothesis_name: string;
  readonly criterion: string;
  readonly collects: readonly string[];
  readonly resolution: Resolution;
};

/**
 * What place-hypothesis needs to adopt one hypothesis-revision into one
 * case version's manifest, at one declared position
 * (domain/knowledge/case-version's own place-hypothesis,
 * domain/knowledge/manifest-entry).
 */
export type PlaceHypothesisInput = {
  readonly slug: string;
  readonly version: number;
  readonly hypothesis_name: string;
  readonly revision: number;
  readonly position: number;
};

/**
 * One case's own bare identity as listCases answers it: slug alone —
 * domain/knowledge/case's own identity carries nothing else beyond
 * next_version, and next_version is the durable counter that assigns a
 * draft's version number, not a fact a listing of cases states about each
 * one (domain/knowledge/case's own "almost everything a curator once wrote
 * directly onto 'the case' ... now belongs to a specific case version").
 */
export type CaseIdentity = {
  readonly slug: string;
};

/**
 * One version of a case as listCaseVersions answers it: its own number and
 * declared lifecycle state alone (domain/knowledge/case-version's own
 * "version" and "state" attributes) — every heavier attribute the same node
 * declares (title, when_to_use, authored_at, subject, fallback,
 * consolidation_register, released_at, manifest) is what assembleVersion's
 * own whole read answers, not what a listing of a case's versions states
 * about each one. No node names a shape for this listing item, so this is
 * this port's own inference, disclosed in this task's delivery record.
 */
export type CaseVersionListItem = {
  readonly version: number;
  readonly state: CaseVersionState;
};

/**
 * The port through which every case-lifecycle fact reaches its persistence:
 * one whole read, and one storage primitive per lifecycle mutation. Every
 * refusal this port's implementation raises is what a schema constraint the
 * sibling migration task added maps to — no business rule is re-decided
 * here that the schema does not already decide.
 */
export interface ICaseStore {
  /**
   * Assembles one version of a case whole: its own attributes, its manifest
   * in declared-position order, and each manifest entry's own adopted
   * hypothesis-revision and its collects, in one transaction, whole or not
   * at all (constraints/a-case-is-read-whole). An unstored slug/version
   * answers absence — undefined — before any manifest entry is ever read,
   * never a partial assembly.
   */
  assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion | undefined>;

  /**
   * Answers the version number of the one version this case currently holds
   * in draft state, if any — undefined where the case holds none: never
   * drafted, or its only draft already released or discarded.
   * rules/knowledge/a-case-has-at-most-one-draft guarantees at most one such
   * version ever exists to answer, so this never needs to disambiguate among
   * several. revise-hypothesis.operation.ts's own gate reads this before
   * originating any hypothesis identity or revision
   * (rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft).
   */
  findDraftVersion(slug: string): Promise<number | undefined>;

  /**
   * Lists every case currently held, by its own bare identity, paginated per
   * src/types/pagination.ts (contracts/knowledge/case-query's own list-cases
   * operation). Carries no filter — every case, not a subset a caller
   * narrowed. An empty store answers an empty page — data: [], total: 0 —
   * never an error or undefined.
   */
  listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseIdentity>>;

  /**
   * Lists every version the named case currently holds, by its own bare
   * number and declared state, paginated per src/types/pagination.ts
   * (contracts/knowledge/case-query's own list-case-versions operation).
   * Refused, through CaseNotFoundError, where the named slug names no case
   * at all — never where the case exists but currently holds no version
   * (every one of its versions discarded and none yet drafted or released),
   * which answers an empty page instead, the same absence-as-data rule
   * listCases already keeps for an empty store.
   */
  listCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>>;

  /**
   * Originates a new draft version: assigns the case's next version number
   * by incrementing its own durable counter, never by computing MAX(version)
   * over existing rows (rules/knowledge/a-case-version-number-is-never-reused),
   * and copies the named source version's manifest — or, naming none, the
   * case's own latest released version's manifest — into the new draft's
   * own manifest, entry for entry
   * (rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version).
   * Refused where the case already holds a version in draft state
   * (rules/knowledge/a-case-has-at-most-one-draft), through
   * CaseAlreadyHasDraftError. Answers the newly assigned version number.
   */
  createDraft(input: CreateDraftInput): Promise<number>;

  /**
   * Originates one new hypothesis-revision: creates the hypothesis's own
   * identity row only the first time its name is used for this case, never
   * a second identity row for a name already held
   * (rules/knowledge/a-hypothesis-name-is-unique-within-its-case), and
   * numbers the revision one past that hypothesis's own highest existing
   * revision, or 1 where none exists yet
   * (rules/knowledge/a-hypothesis-revision-number-is-never-reused). Answers
   * the assigned revision number.
   */
  insertHypothesisRevision(input: HypothesisRevisionInput): Promise<number>;

  /**
   * Places one hypothesis-revision at one position in one case version's
   * manifest. Refused where that position is already occupied by a
   * different hypothesis in the same version's manifest
   * (rules/knowledge/a-hypothesis-position-is-unique-within-its-case),
   * through ManifestPositionOccupiedError.
   */
  placeHypothesis(input: PlaceHypothesisInput): Promise<void>;

  /**
   * Removes one manifest entry, by the hypothesis it names, from one case
   * version's manifest — deletes only that entry, never the
   * hypothesis-revision it referenced
   * (domain/knowledge/case-version's own remove-hypothesis).
   */
  removeManifestEntry(slug: string, version: number, hypothesisName: string): Promise<void>;

  /**
   * Transitions a version's state to released, recording the instant of
   * release (rules/knowledge/a-case-version-moves-through-its-declared-lifecycle).
   * No further write against that version's own row or its manifest entries
   * takes effect afterward
   * (rules/knowledge/a-case-version-is-written-once) — enforced by the
   * schema's own release-conditioned rules, not re-checked here.
   */
  release(slug: string, version: number): Promise<void>;

  /**
   * Discards a draft version: removes it and its own manifest entries,
   * never any hypothesis-revision they referenced
   * (rules/knowledge/only-a-draft-case-version-may-be-discarded). A
   * released version is never removed — enforced by the schema's own
   * release-conditioned delete rules, not re-checked here.
   */
  discard(slug: string, version: number): Promise<void>;
}
