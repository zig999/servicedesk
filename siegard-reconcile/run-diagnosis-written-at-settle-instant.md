---
contract_version: siegard-reconcile/3
title: written_at decided by the store's own write() at settle, never precomputed in run-diagnosis.ts
summary: stamp-written-at-at-settle stops run-diagnosis.ts from stamping written_at before dispatching
  a write, makes the store's own write() (DB-level DEFAULT clock_timestamp(), evaluated at settle) the
  sole authority for the value, and updates every collateral test the corrected contract broke.
target: backend
files:
- path: migrations/0018-investigations-written-at-default.sql
  change: New migration. Adds ALTER TABLE investigations ALTER COLUMN written_at SET DEFAULT clock_timestamp(),
    so an INSERT that omits the column gets the instant Postgres evaluates that default expression during
    that specific INSERT's own execution.
- path: src/__tests__/integration/factories/store-wiring.spec.ts
  change: 'Proof/collateral: updated to assert written_at is store-assigned (differs from the fixture''s
    literal, is a recent timestamp) rather than the fixture''s own hardcoded value, exercised through
    the factory-built store.'
- path: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  change: 'Proof/collateral: updated to the same store-assigned-written_at assertion against the class
    constructed directly, plus a write-once test confirming a colliding write leaves the first-stored
    written_at unchanged.'
- path: src/__tests__/unit/investigation/investigation-factory.spec.ts
  change: 'Proof/collateral: updated to assert buildInvestigation builds an Investigation carrying no
    written_at when none is given, rather than refusing.'
- path: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  change: 'Proof: new and updated tests asserting run-diagnosis.ts never assigns written_at itself (dispatch
    carries none, no clock read in the file''s own text), that a retry reuses the exact same object as
    the first attempt, and that an already-stored record''s written_at is left untouched by a first-attempt
    or retry collision.'
- path: src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
  change: 'Proof/collateral: updated so the root INSERT''s asserted param list no longer includes written_at.'
- path: src/investigation/investigation-factory.ts
  change: BuildInvestigationOptions.written_at becomes optional; buildInvestigation no longer calls refuseMissingWrittenAt
    (removed) and no longer imports WrittenAtRequiredError.
- path: src/investigation/investigation.ts
  change: 'Investigation.written_at becomes optional (written_at?: string), since a built-but-not-yet-persisted
    investigation now correctly carries no value for it.'
- path: src/investigation/run-diagnosis.ts
  change: buildInvestigationOptions no longer assigns written_at at all. investigationForRetry is removed
    entirely; persistWithinBound's retry now dispatches store.write(investigation) with the exact same
    object the first attempt used, so no clock is read anywhere in this file to decide written_at, before
    or after a write settles.
- path: src/persistence/relational-investigation-store.repository.ts
  change: written_at is dropped from INVESTIGATION_INSERT_TEXT's column list and VALUES placeholders and
    from investigationParams -- the root INSERT no longer sends a written_at value at all, so the column's
    own DEFAULT decides it on every write, independently per attempt. The read path is unchanged.
