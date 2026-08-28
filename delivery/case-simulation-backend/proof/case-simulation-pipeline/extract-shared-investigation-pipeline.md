---
implementation: sha256:cf70a00a9a49140bfc9aba81517326c28dcabb8a727ce9614b6ba8e7288da025
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-simulation-pipeline-extract-shared-investigation-pipeline-suite
title: Proof for extracting the shared investigation pipeline
summary: New tests exercise runInvestigationPipeline's own record shape and sequencing directly, since
  run-diagnosis.spec.ts's own unmodified, still-valid suite already proves the composition, identical-response
  and write-ordering criteria but cannot reach fields the diagnose caller never surfaces.
tests:
- file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
  name: answers one record carrying evidence, evaluations, resolved, assessment, cost, durations and prompts
    together, for one confirmed hypothesis
  proves: A shared function exists that runs buildSubject → collectEvidence → judgeHypotheses → resolveAndNarrow
    → draftAssessment and returns evidence, evaluations, resolved, assessment, cost, durations and prompts
    as one record.
  fails_when: runInvestigationPipeline stops running any of the five stages, drops or mis-shapes any of
    the seven record fields, or resolved/prompts (never observable through run-diagnosis's written Investigation)
    diverge from what the stages actually produced
- file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
  name: runs buildSubject before collecting any evidence or judging any hypothesis, refusing an empty
    subject attribute set without reaching either stage
  proves: the stage ordering criterion 1 states (buildSubject first), directly against the new exported
    boundary rather than only inferred through run-diagnosis's own composition
  fails_when: runInvestigationPipeline collects evidence or judges a hypothesis before validating the
    subject, or no longer refuses an empty attribute-value set
- file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
  name: carries only the consolidation call's own prompt under prompts.writing, never merging in a judged
    hypothesis's own distinct judgment prompt
  proves: the implementation record's own inference — the shared record's prompts field carries exactly
    one attribute, writing, rather than also repeating every judged hypothesis's own judgment prompt
  fails_when: prompts gains a second key, or prompts.writing is populated from (or overwritten by) a judgment
    call's own prompt instead of the one consolidation call's
- file: src/__tests__/unit/investigation/investigation-pipeline.spec.ts
  name: imports none of the five stage-owning modules into run-diagnosis.ts, since its only route to any
    of the five stages is through investigation-pipeline.ts
  proves: No stage's own logic (collectEvidence, judgeHypotheses, resolveAndNarrow, draftAssessment, buildSubject)
    is duplicated between diagnose's composition and the shared function.
  fails_when: run-diagnosis.ts re-imports subject.ts, evidence-collection-stage.ts, judgment-stage.ts,
    resolve-and-narrow-input.ts or draft-assessment-text.ts, which would mean it can call a stage a second,
    independent way
not_applicable:
- edge_case: an empty evidence or evaluations collection answered by runInvestigationPipeline
  why: rules/knowledge/a-case-has-at-least-one-hypothesis forbids a manifest with zero entries, so this
    can never occur; guarded upstream by a domain invariant this task does not touch
- edge_case: two concurrent calls to runInvestigationPipeline for the same subject/case
  why: no criterion of this task states a concurrency guarantee for the pipeline itself — the one concurrency/uniqueness
    guarantee that exists (one investigation written once) belongs to run-diagnosis.ts's own persistence
    step, untouched by this extraction and already proved by run-diagnosis.spec.ts's own "refuses the
    second of two concurrent runs" test
- edge_case: a dependency (observation source, evaluator, consolidator) that fails or answers slowly,
    reached through runInvestigationPipeline
  why: every stage's own fault/deadline handling moved verbatim and unchanged; retesting it at the new
    boundary would describe the rearrangement rather than prove anything this task's own criteria newly
    assert, and it is already exercised end-to-end, unaffected, by run-diagnosis.spec.ts's existing failure-
    and deadline-propagation tests
untested:
- The inference that the shared function and its record type live in a new file (investigation-pipeline.ts)
  rather than being exported from run-diagnosis.ts is pinned by the existing, unmodified 'exports exactly
  RunDiagnosisOptions and runDiagnosis' test in run-diagnosis.spec.ts — no new test was written for it,
  since that already-delivered test would fail the moment this inference were violated.
- cost and durations' own exact formulas (per-hypothesis usage sum, max-of-collection/judgment, two-hypothesis
  totals, non-constant durations across two runs) are not retested against runInvestigationPipeline directly
  beyond the one full-record shape test above — that arithmetic moved verbatim and is already fully exercised,
  unaffected by this extraction, by run-diagnosis.spec.ts's own several cost/durations tests.
---

## What it is

Four new tests proving runInvestigationPipeline's own complete record shape, stage ordering, prompts field and the no-duplicated-stage-logic guarantee at the newly exported boundary this extraction introduces — while run-diagnosis.spec.ts's own full, unmodified suite (confirmed still passing in this delivery's own captured suite run) continues to prove criteria 2, 4 and 5 (composition, identical response, write-before-respond) unaffected by the refactor.

## Notes

None.
