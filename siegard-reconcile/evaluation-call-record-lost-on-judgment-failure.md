---
contract_version: siegard-reconcile/3
title: Judgment-failure evaluations carry their own call record, in memory and persisted
summary: carry-the-call-record-through wrote judgment-stage.ts, relational-investigation-store.repository.ts
  and migrations/0017-evaluation-call-record.sql, and proved the change with four test files, under the
  evaluation-call-record-lost-on-judgment-failure initiative — folding a completed call's usage/elapsed_ms/prompt
  into judgmentFailureEvaluation and widening the store's write/read paths and schema to carry the same
  three fields for any evaluation.
target: backend
files:
- path: migrations/0017-evaluation-call-record.sql
  change: 'New migration adding four nullable columns to investigation_evaluations: input_tokens, output_tokens,
    elapsed_ms, prompt.'
- path: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  change: 'Proof: new integration test for the real write/read round trip of a judgment-failure evaluation''s
    call record against PostgreSQL.'
- path: src/__tests__/integration/persistence/schema-migrations.spec.ts
  change: 'Proof: the exhaustive nullable-column test''s list widened from eight to twelve columns to
    account for migration 0017''s four new nullable columns.'
- path: src/__tests__/unit/investigation/judgment-stage.spec.ts
  change: 'Proof: rewrites the one obsolete test asserting the pre-fix no-call-record behavior into an
    assertion of the retry''s own record surviving a judgment-failure, and keeps the existing no-data
    test unchanged.'
- path: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  change: 'Proof: new and updated unit tests for the widened INSERT''s param list (present/absent branches),
    the read-back reconstruction across reasons, and the AND-shaped usage presence check.'
- path: src/investigation/judgment-stage.ts
  change: 'judgmentFailureEvaluation(name, outcome) now folds outcome''s usage/elapsed_ms/prompt via callRecordOf,
    the same helper asEvaluation uses. RetryOrFailOptions gained a first: EvaluationOutcome field; runIsolatedCall''s
    call into retryOrFail now passes first alongside the existing fields. retryOrFail calls judgmentFailureEvaluation(name,
    first) on the no-retry branch and judgmentFailureEvaluation(name, retry) on the retried-and-failed
    branch, so a judgment-failure evaluation now carries the last call actually made.'
- path: src/persistence/relational-investigation-store.repository.ts
  change: evaluationStatement's INSERT gained four params (input_tokens, output_tokens, elapsed_ms, prompt)
    sent from the Evaluation being written, null when absent. evaluationOf/callRecordOf now reconstruct
    usage/elapsed_ms/prompt from the four new columns for every evaluation reason, present exactly when
    the row's four columns are non-null.
