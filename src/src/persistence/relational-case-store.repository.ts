// The relational adapter behind the case module's rebuilt store port
// (task/case-lifecycle-persistence/relational-case-store-for-lifecycle),
// rewritten in place against the schema
// task/case-lifecycle-persistence/case-version-lifecycle-schema added: a
// case's own durable version counter (cases.next_version), a case version's
// draft/released state and released_at (case_versions), a hypothesis split
// into its own identity (hypotheses, now identity-only) and its numbered
// content (hypothesis_revisions, hypothesis_revision_collects), and the
// manifest a case version composes them through
// (case_version_hypotheses). It replaces this same file's previous
// implementation, which targeted the flat, per-version hypotheses table
// migrations/0004-case-and-hypothesis.sql declared and migrations/0009
// dropped — every statement below is written against the new tables only.
//
// assembleVersion answers a case version whole: its own attributes, its
// manifest in declared-position order and each manifest entry's own
// adopted hypothesis-revision and its collects, all through the one
// connection runInTransaction checks out (constraints/a-case-is-read-whole,
// criterion 1) — an unstored slug/version answers undefined before any
// manifest entry is ever read, never a partial assembly (criterion 2).
//
// Every refusal below is what a schema constraint from the sibling
// migration task maps to, the same unique-violation-to-typed-error
// convention this file already kept for CaseVersionAlreadyStoredError: a
// second draft is refused through CaseAlreadyHasDraftError, mapped from the
// case_versions_one_draft_per_case partial unique index (criterion 5), and
// placing a revision at an occupied position is refused through
// ManifestPositionOccupiedError, mapped from the
// case_version_hypotheses_position_unique constraint (criterion 8). No
// other business rule is re-decided here: release() and discard() write
// exactly what their own criteria state (criterion 10, criterion 11) and
// rely on the schema's own release-conditioned rules
// (case_versions_no_update, case_versions_no_delete_when_released,
// case_version_hypotheses_no_update_when_released,
// case_version_hypotheses_no_delete_when_released) to make a write against
// an already-released version's row or manifest take no effect — discard()
// deletes a case version's own row and its manifest entries by identifier
// alone, with no check of the version's own state field, the same judgment
// the sibling schema task's own migration comments already apply to this
// exact gap (this task's own UNDERDETERMINED note): the declarative rule is
// what refuses removing a released version, not application logic
// re-checking what the schema already decides.
//
// findDraftVersion is this file's one later addition
// (work/revise-hypothesis-draft-gate/task/revise-hypothesis-draft-gate/refuse-without-draft):
// one read against case_versions, run directly against the pool rather than
// through runInTransaction, the same convention placeHypothesis, release and
// removeManifestEntry already keep for a single statement that needs no
// unit-of-work boundary.
//
// listCases is this file's next later addition
// (task/case-query-http/list-cases-store-extension): every row of "cases" —
// which, per this file's own long-standing header comment, holds one row
// per slug and nothing else — by slug alone, in one transaction the same
// way assembleVersion already runs its own two related reads (the page and
// its total) so the two never disagree about what was held at the instant
// either ran. total, limit, offset and pageCount answer exactly what
// src/types/pagination.ts's own PaginatedResponse<T> declares (API-03); an
// empty "cases" table answers total: 0 and data: [], never an error or
// undefined.
//
// listCaseVersions is this file's next later addition
// (task/case-query-http/list-case-versions-store-extension): every row of
// "case_versions" for one named slug, by its own version and state alone
// (CaseVersionListItem), paginated the same way listCasesPage already is —
// one transaction running the case-identity check, the total and the page
// together so none of the three can disagree about what was held at the
// instant any of them ran. The case-identity check is what tells an unknown
// slug (refused, through CaseNotFoundError) apart from a known one currently
// holding no version (answered as an empty page, never a refusal) — a case
// row survives the discarding of every version it ever held, since
// cases.next_version is a durable counter, not a fact derived from
// case_versions' own rows. CaseNotFoundError's constructor requires a
// version number that has no referent here — no particular version is ever
// named by this refusal — so NO_VERSION_NAMED below stands in for it, this
// task's own inference, disclosed in its delivery record, since 0 is a
// version cases.next_version's own DEFAULT 1 (migrations/0009-case-version-
// lifecycle-schema.sql) guarantees no case version is ever assigned.
//
// Names no import of 'pg': DatabaseConnection and the
// runStatement/queryOneOrAbsent/runInTransaction helpers database-access.ts
// already declares are the only things this file names for the pool it is
// given (STK-05). Every statement below is schema-qualified as
// public.<table>, the same convention this file's previous implementation
// already documented at length: this project's DATABASE_URL reaches
// Postgres through a transaction-pooling endpoint that can hand back a
// physical connection still carrying an unrelated, already-finished
// session's own search_path, so an unqualified name could otherwise resolve
// against whatever schema happened to be ambient rather than against
// public — true of a single statement run directly against the pool
// (placeHypothesis, removeManifestEntry, release) exactly as it is of one
// run inside a transaction this module opens itself.
import type {
  AssembledCaseVersion,
  CaseIdentity,
  CaseVersionListItem,
  CaseVersionState,
  CreateDraftInput,
  HypothesisRevisionContent,
  HypothesisRevisionInput,
  ICaseStore,
  ManifestEntry,
  PlaceHypothesisInput,
} from '../case/case-store.port.js';
import type { Resolution } from '../case/case.js';
import { CaseAlreadyHasDraftError } from '../errors/case-already-has-draft.error.js';
import { CaseNotFoundError } from '../errors/case-not-found.error.js';
import { CaseStoreError } from '../errors/case-store.error.js';
import { ManifestPositionOccupiedError } from '../errors/manifest-position-occupied.error.js';
import type { ConsolidationRegister } from '../investigation/consolidation-register.js';
import { CONSOLIDATION_REGISTERS } from '../investigation/consolidation-register.js';
import type { PaginatedResponse, PaginationRequest } from '../types/pagination.js';
import {
  queryOneOrAbsent,
  runInTransaction,
  runStatement,
  type IQueryable,
  type IStatement,
  type RaiseStoreError,
} from './database-access.js';
import type { DatabaseConnection } from './database-connection.js';

