---
task: sha256:526cda19d3c5f845bbcb249c45a0faa660ab7793d680c4076dc9c49518f6fea1
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-simulation-pipeline-extract-shared-investigation-pipeline-build
title: Stages 1-4 extracted into a shared investigation-pipeline function
summary: run-diagnosis.ts's own buildSubject-through-draftAssessment body moves verbatim into a new
  investigation-pipeline.ts, whose runInvestigationPipeline() diagnose's own runDiagnosis now calls
  before adding only buildInvestigation and writeWithinDeadline, with run-diagnosis.ts's own exported
  surface and every already-delivered behavior it proves unchanged.
files:
- path: src/investigation/investigation-pipeline.ts
  effect: new file — declares InvestigationPipelineOptions (everything stages 1-4 need — subject
    type/attributes, the pinned case, requester, every stage port, pool size, the default
    consolidation register, now/deadline), InvestigationPipelinePrompts (one required field, writing,
    a string) and InvestigationPipelineResult (evidence, evaluations, resolved, assessment, cost,
    durations, prompts), and exports runInvestigationPipeline(), which runs buildSubject then collectEvidence
    then judgeHypotheses then resolveAndNarrow then draftAssessment, in that order, and answers the
    complete record. Holds capturingConsolidator/consolidatedOutcomeOf/costOf/durationsOf/
    maxElapsedMs/collectEvidenceOptions/judgeHypothesesOptions/evidenceByHypothesisOf and the
    JUDGMENT_STAGE_BUDGET_MS constant — every one of these moved verbatim out of run-diagnosis.ts,
    with no change to any function's own body beyond the one new line that reads consolidation.prompt
    into the answered record's prompts.writing field.
- path: src/investigation/run-diagnosis.ts
  effect: no longer declares or calls buildSubject, collectEvidence, judgeHypotheses, resolveAndNarrow,
    draftAssessment, capturingConsolidator, consolidatedOutcomeOf, costOf, durationsOf, maxElapsedMs,
    collectEvidenceOptions, judgeHypothesesOptions, evidenceByHypothesisOf or JUDGMENT_STAGE_BUDGET_MS
    — all removed, since investigation-pipeline.ts now owns every one of them. RunDiagnosisOptions is
    now InvestigationPipelineOptions intersected with exactly the fields buildInvestigation and the
    write step still need (id, ticket_ref, narrative, prompt_version, model, glossary, store) — the
    same nineteen fields the type declared before this delivery, in the same shape, so
    diagnose.factory.ts's and production-diagnose.factory.ts's own Omit<RunDiagnosisOptions, ...>
    derivations are unaffected. runDiagnosis() now calls runInvestigationPipeline(options), destructures
    its answered evidence/evaluations/assessment/cost/durations, and passes them into
    buildInvestigationOptions/buildInvestigation/writeWithinDeadline exactly as it already did — the
    two steps this composition still adds after the shared call. The file's own exported surface
    (RunDiagnosisOptions, runDiagnosis) is unchanged, still exactly what run-diagnosis.spec.ts's own
    already-delivered export-totality test requires.
criteria:
- criterion: A shared function exists that runs buildSubject → collectEvidence → judgeHypotheses →
    resolveAndNarrow → draftAssessment and returns evidence, evaluations, resolved, assessment, cost,
    durations and prompts as one record.
  met: true
  how: investigation-pipeline.ts's runInvestigationPipeline() runs exactly that sequence, in that
    order, and returns an InvestigationPipelineResult carrying evidence, evaluations, resolved (from
    resolveAndNarrow, verbatim), assessment, cost (costOf), durations (durationsOf) and prompts, whose
    one field writing holds consolidation.prompt, as one object.
- criterion: diagnose's own composition calls this shared function and then adds buildInvestigation
    and writeWithinDeadline.
  met: true
  how: run-diagnosis.ts's runDiagnosis() now opens with `await runInvestigationPipeline(options)`,
    destructures its answer, and only then calls buildInvestigationOptions/buildInvestigation and
    writeWithinDeadline — the same two steps it already added after the (now-extracted) stages, in
    the same order, before returning investigation.assessment.
