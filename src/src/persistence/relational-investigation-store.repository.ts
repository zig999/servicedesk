// The relational adapter behind the investigation module's own store port
// (task/relational-stores/investigation-store): one built investigation
// lives whole across "investigations", "investigation_evidence",
// "investigation_evaluations", "investigation_evaluation_citations" and
// "investigation_subject_attribute_values"
// (migrations/0005-investigation.sql,
// constraints/the-stored-schema-mirrors-the-declared-model). It implements
// the same IInvestigationStore
// persistence/file-investigation-store.repository.ts already implements,
// rather than replacing it (constraints/the-domain-depends-on-no-infrastructure):
// no investigation module imports a driver or opens a file.
//
// write() inserts the investigation's own root row first, then every
// subject-attribute-value, evidence and evaluation-plus-citations row, all
// as one unit of work (constraints/the-system-persists-to-one-relational-database,
// criterion 1): a failure at any point rolls the whole insert back, so no
// part of a record this call did not finish writing is ever left behind
// (criterion 2). Write-once is decided by the root insert's own primary key
// over id, never by a read first
// (rules/investigation/an-investigation-is-written-once, criterion 3): a
// duplicate id's own INSERT fails there with Postgres' own unique-violation
// code, mapped to this module's own already-declared
// InvestigationAlreadyStoredError — never a fresh id refused on that ground
// (criterion 4). Every statement after that one is wrapped in the store's
// own generic InvestigationStoreError instead, since only the root row's
// own key answers "already stored". No statement below is ever an UPDATE,
// so a record already stored is altered by no later write (criterion 9).
//
// read() answers the whole record back through one transaction too: the
// root row, then its subject-attribute-values, its own evidence
// (rules/investigation/one-evidence-per-collected-concept) and its own
// evaluations together with their own citations
// (rules/investigation/one-evaluation-per-required-hypothesis) — an absent
// id answering undefined before any child table is ever read. read()
// answers the StoredInvestigation document/hash shape
// relational-case-store.repository.ts's own readVersion already
// established for the identical port pattern (this task's own inference,
// recorded in the delivery record): `hash` is sha256 of the assembled
// document's own deterministic JSON serialization rather than of bytes
// read off a disk, since there is no file and no disk bytes once the
// content is rows.
//
// Every evidence row's capability_name/capability_version columns already
// exist on investigation_evidence (migrations/0005-investigation.sql,
// applied before this task ran): domain/investigation/evidence's own
// required cardinality-1 relationship to domain/integration/capability —
// which registered capability, at which version, produced this observation
// — so this task adds no migration of its own. write() and read() carry
// both columns through unchanged, alongside the eight fields criterion 6
// names explicitly (this task's own UNDERDETERMINED note).
//
// Names no import of 'pg': DatabaseConnection and the
// runStatement/queryOneOrAbsent/runInTransaction helpers database-access.ts
// already declares are the only things this file names for the pool it is
// given (STK-05).
//
// Every statement below names its table unqualified, the same convention
// every sibling relational store in this tree already documents at length
// (relational-case-store.repository.ts, persistence/migration-runner.ts's
// own header): it resolves against whatever schema the connecting role's
// own server-side default names, safe to trust under this project's
// transaction-pooling DATABASE_URL.

import { createHash } from 'node:crypto';
import { InvestigationAlreadyStoredError } from '../errors/investigation-already-stored.error.js';
import { InvestigationStoreError } from '../errors/investigation-store.error.js';
import type { Assessment } from '../investigation/assessment.js';
import type { Citation } from '../investigation/citation.js';
import type { Cost } from '../investigation/cost.js';
import type { Durations } from '../investigation/durations.js';
import { EVALUATION_REASONS, type EvaluationReason } from '../investigation/evaluation-reason.js';
import type { Evaluation } from '../investigation/evaluation.js';
import { EVIDENCE_RESULTS, type EvidenceResult } from '../investigation/evidence-result.js';
import type { Evidence } from '../investigation/evidence.js';
import type { IInvestigationStore, StoredInvestigation } from '../investigation/investigation-store.port.js';
import type { Investigation } from '../investigation/investigation.js';
import type { SubjectAttributeValue } from '../investigation/subject-attribute-value.js';
import { VERDICTS, type Verdict } from '../investigation/verdict.js';
import { queryOneOrAbsent, runInTransaction, runStatement, type IQueryable, type IStatement, type RaiseStoreError } from './database-access.js';
import type { DatabaseConnection } from './database-connection.js';