nodes:
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at the runDiagnosis function itself, which awaits the
    whole flow in-line and answers within its own call — return investigation.assessment;'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: false
  how: 'no named file holds this fact now: src/investigation/run-diagnosis.ts read `nowhere` — const {
    evidence, evaluations, assessment, cost, durations } = await runInvestigationPipeline(options);'
  observed_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at persistenceStageBoundMs, which clamps the persistence
    stage to the smaller of its nominal budget and what remains of the propagated deadline — return Math.min(PERSISTENCE_STAGE_BUDGET_MS,
    Math.max(0, deadline - now - elapsedBeforePersistenceMs));'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at the import list, lines 1-13 — import { collectionPlan,
    requiresEvaluationOf } from ''../case/case-resolution.js'';

    import type { Case } from ''../case/case.js'';

    import { InvestigationNotBuildableError } from ''../errors/investigation-not-buildable.error.js'';

    import { SubjectAttributeNotInGlossaryError } from ''../errors/subject-attribute-not-in-glossary.error.js'';

    import type { IGlossaryQuery } from ''../glossary/glossary-query.port.js'';


    src/investigation/investigation.ts: held at the import list, lines 1-6 — import type { Assessment
    } from ''./assessment.js'';

    import type { Cost } from ''./cost.js'';

    import type { Durations } from ''./durations.js'';

    import type { Evaluation } from ''./evaluation.js'';

    import type { Evidence } from ''./evidence.js'';

    import type { Subject } from ''./subject.js'';

    '
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
- node: constraints/the-stored-schema-mirrors-the-declared-model
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at the INSERT/SELECT column
    lists, e.g. INVESTIGATION_INSERT_TEXT and investigationSelect() — assessment_usage_input_tokens, assessment_usage_output_tokens,
    assessment_elapsed_ms, assessment_prompt, cost_calls, cost_input_tokens, cost_output_tokens, durations_collection,
    durations_judgment, durations_writing, durations_total'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at write() and read(), both
    routed through runInTransaction(this.connection, ...) — await runInTransaction(this.connection, raiseWriteFailure,
    (tx) => writeWholeInvestigation(tx, investigation));'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: contracts/investigation/case-source
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at options.case forwarded unchanged into the built investigation''s
    options — case: options.case,'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at runDiagnosis''s own signature and return, the synchronous
    entry taking the call''s inputs and answering with the assessment — export async function runDiagnosis(options:
    RunDiagnosisOptions): Promise<Assessment> {'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/glossary-source
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at refuseAttributesNotInGlossary(), line 66 —
    const resolution = await glossary.readVocabularyTerm(''subject-attribute'', name);'
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: domain/glossary/subject-attribute
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at the glossary lookup in refuseAttributesNotInGlossary(),
    line 66 — await glossary.readVocabularyTerm(''subject-attribute'', name)'
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: domain/investigation/assessment
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at assessmentParams() and assessmentOf()
    — assessment.determining_hypothesis ?? null, assessment.text, assessment.register, assessment.usage.input_tokens,
    assessment.usage.output_tokens, assessment.elapsed_ms, assessment.prompt,'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/citation
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at citationStatement() and
    citationOf() — return { concept: row.concept, ...(row.field !== null ? { field: row.field } : {})
    };'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/cost
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at destructured from the pipeline result and passed straight
    through, never recomputed here — const { evidence, evaluations, assessment, cost, durations } = await
    runInvestigationPipeline(options);

    src/persistence/relational-investigation-store.repository.ts: held at costParams() and the cost object
    assembled in investigationOf() — return [cost.calls, cost.input_tokens, cost.output_tokens];'
  encoded_at:
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/durations
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at destructured from the pipeline result and passed straight
    through, never recomputed here — const { evidence, evaluations, assessment, cost, durations } = await
    runInvestigationPipeline(options);

    src/persistence/relational-investigation-store.repository.ts: held at durationsParams() and the durations
    object assembled in investigationOf() — ...(row.durations_writing !== null ? { writing: row.durations_writing
    } : {}),'
  encoded_at:
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at evaluationStatement(), evaluationOf()
    and callRecordOf() — if (verdict === ''confirmed'') { return { hypothesis: row.hypothesis, verdict,
    citations: nonEmptyCitations(citations, row.hypothesis), ...callRecord }; }'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at reasonOf() and isEvaluationReason()\
    \ — function isEvaluationReason(value: string): value is EvaluationReason {\n  return EVALUATION_REASON_VALUES.has(value);\n\
    }\n"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at evidenceStatement() and
    evidenceOf() — concept: row.concept, inputs: row.inputs, observation: row.observation, observed_at:
    row.observed_at.toISOString(), ttl: row.ttl, origin: row.origin,'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at resultOf() and isEvidenceResult()\
    \ — function isEvidenceResult(value: string): value is EvidenceResult {\n  return EVIDENCE_RESULT_VALUES.has(value);\n\
    }\n"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/field-semantics
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at the fields column, written
    and read as one JSON blob per evidence item — JSON.stringify(evidence.fields), ... fields: row.fields,'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/investigation
  conforms: false
  how: 'src/investigation/investigation.ts, line 29, the `written_at` field of the `Investigation` type:
    readonly written_at?: string; — the domain model declares written_at required on the aggregate — the
    field the store''s own settle instant fills — but the TypeScript type lets any caller construct or
    hold an Investigation value missing it; a factory or store path can carry an instance the specification
    treats as an incomplete record, and the compiler gives no signal that the record''s dating fact is
    absent'
  observed_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at the buildSubject() call, line 42, and its
    use in refuseAttributesNotInGlossary() — const subject = buildSubject(subjectType, subjectAttributes);

    src/persistence/relational-investigation-store.repository.ts: held at identityParams() on write and
    the subject object built in investigationOf() on read — subject: { type: row.subject_type, attributes
    },'
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at the attribute-name extraction in refuseAttributesNotInGlossary(),
    line 65 — for (const name of new Set(subject.attributes.map((pair) => pair.attribute))) {

    src/persistence/relational-investigation-store.repository.ts: held at subjectAttributeValueStatement()
    and readSubjectAttributeValues() — text: `INSERT INTO ${INVESTIGATION_SUBJECT_ATTRIBUTE_VALUES_TABLE}
    (investigation_id, attribute, value) VALUES ($1, $2, $3)`,'
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/usage
  conforms: true
  how: 'src/persistence/relational-investigation-store.repository.ts: held at callRecordOf() for an evaluation''s
    usage and assessmentParams()/assessmentOf() for the assessment''s usage — record.usage = { input_tokens:
    row.input_tokens, output_tokens: row.output_tokens };'
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/verdict
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at verdictOf() and isVerdict()\
    \ — function isVerdict(value: string): value is Verdict {\n  return VERDICT_VALUES.has(value);\n}\n"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/knowledge/consolidation-register
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at registerOf() and isConsolidationRegister()\
    \ — function isConsolidationRegister(value: string): value is ConsolidationRegister {\n  return CONSOLIDATION_REGISTER_VALUES.has(value);\n\
    }\n"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  conforms: true
  how: "src/investigation/investigation-factory.ts: held at refuseAttributesNotInGlossary(), lines 63-74\
    \ — if (!resolution.held) {\n    missing.push(name);\n  }\n}\nif (missing.length > 0) {\n  throw new\
    \ SubjectAttributeNotInGlossaryError(subject.type, missing);\n}\n"
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  conforms: true
  how: 'src/investigation/investigation-factory.ts: held at nowhere in this file directly; subject construction
    is delegated to buildSubject(), called at line 42, whose body sits outside this file — const subject
    = buildSubject(subjectType, subjectAttributes);'
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at the PERSISTENCE_STAGE_BUDGET_MS constant and persistenceStageBoundMs
    implementing persistence''s two-second share of the twenty-second total — const PERSISTENCE_STAGE_BUDGET_MS
    = 2_000;'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/an-empty-ticket-reference-is-no-ticket-reference
  conforms: true
  how: "src/persistence/relational-investigation-store.repository.ts: held at ticketRefForWrite()/holdsNoTicketReference()\
    \ on write, the ticket_ref spread in investigationOf() on read — function holdsNoTicketReference(value:\
    \ string | undefined): boolean {\n  return value === undefined || value === '';\n}\n"
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at raceWriteAttempt''s treatment of InvestigationAlreadyStoredError
    as a settled write — (error: unknown): WriteAttemptOutcome => (error instanceof InvestigationAlreadyStoredError
    ? ''settled'' : ''failed''),

    src/persistence/relational-investigation-store.repository.ts: held at raiseRootInsertFailure()/isUniqueViolation(),
    guarding the root INSERT — return (cause) => (isUniqueViolation(cause) ? new InvestigationAlreadyStoredError(id)
    : raiseWriteFailure(cause));'
  encoded_at:
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: 'src/investigation/run-diagnosis.ts: held at writeWithinDeadline and persistWithinBound: the zero-bound
    short-circuit, the single shared timeout raced across both attempts, and the throw when neither settles
    — const settled = stageBoundMs > 0 && (await persistWithinBound(store, investigation, stageBoundMs));'
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: "src/investigation/investigation-factory.ts: held at evaluationTotalityViolations(), lines 115-134,\
    \ invoked from refuseTotalityViolations() at line 87 — for (const name of required) {\n  const count\
    \ = counts.get(name) ?? 0;\n  if (count === 0) {\n    violations.push(`the required hypothesis \"\
    ${name}\" has no matching evaluation`);\n  } else if (count > 1) {\n    violations.push(`the required\
    \ hypothesis \"${name}\" has ${count} evaluations; exactly one is required`);\n  }\n}\n"
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: true
  how: "src/investigation/investigation-factory.ts: held at evidenceTotalityViolations(), lines 94-113,\
    \ invoked from refuseTotalityViolations() at line 86 — for (const concept of plan) {\n  const count\
    \ = counts.get(concept) ?? 0;\n  if (count === 0) {\n    violations.push(`the collection plan's concept\
    \ \"${concept}\" has no matching evidence`);\n  } else if (count > 1) {\n    violations.push(`the\
    \ collection plan's concept \"${concept}\" has ${count} evidence entries; exactly one is required`);\n\
    \  }\n}\n"
  encoded_at:
  - src/investigation/investigation-factory.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: "src/investigation/investigation-factory.ts: held at pinnedCaseOf(), lines 76-78, and the model/prompt_version/evidence\
    \ fields of the returned object, lines 52-54 — function pinnedCaseOf(theCase: Case): PinnedCase {\n\
    \  return { slug: theCase.slug, version: theCase.version };\n}\n\nsrc/investigation/investigation.ts:\
    \ held at the `pinned_case`, `model`, `prompt_version` and `evidence` fields, lines 20-23 — readonly\
    \ pinned_case: PinnedCase;\n  readonly prompt_version: string;\n  readonly model: string;\n  readonly\
    \ evidence: readonly Evidence[];\n\nsrc/investigation/run-diagnosis.ts: held at case, model, prompt_version\
    \ and evidence forwarded unchanged into buildInvestigationOptions — case: options.case,\n  prompt_version:\
    \ options.prompt_version,\n  model: options.model,\n  evidence,\n"
  encoded_at:
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/the-response-follows-the-record
  conforms: true
  how: "src/investigation/run-diagnosis.ts: held at the write awaited before the return statement in runDiagnosis\
    \ — await writeWithinDeadline({\n    store: options.store,\n    investigation,\n    now: options.now,\n\
    \    deadline: options.deadline,\n    elapsedBeforePersistenceMs,\n  });\n  return investigation.assessment;\n"
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/written-at-records-when-the-write-settled
  conforms: false
  how: 'the fact left part of its ground: still held in migrations/0018-investigations-written-at-default.sql,
    src/investigation/investigation-factory.ts, src/investigation/investigation.ts, src/persistence/relational-investigation-store.repository.ts,
    and src/investigation/run-diagnosis.ts read `nowhere` — const first = await raceWriteAttempt(store.write(investigation),
    timeout.promise); — a binding asserts the file answers for the node, so the pair that stopped holding
    it is released by `--bind ... --replace`, never restamped here'
  observed_at:
  - migrations/0018-investigations-written-at-default.sql
  - src/investigation/investigation-factory.ts
  - src/investigation/investigation.ts
  - src/investigation/run-diagnosis.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: scenarios/investigation/no-response-without-a-record
  conforms: true
  how: "src/investigation/run-diagnosis.ts: held at the throw on an unsettled write, which prevents the\
    \ return statement from ever running — if (!settled) {\n    throw new InvestigationWriteDeadlineExceededError(investigation.id,\
    \ stageBoundMs);\n  }\n"
  encoded_at:
  - src/investigation/run-diagnosis.ts
unstated:
- file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
  where: line 220, the closing assertion of the round-trip test
  evidence: expect(answered?.hash).toBe(createHash('sha256').update(JSON.stringify(document), 'utf8').digest('hex'));
  cost: The test asserts that RelationalInvestigationStore.read() answers a `hash` alongside `document`,
    computed as the SHA-256 hex digest of the read-back document's own JSON.stringify with utf8 encoding
    — an algorithm, an encoding and an input (the read document, not the write payload) fixed nowhere
    in the specification. domain/investigation/investigation's attribute list stops at written_at and
    declares no hash; no contract, rule or scenario names such a field anywhere in the specification.
    A reader auditing what the store's read answers has no page saying this integrity value exists, why
    it is computed this way, or what depends on it, and a change to the document's serialization or to
    the hashing scheme could break this test silently, with nothing in the specification for anyone to
    check the change against.
unbound:
- src/__tests__/integration/factories/store-wiring.spec.ts
- src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
- src/__tests__/unit/investigation/investigation-factory.spec.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/persistence/relational-investigation-store.repository.spec.ts
notes: 'Judged by 10 delegation(s), one per file; folded mechanically by trace.py --fold from the returns
  under siegard-reconcile/run-diagnosis-written-at-settle-instant.returns/.

  Staged by a review over files a delivery wrote: no pair was omitted, so the delivery''s own claims and
  every other binding of these files were judged alike; the plan''s node(s) rules/investigation/written-at-records-when-the-write-settled
  were read on every file and answered for, and bound from nowhere here — a binding this record writes
  is one the trace already held.

  Candidates: 13 opened across 2 of 10 delegation(s); each return lists its own under `candidates_opened`.

  Unstated: 1 fact(s) the source states that no node holds, over 1 file(s), listed under `unstated`. They
  block no binding here and no rebind closes them — the route is the analysis that gives each fact a node.'
---

## Folded
This record was folded by `trace.py --fold` from the delegation returns under `siegard-reconcile/run-diagnosis-written-at-settle-instant.returns/`, which are the evidence behind every entry above.
