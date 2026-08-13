// The relational adapter behind the case module's own store port
// (task/relational-stores/case-store): every case's identity lives in one
// row of "cases", every version of it in one row of "case_versions", and
// every hypothesis and its collected concepts in "hypotheses" and
// "hypothesis_collects" (migrations/0004-case-and-hypothesis.sql). It
// implements the same ICaseStore persistence/file-case-store.repository.ts
// already implements, rather than replacing it
// (constraints/the-domain-depends-on-no-infrastructure): no case module
// imports a driver or opens a file.
//
// readVersion answers the case root together with its hypotheses and their
// resolutions and referrals, assembled in one transaction
// (constraints/a-case-is-read-whole): a SELECT against case_versions, then
// against hypotheses and hypothesis_collects, all through the one connection
// runInTransaction checks out, so a failure partway through assembly raises
// rather than answering a partial case, and an unwritten slug/version
// answers with absence — undefined — rather than a raise. writeVersion
// inserts the case identity, the version and every hypothesis and its
// collects the same way, as one unit of work (this task's own
// UNDERDETERMINED note: no criterion alone holds the write to one
// transaction, but a case answered whole on read demands one on write too,
// or a failure between inserts would leave a version the next read answers
// as whole when it never finished writing). Write-once is decided by
// case_versions' own primary key over (slug, version) rather than by reading
// first (rules/knowledge/a-case-version-is-written-once): a duplicate insert
// fails there and is mapped to this module's own CaseVersionAlreadyStoredError
// rather than the generic write failure — the same unique-violation-to-typed-error
// mapping relational-investigation-store.repository.ts's own root insert
// already keeps for its own key, mirrored here for task/case-authoring/author-case-version-command,
// which depends on this store and needed the two failures distinguished
// (that task's own criterion 2) — and rolls back the whole unit of work,
// leaving whatever was already stored exactly as it was. The case-identity insert is an
// idempotent ON CONFLICT DO NOTHING against "cases", so a second version
// under an already-held slug is never refused on that ground
// (rules/knowledge/a-slug-identifies-one-case) while every version still
// hangs off the one row that slug ever gets — cases.slug being the table's
// sole column and primary key is the whole of how a second, distinct case
// under one slug is refused; nothing here distinguishes a genuine second
// case from the next version of the one already there.
//
// The attributes mapped to and from these rows are declared by
// domain/knowledge/case, domain/knowledge/hypothesis,
// domain/knowledge/resolution and domain/knowledge/referral, none of which
// this task implements: the mapping is read off case.ts's own Case,
// Hypothesis and Resolution types rather than restated here.
//
// Names no import of 'pg': DatabaseConnection and the
// runStatement/queryOneOrAbsent/runInTransaction helpers database-access.ts
// already declares are the only things this file names for the pool it is
// given (STK-05).
//
// Every statement below is schema-qualified as public.<table>, the same
// convention persistence/relational-capability-store.repository.ts and
// database-access.spec.ts's own proof already document at length: this
// project's DATABASE_URL reaches Postgres through a transaction-pooling
// endpoint that can hand back a physical connection still carrying an
// unrelated, already-finished session's own search_path, so an unqualified
// name run by listVersions — outside any transaction this module opens
// itself — could otherwise resolve against whatever schema happened to be
// ambient rather than against public. Inside writeVersion's and
// readVersion's own runInTransaction the qualification is kept regardless,
// even though that helper has already reset search_path to public itself,
// so every statement below reads the same way no matter which path runs it.
import { createHash } from 'node:crypto';
import type { ICaseStore, StoredCaseVersion } from '../case/case-store.port.js';
import type { Case, Hypothesis, Resolution } from '../case/case.js';
import { CaseStoreError } from '../errors/case-store.error.js';
import { CaseVersionAlreadyStoredError } from '../errors/case-version-already-stored.error.js';
import { CONSOLIDATION_REGISTERS, type ConsolidationRegister } from '../investigation/consolidation-register.js';
import {
  queryOneOrAbsent,
  runInTransaction,
  runStatement,
  type IQueryable,
  type IStatement,
  type RaiseStoreError,
} from './database-access.js';
import type { DatabaseConnection } from './database-connection.js';