/** One row of "investigations", exactly the columns migrations/0005-investigation.sql declares. written_at is typed Date because node-postgres parses a timestamptz column into one by default, the same convention relational-case-store.repository.ts's own authored_at already documents. */
interface IInvestigationRow {
  readonly requester: string;
  readonly ticket_ref: string | null;
  readonly narrative: string;
  readonly subject_type: string;
  readonly prompt_version: string;
  readonly model: string;
  readonly pinned_case_slug: string;
  readonly pinned_case_version: number;
  readonly assessment_outcome: string;
  readonly assessment_action: string;
  readonly assessment_recipient: string;
  readonly assessment_determining_hypothesis: string | null;
  readonly assessment_text: string;
  readonly cost_calls: number;
  readonly cost_input_tokens: number;
  readonly cost_output_tokens: number;
  readonly durations_collection: number;
  readonly durations_judgment: number;
  readonly durations_writing: number;
  readonly durations_total: number;
  readonly written_at: Date;
}

/** One row of "investigation_evidence", exactly the columns beyond its own key. observed_at is typed Date for the same reason IInvestigationRow's written_at is. */
interface IEvidenceRow {
  readonly concept: string;
  readonly inputs: string;
  readonly observation: string;
  readonly observed_at: Date;
  readonly ttl: number;
  readonly origin: string;
  readonly result: string;
  readonly result_detail: string | null;
  readonly capability_name: string;
  readonly capability_version: string;
  readonly elapsed_ms: number;
}

/** One row of "investigation_evaluations", exactly the columns beyond its own key. */
interface IEvaluationRow {
  readonly hypothesis: string;
  readonly verdict: string;
  readonly reason: string | null;
}

/** One row of "investigation_evaluation_citations": which evaluation cites which concept and field. */
interface ICitationRow {
  readonly hypothesis: string;
  readonly concept: string;
  readonly field: string;
}

/** Every value domain/investigation/evidence-result declares, reused rather than re-listing them (MNT-03), the same convention relational-capability-store.repository.ts's own CAPABILITY_NATURE_VALUES already keeps. */
const EVIDENCE_RESULT_VALUES: ReadonlySet<string> = new Set<string>(EVIDENCE_RESULTS);

/** Every value domain/investigation/verdict declares, reused the same way. */
const VERDICT_VALUES: ReadonlySet<string> = new Set<string>(VERDICTS);

/** Every value domain/investigation/evaluation-reason declares, reused the same way. */
const EVALUATION_REASON_VALUES: ReadonlySet<string> = new Set<string>(EVALUATION_REASONS);

/** Schema-qualified table names, named once and reused across every statement below rather than repeated as literals (TYP-04). */
const INVESTIGATIONS_TABLE = 'investigations';
const INVESTIGATION_EVIDENCE_TABLE = 'investigation_evidence';
const INVESTIGATION_EVALUATIONS_TABLE = 'investigation_evaluations';
const INVESTIGATION_EVALUATION_CITATIONS_TABLE = 'investigation_evaluation_citations';
const INVESTIGATION_SUBJECT_ATTRIBUTE_VALUES_TABLE = 'investigation_subject_attribute_values';

/** Postgres' own error code for a unique-constraint violation — the signal write-once is decided by, never a value spelled out where it is compared (TYP-04). */
const UNIQUE_VIOLATION_CODE = '23505';

/** The parameterized INSERT text for one investigation's own root row, named once so investigationStatement stays well within a function's own line budget (MNT-01). */
const INVESTIGATION_INSERT_TEXT = `INSERT INTO ${INVESTIGATIONS_TABLE}
    (id, requester, ticket_ref, narrative, subject_type, prompt_version, model,
     pinned_case_slug, pinned_case_version, assessment_outcome, assessment_action, assessment_recipient,
     assessment_determining_hypothesis, assessment_text, cost_calls, cost_input_tokens, cost_output_tokens,
     durations_collection, durations_judgment, durations_writing, durations_total, written_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`;