/** slug and version together, the pair every case_versions/case_version_hypotheses statement below is built from — bundled once so no helper needs more than the standard's own three-positional-parameter limit (MNT-01). */
interface ICaseVersionKey {
  readonly slug: string;
  readonly version: number;
}

/** A case slug and a hypothesis name together, the pair every hypotheses/hypothesis_revisions statement not yet numbered by a revision is built from. */
interface IHypothesisKey {
  readonly slug: string;
  readonly hypothesis_name: string;
}

/** An IHypothesisKey narrowed to one numbered revision, the triple hypothesis_revision_collects' own key is built from. */
interface IRevisionKey extends IHypothesisKey {
  readonly revision: number;
}

/** One row of "case_versions", exactly the columns beyond its own key: the flattened fallback, the optional consolidation register, and the lifecycle pair this schema added. */
interface ICaseVersionRow {
  readonly title: string;
  readonly when_to_use: string;
  readonly authored_at: Date;
  readonly subject: string;
  readonly fallback_outcome: string;
  readonly fallback_action: string;
  readonly fallback_recipient: string;
  readonly consolidation_register: string | null;
  readonly state: string;
  readonly released_at: Date | null;
}

/** One row of one version's manifest, joined to its adopted hypothesis-revision's own content. */
interface IManifestRow {
  readonly position: number;
  readonly hypothesis_name: string;
  readonly revision: number;
  readonly criterion: string;
  readonly resolution_outcome: string;
  readonly resolution_action: string;
  readonly resolution_recipient: string;
}

/** One row of one manifest entry's own adopted revision's collects. */
interface ICollectRow {
  readonly hypothesis_name: string;
  readonly concept_name: string;
}

/** Every value domain/knowledge/consolidation-register declares, reused rather than re-listed (MNT-03), the same convention this file's previous implementation already kept. */
const CONSOLIDATION_REGISTER_VALUES: ReadonlySet<string> = new Set<string>(CONSOLIDATION_REGISTERS);

/** Schema-qualified table names, named once and reused across every statement below rather than repeated as literals (TYP-04). */
const CASES_TABLE = 'public.cases';
const CASE_VERSIONS_TABLE = 'public.case_versions';
const HYPOTHESES_TABLE = 'public.hypotheses';
const HYPOTHESIS_REVISIONS_TABLE = 'public.hypothesis_revisions';
const HYPOTHESIS_REVISION_COLLECTS_TABLE = 'public.hypothesis_revision_collects';
const CASE_VERSION_HYPOTHESES_TABLE = 'public.case_version_hypotheses';

/** The two values domain/knowledge/case-version-state declares (TYP-04), named once rather than spelled at each write. */
const DRAFT_STATE: CaseVersionState = 'draft';
const RELEASED_STATE: CaseVersionState = 'released';

/** Postgres' own error code for a unique-constraint violation, the signal every refusal below is decided by (TYP-04), the same convention this file's previous implementation already kept. */
const UNIQUE_VIOLATION_CODE = '23505';

