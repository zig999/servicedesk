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
import type { FieldSemantics } from '../investigation/field-semantics.js';
import type { IInvestigationStore, StoredInvestigation } from '../investigation/investigation-store.port.js';
import type { Investigation } from '../investigation/investigation.js';
import type { SubjectAttributeValue } from '../investigation/subject-attribute-value.js';
import { VERDICTS, type Verdict } from '../investigation/verdict.js';
import {
  queryOneOrAbsent,
  runInTransaction,
  runStatement,
  type IConnectableQueryable,
  type IQueryable,
  type IStatement,
  type RaiseStoreError,
} from './database-access.js';

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
  readonly fields: readonly FieldSemantics[];
  readonly concept_description: string;
}

interface IEvaluationRow {
  readonly hypothesis: string;
  readonly verdict: string;
  readonly reason: string | null;
}

interface ICitationRow {
  readonly hypothesis: string;
  readonly concept: string;
  readonly field: string;
}

const EVIDENCE_RESULT_VALUES: ReadonlySet<string> = new Set<string>(EVIDENCE_RESULTS);

const VERDICT_VALUES: ReadonlySet<string> = new Set<string>(VERDICTS);

const EVALUATION_REASON_VALUES: ReadonlySet<string> = new Set<string>(EVALUATION_REASONS);

const INVESTIGATIONS_TABLE = 'investigations';
const INVESTIGATION_EVIDENCE_TABLE = 'investigation_evidence';
const INVESTIGATION_EVALUATIONS_TABLE = 'investigation_evaluations';
const INVESTIGATION_EVALUATION_CITATIONS_TABLE = 'investigation_evaluation_citations';
const INVESTIGATION_SUBJECT_ATTRIBUTE_VALUES_TABLE = 'investigation_subject_attribute_values';

const UNIQUE_VIOLATION_CODE = '23505';

const INVESTIGATION_INSERT_TEXT = `INSERT INTO ${INVESTIGATIONS_TABLE}
    (id, requester, ticket_ref, narrative, subject_type, prompt_version, model,
     pinned_case_slug, pinned_case_version, assessment_outcome, assessment_action, assessment_recipient,
     assessment_determining_hypothesis, assessment_text, cost_calls, cost_input_tokens, cost_output_tokens,
     durations_collection, durations_judgment, durations_writing, durations_total, written_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`;

export class RelationalInvestigationStore implements IInvestigationStore {
  public constructor(private readonly connection: IConnectableQueryable) {}

  public async write(investigation: Investigation): Promise<void> {
    await runInTransaction(this.connection, raiseWriteFailure, (tx) => writeWholeInvestigation(tx, investigation));
  }

  public async read(id: string): Promise<StoredInvestigation | undefined> {
    return runInTransaction(this.connection, raiseReadFailure, (tx) => readWholeInvestigation(tx, id));
  }
}

async function writeWholeInvestigation(tx: IQueryable, investigation: Investigation): Promise<void> {
  await runStatement(tx, investigationStatement(investigation), raiseRootInsertFailure(investigation.id));
  for (const statement of childStatementsFor(investigation)) {
    await runStatement(tx, statement, raiseWriteFailure);
  }
}

function childStatementsFor(investigation: Investigation): readonly IStatement[] {
  return [
    ...investigation.subject.attributes.map((attribute) => subjectAttributeValueStatement(investigation.id, attribute)),
    ...investigation.evidence.map((item) => evidenceStatement(investigation.id, item)),
    ...investigation.evaluations.flatMap((evaluation) => evaluationStatements(investigation.id, evaluation)),
  ];
}

function investigationStatement(investigation: Investigation): IStatement {
  return { text: INVESTIGATION_INSERT_TEXT, params: investigationParams(investigation) };
}

function investigationParams(investigation: Investigation): readonly unknown[] {
  return [
    ...identityParams(investigation),
    ...assessmentParams(investigation.assessment),
    ...costParams(investigation.cost),
    ...durationsParams(investigation.durations),
    investigation.written_at,
  ];
}

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

function assessmentParams(assessment: Assessment): readonly unknown[] {
  return [assessment.outcome, assessment.referral.action, assessment.referral.recipient, assessment.determining_hypothesis ?? null, assessment.text];
}

function costParams(cost: Cost): readonly unknown[] {
  return [cost.calls, cost.input_tokens, cost.output_tokens];
}

function durationsParams(durations: Durations): readonly unknown[] {
  return [durations.collection, durations.judgment, durations.writing, durations.total];
}

function subjectAttributeValueStatement(investigationId: string, attribute: SubjectAttributeValue): IStatement {
  return {
    text: `INSERT INTO ${INVESTIGATION_SUBJECT_ATTRIBUTE_VALUES_TABLE} (investigation_id, attribute, value) VALUES ($1, $2, $3)`,
    params: [investigationId, attribute.attribute, attribute.value],
  };
}