/**
 * The relational adapter of the investigation module's own store port: one
 * built investigation is written whole, in one transaction, refused
 * through this store's own typed error exactly where its id's key already
 * exists (criterion 1, criterion 2, criterion 3, criterion 4), and read
 * back together with every evidence item, every evaluation and its
 * citations, the assessment, the cost and the durations (criterion 5,
 * criterion 6, criterion 7, criterion 8).
 */
export class RelationalInvestigationStore implements IInvestigationStore {
  public constructor(private readonly connection: DatabaseConnection) {}

  public async write(investigation: Investigation): Promise<void> {
    await runInTransaction(this.connection, raiseWriteFailure, (tx) => writeWholeInvestigation(tx, investigation));
  }

  public async read(id: string): Promise<StoredInvestigation | undefined> {
    return runInTransaction(this.connection, raiseReadFailure, (tx) => readWholeInvestigation(tx, id));
  }
}

// ---------------------------------------------------------------- write

/** Inserts the root row first, refused through InvestigationAlreadyStoredError exactly where its own key already holds this id, then every child row — never an UPDATE anywhere in this module (criterion 9). */
async function writeWholeInvestigation(tx: IQueryable, investigation: Investigation): Promise<void> {
  await runStatement(tx, investigationStatement(investigation), raiseRootInsertFailure(investigation.id));
  for (const statement of childStatementsFor(investigation)) {
    await runStatement(tx, statement, raiseWriteFailure);
  }
}

/** Every child row one whole write needs, in an order that always satisfies the foreign key each one carries back to the root row just inserted: every subject-attribute-value, every evidence item, then every evaluation immediately followed by its own citations. */
function childStatementsFor(investigation: Investigation): readonly IStatement[] {
  return [
    ...investigation.subject.attributes.map((attribute) => subjectAttributeValueStatement(investigation.id, attribute)),
    ...investigation.evidence.map((item) => evidenceStatement(investigation.id, item)),
    ...investigation.evaluations.flatMap((evaluation) => evaluationStatements(investigation.id, evaluation)),
  ];
}

/** The one INSERT the root row needs, from every attribute domain/investigation/investigation declares plus the flattened subject, pinned case, assessment, cost and durations (constraints/the-stored-schema-mirrors-the-declared-model). */
function investigationStatement(investigation: Investigation): IStatement {
  return { text: INVESTIGATION_INSERT_TEXT, params: investigationParams(investigation) };
}

/** Every parameter INVESTIGATION_INSERT_TEXT's own positional placeholders need, in that exact order — split into the four groups below rather than one long literal, so each stays a small, named piece (MNT-01). */
function investigationParams(investigation: Investigation): readonly unknown[] {
  return [
    ...identityParams(investigation),
    ...assessmentParams(investigation.assessment),
    ...costParams(investigation.cost),
    ...durationsParams(investigation.durations),
    investigation.written_at,
  ];
}

/** id, requester, ticket_ref, narrative, the subject's own type, prompt_version, model and the pinned case's own slug and version — every column the root row carries ahead of its own assessment, cost and durations. ticket_ref travels exactly as the aggregate holds it, including the empty string the upstream boundary already uses where none was given (this task's own inference, recorded in the delivery record). */
function identityParams(investigation: Investigation): readonly unknown[] {
  return [
    investigation.id,
    investigation.requester,
    investigation.ticket_ref,
    investigation.narrative,
    investigation.subject.type,
    investigation.prompt_version,
    investigation.model,
    investigation.pinned_case.slug,
    investigation.pinned_case.version,
  ];
}

/** The assessment's own five columns, flattened (domain/investigation/assessment): outcome and, from its referral, action and recipient, then its optional determining_hypothesis and its text. */
function assessmentParams(assessment: Assessment): readonly unknown[] {
  return [assessment.outcome, assessment.referral.action, assessment.referral.recipient, assessment.determining_hypothesis ?? null, assessment.text];
}