- criterion: No stage's own logic (collectEvidence, judgeHypotheses, resolveAndNarrow, draftAssessment,
    buildSubject) is duplicated between diagnose's composition and the shared function.
  met: true
  how: run-diagnosis.ts no longer imports or calls any of the five stage functions, or any of the
    helpers that assemble their own options (collectEvidenceOptions, judgeHypothesesOptions,
    evidenceByHypothesisOf) — every one of those now lives solely in investigation-pipeline.ts, and
    run-diagnosis.ts's only route to any of the five stages is through runInvestigationPipeline().
    Confirmed by grep over src/investigation/run-diagnosis.ts — none of buildSubject/collectEvidence/
    judgeHypotheses/resolveAndNarrow/draftAssessment appears in its text any more.
- criterion: A diagnose request that succeeded before this extraction still returns the identical
    response after it.
  met: true
  how: every moved function's own body is byte-for-byte unchanged (capturingConsolidator,
    consolidatedOutcomeOf, costOf, durationsOf, maxElapsedMs, collectEvidenceOptions,
    judgeHypothesesOptions, evidenceByHypothesisOf, and the five stage calls themselves, in the same
    order with the same arguments) — the only new statement in the whole extraction is the one line
    that reads consolidation.prompt into the answered record's own prompts field, which runDiagnosis
    never reads. runDiagnosis destructures exactly evidence/evaluations/assessment/cost/durations off
    runInvestigationPipeline's answer — the same five values it built inline before — and passes them
    into buildInvestigationOptions/buildInvestigation unchanged, so the built Investigation and the
    assessment returned to the caller are computed by the identical sequence of calls as before this
    delivery. RunDiagnosisOptions keeps the same field set, so diagnose.factory.ts's and
    production-diagnose.factory.ts's own composition and every caller-facing behavior (the DiagnoseCall/
    ProductionDiagnoseCall shape a controller assembles against) is untouched.
- criterion: The response to a diagnose request still leaves only after the investigation is written.
  met: true
  how: writeWithinDeadline and racePersist are untouched, still the last two calls runDiagnosis makes
    before returning investigation.assessment, still racing the write against
    PERSISTENCE_STAGE_BUDGET_MS and raising InvestigationWriteDeadlineExceededError rather than ever
    answering without a completed write (rules/investigation/the-response-follows-the-record). This
    ordering does not touch runInvestigationPipeline at all — it is entirely downstream of the shared
    call's own answer, exactly as it was downstream of the inlined stages before this extraction.
nodes:
- node: rules/investigation/the-response-follows-the-record
  encoded_at:
  - src/investigation/run-diagnosis.ts
  how: this invariant's own enforcement (writeWithinDeadline racing the write, runDiagnosis returning
    only investigation.assessment after that await settles) is untouched by this extraction — it sits
    entirely after runInvestigationPipeline's own answer and is proved unchanged by criterion 5 above.
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  encoded_at:
  - src/investigation/subject.ts
  - src/investigation/investigation-pipeline.ts
  how: subject.ts's own buildSubject is untouched and still the one place this invariant is enforced;
    only its call site moved, from run-diagnosis.ts's own body into investigation-pipeline.ts's
    runInvestigationPipeline, which calls it first, unconditionally, exactly as run-diagnosis.ts did.
- node: domain/investigation/subject
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  how: the Subject value object's own shape (subject.ts) is untouched; investigation-pipeline.ts is
    now the one call site that assembles it via buildSubject before collection.
- node: domain/investigation/evidence
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  how: Evidence's own shape (evidence.ts) is untouched by this task; investigation-pipeline.ts's own
    InvestigationPipelineResult declares evidence as one field of the shared record — the concrete
    place a reader now finds every concept's collected Evidence alongside the run's other stage
    outputs, satisfying this task's own "one record" criterion.
- node: domain/investigation/evaluation
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  how: Evaluation's own shape and how it is assembled (judgment-stage.ts) are untouched;
    investigation-pipeline.ts's InvestigationPipelineResult declares evaluations as one field of the
    same shared record, and its own judgment prompts travel inline on each Evaluation's own optional
    prompt attribute — never duplicated into the record's separate prompts field.