/** slug and version together, the pair every one of case_versions', hypotheses' and hypothesis_collects' own keys is built from — bundled once so no helper below needs more than the standard's own three-positional-parameter limit (MNT-01). */
interface ICaseVersionKey {
  readonly slug: string;
  readonly version: number;
}

/** One row of "case_versions", exactly the columns migrations/0004-case-and-hypothesis.sql declares beyond its own key: the flattened fallback (domain/knowledge/resolution, domain/knowledge/referral) and the optional consolidation register (domain/knowledge/consolidation-register). authored_at is typed Date because node-postgres parses a timestamptz column into one by default. */
interface ICaseVersionRow {
  readonly title: string;
  readonly when_to_use: string;
  readonly authored_at: Date;
  readonly subject: string;
  readonly fallback_outcome: string;
  readonly fallback_action: string;
  readonly fallback_recipient: string;
  readonly consolidation_register: string | null;
}

/** One row of "hypotheses", exactly the columns beyond its own key: name, its declared position, its criterion and its flattened resolution (domain/knowledge/hypothesis, domain/knowledge/resolution, domain/knowledge/referral). */
interface IHypothesisRow {
  readonly name: string;
  readonly position: number;
  readonly criterion: string;
  readonly resolution_outcome: string;
  readonly resolution_action: string;
  readonly resolution_recipient: string;
}

/** One row of "hypothesis_collects": which hypothesis collects which concept (domain/knowledge/hypothesis's own collects). */
interface IHypothesisCollectRow {
  readonly hypothesis_name: string;
  readonly concept_name: string;
}

/** Every value domain/knowledge/consolidation-register declares, reused rather than re-listing them (MNT-03), the same convention relational-capability-store.repository.ts's own CAPABILITY_NATURE_VALUES already keeps for its own enumeration. */
const CONSOLIDATION_REGISTER_VALUES: ReadonlySet<string> = new Set<string>(CONSOLIDATION_REGISTERS);

/** Schema-qualified table names, named once and reused across every statement below rather than repeated as literals (TYP-04). */
const CASES_TABLE = 'public.cases';
const CASE_VERSIONS_TABLE = 'public.case_versions';
const HYPOTHESES_TABLE = 'public.hypotheses';
const HYPOTHESIS_COLLECTS_TABLE = 'public.hypothesis_collects';

/** Postgres' own error code for a unique-constraint violation — the signal write-once is decided by, never a value spelled out where it is compared (TYP-04), the same convention relational-investigation-store.repository.ts's own UNIQUE_VIOLATION_CODE already keeps for its own root key (task/case-authoring/author-case-version-command's own mirroring of that pattern here). */
const UNIQUE_VIOLATION_CODE = '23505';

/**
 * The relational adapter of the case module's store port: a case's root,
 * its hypotheses and their resolutions and referrals are read together in
 * one transaction (criterion 1, criterion 2) or answered as absence
 * (criterion 3); a write inserts the case identity, the version and every
 * hypothesis and its collects as one unit of work, refused through this
 * store's own typed error exactly where the version's key already exists
 * (criterion 4, criterion 5), and every version once stored keeps answering
 * to listVersions (criterion 6, criterion 7).
 */
export class RelationalCaseStore implements ICaseStore {
  public constructor(private readonly connection: DatabaseConnection) {}

  public async writeVersion(slug: string, version: number, document: unknown): Promise<void> {
    const statements = writeStatementsFor(slug, version, document);
    await runInTransaction(this.connection, raiseWriteFailure, (tx) =>
      runAllStatements(tx, { slug, version }, statements),
    );
  }

  public async readVersion(slug: string, version: number): Promise<StoredCaseVersion | undefined> {
    return runInTransaction(this.connection, raiseReadFailure, (tx) => readWholeVersion(tx, { slug, version }));
  }

  /** Every version number case_versions holds for this slug, an absent slug answering no versions at all — the index rules/knowledge/every-case-version-remains-readable needs, kept as the rows themselves rather than as a second record of them. */
  public async listVersions(slug: string): Promise<readonly number[]> {
    const rows = await runStatement<{ version: number }>(
      this.connection,
      { text: `SELECT version FROM ${CASE_VERSIONS_TABLE} WHERE slug = $1 ORDER BY version`, params: [slug] },
      raiseReadFailure,
    );
    return rows.map((row) => row.version);
  }
}

