---
title: Consolidation call-record chain carries register, usage, elapsed_ms and prompt to the assessment
summary: The consolidation port's answer now states the register it used, and draftAssessment/investigation-pipeline/relational-investigation-store
  carry that register together with usage, elapsed_ms and prompt onto every returned and persisted Assessment
  instead of dropping them before the assessment is built or stored.
task: sha256:428581e23801967de724e161abe0c517d250c627f4adcd5f21876e59599b0c96
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/consolidation-call-record-chain-hotfix-register-usage-elapsed-ms-and-prompt-reach-the-assessment-build-5
files:
- path: src/investigation/assessment.ts
  effect: Assessment now declares register (ConsolidationRegister), usage (Usage), elapsed_ms (number)
    and prompt (string) as required attributes, beside the existing outcome, referral, determining_hypothesis
    and text.
- path: src/investigation/assessment-consolidator.port.ts
  effect: ConsolidationOutcome now declares a required register field beside text, usage, elapsed_ms and
    prompt, so IAssessmentConsolidator.consolidate()'s answer states the register the call used.
- path: src/investigation/draft-assessment-text.ts
  effect: draftAssessment() reads the whole consolidate() answer (outcome) instead of only its text, and
    builds the returned Assessment with register, usage, elapsed_ms and prompt copied straight from that
    answer, alongside outcome/referral/text as before.
- path: src/investigation/investigation-pipeline.ts
  effect: runInvestigationPipeline() no longer wraps the consolidator in a capturing shim to recover usage/elapsed_ms/prompt;
    it now reads assessment.usage, assessment.elapsed_ms and assessment.prompt directly off the Assessment
    draftAssessment() returned, and feeds those into cost, durations and prompts.writing.
- path: src/investigation/fake-assessment-consolidator.adapter.ts
  effect: FakeAssessmentConsolidator.consolidate() now answers with register set to the exact consolidationRegister
    it was called with.
- path: src/investigation/anthropic-assessment-consolidator.adapter.ts
  effect: AnthropicAssessmentConsolidator.consolidate() now answers with register set to the exact consolidationRegister
    it was called with.
- path: src/persistence/relational-investigation-store.repository.ts
  effect: IInvestigationRow gains assessment_register/assessment_usage_input_tokens/assessment_usage_output_tokens/assessment_elapsed_ms/assessment_prompt;
    the INSERT statement, assessmentParams(), the SELECT and a new assessmentOf()/registerOf()/isConsolidationRegister()
    guard write and read all four values so a round trip preserves them.
- path: migrations/0014-assessment-consolidation-call-record.sql
  effect: New additive migration adding investigations.assessment_register (TEXT NOT NULL DEFAULT 'plain',
    CHECK IN ('formal','plain')), assessment_usage_input_tokens/assessment_usage_output_tokens/assessment_elapsed_ms
    (INTEGER NOT NULL DEFAULT 0) and assessment_prompt (TEXT NOT NULL DEFAULT '').
- path: src/http/diagnose.controller.ts
  effect: Adds an exported toDiagnoseResponse(assessment) helper that picks outcome, referral, text and
    (when present) determining_hypothesis off an Assessment, mirroring the project's own toReadCaseResponse
    convention in read-case.controller.ts. handleDiagnoseRequest now awaits runDiagnose into a local
    assessment variable and returns toDiagnoseResponse(assessment) instead of returning the runDiagnose
    promise directly typed as DiagnoseResponseDto by assertion alone -- a fix-forward closing a suite
    failure a diagnostician classed as a code cause -- the widened Assessment was reaching the HTTP wire
    unfiltered, contradicting this task's own deferred decision to leave the transport contract at four
    fields.
criteria:
- criterion: Every Assessment an investigation-pipeline run returns carries all eight attributes domain/investigation/assessment
    declares, never only outcome, referral, determining_hypothesis and text.
  met: true
  how: assessment.ts requires register, usage, elapsed_ms and prompt beside the original four; draftAssessment()
    fills all eight from resolved.* and the consolidate() call's own outcome, and runInvestigationPipeline()
    returns that same Assessment unchanged.
- criterion: assessment-consolidator.port.ts's consolidate() operation answers with the register it actually
    used to produce the text, in addition to the usage, elapsed_ms and prompt it already answers with
    — the same call-record shape those three already have.
  met: true
  how: ConsolidationOutcome now declares a required register field of type ConsolidationRegister beside
    text, usage, elapsed_ms and prompt; both FakeAssessmentConsolidator and AnthropicAssessmentConsolidator
    populate it on every answer.