nodes:
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at judgeHypotheses(): one judgeOneHypothesis call per\
    \ required hypothesis, launched together and gated by a CallPool sized from options.poolSize — const\
    \ pool = new CallPool(poolSize); ... return Promise.all(\n    requiredNames.map((name) =>\n      judgeOneHypothesis({\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at runIsolatedCall()/retryOrFail(): the only call into
    a hypothesis judgment is through the injected IHypothesisEvaluator — evaluator.evaluate(hypothesis.criterion,
    evidenceItems, caseContext)'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at judgeHypotheses(): the guard is built from the absolute
    deadline minus now, clamped at zero, and threaded to every hypothesis''s call and retry — const deadlineGuard
    = createDeadlineGuard(Math.max(0, deadline - now));'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at toEvidenceItems() and the caseContext literal built
    in judgeHypotheses(), passed as the sole inputs to evaluator.evaluate — const evidenceItems = toEvidenceItems(evidence);
    ... const caseContext: CaseContext = { title: theCase.title, whenToUse: theCase.when_to_use };

    '
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-stored-schema-mirrors-the-declared-model
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at the INVESTIGATION_INSERT_TEXT
    column list and the *Params/*Row functions pairing each column to a declared attribute — assessment.outcome,
    assessment.referral.action, assessment.referral.recipient, assessment.determining_hypothesis ?? null,
    assessment.text, assessment.register, assessment.usage.input_tokens, assessment.usage.output_tokens,
    assessment.elapsed_ms, assessment.prompt,'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at write() and read(), which
    only ever call through IConnectableQueryable/IQueryable — await runInTransaction(this.connection,
    raiseWriteFailure, (tx) => writeWholeInvestigation(tx, investigation));'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: contracts/integration/capability-registry
  conforms: false
  how: 'no named file holds this fact now: src/investigation/judgment-stage.ts read `nowhere` — the import
    list (lines 1-8) names case-resolution, case, citation, citation-validation, evaluation, evidence,
    hypothesis-evaluator.port and usage — no capability-registry client is imported or called anywhere
    in the file'
  observed_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/assessment
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at assessmentParams and assessmentOf
    — outcome: row.assessment_outcome, referral: { action: row.assessment_action, recipient: row.assessment_recipient
    }, ...(row.assessment_determining_hypothesis !== null ? { determining_hypothesis: row.assessment_determining_hypothesis
    } : {}), text: row.assessment_text, register: registerOf(row.assessment_register),'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/citation
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at noDataEvaluation(): citations built with concept
    only, field left absent — citations: nonOkEvidence.map((item): Citation => ({ concept: item.concept
    }))

    src/persistence/relational-investigation-store.repository.ts: held at citationStatement and citationOf
    — return { concept: row.concept, ...(row.field !== null ? { field: row.field } : {}) };'
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/cost
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at costParams and the cost
    object in investigationOf — return [cost.calls, cost.input_tokens, cost.output_tokens];'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/durations
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at durationsParams and the
    durations object in investigationOf — return [durations.collection, durations.judgment, durations.writing,
    durations.total];'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation
  conforms: true
  how: "migrations/0017-evaluation-call-record.sql: held at the four ALTER TABLE statements adding input_tokens,\
    \ output_tokens, elapsed_ms and prompt — ALTER TABLE investigation_evaluations\n  ADD COLUMN input_tokens\
    \ INTEGER;\nALTER TABLE investigation_evaluations\n  ADD COLUMN output_tokens INTEGER;\nALTER TABLE\
    \ investigation_evaluations\n  ADD COLUMN elapsed_ms INTEGER;\nALTER TABLE investigation_evaluations\n\
    \  ADD COLUMN prompt TEXT;\n\nsrc/investigation/judgment-stage.ts: held at asEvaluation()/noDataEvaluation()/deadlineExceededEvaluation()/judgmentFailureEvaluation():\
    \ the Evaluation object literals returned to the caller — return { hypothesis: name, verdict: 'confirmed',\
    \ citations: outcome.citations, ...callRecord };\nsrc/persistence/relational-investigation-store.repository.ts:\
    \ held at evaluationStatement, evaluationOf and callRecordOf — params: [investigationId, evaluation.hypothesis,\
    \ evaluation.verdict, reason, evaluation.usage?.input_tokens ?? null, evaluation.usage?.output_tokens\
    \ ?? null, evaluation.elapsed_ms ?? null, evaluation.prompt ?? null,],\n"
  encoded_at:
  - migrations/0017-evaluation-call-record.sql
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at the three reason literals set across noDataEvaluation,
    deadlineExceededEvaluation and judgmentFailureEvaluation — reason: ''no-data'' ... reason: ''deadline-exceeded''
    ... reason: ''judgment-failure''

    src/persistence/relational-investigation-store.repository.ts: held at EVALUATION_REASON_VALUES and
    isEvaluationReason — const EVALUATION_REASON_VALUES: ReadonlySet<string> = new Set<string>(EVALUATION_REASONS);'
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at evidenceStatement and evidenceOf
    — concept: row.concept, inputs: row.inputs, observation: row.observation, observed_at: row.observed_at.toISOString(),
    ttl: row.ttl, origin: row.origin, result: resultOf(row.result),'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at EVIDENCE_RESULT_VALUES,
    resultOf and isEvidenceResult — const EVIDENCE_RESULT_VALUES: ReadonlySet<string> = new Set<string>(EVIDENCE_RESULTS);'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/field-semantics
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at the fields column, written
    and read as a JSON blob of FieldSemantics — JSON.stringify(evidence.fields),'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at runIsolatedCall()/retryOrFail(): evaluator.evaluate
    is given the hypothesis''s criterion, its own evidence items and the case context, and its outcome
    is what gets turned into an Evaluation — await raceEvaluateAgainstDeadline(evaluator.evaluate(hypothesis.criterion,
    evidenceItems, caseContext), deadlineGuard)'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/investigation
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at investigationStatement,\
    \ investigationParams and investigationOf — INSERT INTO ${INVESTIGATIONS_TABLE}\n    (id, requester,\
    \ ticket_ref, narrative, subject_type, prompt_version, model,\n"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at identityParams (subject_type)
    and investigationOf''s subject assembly — subject: { type: row.subject_type, attributes },'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at subjectAttributeValueStatement
    and readSubjectAttributeValues — params: [investigationId, attribute.attribute, attribute.value],'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/usage
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at assessmentParams/assessmentOf
    and callRecordOf — record.usage = { input_tokens: row.input_tokens, output_tokens: row.output_tokens
    };'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/verdict
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at asEvaluation(): branches on outcome.verdict across\
    \ confirmed, refuted and the remaining (inconclusive) case — if (outcome.verdict === 'confirmed')\
    \ {\n ... }\n  if (outcome.verdict === 'refuted') {\n\nsrc/persistence/relational-investigation-store.repository.ts:\
    \ held at VERDICT_VALUES, verdictOf and isVerdict — const VERDICT_VALUES: ReadonlySet<string> = new\
    \ Set<string>(VERDICTS);"
  encoded_at:
  - src/investigation/judgment-stage.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/knowledge/case-version
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at judgeHypotheses(): requiredNames derived via requiresEvaluationOf(theCase),
    and title/when_to_use read off theCase for the caseContext — const requiredNames = requiresEvaluationOf(theCase);'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at CONSOLIDATION_REGISTER_VALUES,
    registerOf and isConsolidationRegister — register: registerOf(row.assessment_register),'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at noDataEvaluation() draws citations straight from
    the hypothesis''s own filtered evidence; runIsolatedCall()/retryOrFail() gate every evaluator-produced
    outcome through citationsAreAcceptable/isStructurallyValid before accepting it — const context: HypothesisCitationContext
    = { collects: hypothesis.collects, evidence }; if (citationsAreAcceptable(context, first)) {'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at isStructurallyValid(): delegates the check to acceptedCitations(),
    whose own module enforces field existence; this file only gates on its result — const accepted = acceptedCitations({
    ...context, citations }); return accepted.length === citations.length;'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: false
  how: "src/persistence/relational-investigation-store.repository.ts, nonEmptyCitations, lines 443-448:\
    \ if (citations.length === 0) {\n    throw raiseReadFailure(new Error(`investigation_evaluations holds\
    \ a decided verdict for hypothesis \"${hypothesis}\" with no citations`));\n  }\n — the rule that\
    \ a confirmed or refuted evaluation carries at least one citation is re-asserted here as an independent,\
    \ hard-coded length check carrying its own business-worded message, rather than by reference to the\
    \ node that states it; a later change to that rule has to be carried into this file separately, and\
    \ disagreement between the two is invisible until a stored evaluation is actually read back."
  observed_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-judgment-failure-records-the-last-call-made
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at retryOrFail(): the no-retry branch carries the first\
    \ call's outcome, the retried branch carries only the retry's outcome — if (deadlineGuard.elapsed())\
    \ {\n    return judgmentFailureEvaluation(name, first);\n  } ... return citationsAreAcceptable(context,\
    \ retry) ? asEvaluation(name, retry) : judgmentFailureEvaluation(name, retry);\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-empty-ticket-reference-is-no-ticket-reference
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at ticketRefForWrite and holdsNoTicketReference\
    \ — function holdsNoTicketReference(value: string | undefined): boolean {\n  return value === undefined\
    \ || value === '';\n}\n"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: false
  how: "src/persistence/relational-investigation-store.repository.ts, reasonOf, lines 429-432: if (row.reason\
    \ === null) {\n    throw raiseReadFailure(new Error(`investigation_evaluations holds an inconclusive\
    \ verdict with no reason for hypothesis \"${row.hypothesis}\"`));\n  }\n — the rule that every inconclusive\
    \ evaluation declares a reason is re-asserted here as an independent, hard-coded null check carrying\
    \ its own business-worded message, rather than by reference to the node that states it; a later change\
    \ to that rule has to be found and re-derived here separately, and until then the two can silently\
    \ disagree about which stored rows are valid."
  observed_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: false
  how: 'src/persistence/relational-investigation-store.repository.ts, raiseRootInsertFailure, lines 267-269,
    and its use inside writeWholeInvestigation: return (cause) => (isUniqueViolation(cause) ? new InvestigationAlreadyStoredError(id)
    : raiseWriteFailure(cause)); — write() rejects with InvestigationAlreadyStoredError whenever the id
    already has a record, rather than resolving the way a write that settled would; a caller that reads
    only this store''s own write() outcome sees the duplicate as something to recover from, not as the
    already-answered request the rule describes, and nothing in this file makes the second attempt behave
    as a write that settled.'
  observed_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/judgment-reads-the-evidence-snapshot
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at toEvidenceItems(): maps each Evidence item's own\
    \ already-collected concept, observation, fields and concept_description, with no external lookup\
    \ — return evidence.map((item): EvidenceItem => ({\n    concept: item.concept,\n    result: 'ok',\n\
    \    observation: item.observation,\n    fields: item.fields,\n    concept_description: item.concept_description,\n\
    \  }));\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at acquireSlotOrDeadline()'s caller and runIsolatedCall()/retryOrFail():\
    \ a deadline overrun returns a deadlineExceededEvaluation instead of throwing or aborting the stage\
    \ — if (!(await acquireSlotOrDeadline(pool, deadlineGuard))) {\n    return deadlineExceededEvaluation(name);\n\
    \  }\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at judgeHypotheses(): one judgeOneHypothesis result\
    \ per name in requiredNames, none filtered out — return Promise.all(\n    requiredNames.map((name)\
    \ =>\n      judgeOneHypothesis({\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/written-at-records-when-the-write-settled
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at written_at is absent from
    INVESTIGATION_INSERT_TEXT''s column list (left to the store to fill at settle) and read back in investigationOf
    — written_at: row.written_at.toISOString(),'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/knowledge/requires-evaluation-of-names-exactly-the-manifested-hypotheses
  conforms: false
  how: 'no named file holds this fact now: src/investigation/judgment-stage.ts read `nowhere` — import
    { requiresEvaluationOf } from ''../case/case-resolution.js''; ... const requiredNames = requiresEvaluationOf(theCase);'
  observed_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at judgeOneHypothesis(): non-ok evidence short-circuits\
    \ straight to noDataEvaluation before any call or pool acquisition — const nonOkEvidence = evidence.filter((item)\
    \ => item.result !== 'ok');\n  if (nonOkEvidence.length > 0) {\n    return noDataEvaluation(name,\
    \ nonOkEvidence);\n  }\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at runIsolatedCall()/retryOrFail(): a rejected citation\
    \ set routes to retryOrFail, which retries once if time remains and otherwise records judgment-failure\
    \ — if (citationsAreAcceptable(context, first)) {\n    return asEvaluation(name, first);\n  }\n  return\
    \ retryOrFail({\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: 'src/investigation/judgment-stage.ts: held at acquireSlotOrDeadline(): a slot lost to the deadline
    races the pool acquisition against the deadline signal and reports false — const acquired = await
    Promise.race([acquisition.then(() => true), deadlineGuard.signal.then(() => false)]);'
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-re-registered-capability-does-not-change-a-past-judgment
  conforms: true
  how: "src/investigation/judgment-stage.ts: held at toEvidenceItems(): fields and concept_description\
    \ are carried unchanged from the already-collected evidence item, never re-fetched — fields: item.fields,\n\
    \    concept_description: item.concept_description,\n"
  encoded_at:
  - src/investigation/judgment-stage.ts
unbound:
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/integration/persistence/schema-migrations.spec.ts
- src/__tests__/unit/investigation/judgment-stage.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
notes: 'Judged by 7 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/evaluation-call-record-lost-on-judgment-failure.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) domain/investigation/evaluation,
  rules/investigation/a-judgment-failure-records-the-last-call-made were read on every file and answered
  for, and bound from nowhere here — a binding this record writes is one the trace already held.

  Candidates: 12 opened across 5 of 7 delegation(s); each return lists its own under `candidates_opened`.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/evaluation-call-record-lost-on-judgment-failure.returns/`, which are the evidence behind every entry above.