/**
 * Reads the given document as the Case it is trusted to be — the one
 * departure this module takes from TYP-02's guard-alongside-every-assertion
 * convention, the same one case-query.service.ts's own trustedCase already
 * discloses for the identical reason: a guard thorough enough to narrow
 * `unknown` to `Case` here would re-implement parse-case-document.ts's own
 * structural refusal, which is that module's to own — validation runs at
 * every read, not at write (rules/knowledge/validation-runs-at-every-read) —
 * and this task's own ADVISORY note leaves case.ts's types as the mapping's
 * source of truth rather than restating them here. A document that is not
 * actually case-shaped still fails, either immediately while these
 * statements are built or against a NOT NULL/foreign-key column once run,
 * never silently accepted.
 */
function documentAsCase(document: unknown): Case {
  return document as Case;
}

/** Every statement one write needs, from the given document. Building them can throw on its own — the document may not be case-shaped at all — and that failure is wrapped into this store's own typed error the same way a driver failure already is (COR-02), rather than reaching the caller as a plain, unwrapped exception. */
function writeStatementsFor(slug: string, version: number, document: unknown): readonly IStatement[] {
  try {
    return caseVersionStatements({ slug, version }, documentAsCase(document));
  } catch (error) {
    throw raiseWriteFailure(error);
  }
}

/** Every statement one whole write needs, in an order that always satisfies the foreign keys the next statement depends on: the case identity, then the version, then each hypothesis immediately followed by its own collects. */
function caseVersionStatements(key: ICaseVersionKey, theCase: Case): readonly IStatement[] {
  return [
    caseIdentityStatement(key.slug),
    caseVersionStatement(key, theCase),
    ...theCase.hypotheses.flatMap((hypothesis) => hypothesisStatements(key, hypothesis)),
  ];
}

/**
 * Runs every given statement, in order, through the one checked-out
 * connection a unit of work supplies: the case-identity statement and every
 * hypothesis/collect statement through this store's own generic write
 * failure, and the version statement — always caseVersionStatements' own
 * second entry, by that function's own fixed construction order — through
 * the one raise that distinguishes a duplicate (slug, version) from any
 * other failure (rules/knowledge/a-case-version-is-written-once,
 * task/case-authoring/author-case-version-command's own criterion 2).
 */
async function runAllStatements(
  tx: IQueryable,
  key: ICaseVersionKey,
  statements: readonly IStatement[],
): Promise<void> {
  const [identity, version, ...rest] = statements;
  await runStatement(tx, identity, raiseWriteFailure);
  await runStatement(tx, version, raiseCaseVersionInsertFailure(key));
  for (const statement of rest) {
    await runStatement(tx, statement, raiseWriteFailure);
  }
}

/** The one outcome/action/recipient triple every resolution flattens to, whether it is a case's fallback or a hypothesis's own (domain/knowledge/resolution, domain/knowledge/referral) — read once here rather than twice at each call site (MNT-03). */
function referralColumns(resolution: Resolution): readonly [string, string, string] {
  return [resolution.outcome, resolution.referral.action, resolution.referral.recipient];
}

/** Idempotently claims the case's own identity row, never refusing an already-held slug (rules/knowledge/a-slug-identifies-one-case) since a second version under it is not a second case. */
function caseIdentityStatement(slug: string): IStatement {
  return {
    text: `INSERT INTO ${CASES_TABLE} (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING`,
    params: [slug],
  };
}