- criterion: The register on a returned Assessment equals exactly the register the consolidate() call
    answered with — never a value assumed by the caller in advance, and never a value different from what
    the call actually used.
  met: true
  how: draftAssessment() assigns register from the consolidate() call's own returned outcome.register
    — never from the consolidationRegister value it passed in as an argument.
- criterion: The register and usage values carried onto the assessment are exactly the domain/knowledge/consolidation-register
    enumeration value and domain/investigation/usage integers the consolidate() call answered with — never
    a wider or looser type standing in for either.
  met: true
  how: Assessment.register and ConsolidationOutcome.register are both typed ConsolidationRegister; Assessment.usage
    and ConsolidationOutcome.usage are both typed Usage. Persisted columns are INTEGER/CHECK-restricted
    TEXT, validated back through registerOf() on read.
- criterion: The prompt on a returned Assessment is the consolidation prompt as the writing call actually
    materialized it, and is never carried on a field of the pipeline's own result object instead of on
    the assessment.
  met: true
  how: draftAssessment() sets Assessment.prompt from outcome.prompt. InvestigationPipelinePrompts.writing
    is now sourced from assessment.prompt rather than from a separately captured outcome.
- criterion: A stored and re-read Assessment carries the same register, usage (input_tokens and output_tokens),
    elapsed_ms and prompt values the write recorded — none of the four is dropped or altered by a persistence
    round trip.
  met: true
  how: assessmentParams() and INVESTIGATION_INSERT_TEXT write all four into five new investigations columns;
    assessmentOf() and registerOf() reassemble the identical values on read.
nodes:
- node: domain/investigation/assessment
  encoded_at:
  - src/investigation/assessment.ts
  - src/investigation/draft-assessment-text.ts
  - src/persistence/relational-investigation-store.repository.ts
  - migrations/0014-assessment-consolidation-call-record.sql
  how: assessment.ts's Assessment type now carries all eight declared attributes as required (except the
    always-optional determining_hypothesis); draft-assessment-text.ts populates register/usage/elapsed_ms/prompt
    from the writing call's own answer; the repository and its migration give the four new attributes
    a persisted, round-trippable home.
- node: domain/investigation/assessment-consolidator
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  how: ConsolidationOutcome now states register beside text, usage, elapsed_ms and prompt, matching the
    node's own Responsibility; both adapters answer with the register they were actually called with.
- node: domain/knowledge/consolidation-register
  encoded_at:
  - src/investigation/assessment.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/persistence/relational-investigation-store.repository.ts
  - migrations/0014-assessment-consolidation-call-record.sql
  how: Assessment.register and ConsolidationOutcome.register both reuse the existing ConsolidationRegister
    type; the new column is CHECK-restricted to the same two values and read back through registerOf()/isConsolidationRegister().
- node: domain/investigation/usage
  encoded_at:
  - src/investigation/assessment.ts
  - src/investigation/assessment-consolidator.port.ts
  - src/persistence/relational-investigation-store.repository.ts
  - migrations/0014-assessment-consolidation-call-record.sql
  how: Assessment.usage and ConsolidationOutcome.usage both reuse the existing Usage value object; the
    repository flattens it into two columns and reassembles it on read.
- node: rules/investigation/the-consolidation-answer-states-its-register
  encoded_at:
  - src/investigation/assessment-consolidator.port.ts
  - src/investigation/draft-assessment-text.ts
  - src/investigation/fake-assessment-consolidator.adapter.ts
  - src/investigation/anthropic-assessment-consolidator.adapter.ts
  how: the register now rides the same ConsolidationOutcome answer as the text, usage, elapsed_ms and
    prompt; draftAssessment() reads register from that one answer rather than from the register it handed
    in, so the invariant holds structurally rather than by the caller's own assumption.
inferences:
- inferred: migrations/0014-assessment-consolidation-call-record.sql backfills every already-stored investigations
    row with assessment_register DEFAULT 'plain', assessment_usage_input_tokens/assessment_usage_output_tokens/assessment_elapsed_ms
    DEFAULT 0 and assessment_prompt DEFAULT '', and keeps each DEFAULT on the column permanently.
  from: the identical DEFAULT-plus-permanent-backfill pattern migrations 0011 and 0013 already establish
    for a required attribute a pre-existing row never recorded; a specific backfill value for register
    carries no domain meaning either way, so 'plain' is a technical migration choice.