/** The two constraint names a unique violation is disambiguated by (TYP-04): which schema rule fired decides which typed error this store raises. */
const ONE_DRAFT_PER_CASE_CONSTRAINT = 'case_versions_one_draft_per_case';
const POSITION_UNIQUE_CONSTRAINT = 'case_version_hypotheses_position_unique';

/** Stands in for CaseNotFoundError's own required version number where listCaseVersions refuses a slug naming no case at all (TYP-04) — no particular version is ever named by that refusal, and 0 is one cases.next_version's own DEFAULT 1 guarantees no case version is ever assigned (migrations/0009-case-version-lifecycle-schema.sql), so it can never be mistaken for a real one. This task's own inference, disclosed in its delivery record. */
const NO_VERSION_NAMED = 0;

/**
 * The relational adapter of the case module's rebuilt store port: assembles
 * one version whole (criterion 1, criterion 2), originates a draft
 * (criterion 3, criterion 4, criterion 5), originates a hypothesis-revision
 * (criterion 6, criterion 7), places and removes manifest entries
 * (criterion 8, criterion 9), and transitions a version to released or
 * discards a draft (criterion 10, criterion 11).
 */
export class RelationalCaseStore implements ICaseStore {
  public constructor(private readonly connection: DatabaseConnection) {}

  public async assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion | undefined> {
    return runInTransaction(this.connection, raiseReadFailure, (tx) => assembleWholeVersion(tx, { slug, version }));
  }

  public async findDraftVersion(slug: string): Promise<number | undefined> {
    const row = await queryOneOrAbsent<{ version: number }>(this.connection, draftVersionSelect(slug), raiseReadFailure);
    return row?.version;
  }

  public async listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseIdentity>> {
    return runInTransaction(this.connection, raiseReadFailure, (tx) => listCasesPage(tx, pagination));
  }

  public async listCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>> {
    return runInTransaction(this.connection, raiseReadFailure, (tx) => listCaseVersionsPage(tx, slug, pagination));
  }

  public async createDraft(input: CreateDraftInput): Promise<number> {
    return runInTransaction(this.connection, raiseWriteFailure, (tx) => createDraftVersion(tx, input));
  }

  public async insertHypothesisRevision(input: HypothesisRevisionInput): Promise<number> {
    return runInTransaction(this.connection, raiseWriteFailure, (tx) => insertRevision(tx, input));
  }

  public async placeHypothesis(input: PlaceHypothesisInput): Promise<void> {
    await runStatement(this.connection, placeHypothesisStatement(input), raisePlaceHypothesisFailure(input));
  }

  public async removeManifestEntry(slug: string, version: number, hypothesisName: string): Promise<void> {
    await runStatement(this.connection, removeManifestEntryStatement(slug, version, hypothesisName), raiseWriteFailure);
  }

  public async release(slug: string, version: number): Promise<void> {
    await runStatement(this.connection, releaseStatement(slug, version), raiseWriteFailure);
  }

  public async discard(slug: string, version: number): Promise<void> {
    await runInTransaction(this.connection, raiseWriteFailure, (tx) => discardDraft(tx, { slug, version }));
  }
}

// ---------------------------------------------------------------- assembleVersion

/** Reads one whole version through the caller's own transaction: an absent version answers undefined before any manifest entry is ever read (criterion 2), never a partial assembly. */
async function assembleWholeVersion(tx: IQueryable, key: ICaseVersionKey): Promise<AssembledCaseVersion | undefined> {
  const versionRow = await queryOneOrAbsent<ICaseVersionRow>(tx, caseVersionSelect(key), raiseReadFailure);
  if (versionRow === undefined) {
    return undefined;
  }
  const manifest = await readManifest(tx, key);
  return assembledCaseVersionOf(key, versionRow, manifest);
}

/** One version's own manifest, in declared-position order, each entry joined to its adopted hypothesis-revision's own content and collects (criterion 1). */
async function readManifest(tx: IQueryable, key: ICaseVersionKey): Promise<readonly ManifestEntry[]> {
  const rows = await runStatement<IManifestRow>(tx, manifestSelect(key), raiseReadFailure);
  const collects = await collectsByHypothesisName(tx, key);
  return rows.map((row) => manifestEntryOf(row, collects.get(row.hypothesis_name) ?? []));
}