/** Inserts one version's own row — write-once is this statement's own primary key over (slug, version), never a read-first check (rules/knowledge/a-case-version-is-written-once). */
function caseVersionStatement(key: ICaseVersionKey, theCase: Case): IStatement {
  const [fallbackOutcome, fallbackAction, fallbackRecipient] = referralColumns(theCase.fallback);
  return {
    text: `INSERT INTO ${CASE_VERSIONS_TABLE}
             (slug, version, title, when_to_use, authored_at, subject,
              fallback_outcome, fallback_action, fallback_recipient, consolidation_register)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    params: [
      key.slug,
      key.version,
      theCase.title,
      theCase.when_to_use,
      theCase.authored_at,
      theCase.subject,
      fallbackOutcome,
      fallbackAction,
      fallbackRecipient,
      theCase.consolidation_register ?? null,
    ],
  };
}

/** One hypothesis's own row, immediately followed by one row per concept it collects — kept together so the FK from hypothesis_collects to hypotheses is always satisfied by the statement just before it. */
function hypothesisStatements(key: ICaseVersionKey, hypothesis: Hypothesis): readonly IStatement[] {
  return [
    hypothesisStatement(key, hypothesis),
    ...hypothesis.collects.map((concept) => hypothesisCollectStatement(key, hypothesis.name, concept)),
  ];
}

/** Inserts one hypothesis's own row: its name, its declared position, its criterion and its flattened resolution (domain/knowledge/hypothesis). */
function hypothesisStatement(key: ICaseVersionKey, hypothesis: Hypothesis): IStatement {
  const [resolutionOutcome, resolutionAction, resolutionRecipient] = referralColumns(hypothesis.resolution);
  return {
    text: `INSERT INTO ${HYPOTHESES_TABLE}
             (case_slug, case_version, name, position, criterion,
              resolution_outcome, resolution_action, resolution_recipient)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    params: [
      key.slug,
      key.version,
      hypothesis.name,
      hypothesis.position,
      hypothesis.criterion,
      resolutionOutcome,
      resolutionAction,
      resolutionRecipient,
    ],
  };
}

/** Inserts one row of one hypothesis's own collects (domain/knowledge/hypothesis's own collects). */
function hypothesisCollectStatement(key: ICaseVersionKey, hypothesisName: string, conceptName: string): IStatement {
  return {
    text: `INSERT INTO ${HYPOTHESIS_COLLECTS_TABLE}
             (case_slug, case_version, hypothesis_name, concept_name)
           VALUES ($1, $2, $3, $4)`,
    params: [key.slug, key.version, hypothesisName, conceptName],
  };
}

/**
 * Reads one whole version, root together with its hypotheses and their
 * resolutions and referrals, through the one connection the caller's own
 * transaction checked out (constraints/a-case-is-read-whole): an absent
 * version answers undefined before any hypothesis is ever read (criterion
 * 3), never a partial assembly.
 */
async function readWholeVersion(tx: IQueryable, key: ICaseVersionKey): Promise<StoredCaseVersion | undefined> {
  const versionRow = await queryOneOrAbsent<ICaseVersionRow>(tx, caseVersionSelect(key), raiseReadFailure);
  if (versionRow === undefined) {
    return undefined;
  }
  const hypotheses = await readHypotheses(tx, key);
  const document = documentOf(key, versionRow, hypotheses);
  return { document, hash: contentHash(document) };
}

/** Every hypothesis of one version, each carrying its own collects, in declared-position order. */
async function readHypotheses(tx: IQueryable, key: ICaseVersionKey): Promise<readonly Hypothesis[]> {
  const rows = await runStatement<IHypothesisRow>(tx, hypothesesSelect(key), raiseReadFailure);
  const collects = await collectsByHypothesisName(tx, key);
  return rows.map((row) => hypothesisOf(row, collects.get(row.name) ?? []));
}

/** Every concept each hypothesis of one version collects, grouped by the hypothesis's own name — hypothesis_collects carries no order of its own, so each group is read back sorted by concept name for a deterministic result. */
async function collectsByHypothesisName(tx: IQueryable, key: ICaseVersionKey): Promise<ReadonlyMap<string, readonly string[]>> {
  const rows = await runStatement<IHypothesisCollectRow>(tx, hypothesisCollectsSelect(key), raiseReadFailure);
  const grouped = new Map<string, string[]>();
  for (const row of rows) {
    const concepts = grouped.get(row.hypothesis_name) ?? [];
    concepts.push(row.concept_name);
    grouped.set(row.hypothesis_name, concepts);
  }
  return grouped;
}

/** One hypothesis row plus its already-grouped collects, assembled into the shape domain/knowledge/hypothesis declares. */
function hypothesisOf(row: IHypothesisRow, collects: readonly string[]): Hypothesis {
  return {
    name: row.name,
    position: row.position,
    criterion: row.criterion,
    collects,
    resolution: {
      outcome: row.resolution_outcome,
      referral: { action: row.resolution_action, recipient: row.resolution_recipient },
    },
  };
}