- inferred: the five new columns are named assessment_register, assessment_usage_input_tokens, assessment_usage_output_tokens,
    assessment_elapsed_ms and assessment_prompt, placed directly after assessment_text, with a registerOf()/isConsolidationRegister()
    guard validating the stored register on read.
  from: the assessment_* flattening convention this repository already establishes for Assessment's other
    attributes, and the resultOf()/verdictOf()/reasonOf() enum-guard pattern already in this same file.
- inferred: the new migration file is named 0014-assessment-consolidation-call-record.sql.
  from: the sequential NNNN-<slug>.sql numbering the migrations/ directory already follows (highest existing
    file was 0013).
- inferred: assessment.elapsed_ms is stored in its own new column rather than derived from the pre-existing
    durations_writing column at read time.
  from: domain/investigation/assessment.md and domain/investigation/durations.md describe two independent
    value objects, each stating its own call-record fact; durations.writing is documented as conditionally
    present while assessment.elapsed_ms is required, so the two cannot safely share one column.
- inferred: the HTTP response narrowing (toDiagnoseResponse) was implemented as an exported helper inside
    diagnose.controller.ts, called from handleDiagnoseRequest's own return, rather than as a schema-parse
    call at the route boundary.
  from: the project's own established controller convention already present in read-case.controller.ts
    (toReadCaseResponse(theCase), called from handleReadCaseRequest's own return) -- reused rather than
    introducing a second narrowing pattern the codebase does not otherwise use for this purpose.
preserved:
- IAssessmentConsolidator.consolidate()'s existing three-parameter call signature (evaluations, evidence,
  consolidationRegister) is unchanged, so every existing caller and factory wiring it keeps compiling.
- InvestigationPipelineResult.prompts.writing keeps its existing field name and string type; only where
  its value comes from changed.
- handleSimulateCaseRequest's response shape is untouched, so the simulate endpoint's existing 'no prompts
  field' contract still holds.
- costOf()'s and durationsOf()'s arithmetic kept their exact prior shape; only their consolidation-derived
  input changed from a captured value to assessment.usage/assessment.elapsed_ms.
- every other investigations-adjacent table and every other investigations column are untouched; the migration
  is additive only.
deferred:
- what: diagnose.dto.ts's diagnoseResponseSchema/DiagnoseResponseDto still declares only the four legacy
    Assessment fields. The /v1/diagnose route now narrows to exactly that shape via toDiagnoseResponse()
    (a fix-forward closing a suite failure this task's own widening caused), so the wire contract stays
    at four fields as this task's own scope leaves it -- but simulate-case.dto.ts's assessmentSchema was
    never widened either, and handleSimulateCaseRequest's response was not audited for the same leak this
    fix closed on the diagnose route; whether it has the same gap is unconfirmed.
  why: no criterion of this task names the HTTP response contract, and the task's own implements list
    stops at the pipeline/port/persistence chain; widening either DTO, or auditing the simulate-case route
    for the same leak, reaches past that into a decision that belongs to whichever task owns the transport
    contract.
---

## What it is

The corrective fix carrying the consolidation call's own register, usage, elapsed_ms and prompt
through draft-assessment-text.ts and investigation-pipeline.ts to the returned Assessment, and
through relational-investigation-store.repository.ts (plus a new additive migration) to the
persisted and read-back record.

## Notes

A red build was hit twice during delivery, both confined to pre-existing test files (not this
record's own files) breaking against the widened Assessment/ConsolidationOutcome types: once at
typecheck (~16 fixtures needing the four new fields, plus one file's own DiagnoseResponseDto/Assessment
type mismatch at the HTTP boundary), once at lint (three fixtures growing past max-lines-per-function).
Both were fixed by the test-author as part of writing this task's proof, following an established
precedent in this same project (delivery/case-simulation-backend/proof/investigation-telemetry/diagnose-reports-real-cost-and-durations.md),
since the task-implementer never touches test files. See the proof record for the full list of
fixtures touched and why.
Deferred: the HTTP response DTOs (diagnose.dto.ts, simulate-case.dto.ts) were not widened to declare
the four new Assessment fields, even though the real /v1/diagnose response already carries them
unfiltered at runtime (no Fastify response schema is attached to that route). No criterion or node
this task implements governs the HTTP transport contract; deciding whether the DTO should be widened
is a person's, not this task's.