/** Every concept each manifest entry's own adopted revision collects, grouped by the hypothesis's own name — one row per hypothesis within one version's manifest, so grouping by name alone is unambiguous here. */
async function collectsByHypothesisName(tx: IQueryable, key: ICaseVersionKey): Promise<ReadonlyMap<string, readonly string[]>> {
  const rows = await runStatement<ICollectRow>(tx, manifestCollectsSelect(key), raiseReadFailure);
  const grouped = new Map<string, string[]>();
  for (const row of rows) {
    const concepts = grouped.get(row.hypothesis_name) ?? [];
    concepts.push(row.concept_name);
    grouped.set(row.hypothesis_name, concepts);
  }
  return grouped;
}

/** One manifest row plus its already-grouped collects, assembled into the shape domain/knowledge/manifest-entry and domain/knowledge/hypothesis-revision together declare. */
function manifestEntryOf(row: IManifestRow, collects: readonly string[]): ManifestEntry {
  const hypothesisRevision: HypothesisRevisionContent = {
    hypothesis_name: row.hypothesis_name,
    revision: row.revision,
    criterion: row.criterion,
    collects,
    resolution: resolutionOf(row.resolution_outcome, row.resolution_action, row.resolution_recipient),
  };
  return { position: row.position, hypothesis_revision: hypothesisRevision };
}

/** The whole case version these rows together answer, in the shape domain/knowledge/case-version declares — slug and version come from the given key, never from a column of their own. */
function assembledCaseVersionOf(key: ICaseVersionKey, row: ICaseVersionRow, manifest: readonly ManifestEntry[]): AssembledCaseVersion {
  const consolidationRegister = consolidationRegisterOf(row.consolidation_register);
  return {
    slug: key.slug,
    version: key.version,
    title: row.title,
    when_to_use: row.when_to_use,
    authored_at: row.authored_at.toISOString(),
    subject: row.subject,
    fallback: resolutionOf(row.fallback_outcome, row.fallback_action, row.fallback_recipient),
    ...(consolidationRegister !== undefined ? { consolidation_register: consolidationRegister } : {}),
    state: caseVersionStateOf(row.state),
    ...(row.released_at !== null ? { released_at: row.released_at.toISOString() } : {}),
    manifest,
  };
}

function caseVersionSelect(key: ICaseVersionKey): IStatement {
  return {
    text: `SELECT title, when_to_use, authored_at, subject,
                  fallback_outcome, fallback_action, fallback_recipient, consolidation_register,
                  state, released_at
           FROM ${CASE_VERSIONS_TABLE}
           WHERE slug = $1 AND version = $2`,
    params: [key.slug, key.version],
  };
}

/** The version currently in draft state for the given slug, if any (rules/knowledge/a-case-has-at-most-one-draft guarantees at most one row can ever match). */
function draftVersionSelect(slug: string): IStatement {
  return {
    text: `SELECT version FROM ${CASE_VERSIONS_TABLE} WHERE slug = $1 AND state = $2`,
    params: [slug, DRAFT_STATE],
  };
}

// ---------------------------------------------------------------- listCases

/** Every case currently held, by slug alone, paginated: the total count and this page's own rows, read through the same transaction so the two never disagree about what "cases" held at that instant — an empty table answers total: 0 and data: [], never an error or undefined. */
async function listCasesPage(tx: IQueryable, pagination: PaginationRequest): Promise<PaginatedResponse<CaseIdentity>> {
  const total = await countCases(tx);
  const rows = await runStatement<{ slug: string }>(tx, casesPageSelect(pagination), raiseReadFailure);
  return {
    data: rows.map((row) => ({ slug: row.slug })),
    total,
    limit: pagination.limit,
    offset: pagination.offset,
    pageCount: pageCountOf(total, pagination.limit),
  };
}

/** How many rows "cases" holds in total, across every page — 0 where it holds none. */
async function countCases(tx: IQueryable): Promise<number> {
  const row = await queryOneOrAbsent<{ count: string }>(tx, casesCountSelect(), raiseReadFailure);
  return row === undefined ? 0 : Number(row.count);
}

function casesCountSelect(): IStatement {
  return { text: `SELECT COUNT(*) AS count FROM ${CASES_TABLE}` };
}

/** One page of "cases", ordered by slug so a stable page boundary means the same rows on a repeated call between two writes. */
function casesPageSelect(pagination: PaginationRequest): IStatement {
  return {
    text: `SELECT slug FROM ${CASES_TABLE} ORDER BY slug LIMIT $1 OFFSET $2`,
    params: [pagination.limit, pagination.offset],
  };
}

