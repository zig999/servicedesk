import type {
  AssembledCaseVersion,
  CaseCatalogEntry,
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
} from '../case/case-store.port.js';
import type { Resolution } from '../case/case.js';
import { CaseAlreadyHasDraftError } from '../errors/case-already-has-draft.error.js';
import { CaseNotFoundError } from '../errors/case-not-found.error.js';
import { CaseStoreError } from '../errors/case-store.error.js';
import { CaseVersionNotDraftError } from '../errors/case-version-not-draft.error.js';
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

interface ICaseVersionKey {
  readonly slug: string;
  readonly version: number;
}

interface IHypothesisKey {
  readonly slug: string;
  readonly hypothesis_name: string;
}

interface IRevisionKey extends IHypothesisKey {
  readonly revision: number;
}

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

interface IManifestRow {
  readonly position: number;
  readonly hypothesis_name: string;
  readonly revision: number;
  readonly criterion: string;
  readonly resolution_outcome: string;
  readonly resolution_action: string;
  readonly resolution_recipient: string;
}

interface ICollectRow {
  readonly hypothesis_name: string;
  readonly concept_name: string;
}

const CONSOLIDATION_REGISTER_VALUES: ReadonlySet<string> = new Set<string>(CONSOLIDATION_REGISTERS);

const CASES_TABLE = 'cases';
const CASE_VERSIONS_TABLE = 'case_versions';
const HYPOTHESES_TABLE = 'hypotheses';
const HYPOTHESIS_REVISIONS_TABLE = 'hypothesis_revisions';
const HYPOTHESIS_REVISION_COLLECTS_TABLE = 'hypothesis_revision_collects';
const CASE_VERSION_HYPOTHESES_TABLE = 'case_version_hypotheses';

const DRAFT_STATE: CaseVersionState = 'draft';
const RELEASED_STATE: CaseVersionState = 'released';

const UNIQUE_VIOLATION_CODE = '23505';

const ONE_DRAFT_PER_CASE_CONSTRAINT = 'case_versions_one_draft_per_case';
const POSITION_UNIQUE_CONSTRAINT = 'case_version_hypotheses_position_unique';

const NO_VERSION_NAMED = 0;

export class RelationalCaseStore implements ICaseStore {
  public constructor(private readonly connection: DatabaseConnection) {}

  public async assembleVersion(slug: string, version: number): Promise<AssembledCaseVersion | undefined> {
    return runInTransaction(this.connection, raiseReadFailure, (tx) => assembleWholeVersion(tx, { slug, version }));
  }

  public async findDraftVersion(slug: string): Promise<number | undefined> {
    const row = await queryOneOrAbsent<{ version: number }>(this.connection, draftVersionSelect(slug), raiseReadFailure);
    return row?.version;
  }