/** The cost's own three columns (domain/investigation/cost). */
function costParams(cost: Cost): readonly unknown[] {
  return [cost.calls, cost.input_tokens, cost.output_tokens];
}

/** The durations' own four columns (domain/investigation/durations). */
function durationsParams(durations: Durations): readonly unknown[] {
  return [durations.collection, durations.judgment, durations.writing, durations.total];
}

/** Inserts one row of the subject's own attribute-values (domain/investigation/subject-attribute-value). */
function subjectAttributeValueStatement(investigationId: string, attribute: SubjectAttributeValue): IStatement {
  return {
    text: `INSERT INTO ${INVESTIGATION_SUBJECT_ATTRIBUTE_VALUES_TABLE} (investigation_id, attribute, value) VALUES ($1, $2, $3)`,
    params: [investigationId, attribute.attribute, attribute.value],
  };
}

/** Inserts one evidence item's own row, whole (domain/investigation/evidence): every declared attribute plus the capability reference this task's own UNDERDETERMINED note requires a column for, plus elapsed_ms (task/investigation-telemetry/evidence-collection-measures-elapsed-ms, 0011-investigation-evidence-elapsed-ms.sql). */
function evidenceStatement(investigationId: string, evidence: Evidence): IStatement {
  return {
    text: `INSERT INTO ${INVESTIGATION_EVIDENCE_TABLE}
             (investigation_id, concept, inputs, observation, observed_at, ttl, origin, result, result_detail, capability_name, capability_version, elapsed_ms)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    params: [
      investigationId,
      evidence.concept,
      evidence.inputs,
      evidence.observation,
      evidence.observed_at,
      evidence.ttl,
      evidence.origin,
      evidence.result,
      evidence.result_detail ?? null,
      evidence.capability_name,
      evidence.capability_version,
      evidence.elapsed_ms,
    ],
  };
}

/** One evaluation's own row, immediately followed by one row per citation it carries — kept together so the FK from citations to this evaluation is always satisfied by the statement just before it. */
function evaluationStatements(investigationId: string, evaluation: Evaluation): readonly IStatement[] {
  return [
    evaluationStatement(investigationId, evaluation),
    ...evaluation.citations.map((citation) => citationStatement(investigationId, evaluation.hypothesis, citation)),
  ];
}

/** Inserts one evaluation's own row (domain/investigation/evaluation): its hypothesis, its verdict and, where inconclusive, its reason. */
function evaluationStatement(investigationId: string, evaluation: Evaluation): IStatement {
  const reason = evaluation.verdict === 'inconclusive' ? evaluation.reason : null;
  return {
    text: `INSERT INTO ${INVESTIGATION_EVALUATIONS_TABLE} (investigation_id, hypothesis, verdict, reason) VALUES ($1, $2, $3, $4)`,
    params: [investigationId, evaluation.hypothesis, evaluation.verdict, reason],
  };
}

/** Inserts one row of one evaluation's own citations (domain/investigation/citation). */
function citationStatement(investigationId: string, hypothesis: string, citation: Citation): IStatement {
  return {
    text: `INSERT INTO ${INVESTIGATION_EVALUATION_CITATIONS_TABLE} (investigation_id, hypothesis, concept, field) VALUES ($1, $2, $3, $4)`,
    params: [investigationId, hypothesis, citation.concept, citation.field],
  };
}

/** Whether a failure the driver raised is Postgres' own unique-violation code (TYP-02's guard, the same convention json-file.ts's own ENOENT check already keeps for a different code). */
function isUniqueViolation(cause: unknown): boolean {
  return cause instanceof Error && 'code' in cause && cause.code === UNIQUE_VIOLATION_CODE;
}

/** Builds the raise callback the root insert's own statement runs through: a unique-violation on its own primary key is this id already being stored (rules/investigation/an-investigation-is-written-once, criterion 3), answered through the existing typed error rather than the store's own generic one; anything else is wrapped the same way every other statement's own failure is. */
function raiseRootInsertFailure(id: string): RaiseStoreError {
  return (cause) => (isUniqueViolation(cause) ? new InvestigationAlreadyStoredError(id) : raiseWriteFailure(cause));
}

/** Builds this store's own typed error for a failed write, carrying the driver failure as its cause. */
function raiseWriteFailure(cause: unknown): Error {
  return new InvestigationStoreError('a write against the investigation store failed', { operation: 'write' }, { cause });
}

// ---------------------------------------------------------------- read

/** Reads one whole investigation, root together with its subject-attribute-values, evidence and evaluations, through the one connection the caller's own transaction checked out: an absent id answers undefined before any child table is ever read (never a partial assembly). */
async function readWholeInvestigation(tx: IQueryable, id: string): Promise<StoredInvestigation | undefined> {
  const row = await queryOneOrAbsent<IInvestigationRow>(tx, investigationSelect(id), raiseReadFailure);
  if (row === undefined) {
    return undefined;
  }
  const attributes = await readSubjectAttributeValues(tx, id);
  const evidence = await readEvidence(tx, id);
  const evaluations = await readEvaluations(tx, id);
  const document = investigationOf({ id, row, attributes, evidence, evaluations });
  return { document, hash: contentHash(document) };
}

function investigationSelect(id: string): IStatement {
  return {
    text: `SELECT requester, ticket_ref, narrative, subject_type, prompt_version, model,
                  pinned_case_slug, pinned_case_version, assessment_outcome, assessment_action, assessment_recipient,
                  assessment_determining_hypothesis, assessment_text, cost_calls, cost_input_tokens, cost_output_tokens,
                  durations_collection, durations_judgment, durations_writing, durations_total, written_at
           FROM ${INVESTIGATIONS_TABLE}
           WHERE id = $1`,
    params: [id],
  };
}

/** Every subject-attribute-value one investigation holds, sorted for a deterministic result — the table carries no ordinal column of its own. */
async function readSubjectAttributeValues(tx: IQueryable, id: string): Promise<readonly SubjectAttributeValue[]> {
  return runStatement<SubjectAttributeValue>(
    tx,
    {
      text: `SELECT attribute, value FROM ${INVESTIGATION_SUBJECT_ATTRIBUTE_VALUES_TABLE}
             WHERE investigation_id = $1 ORDER BY attribute, value`,
      params: [id],
    },
    raiseReadFailure,
  );
}

/** Every evidence item one investigation holds, one per concept its collection plan named (rules/investigation/one-evidence-per-collected-concept), sorted by concept for a deterministic result. */
async function readEvidence(tx: IQueryable, id: string): Promise<readonly Evidence[]> {
  const rows = await runStatement<IEvidenceRow>(
    tx,
    {
      text: `SELECT concept, inputs, observation, observed_at, ttl, origin, result, result_detail, capability_name, capability_version, elapsed_ms
             FROM ${INVESTIGATION_EVIDENCE_TABLE} WHERE investigation_id = $1 ORDER BY concept`,
      params: [id],
    },
    raiseReadFailure,
  );
  return rows.map(evidenceOf);
}

/**
 * One evidence row assembled into the shape domain/investigation/evidence
 * declares, including the capability pin this task's own UNDERDETERMINED
 * note requires and elapsed_ms
 * (task/investigation-telemetry/evidence-collection-measures-elapsed-ms).
 * fields and concept_description are not yet columns of this table — no
 * migration for them exists yet
 * (task/evidence-semantics-snapshot/investigation-store-persists-the-snapshot's
 * own objective, which adds both and this function's own read of them) — so
 * a row read back here always answers the same honest empty snapshot
 * domain/investigation/evidence already allows for an evidence item
 * collected before this attribute existed (this delivery's own inference:
 * the sibling task's own second criterion already commits to exactly this
 * degradation for a row stored before its migration runs, and every row
 * this function reads today lacks both columns).
 */
function evidenceOf(row: IEvidenceRow): Evidence {
  return {
    concept: row.concept,
    inputs: row.inputs,
    observation: row.observation,
    observed_at: row.observed_at.toISOString(),
    ttl: row.ttl,
    origin: row.origin,
    result: resultOf(row.result),
    ...(row.result_detail !== null ? { result_detail: row.result_detail } : {}),
    capability_name: row.capability_name,
    capability_version: row.capability_version,
    elapsed_ms: row.elapsed_ms,
    fields: [],
    concept_description: '',
  };
}

/** Narrows a stored result to evidence-result's own four declared values, raising this store's own typed error where a row somehow holds a value the enumeration does not (TYP-02) — the same defensive-narrow convention relational-capability-store.repository.ts's own toCapability already keeps. */
function resultOf(value: string): EvidenceResult {
  if (!isEvidenceResult(value)) {
    throw raiseReadFailure(new Error(`investigation_evidence holds an unrecognized result "${value}"`));
  }
  return value;
}

function isEvidenceResult(value: string): value is EvidenceResult {
  return EVIDENCE_RESULT_VALUES.has(value);
}

/** Every evaluation one investigation holds, one per hypothesis its pinned case required (rules/investigation/one-evaluation-per-required-hypothesis), each carrying its own citations, sorted by hypothesis for a deterministic result. */
async function readEvaluations(tx: IQueryable, id: string): Promise<readonly Evaluation[]> {
  const rows = await runStatement<IEvaluationRow>(
    tx,
    {
      text: `SELECT hypothesis, verdict, reason FROM ${INVESTIGATION_EVALUATIONS_TABLE}
             WHERE investigation_id = $1 ORDER BY hypothesis`,
      params: [id],
    },
    raiseReadFailure,
  );
  const citations = await citationsByHypothesis(tx, id);
  return rows.map((row) => evaluationOf(row, citations.get(row.hypothesis) ?? []));
}

/** Every citation each evaluation of one investigation carries, grouped by the evaluation's own hypothesis name — the citations table carries no order of its own, so each group is read back sorted by concept then field for a deterministic result. */
async function citationsByHypothesis(tx: IQueryable, id: string): Promise<ReadonlyMap<string, Citation[]>> {
  const rows = await runStatement<ICitationRow>(
    tx,
    {
      text: `SELECT hypothesis, concept, field FROM ${INVESTIGATION_EVALUATION_CITATIONS_TABLE}
             WHERE investigation_id = $1 ORDER BY hypothesis, concept, field`,
      params: [id],
    },
    raiseReadFailure,
  );
  const grouped = new Map<string, Citation[]>();
  for (const row of rows) {
    const citations = grouped.get(row.hypothesis) ?? [];
    citations.push({ concept: row.concept, field: row.field });
    grouped.set(row.hypothesis, citations);
  }
  return grouped;
}

/** One evaluation row plus its already-grouped citations, assembled into the shape domain/investigation/evaluation declares — each branch's verdict written as its own literal so it matches exactly the corresponding member of the Evaluation union, the same convention judgment-stage.ts's own asEvaluation already keeps. */
function evaluationOf(row: IEvaluationRow, citations: readonly Citation[]): Evaluation {
  const verdict = verdictOf(row);
  if (verdict === 'confirmed') {
    return { hypothesis: row.hypothesis, verdict, citations: nonEmptyCitations(citations, row.hypothesis) };
  }
  if (verdict === 'refuted') {
    return { hypothesis: row.hypothesis, verdict, citations: nonEmptyCitations(citations, row.hypothesis) };
  }
  return { hypothesis: row.hypothesis, verdict, reason: reasonOf(row), citations };
}

/** Narrows a stored verdict to verdict's own three declared values (TYP-02). */
function verdictOf(row: IEvaluationRow): Verdict {
  if (!isVerdict(row.verdict)) {
    throw raiseReadFailure(new Error(`investigation_evaluations holds an unrecognized verdict "${row.verdict}" for hypothesis "${row.hypothesis}"`));
  }
  return row.verdict;
}

function isVerdict(value: string): value is Verdict {
  return VERDICT_VALUES.has(value);
}

/** An inconclusive row's own reason, required by domain/investigation/evaluation for that verdict: raises where the column is null or holds a value evaluation-reason does not declare (TYP-02) — a decided verdict never reaches this call at all. */
function reasonOf(row: IEvaluationRow): EvaluationReason {
  if (row.reason === null) {
    throw raiseReadFailure(new Error(`investigation_evaluations holds an inconclusive verdict with no reason for hypothesis "${row.hypothesis}"`));
  }
  if (!isEvaluationReason(row.reason)) {
    throw raiseReadFailure(new Error(`investigation_evaluations holds an unrecognized reason "${row.reason}" for hypothesis "${row.hypothesis}"`));
  }
  return row.reason;
}

function isEvaluationReason(value: string): value is EvaluationReason {
  return EVALUATION_REASON_VALUES.has(value);
}

/** A confirmed or refuted row's own citations, required non-empty by domain/investigation/evaluation for those two verdicts (TYP-02's guard: the length check below narrows before the cast it accompanies) — raises rather than silently building a value the type does not actually satisfy. */
function nonEmptyCitations(citations: readonly Citation[], hypothesis: string): readonly [Citation, ...Citation[]] {
  if (citations.length === 0) {
    throw raiseReadFailure(new Error(`investigation_evaluations holds a decided verdict for hypothesis "${hypothesis}" with no citations`));
  }
  return citations as readonly [Citation, ...Citation[]];
}

/** Builds this store's own typed error for a failed read, carrying the driver failure as its cause. */
function raiseReadFailure(cause: unknown): Error {
  return new InvestigationStoreError('a read against the investigation store failed', { operation: 'read' }, { cause });
}

// ---------------------------------------------------------------- assembly

/** Every part readWholeInvestigation gathers, bundled into one object rather than five positional parameters (MNT-01). */
interface IAssembledInvestigation {
  readonly id: string;
  readonly row: IInvestigationRow;
  readonly attributes: readonly SubjectAttributeValue[];
  readonly evidence: readonly Evidence[];
  readonly evaluations: readonly Evaluation[];
}

/** The whole investigation these rows together answer, in the exact shape domain/investigation/investigation declares. */
function investigationOf(parts: IAssembledInvestigation): Investigation {
  const { id, row, attributes, evidence, evaluations } = parts;
  return {
    id,
    requester: row.requester,
    ticket_ref: row.ticket_ref ?? '',
    narrative: row.narrative,
    subject: { type: row.subject_type, attributes },
    pinned_case: { slug: row.pinned_case_slug, version: row.pinned_case_version },
    prompt_version: row.prompt_version,
    model: row.model,
    evidence,
    evaluations,
    assessment: assessmentOf(row),
    cost: { calls: row.cost_calls, input_tokens: row.cost_input_tokens, output_tokens: row.cost_output_tokens },
    durations: {
      collection: row.durations_collection,
      judgment: row.durations_judgment,
      writing: row.durations_writing,
      total: row.durations_total,
    },
    written_at: row.written_at.toISOString(),
  };
}

/** The root row's own five assessment columns, unflattened back into domain/investigation/assessment's own shape. */
function assessmentOf(row: IInvestigationRow): Assessment {
  return {
    outcome: row.assessment_outcome,
    referral: { action: row.assessment_action, recipient: row.assessment_recipient },
    ...(row.assessment_determining_hypothesis !== null ? { determining_hypothesis: row.assessment_determining_hypothesis } : {}),
    text: row.assessment_text,
  };
}

/**
 * The content identity of the document this read assembled — sha256 of its
 * deterministic JSON serialization, the equivalent
 * relational-case-store.repository.ts's own contentHash already establishes
 * for the identical StoredCaseVersion.hash pattern once a document is rows
 * rather than a file's own bytes (this task's own inference, recorded in
 * the delivery record): an investigation is written once and never altered
 * (rules/investigation/an-investigation-is-written-once), so the rows one
 * id ever answers never change, and investigationOf above always builds
 * its object literal in the same key order, so the same JSON text — and
 * therefore the same hash — answers every read of one already-stored
 * investigation.
 */
function contentHash(document: Investigation): string {
  return createHash('sha256').update(JSON.stringify(document), 'utf8').digest('hex');
}