/** The page count this limit divides total into (API-03) — 0 for a non-positive limit, since dividing by it would answer no page count at all rather than one a caller could page through; neither this task's own criteria nor src/types/pagination.ts states what a non-positive limit answers, so this is this store's own defensive floor rather than a documented behavior. */
function pageCountOf(total: number, limit: number): number {
  return limit > 0 ? Math.ceil(total / limit) : 0;
}

function manifestSelect(key: ICaseVersionKey): IStatement {
  return {
    text: `SELECT cvh.position, cvh.hypothesis_name, cvh.revision,
                  hr.criterion, hr.resolution_outcome, hr.resolution_action, hr.resolution_recipient
           FROM ${CASE_VERSION_HYPOTHESES_TABLE} cvh
           JOIN ${HYPOTHESIS_REVISIONS_TABLE} hr
             ON hr.case_slug = cvh.case_slug AND hr.hypothesis_name = cvh.hypothesis_name AND hr.revision = cvh.revision
           WHERE cvh.case_slug = $1 AND cvh.case_version = $2
           ORDER BY cvh.position`,
    params: [key.slug, key.version],
  };
}

function manifestCollectsSelect(key: ICaseVersionKey): IStatement {
  return {
    text: `SELECT cvh.hypothesis_name, hrc.concept_name
           FROM ${CASE_VERSION_HYPOTHESES_TABLE} cvh
           JOIN ${HYPOTHESIS_REVISION_COLLECTS_TABLE} hrc
             ON hrc.case_slug = cvh.case_slug AND hrc.hypothesis_name = cvh.hypothesis_name AND hrc.revision = cvh.revision
           WHERE cvh.case_slug = $1 AND cvh.case_version = $2
           ORDER BY cvh.hypothesis_name, hrc.concept_name`,
    params: [key.slug, key.version],
  };
}

// ---------------------------------------------------------------- listCaseVersions