  public async listCases(pagination: PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>> {
    return runInTransaction(this.connection, raiseReadFailure, (tx) => listCasesPage(tx, pagination));
  }

  public async listCaseVersions(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<CaseVersionListItem>> {
    return runInTransaction(this.connection, raiseReadFailure, (tx) => listCaseVersionsPage(tx, slug, pagination));
  }

  public async listHypotheses(slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisIdentity>> {
    return runInTransaction(this.connection, raiseReadFailure, (tx) => listHypothesesPage(tx, slug, pagination));
  }

  public async listHypothesisRevisions(
    slug: string,
    hypothesisName: string,
    pagination: PaginationRequest,
  ): Promise<PaginatedResponse<HypothesisRevisionListItem>> {
    return runInTransaction(this.connection, raiseReadFailure, (tx) =>
      listHypothesisRevisionsPage(tx, { slug, hypothesis_name: hypothesisName }, pagination),
    );
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

  public async updateDraft(slug: string, version: number, attributes: UpdateDraftInput): Promise<void> {
    await runInTransaction(this.connection, raiseWriteFailure, (tx) => updateDraftVersion(tx, { slug, version }, attributes));
  }
}

async function assembleWholeVersion(tx: IQueryable, key: ICaseVersionKey): Promise<AssembledCaseVersion | undefined> {
  const versionRow = await queryOneOrAbsent<ICaseVersionRow>(tx, caseVersionSelect(key), raiseReadFailure);
  if (versionRow === undefined) {
    return undefined;
  }
  const manifest = await readManifest(tx, key);
  return assembledCaseVersionOf(key, versionRow, manifest);
}

async function readManifest(tx: IQueryable, key: ICaseVersionKey): Promise<readonly ManifestEntry[]> {
  const rows = await runStatement<IManifestRow>(tx, manifestSelect(key), raiseReadFailure);
  const collects = await collectsByHypothesisName(tx, key);
  return rows.map((row) => manifestEntryOf(row, collects.get(row.hypothesis_name) ?? []));
}

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

function draftVersionSelect(slug: string): IStatement {
  return {
    text: `SELECT version FROM ${CASE_VERSIONS_TABLE} WHERE slug = $1 AND state = $2`,
    params: [slug, DRAFT_STATE],
  };
}

interface ICasesPageRow {
  readonly slug: string;
  readonly current_state: string | null;
  readonly last_updated: Date | null;
  readonly version_count: string;
  readonly title: string | null;
  readonly when_to_use: string | null;
  readonly released_version: number | null;
}

async function listCasesPage(tx: IQueryable, pagination: PaginationRequest): Promise<PaginatedResponse<CaseCatalogEntry>> {
  const total = await countCases(tx);
  const rows = await runStatement<ICasesPageRow>(tx, casesPageSelect(pagination), raiseReadFailure);
  return {
    data: rows.map(caseCatalogEntryOf),
    total,
    limit: pagination.limit,
    offset: pagination.offset,
    pageCount: pageCountOf(total, pagination.limit),
  };
}

function caseCatalogEntryOf(row: ICasesPageRow): CaseCatalogEntry {
  return {
    slug: row.slug,
    ...(row.current_state !== null ? { current_state: caseVersionStateOf(row.current_state) } : {}),
    version_count: Number(row.version_count),
    ...(row.last_updated !== null ? { last_updated: row.last_updated.toISOString() } : {}),
    ...(row.title !== null ? { title: row.title } : {}),
    ...(row.when_to_use !== null ? { when_to_use: row.when_to_use } : {}),
    ...(row.released_version !== null ? { released_version: row.released_version } : {}),
  };
}

async function countCases(tx: IQueryable): Promise<number> {
  const row = await queryOneOrAbsent<{ count: string }>(tx, casesCountSelect(), raiseReadFailure);
  return row === undefined ? 0 : Number(row.count);
}

function casesCountSelect(): IStatement {
  return { text: `SELECT COUNT(*) AS count FROM ${CASES_TABLE}` };
}

function casesPageSelect(pagination: PaginationRequest): IStatement {
  return {
    text: `SELECT c.slug,
                  latest.state AS current_state,
                  latest.authored_at AS last_updated,
                  COALESCE(latest.version_count, 0) AS version_count,
                  released.title AS title,
                  released.when_to_use AS when_to_use,
                  released.version AS released_version
           FROM (SELECT slug FROM ${CASES_TABLE} ORDER BY slug LIMIT $1 OFFSET $2) c
           LEFT JOIN (
             SELECT DISTINCT ON (slug) slug, state, authored_at,
                    COUNT(*) OVER (PARTITION BY slug) AS version_count
             FROM ${CASE_VERSIONS_TABLE}
             ORDER BY slug, version DESC
           ) latest ON latest.slug = c.slug
           LEFT JOIN (
             SELECT DISTINCT ON (slug) slug, version, title, when_to_use
             FROM ${CASE_VERSIONS_TABLE}
             WHERE state = $3
             ORDER BY slug, version DESC
           ) released ON released.slug = c.slug
           ORDER BY c.slug`,
    params: [pagination.limit, pagination.offset, RELEASED_STATE],
  };
}

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

async function requireCaseIdentity(tx: IQueryable, slug: string): Promise<void> {
  const row = await queryOneOrAbsent<{ slug: string }>(tx, caseIdentitySelect(slug), raiseReadFailure);
  if (row === undefined) {
    throw new CaseNotFoundError(slug, NO_VERSION_NAMED);
  }
}

function caseIdentitySelect(slug: string): IStatement {
  return { text: `SELECT slug FROM ${CASES_TABLE} WHERE slug = $1`, params: [slug] };
}

async function countCaseVersions(tx: IQueryable, slug: string): Promise<number> {
  const row = await queryOneOrAbsent<{ count: string }>(tx, caseVersionsCountSelect(slug), raiseReadFailure);
  return row === undefined ? 0 : Number(row.count);
}

function caseVersionsCountSelect(slug: string): IStatement {
  return { text: `SELECT COUNT(*) AS count FROM ${CASE_VERSIONS_TABLE} WHERE slug = $1`, params: [slug] };
}

function caseVersionsPageSelect(slug: string, pagination: PaginationRequest): IStatement {
  return {
    text: `SELECT version, state FROM ${CASE_VERSIONS_TABLE} WHERE slug = $1 ORDER BY version LIMIT $2 OFFSET $3`,
    params: [slug, pagination.limit, pagination.offset],
  };
}

async function listHypothesesPage(tx: IQueryable, slug: string, pagination: PaginationRequest): Promise<PaginatedResponse<HypothesisIdentity>> {
  await requireCaseIdentity(tx, slug);
  const total = await countHypotheses(tx, slug);
  const rows = await runStatement<{ name: string }>(tx, hypothesesPageSelect(slug, pagination), raiseReadFailure);
  return {
    data: rows.map((row) => ({ name: row.name })),
    total,
    limit: pagination.limit,
    offset: pagination.offset,
    pageCount: pageCountOf(total, pagination.limit),
  };
}

async function countHypotheses(tx: IQueryable, slug: string): Promise<number> {
  const row = await queryOneOrAbsent<{ count: string }>(tx, hypothesesCountSelect(slug), raiseReadFailure);
  return row === undefined ? 0 : Number(row.count);
}

function hypothesesCountSelect(slug: string): IStatement {
  return { text: `SELECT COUNT(*) AS count FROM ${HYPOTHESES_TABLE} WHERE case_slug = $1`, params: [slug] };
}

function hypothesesPageSelect(slug: string, pagination: PaginationRequest): IStatement {
  return {
    text: `SELECT name FROM ${HYPOTHESES_TABLE} WHERE case_slug = $1 ORDER BY name LIMIT $2 OFFSET $3`,
    params: [slug, pagination.limit, pagination.offset],
  };
}

interface IHypothesisRevisionRow {
  readonly revision: number;
  readonly criterion: string;
  readonly resolution_outcome: string;
  readonly resolution_action: string;
  readonly resolution_recipient: string;
}

async function listHypothesisRevisionsPage(
  tx: IQueryable,
  key: IHypothesisKey,
  pagination: PaginationRequest,
): Promise<PaginatedResponse<HypothesisRevisionListItem>> {
  await requireHypothesisIdentity(tx, key);
  const total = await countHypothesisRevisions(tx, key);
  const rows = await runStatement<IHypothesisRevisionRow>(tx, hypothesisRevisionsPageSelect(key, pagination), raiseReadFailure);
  const collects = await collectsByRevision(tx, key);
  return {
    data: rows.map((row) => hypothesisRevisionListItemOf(row, collects.get(row.revision) ?? [])),
    total,
    limit: pagination.limit,
    offset: pagination.offset,
    pageCount: pageCountOf(total, pagination.limit),
  };
}

async function requireHypothesisIdentity(tx: IQueryable, key: IHypothesisKey): Promise<void> {
  const row = await queryOneOrAbsent<{ name: string }>(tx, hypothesisIdentitySelect(key), raiseReadFailure);
  if (row === undefined) {
    throw new CaseNotFoundError(key.slug, NO_VERSION_NAMED);
  }
}

function hypothesisIdentitySelect(key: IHypothesisKey): IStatement {
  return { text: `SELECT name FROM ${HYPOTHESES_TABLE} WHERE case_slug = $1 AND name = $2`, params: [key.slug, key.hypothesis_name] };
}

async function countHypothesisRevisions(tx: IQueryable, key: IHypothesisKey): Promise<number> {
  const row = await queryOneOrAbsent<{ count: string }>(tx, hypothesisRevisionsCountSelect(key), raiseReadFailure);
  return row === undefined ? 0 : Number(row.count);
}

function hypothesisRevisionsCountSelect(key: IHypothesisKey): IStatement {
  return {
    text: `SELECT COUNT(*) AS count FROM ${HYPOTHESIS_REVISIONS_TABLE} WHERE case_slug = $1 AND hypothesis_name = $2`,
    params: [key.slug, key.hypothesis_name],
  };
}

function hypothesisRevisionsPageSelect(key: IHypothesisKey, pagination: PaginationRequest): IStatement {
  return {
    text: `SELECT revision, criterion, resolution_outcome, resolution_action, resolution_recipient
           FROM ${HYPOTHESIS_REVISIONS_TABLE}
           WHERE case_slug = $1 AND hypothesis_name = $2
           ORDER BY revision
           LIMIT $3 OFFSET $4`,
    params: [key.slug, key.hypothesis_name, pagination.limit, pagination.offset],
  };
}

async function collectsByRevision(tx: IQueryable, key: IHypothesisKey): Promise<ReadonlyMap<number, readonly string[]>> {
  const rows = await runStatement<{ revision: number; concept_name: string }>(tx, hypothesisRevisionCollectsSelect(key), raiseReadFailure);
  const grouped = new Map<number, string[]>();
  for (const row of rows) {
    const concepts = grouped.get(row.revision) ?? [];
    concepts.push(row.concept_name);
    grouped.set(row.revision, concepts);
  }
  return grouped;
}

function hypothesisRevisionCollectsSelect(key: IHypothesisKey): IStatement {
  return {
    text: `SELECT revision, concept_name
           FROM ${HYPOTHESIS_REVISION_COLLECTS_TABLE}
           WHERE case_slug = $1 AND hypothesis_name = $2
           ORDER BY revision, concept_name`,
    params: [key.slug, key.hypothesis_name],
  };
}

function hypothesisRevisionListItemOf(row: IHypothesisRevisionRow, collects: readonly string[]): HypothesisRevisionListItem {
  return {
    revision: row.revision,
    criterion: row.criterion,
    collects,
    resolution: resolutionOf(row.resolution_outcome, row.resolution_action, row.resolution_recipient),
  };
}

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

function caseIdentityStatement(slug: string): IStatement {
  return { text: `INSERT INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING`, params: [slug] };
}

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

function manifestCopyStatement(slug: string, version: number, sourceVersion: number): IStatement {
  return {
    text: `INSERT INTO ${CASE_VERSION_HYPOTHESES_TABLE} (case_slug, case_version, hypothesis_name, revision, position)
           SELECT case_slug, $2, hypothesis_name, revision, position
           FROM ${CASE_VERSION_HYPOTHESES_TABLE}
           WHERE case_slug = $1 AND case_version = $3`,
    params: [slug, version, sourceVersion],
  };
}

function raiseCreateDraftFailure(slug: string): RaiseStoreError {
  return (cause) => (isConstraintViolation(cause, ONE_DRAFT_PER_CASE_CONSTRAINT) ? new CaseAlreadyHasDraftError(slug) : raiseWriteFailure(cause));
}

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

function hypothesisIdentityStatement(key: IHypothesisKey): IStatement {
  return {
    text: `INSERT INTO ${HYPOTHESES_TABLE} (case_slug, name) VALUES ($1, $2) ON CONFLICT (case_slug, name) DO NOTHING`,
    params: [key.slug, key.hypothesis_name],
  };
}

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

function placeHypothesisStatement(input: PlaceHypothesisInput): IStatement {
  return {
    text: `INSERT INTO ${CASE_VERSION_HYPOTHESES_TABLE} (case_slug, case_version, hypothesis_name, revision, position)
           VALUES ($1, $2, $3, $4, $5)`,
    params: [input.slug, input.version, input.hypothesis_name, input.revision, input.position],
  };
}

function raisePlaceHypothesisFailure(input: PlaceHypothesisInput): RaiseStoreError {
  return (cause) =>
    isConstraintViolation(cause, POSITION_UNIQUE_CONSTRAINT)
      ? new ManifestPositionOccupiedError(input.slug, input.version, input.position)
      : raiseWriteFailure(cause);
}

function removeManifestEntryStatement(slug: string, version: number, hypothesisName: string): IStatement {
  return {
    text: `DELETE FROM ${CASE_VERSION_HYPOTHESES_TABLE} WHERE case_slug = $1 AND case_version = $2 AND hypothesis_name = $3`,
    params: [slug, version, hypothesisName],
  };
}

function releaseStatement(slug: string, version: number): IStatement {
  return {
    text: `UPDATE ${CASE_VERSIONS_TABLE} SET state = $3, released_at = NOW() WHERE slug = $1 AND version = $2`,
    params: [slug, version, RELEASED_STATE],
  };
}

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

async function updateDraftVersion(tx: IQueryable, key: ICaseVersionKey, attributes: UpdateDraftInput): Promise<void> {
  const row = await queryOneOrAbsent<{ state: string }>(tx, caseVersionStateSelect(key), raiseReadFailure);
  if (row === undefined) {
    throw new CaseNotFoundError(key.slug, key.version);
  }
  const state = caseVersionStateOf(row.state);
  if (state !== DRAFT_STATE) {
    throw new CaseVersionNotDraftError(key.slug, key.version, state);
  }
  await runStatement(tx, updateDraftStatement(key, attributes), raiseWriteFailure);
}

function caseVersionStateSelect(key: ICaseVersionKey): IStatement {
  return { text: `SELECT state FROM ${CASE_VERSIONS_TABLE} WHERE slug = $1 AND version = $2`, params: [key.slug, key.version] };
}

function updateDraftStatement(key: ICaseVersionKey, attributes: UpdateDraftInput): IStatement {
  const [fallbackOutcome, fallbackAction, fallbackRecipient] = referralColumns(attributes.fallback);
  return {
    text: `UPDATE ${CASE_VERSIONS_TABLE}
           SET title = $3, when_to_use = $4, subject = $5,
               fallback_outcome = $6, fallback_action = $7, fallback_recipient = $8,
               consolidation_register = $9
           WHERE slug = $1 AND version = $2`,
    params: [
      key.slug,
      key.version,
      attributes.title,
      attributes.when_to_use,
      attributes.subject,
      fallbackOutcome,
      fallbackAction,
      fallbackRecipient,
      attributes.consolidation_register ?? null,
    ],
  };
}

function referralColumns(resolution: Resolution): readonly [string, string, string] {
  return [resolution.outcome, resolution.referral.action, resolution.referral.recipient];
}

function resolutionOf(outcome: string, action: string, recipient: string): Resolution {
  return { outcome, referral: { action, recipient } };
}

function consolidationRegisterOf(value: string | null): ConsolidationRegister | undefined {
  if (value === null) {
    return undefined;
  }
  if (!isConsolidationRegister(value)) {
    throw raiseReadFailure(new Error(`case_versions holds an unrecognized consolidation_register "${value}"`));
  }
  return value;
}

function isConsolidationRegister(value: string): value is ConsolidationRegister {
  return CONSOLIDATION_REGISTER_VALUES.has(value);
}

function caseVersionStateOf(value: string): CaseVersionState {
  if (!isCaseVersionState(value)) {
    throw raiseReadFailure(new Error(`case_versions holds an unrecognized state "${value}"`));
  }
  return value;
}

function isCaseVersionState(value: string): value is CaseVersionState {
  return value === DRAFT_STATE || value === RELEASED_STATE;
}

function isConstraintViolation(cause: unknown, constraintName: string): boolean {
  return (
    cause instanceof Error &&
    'code' in cause &&
    cause.code === UNIQUE_VIOLATION_CODE &&
    'constraint' in cause &&
    cause.constraint === constraintName
  );
}

function raiseReadFailure(cause: unknown): Error {
  return new CaseStoreError('a read against the case store failed', { operation: 'read' }, { cause });
}

function raiseWriteFailure(cause: unknown): Error {
  return new CaseStoreError('a write against the case store failed', { operation: 'write' }, { cause });
}