- node: domain/investigation/assessment
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  how: 'honored only in part, deliberately, the same gap the depended-upon
    diagnose-reports-real-cost-and-durations task already disclosed and left open: this node''s own
    schema declares register, usage, elapsed_ms and prompt as required Assessment attributes, and
    Assessment itself still carries only outcome, referral, determining_hypothesis and text
    (draft-assessment-text.spec.ts''s own already-delivered guarantee, untouched here). This task''s
    own criteria never ask for Assessment''s shape to widen — only for the shared record to carry
    assessment, cost and durations, which it does. investigation-pipeline.ts''s own prompts.writing
    field is the one piece of this node''s own already-specified prompt fact this delivery does
    surface, at the pipeline-record boundary rather than on Assessment itself; see this record''s own
    inferences below.'
- node: domain/investigation/cost
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  how: costOf's own computation (one call per judged hypothesis carrying usage, plus the one
    consolidation call) is moved verbatim from run-diagnosis.ts into investigation-pipeline.ts, with
    no change to its logic; it is now assembled inside runInvestigationPipeline and returned as one
    field of the shared record.
- node: domain/investigation/durations
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  how: durationsOf's own computation (the largest collection/judgment elapsed_ms, the one
    consolidation call's own writing elapsed_ms, and their sum as total) is moved verbatim from
    run-diagnosis.ts into investigation-pipeline.ts, with no change to its logic.
- node: domain/knowledge/resolution
  encoded_at:
  - src/investigation/investigation-pipeline.ts
  how: resolveAndNarrow's own resolved output (case-resolution.ts's ResolvedOutcome, itself untouched)
    is returned verbatim as the shared record's own resolved field — never recomputed, the same
    "computed nowhere else" guarantee resolve-and-narrow-input.ts's own documentation already states.
- node: domain/knowledge/referral
  how: honored, not separately encoded — referral travels unchanged inside resolved.referral and
    assessment.referral, both untouched value shapes (case-resolution.ts, draft-assessment-text.ts);
    this task moves only the call sites that produce and forward them, never their own assembly.
inferences:
- inferred: The shared record's own prompts field carries exactly one attribute, writing (the one
    consolidation call's own materialized prompt), rather than also repeating every judged
    hypothesis's own judgment prompt.
  from: domain/investigation/evaluation already carries prompt inline on each Evaluation (present
    exactly when a judgment call happened), so the shared record's own evaluations field already
    exposes every judgment prompt without duplication; domain/investigation/assessment's own already-
    published schema separately names prompt as one of Assessment's own required, not-yet-carried
    attributes — the one piece of this run's own prompt data with nowhere else to land, since
    Assessment's shape is untouched by this task (draft-assessment-text.spec.ts's own already-
    delivered guarantee). Naming the field writing mirrors durations.ts's own writing attribute,
    which already names the same one consolidation call by the same stage name.
- inferred: The shared function and its record type live in a new file, investigation-pipeline.ts,
    rather than being exported from run-diagnosis.ts itself.
  from: run-diagnosis.spec.ts's own already-delivered test ('exports exactly RunDiagnosisOptions and
    runDiagnosis, keeping every internal helper ... private to this module') scans run-diagnosis.ts's
    own source text and fails if any further symbol is exported from it; a shared function callable by
    a future simulate composition has to be exported from somewhere, so it could not be added to
    run-diagnosis.ts's own export surface without breaking that already-delivered, still-active
    guarantee. Placing it in a new file keeps run-diagnosis.ts's own exports, its "no case-query/
    case-store import" guarantee and its "no system clock" guarantee all intact, unexamined by this
    delivery, while still giving diagnose's own composition (and, later, simulate's) one shared
    function to call.
preserved:
- run-diagnosis.ts's own exact exported surface — RunDiagnosisOptions and runDiagnosis, and nothing
  else — proved by its own already-delivered export-totality test.