/** Every version the named case currently holds, by its own number and state alone, paginated — refused through CaseNotFoundError where the slug names no case at all (criterion 2), the identity check, the total and the page all read through the same transaction so none of the three can disagree about what "case_versions" held at the instant any of them ran. */
async function listCaseVersionsPage(tx: IQueryable, slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>> {
  await requireCaseIdentity(tx, slug);
  const total = await countCaseVersions(tx, slug);
  const rows = await runStatement<{ version: number; state: string }>(tx, caseVersionsPageSelect(slug, pagination), raiseReadFailure);
  return {
    data: rows.map((row) => ({ version: row.version, state: caseVersionStateOf(row.state) })),
    total,
    limit: pagination.limit,
    offset: pagination.offset,
    pageCount: pageCountOf(total, pagination.limit),
  };
}

/** Refuses, through CaseNotFoundError, a slug the "cases" table holds no row for at all (criterion 2) — the one check that tells an unknown case apart from a known one currently holding no version. */
async function requireCaseIdentity(tx: IQueryable, slug: string): Promise<void> {
  const row = await queryOneOrAbsent<{ slug: string }>(tx, caseIdentitySelect(slug), raiseReadFailure);
  if (row === undefined) {
    throw new CaseNotFoundError(slug, NO_VERSION_NAMED);
  }
}

function caseIdentitySelect(slug: string): IStatement {
  return { text: `SELECT slug FROM ${CASES_TABLE} WHERE slug = $1`, params: [slug] };
}

/** How many versions the named case holds in total, across every page — 0 where it currently holds none (every one discarded, or none yet drafted or released). */
async function countCaseVersions(tx: IQueryable, slug: string): Promise<number> {
  const row = await queryOneOrAbsent<{ count: string }>(tx, caseVersionsCountSelect(slug), raiseReadFailure);
  return row === undefined ? 0 : Number(row.count);
}

function caseVersionsCountSelect(slug: string): IStatement {
  return { text: `SELECT COUNT(*) AS count FROM ${CASE_VERSIONS_TABLE} WHERE slug = $1`, params: [slug] };
}

/** One page of the named case's own versions, ordered by version so a stable page boundary means the same rows on a repeated call between two writes. */
function caseVersionsPageSelect(slug: string, pagination: PaginationRequest): IStatement {
  return {
    text: `SELECT version, state FROM ${CASE_VERSIONS_TABLE} WHERE slug = $1 ORDER BY version LIMIT $2 OFFSET $3`,
    params: [slug, pagination.limit, pagination.offset],
  };
}

// ---------------------------------------------------------------- createDraft

/** Originates one new draft: claims the case identity, assigns the next version off its own durable counter, resolves which version's manifest to copy, inserts the draft's own row (refused where a draft already exists), and copies the resolved source's manifest entry for entry. */
async function createDraftVersion(tx: IQueryable, input: CreateDraftInput): Promise<number> {
  await runStatement(tx, caseIdentityStatement(input.slug), raiseWriteFailure);
  const version = await assignNextVersion(tx, input.slug);
  const sourceVersion = await resolveSourceVersion(tx, input);
  await runStatement(tx, draftInsertStatement(input, version), raiseCreateDraftFailure(input.slug));
  if (sourceVersion !== undefined) {
    await runStatement(tx, manifestCopyStatement(input.slug, version, sourceVersion), raiseWriteFailure);
  }
  return version;
}

/** Idempotently claims the case's own identity row, never refusing an already-held slug — a second draft under it is not a second case. */
function caseIdentityStatement(slug: string): IStatement {
  return { text: `INSERT INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING`, params: [slug] };
}

/** The case's next version number, assigned by incrementing its own durable counter and answering the value it held before the increment — never MAX(version) over existing rows (criterion 3, rules/knowledge/a-case-version-number-is-never-reused). */
async function assignNextVersion(tx: IQueryable, slug: string): Promise<number> {
  const row = await queryOneOrAbsent<{ version: number }>(tx, nextVersionUpdateStatement(slug), raiseWriteFailure);
  if (row === undefined) {
    throw raiseWriteFailure(new Error(`cases holds no row for slug "${slug}" to assign a version from`));
  }
  return row.version;
}

function nextVersionUpdateStatement(slug: string): IStatement {
  return {
    text: `UPDATE ${CASES_TABLE} SET next_version = next_version + 1
           WHERE slug = $1
           RETURNING next_version - 1 AS version`,
    params: [slug],
  };
}

/** The version whose manifest the new draft copies: the one named, or, naming none, the case's own latest released version — undefined where the case holds no released version yet (criterion 4, rules/knowledge/a-new-drafts-manifest-is-copied-from-an-existing-version). */
async function resolveSourceVersion(tx: IQueryable, input: CreateDraftInput): Promise<number | undefined> {
  if (input.source_version !== undefined) {
    return input.source_version;
  }
  const row = await queryOneOrAbsent<{ version: number | null }>(tx, latestReleasedVersionSelect(input.slug), raiseWriteFailure);
  return row?.version ?? undefined;
}

function latestReleasedVersionSelect(slug: string): IStatement {
  return {
    text: `SELECT MAX(version) AS version FROM ${CASE_VERSIONS_TABLE} WHERE slug = $1 AND state = $2`,
    params: [slug, RELEASED_STATE],
  };
}

/** Inserts the new draft's own row — refused, through the schema's own partial unique index, where this case already holds a version in draft state (criterion 5). */
function draftInsertStatement(input: CreateDraftInput, version: number): IStatement {
  const [fallbackOutcome, fallbackAction, fallbackRecipient] = referralColumns(input.fallback);
  return {
    text: `INSERT INTO ${CASE_VERSIONS_TABLE}
             (slug, version, title, when_to_use, authored_at, subject,
              fallback_outcome, fallback_action, fallback_recipient, consolidation_register, state)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    params: [
      input.slug,
      version,
      input.title,
      input.when_to_use,
      input.authored_at,
      input.subject,
      fallbackOutcome,
      fallbackAction,
      fallbackRecipient,
      input.consolidation_register ?? null,
      DRAFT_STATE,
    ],
  };
}

/** Copies the source version's manifest into the new draft's own manifest, entry for entry (criterion 4) — one INSERT/SELECT rather than a read followed by N inserts. */
function manifestCopyStatement(slug: string, version: number, sourceVersion: number): IStatement {
  return {
    text: `INSERT INTO ${CASE_VERSION_HYPOTHESES_TABLE} (case_slug, case_version, hypothesis_name, revision, position)
           SELECT case_slug, $2, hypothesis_name, revision, position
           FROM ${CASE_VERSION_HYPOTHESES_TABLE}
           WHERE case_slug = $1 AND case_version = $3`,
    params: [slug, version, sourceVersion],
  };
}

/** Builds the raise callback the draft's own insert runs through: a unique-violation on the one-draft-per-case partial index is this case already holding a draft (criterion 5), answered through CaseAlreadyHasDraftError rather than the generic write failure; anything else is wrapped the same way every other statement's own failure is. */
function raiseCreateDraftFailure(slug: string): RaiseStoreError {
  return (cause) => (isConstraintViolation(cause, ONE_DRAFT_PER_CASE_CONSTRAINT) ? new CaseAlreadyHasDraftError(slug) : raiseWriteFailure(cause));
}

// ---------------------------------------------------------------- insertHypothesisRevision

/** Originates one new hypothesis-revision: claims the hypothesis's own identity row only the first time its name is used (criterion 6), inserts the revision numbered one past its own highest existing revision or 1 (criterion 7), and inserts its own collects. */
async function insertRevision(tx: IQueryable, input: HypothesisRevisionInput): Promise<number> {
  const key: IHypothesisKey = { slug: input.slug, hypothesis_name: input.hypothesis_name };
  await runStatement(tx, hypothesisIdentityStatement(key), raiseWriteFailure);
  const revision = await insertRevisionRow(tx, input);
  const revisionKey: IRevisionKey = { ...key, revision };
  for (const conceptName of input.collects) {
    await runStatement(tx, revisionCollectStatement(revisionKey, conceptName), raiseWriteFailure);
  }
  return revision;
}

/** Idempotently claims the hypothesis's own identity row, never a second one for a name already held (criterion 6, rules/knowledge/a-hypothesis-name-is-unique-within-its-case). */
function hypothesisIdentityStatement(key: IHypothesisKey): IStatement {
  return {
    text: `INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug, name) DO NOTHING`,
    params: [key.slug, key.hypothesis_name],
  };
}

/** Inserts the revision row, computed and inserted as one statement: one past the hypothesis's own highest existing revision, or 1 where none exists yet (criterion 7). */
async function insertRevisionRow(tx: IQueryable, input: HypothesisRevisionInput): Promise<number> {
  const columns = referralColumns(input.resolution);
  const row = await queryOneOrAbsent<{ revision: number }>(tx, revisionInsertStatement(input, columns), raiseWriteFailure);
  if (row === undefined) {
    throw raiseWriteFailure(new Error('inserting a hypothesis-revision returned no row'));
  }
  return row.revision;
}

function revisionInsertStatement(input: HypothesisRevisionInput, columns: readonly [string, string, string]): IStatement {
  const [outcome, action, recipient] = columns;
  return {
    text: `INSERT INTO ${HYPOTHESIS_REVISIONS_TABLE}
             (case_slug, hypothesis_name, revision, criterion, resolution_outcome, resolution_action, resolution_recipient)
           SELECT $1, $2, COALESCE(MAX(revision), 0) + 1, $3, $4, $5, $6
           FROM ${HYPOTHESIS_REVISIONS_TABLE}
           WHERE case_slug = $1 AND hypothesis_name = $2
           RETURNING revision`,
    params: [input.slug, input.hypothesis_name, input.criterion, outcome, action, recipient],
  };
}

function revisionCollectStatement(key: IRevisionKey, conceptName: string): IStatement {
  return {
    text: `INSERT INTO ${HYPOTHESIS_REVISION_COLLECTS_TABLE} (case_slug, hypothesis_name, revision, concept_name)
           VALUES ($1, $2, $3, $4)`,
    params: [key.slug, key.hypothesis_name, key.revision, conceptName],
  };
}

// ---------------------------------------------------------------- placeHypothesis / removeManifestEntry

/** Places one hypothesis-revision at one manifest position — refused, through the schema's own position-unique constraint, where that position already holds a different hypothesis in the same version (criterion 8). */
function placeHypothesisStatement(input: PlaceHypothesisInput): IStatement {
  return {
    text: `INSERT INTO ${CASE_VERSION_HYPOTHESES_TABLE} (case_slug, case_version, hypothesis_name, revision, position)
           VALUES ($1, $2, $3, $4, $5)`,
    params: [input.slug, input.version, input.hypothesis_name, input.revision, input.position],
  };
}

/** Builds the raise callback place-hypothesis's own insert runs through: a unique-violation on the position-unique constraint is that position already occupied (criterion 8), answered through ManifestPositionOccupiedError rather than the generic write failure. */
function raisePlaceHypothesisFailure(input: PlaceHypothesisInput): RaiseStoreError {
  return (cause) =>
    isConstraintViolation(cause, POSITION_UNIQUE_CONSTRAINT)
      ? new ManifestPositionOccupiedError(input.slug, input.version, input.position)
      : raiseWriteFailure(cause);
}

/** Deletes only the named manifest entry, never the hypothesis-revision it referenced (criterion 9). */
function removeManifestEntryStatement(slug: string, version: number, hypothesisName: string): IStatement {
  return {
    text: `DELETE FROM ${CASE_VERSION_HYPOTHESES_TABLE} WHERE case_slug = $1 AND case_version = $2 AND hypothesis_name = $3`,
    params: [slug, version, hypothesisName],
  };
}

// ---------------------------------------------------------------- release / discard

/** Transitions the version to released, recording the instant of release (criterion 10). A version already released is left as-is by the schema's own release-conditioned rule rather than re-checked here. */
function releaseStatement(slug: string, version: number): IStatement {
  return {
    text: `UPDATE ${CASE_VERSIONS_TABLE} SET state = $3, released_at = NOW() WHERE slug = $1 AND version = $2`,
    params: [slug, version, RELEASED_STATE],
  };
}

/** Removes a draft version and its own manifest entries, never any hypothesis-revision they referenced (criterion 11) — manifest entries first, so the version row's own foreign key from case_version_hypotheses is never left dangling. A released version's row and manifest entries are left in place by the schema's own release-conditioned delete rules rather than re-checked here. */
async function discardDraft(tx: IQueryable, key: ICaseVersionKey): Promise<void> {
  await runStatement(tx, deleteManifestEntriesStatement(key), raiseWriteFailure);
  await runStatement(tx, deleteCaseVersionStatement(key), raiseWriteFailure);
}

function deleteManifestEntriesStatement(key: ICaseVersionKey): IStatement {
  return {
    text: `DELETE FROM ${CASE_VERSION_HYPOTHESES_TABLE} WHERE case_slug = $1 AND case_version = $2`,
    params: [key.slug, key.version],
  };
}

function deleteCaseVersionStatement(key: ICaseVersionKey): IStatement {
  return { text: `DELETE FROM ${CASE_VERSIONS_TABLE} WHERE slug = $1 AND version = $2`, params: [key.slug, key.version] };
}

// ---------------------------------------------------------------- shared helpers

/** The one outcome/action/recipient triple every resolution flattens to, whether it is a case version's fallback or a hypothesis-revision's own (domain/knowledge/resolution, domain/knowledge/referral) — read once here rather than at each call site (MNT-03). */
function referralColumns(resolution: Resolution): readonly [string, string, string] {
  return [resolution.outcome, resolution.referral.action, resolution.referral.recipient];
}

/** One stored outcome/action/recipient triple, assembled back into the shape domain/knowledge/resolution and domain/knowledge/referral together declare. */
function resolutionOf(outcome: string, action: string, recipient: string): Resolution {
  return { outcome, referral: { action, recipient } };
}

/** Narrows a stored consolidation_register (or its absence) to the enumeration's own two declared values, raising this store's own typed error where a row somehow holds a value the enumeration does not (TYP-02) — the same defensive-narrow convention this file's previous implementation already kept. */
function consolidationRegisterOf(value: string | null): ConsolidationRegister | undefined {
  if (value === null) {
    return undefined;
  }
  if (!isConsolidationRegister(value)) {
    throw raiseReadFailure(new Error(`case_versions holds an unrecognized consolidation_register "${value}"`));
  }
  return value;
}

/** Whether one stored value is one of the enumeration's own two declared values (TYP-02). */
function isConsolidationRegister(value: string): value is ConsolidationRegister {
  return CONSOLIDATION_REGISTER_VALUES.has(value);
}

/** Narrows a stored state to domain/knowledge/case-version-state's own two declared values, raising this store's own typed error where a row somehow holds a value the enumeration does not (TYP-02). */
function caseVersionStateOf(value: string): CaseVersionState {
  if (!isCaseVersionState(value)) {
    throw raiseReadFailure(new Error(`case_versions holds an unrecognized state "${value}"`));
  }
  return value;
}

/** Whether one stored value is one of the enumeration's own two declared values (TYP-02's guard). */
function isCaseVersionState(value: string): value is CaseVersionState {
  return value === DRAFT_STATE || value === RELEASED_STATE;
}

/** Whether a failure the driver raised is Postgres' own unique-violation code against the named constraint (TYP-02's guard) — disambiguating which schema rule fired, since this adapter now maps more than one unique constraint to its own typed error. */
function isConstraintViolation(cause: unknown, constraintName: string): boolean {
  return (
    cause instanceof Error &&
    'code' in cause &&
    cause.code === UNIQUE_VIOLATION_CODE &&
    'constraint' in cause &&
    cause.constraint === constraintName
  );
}

/** Builds this store's own typed error for a failed read, carrying the driver failure as its cause. */
function raiseReadFailure(cause: unknown): Error {
  return new CaseStoreError('a read against the case store failed', { operation: 'read' }, { cause });
}

/** Builds this store's own typed error for a failed write, carrying the driver failure as its cause. */
function raiseWriteFailure(cause: unknown): Error {
  return new CaseStoreError('a write against the case store failed', { operation: 'write' }, { cause });
}