/** The whole case document these rows together answer, in the exact shape domain/knowledge/case declares — slug and version come from the given key, never from a column of their own, the same way FileCaseStore never reads either from the document it stores. */
function documentOf(key: ICaseVersionKey, row: ICaseVersionRow, hypotheses: readonly Hypothesis[]): Case {
  const consolidationRegister = consolidationRegisterOf(row.consolidation_register);
  return {
    slug: key.slug,
    title: row.title,
    when_to_use: row.when_to_use,
    version: key.version,
    authored_at: row.authored_at.toISOString(),
    subject: row.subject,
    fallback: {
      outcome: row.fallback_outcome,
      referral: { action: row.fallback_action, recipient: row.fallback_recipient },
    },
    ...(consolidationRegister !== undefined ? { consolidation_register: consolidationRegister } : {}),
    hypotheses,
  };
}

/** Narrows a stored consolidation_register (or its absence) to the enumeration's own two declared values, raising this store's own typed error where a row somehow holds a value the enumeration does not (TYP-02) — the same defensive-narrow convention relational-capability-store.repository.ts's own toCapability already keeps for its own enumeration. */
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

/**
 * The content identity of the document this read assembled — sha256 of its
 * deterministic JSON serialization, the equivalent this task's own inventory
 * observes "has no equivalent once the document is rows": a version is
 * written once and never altered (rules/knowledge/a-case-version-is-written-once),
 * so the rows one slug and version answer never change, and documentOf
 * above always builds its object literal in the same key order, so the same
 * JSON text — and therefore the same hash — answers every read of one
 * already-stored version.
 */
function contentHash(document: Case): string {
  return createHash('sha256').update(JSON.stringify(document), 'utf8').digest('hex');
}

function caseVersionSelect(key: ICaseVersionKey): IStatement {
  return {
    text: `SELECT title, when_to_use, authored_at, subject,
                  fallback_outcome, fallback_action, fallback_recipient, consolidation_register
           FROM ${CASE_VERSIONS_TABLE}
           WHERE slug = $1 AND version = $2`,
    params: [key.slug, key.version],
  };
}

function hypothesesSelect(key: ICaseVersionKey): IStatement {
  return {
    text: `SELECT name, position, criterion, resolution_outcome, resolution_action, resolution_recipient
           FROM ${HYPOTHESES_TABLE}
           WHERE case_slug = $1 AND case_version = $2
           ORDER BY position`,
    params: [key.slug, key.version],
  };
}

function hypothesisCollectsSelect(key: ICaseVersionKey): IStatement {
  return {
    text: `SELECT hypothesis_name, concept_name
           FROM ${HYPOTHESIS_COLLECTS_TABLE}
           WHERE case_slug = $1 AND case_version = $2
           ORDER BY hypothesis_name, concept_name`,
    params: [key.slug, key.version],
  };
}

/** Whether a failure the driver raised is Postgres' own unique-violation code (TYP-02's guard), the same convention relational-investigation-store.repository.ts's own isUniqueViolation already keeps for its own root key. */
function isUniqueViolation(cause: unknown): boolean {
  return cause instanceof Error && 'code' in cause && cause.code === UNIQUE_VIOLATION_CODE;
}

/**
 * Builds the raise callback the version's own insert statement runs
 * through: a unique-violation on its own primary key over (slug, version)
 * is that version already being stored
 * (rules/knowledge/a-case-version-is-written-once,
 * task/case-authoring/author-case-version-command's own criterion 2),
 * answered through this module's own CaseVersionAlreadyStoredError rather
 * than the generic write failure; anything else is wrapped the same way
 * every other statement's own failure is.
 */
function raiseCaseVersionInsertFailure(key: ICaseVersionKey): RaiseStoreError {
  return (cause) =>
    isUniqueViolation(cause) ? new CaseVersionAlreadyStoredError(key.slug, key.version) : raiseWriteFailure(cause);
}

/** Builds this store's own typed error for a failed read, carrying the driver failure as its cause. */
function raiseReadFailure(cause: unknown): Error {
  return new CaseStoreError('a read against the case store failed', { operation: 'read' }, { cause });
}

/** Builds this store's own typed error for a failed write, carrying the driver failure as its cause. */
function raiseWriteFailure(cause: unknown): Error {
  return new CaseStoreError('a write against the case store failed', { operation: 'write' }, { cause });
}