function evidenceStatement(investigationId: string, evidence: Evidence): IStatement {
  return {
    text: `INSERT INTO ${INVESTIGATION_EVIDENCE_TABLE}
             (investigation_id, concept, inputs, observation, observed_at, ttl, origin, result, result_detail, capability_name, capability_version, elapsed_ms, fields, concept_description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
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
      JSON.stringify(evidence.fields),
      evidence.concept_description,
    ],
  };
}

function evaluationStatements(investigationId: string, evaluation: Evaluation): readonly IStatement[] {
  return [
    evaluationStatement(investigationId, evaluation),
    ...evaluation.citations.map((citation) => citationStatement(investigationId, evaluation.hypothesis, citation)),
  ];
}

function evaluationStatement(investigationId: string, evaluation: Evaluation): IStatement {
  const reason = evaluation.verdict === 'inconclusive' ? evaluation.reason : null;
  return {
    text: `INSERT INTO ${INVESTIGATION_EVALUATIONS_TABLE} (investigation_id, hypothesis, verdict, reason) VALUES ($1, $2, $3, $4)`,
    params: [investigationId, evaluation.hypothesis, evaluation.verdict, reason],
  };
}

function citationStatement(investigationId: string, hypothesis: string, citation: Citation): IStatement {
  return {
    text: `INSERT INTO ${INVESTIGATION_EVALUATION_CITATIONS_TABLE} (investigation_id, hypothesis, concept, field) VALUES ($1, $2, $3, $4)`,
    params: [investigationId, hypothesis, citation.concept, citation.field],
  };
}

function isUniqueViolation(cause: unknown): boolean {
  return cause instanceof Error && 'code' in cause && cause.code === UNIQUE_VIOLATION_CODE;
}

function raiseRootInsertFailure(id: string): RaiseStoreError {
  return (cause) => (isUniqueViolation(cause) ? new InvestigationAlreadyStoredError(id) : raiseWriteFailure(cause));
}

function raiseWriteFailure(cause: unknown): Error {
  return new InvestigationStoreError('a write against the investigation store failed', { operation: 'write' }, { cause });
}

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

async function readEvidence(tx: IQueryable, id: string): Promise<readonly Evidence[]> {
  const rows = await runStatement<IEvidenceRow>(
    tx,
    {
      text: `SELECT concept, inputs, observation, observed_at, ttl, origin, result, result_detail, capability_name, capability_version, elapsed_ms, fields, concept_description
             FROM ${INVESTIGATION_EVIDENCE_TABLE} WHERE investigation_id = $1 ORDER BY concept`,
      params: [id],
    },
    raiseReadFailure,
  );
  return rows.map(evidenceOf);
}

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
    fields: row.fields,
    concept_description: row.concept_description,
  };
}

function resultOf(value: string): EvidenceResult {
  if (!isEvidenceResult(value)) {
    throw raiseReadFailure(new Error(`investigation_evidence holds an unrecognized result "${value}"`));
  }
  return value;
}

function isEvidenceResult(value: string): value is EvidenceResult {
  return EVIDENCE_RESULT_VALUES.has(value);
}

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

function verdictOf(row: IEvaluationRow): Verdict {
  if (!isVerdict(row.verdict)) {
    throw raiseReadFailure(new Error(`investigation_evaluations holds an unrecognized verdict "${row.verdict}" for hypothesis "${row.hypothesis}"`));
  }
  return row.verdict;
}

function isVerdict(value: string): value is Verdict {
  return VERDICT_VALUES.has(value);
}

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

function nonEmptyCitations(citations: readonly Citation[], hypothesis: string): readonly [Citation, ...Citation[]] {
  if (citations.length === 0) {
    throw raiseReadFailure(new Error(`investigation_evaluations holds a decided verdict for hypothesis "${hypothesis}" with no citations`));
  }
  return citations as readonly [Citation, ...Citation[]];
}

function raiseReadFailure(cause: unknown): Error {
  return new InvestigationStoreError('a read against the investigation store failed', { operation: 'read' }, { cause });
}

interface IAssembledInvestigation {
  readonly id: string;
  readonly row: IInvestigationRow;
  readonly attributes: readonly SubjectAttributeValue[];
  readonly evidence: readonly Evidence[];
  readonly evaluations: readonly Evaluation[];
}

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

function assessmentOf(row: IInvestigationRow): Assessment {
  return {
    outcome: row.assessment_outcome,
    referral: { action: row.assessment_action, recipient: row.assessment_recipient },
    ...(row.assessment_determining_hypothesis !== null ? { determining_hypothesis: row.assessment_determining_hypothesis } : {}),
    text: row.assessment_text,
  };
}

function contentHash(document: Investigation): string {
  return createHash('sha256').update(JSON.stringify(document), 'utf8').digest('hex');
}