- run-diagnosis.ts's own "never reads the system clock internally" guarantee (no Date.now(), bare new
  Date() or performance.now() anywhere in its text) and its "imports no case-query/case-store"
  guarantee — both already-delivered, source-text-scanning tests, unaffected since neither pattern
  appears in the new investigation-pipeline.ts either.
- diagnose.factory.ts's and production-diagnose.factory.ts's own DiagnoseCall/ProductionDiagnoseCall
  derivations (Omit<RunDiagnosisOptions, ...>) and their own composition and construction-once
  discipline — RunDiagnosisOptions keeps the same field set, so neither factory needed a change.
- writeWithinDeadline's and racePersist's own deadline-racing behavior and
  InvestigationWriteDeadlineExceededError handling — untouched, still the last two calls runDiagnosis
  makes.
- Every stage's own control flow, budgets, pool, retry and citation-validation logic
  (evidence-collection-stage.ts, judgment-stage.ts, resolve-and-narrow-input.ts,
  draft-assessment-text.ts, subject.ts) — untouched; only their call sites moved into
  investigation-pipeline.ts.
- draftAssessment's own call convention and Assessment's own shape (outcome, referral,
  determining_hypothesis, text; no usage/elapsed_ms/prompt) — untouched, still proved by
  draft-assessment-text.spec.ts and by run-diagnosis.spec.ts's own capturingConsolidator test.
deferred:
- what: Building an actual no-cache simulate composition/factory that calls runInvestigationPipeline,
    and the simulate-case/simulate-hypothesis HTTP surface (routes, controllers, DTOs) that would use
    it.
  why: this task's own REMAINDER notes already name these as belonging to
    task/case-simulation-pipeline/no-cache-simulation-composition and the two simulate-*-operation
    tasks; this task's own four criteria ask only that the shared function exist and that diagnose's
    composition call it, not that a second caller be built.
- what: domain/investigation/assessment's own schema still requires register, usage, elapsed_ms and
    prompt on Assessment itself, and Assessment's own shape still does not carry any of the four.
  why: draft-assessment-text.spec.ts, already delivered and passing, asserts the answered Assessment
    carries none of the three call-record fields; the depended-upon
    diagnose-reports-real-cost-and-durations task already disclosed this same gap as deliberately left
    open for a future task or human decision, and this task's own criteria do not reach Assessment's
    shape either — only the shared record's own separate prompts field, which this delivery does add.
---

## What it is

Stages 1-4 of the investigation pipeline (buildSubject, collectEvidence, judgeHypotheses, resolveAndNarrow, draftAssessment) now live in one new file, investigation-pipeline.ts, behind one exported function, runInvestigationPipeline, that returns the whole record (evidence, evaluations, resolved, assessment, cost, durations, prompts). run-diagnosis.ts's own runDiagnosis calls it and adds only buildInvestigation and writeWithinDeadline, exactly as before this extraction — every moved function's own body is unchanged, and run-diagnosis.ts's own exported surface, clock-read guarantee and case-fetching-import guarantee (all three already proved by run-diagnosis.spec.ts) are untouched.

## Notes

The shared function was placed in a new file rather than kept inside run-diagnosis.ts, even though this task's own "What it is" text describes reshaping run-diagnosis.ts's own private helpers: run-diagnosis.spec.ts already asserts, by scanning that file's own source text, that it exports exactly `RunDiagnosisOptions` and `runDiagnosis` and nothing else. A shared function a future simulate composition can call has to be exported from somewhere, and adding it to run-diagnosis.ts's own exports would have broken that already-delivered, still-active test — which this task's own fourth and fifth criteria (identical response, write-before-respond ordering) require staying green, since they are exactly what that spec file proves. Placing runInvestigationPipeline in investigation-pipeline.ts instead satisfies "diagnose's own composition ... calls this shared function" literally, keeps every one of run-diagnosis.ts's own already-delivered guarantees intact, and does not need that spec file's own export-totality assertion to change.

This delivery holds no captured build or test run: the implementing session had no shell. The `task` pin above is left as a plain, non-conforming placeholder for the same reason — sha256sum was not available to compute it — for the caller to fill in before this record is validated.
