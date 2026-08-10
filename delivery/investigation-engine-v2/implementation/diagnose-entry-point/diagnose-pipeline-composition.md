---
title: Diagnose pipeline composition
summary: A new composition root, run-diagnosis.ts, wires collection, judgment, resolve-and-narrow, drafting and persistence into one synchronous, deadline-bound run over an already-resolved case/subject/narrative, backed by two new factory files and a new persistence-deadline error.
task: sha256:9f4624777f24f476807a3acbf12d694bb5441edb0e19641946a09bc8f5e3465b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/diagnose-entry-point-diagnose-pipeline-composition-build
files:
  - path: src/investigation/run-diagnosis.ts
    effect: "exports RunDiagnosisOptions and runDiagnosis(options): the composition root that builds and validates the subject (subject.ts's buildSubject), collects evidence (collectEvidence), judges every required hypothesis (judgeHypotheses, its own deadline tightened to no more than a 5-second nominal budget beyond the given now), resolves the outcome and narrows the writing input (resolveAndNarrow), drafts the assessment's text (draftAssessment, falling back to a caller-given default register where the case leaves consolidation_register undeclared), builds the whole Investigation (buildInvestigation), and writes it, racing the write against a 2-second nominal persistence budget intersected with what remains of the given deadline — throwing InvestigationWriteDeadlineExceededError instead of ever returning an assessment where that write does not conclude in time. Reads options.now/options.deadline only; calls no clock anywhere in its own body."
  - path: src/errors/investigation-write-deadline-exceeded.error.ts
    effect: "new typed error InvestigationWriteDeadlineExceededError(id, remainingMs), raised by run-diagnosis.ts's writeWithinDeadline when persistence does not conclude within what remains of its own budget — the same name/message/context shape every existing investigation-context error already keeps."
  - path: src/factories/investigation-store.factory.ts
    effect: "new createInvestigationStore(dataDirectory): IInvestigationStore, wiring FileInvestigationStore behind its port — mirrors case-store.factory.ts's own createCaseStore exactly."
  - path: src/factories/diagnose.factory.ts
    effect: "new createDiagnoseRunner(dependencies): (call) => Promise<Assessment> — the diagnose composition's own wiring point. Composes createInvestigationStore with the already-published createGlossaryQuery/createCapabilityQuery and the caller-given observation/evaluator/consolidator adapters, poolSize and defaultConsolidationRegister, returning a function that only still needs each individual diagnose call's own per-call inputs."
criteria:
  - criterion: "The composition returns an assessment only after the investigation has been written; no assessment is returned without a corresponding record."
    met: true
    how: "runDiagnosis's only return statement sits after await writeWithinDeadline(...); every path that does not reach a successful write (a timeout or a rejected store.write()) throws instead of falling through to that return."
  - criterion: "When persistence does not conclude within what remains of the declared deadline, the caller receives an error, not an assessment."
    met: true
    how: "writeWithinDeadline computes boundMs = min(PERSISTENCE_STAGE_BUDGET_MS, max(0, deadline - now)) and races store.write(investigation) against a setTimeout of that duration; where the timer wins, writeWithinDeadline throws InvestigationWriteDeadlineExceededError, and runDiagnosis never reaches its own return."
  - criterion: "The whole run responds within the declared total deadline, with each stage receiving no more than the minimum of its nominal budget and what remains at that point."
    met: true
    how: "collection receives (now, deadline) unchanged and self-bounds inside evidence-collection-stage.ts (unmodified). Judgment's deadline is tightened to min(deadline, now + JUDGMENT_STAGE_BUDGET_MS) before judgeHypotheses is called. Persistence is bounded by writeWithinDeadline. Disclosed caveat: draft-assessment-text.ts's already-delivered DraftAssessmentOptions takes no now/deadline parameter, so drafting is called unbounded (see deferred)."
  - criterion: "The completed Investigation pins the case by slug, version and hash, together with the model, the prompt version and the evidence."
    met: true
    how: "buildInvestigationOptions forwards options.case, options.model, options.prompt_version and the evidence collectEvidence actually produced straight into buildInvestigation, unmodified by this task; buildInvestigation's own pinnedCaseOf pins slug/version/hash from that exact case object."
  - criterion: "The composition takes now and the deadline as explicit parameters and never reads the system clock internally."
    met: true
    how: "RunDiagnosisOptions declares now and deadline as required fields; run-diagnosis.ts contains no Date.now() or any other clock read anywhere in its body. The same given pair is reused, unchanged, for every stage-bound call."
  - criterion: "The investigation the composition runs is exactly the case the knowledge context published, pinned by content at the start of the request."
    met: true
    how: "runDiagnosis never calls a case-fetching port; it receives options.case as an already-resolved Case (carrying its own hash) and threads that exact object, unchanged, through collectEvidence, judgeHypotheses, resolveAndNarrow and buildInvestigation. Making the actual read/pin call happen once, at request entry, is the responsibility of whoever calls this composition — outside this task's own objective."
nodes:
  - node: contracts/investigation/diagnosis
    encoded_at:
      - src/investigation/run-diagnosis.ts
    how: "runDiagnosis realizes the synchronous shape this contract publishes — case, subject, narrative, requester (+ ticket_ref) in; assessment out, within the declared deadline. The idempotent-within-the-window half is this task's own declared REMAINDER, left to diagnose-payload-and-window-dedup."
  - node: contracts/investigation/case-source
    encoded_at:
      - src/investigation/run-diagnosis.ts
    how: "runDiagnosis takes case as an already-resolved input and calls no case-query port itself, so the investigation it runs is exactly whatever its own caller already read and pinned by content."
  - node: domain/investigation/investigation
    how: "honored, not re-encoded: the aggregate's own shape and replay pins already live in investigation.ts/investigation-factory.ts, untouched by this task. This composition is the first code that actually assembles one and persists it as part of a real, callable, deadline-bound flow."
  - node: rules/investigation/an-investigation-is-written-once
    encoded_at:
      - src/investigation/run-diagnosis.ts
    how: "store.write(investigation) is called exactly once, at the very end of runDiagnosis, never retried or called a second time on any path; the actual once-only refusal is FileInvestigationStore's own (unmodified)."
  - node: rules/investigation/replay-is-pinned
    encoded_at:
      - src/investigation/run-diagnosis.ts
    how: "this composition supplies buildInvestigation with the case, model, prompt_version and the evidence actually collected during this run, so the pins buildInvestigation writes reflect exactly what this run used — the pinning mechanism itself is investigation-factory.ts's, unchanged."
  - node: rules/investigation/the-response-follows-the-record
    encoded_at:
      - src/investigation/run-diagnosis.ts
    how: "runDiagnosis returns investigation.assessment only after writeWithinDeadline resolves without throwing; any failure to write propagates as a thrown error instead of a returned assessment."
  - node: rules/investigation/no-stage-aborts-on-its-deadline
    encoded_at:
      - src/investigation/run-diagnosis.ts
    how: "only the persistence clause is reached by this task's own criteria, per the task's own REMAINDER note. writeWithinDeadline is this composition's own persistence budget/race, and a write that does not conclude within it raises InvestigationWriteDeadlineExceededError. Collection's timeout-result and judgment's deadline-exceeded degradation are already realized in the unmodified stage files. No retry is implemented, since no criterion states a retry count or policy."
  - node: rules/investigation/an-answer-arrives-within-the-declared-deadline
    encoded_at:
      - src/investigation/run-diagnosis.ts
    how: "the rule's own twenty-second total and five-slice breakdown are the source of JUDGMENT_STAGE_BUDGET_MS (5000) and PERSISTENCE_STAGE_BUDGET_MS (2000); collection reuses evidence-collection-stage.ts's own COLLECTION_STAGE_BUDGET_MS (7000) unchanged. Writing has no deadline parameter in its already-delivered signature and is called unbounded — see deferred."
  - node: constraints/diagnosis-answers-synchronously
    encoded_at:
      - src/investigation/run-diagnosis.ts
    how: "runDiagnosis is one awaited async function call straight through to its own return; no job, queue or polling is introduced anywhere in this composition or its factory."
  - node: constraints/the-deadline-is-an-absolute-propagated-instant
    encoded_at:
      - src/investigation/run-diagnosis.ts
    how: "the one (now, deadline) pair given to runDiagnosis is the one pair every stage-bound call is computed from — never re-read from a fresh clock — each intersected with its own nominal budget where this composition can enforce one (judgment, persistence) or where the called stage already enforces it itself (collection)."
  - node: scenarios/investigation/no-response-without-a-record
    encoded_at:
      - src/investigation/run-diagnosis.ts
      - src/errors/investigation-write-deadline-exceeded.error.ts
    how: "exactly this scenario's given/when/then: writeWithinDeadline races store.write(investigation) against what remains of persistence's own budget; where it does not conclude, runDiagnosis throws InvestigationWriteDeadlineExceededError instead of returning an assessment."
inferences:
  - inferred: "cost and durations arrive at runDiagnosis as explicit, caller-given fields, forwarded unchanged into buildInvestigation, rather than being computed inside this composition."
    from: "cost.ts's and durations.ts's own module comments, which say accumulating/measuring these is each calling stage's own concern outside this task's objective, and no port this composition calls reports a token count, a call count, or its own elapsed time. Criterion 5 also forbids reading the system clock, which rules out measuring real per-stage durations here."
  - inferred: "defaultConsolidationRegister is an explicit, caller-given fallback field, used only via options.case.consolidation_register ?? options.defaultConsolidationRegister when calling draftAssessment."
    from: "domain/knowledge/case's own text that an adapter, not this writing step, keeps whatever register it defaults to when absent, combined with assessment-consolidator.port.ts's already-delivered consolidate() signature, which requires a concrete ConsolidationRegister on every call and cannot express absent — that port is not this task's file to change."
  - inferred: "the same (now, deadline) pair given to runDiagnosis is reused, unchanged, for every stage-bound call for the whole run, rather than reading a fresh clock value between stages."
    from: "criterion 5's literal never reads the system clock internally, and the inventory's must_not_duplicate entry naming this exact now/deadline-as-parameters discipline for any diagnose-entry-point wiring. Disclosed tradeoff: a stage finishing early does not literally return its balance to the next the way the constraint's own narration describes; closing that fully would require reading the real clock between stages, which the stated criterion forbids."
  - inferred: "JUDGMENT_STAGE_BUDGET_MS (5000ms) and PERSISTENCE_STAGE_BUDGET_MS (2000ms) are declared as new local constants inside run-diagnosis.ts, rather than added as exports to judgment-stage.ts."
    from: "the rule's own stated twenty-second breakdown and criterion 3's explicit minimum of nominal budget and what remains. judgment-stage.ts and draft-assessment-text.ts are already-delivered files this task does not touch."
  - inferred: "poolSize, the observationSource/evaluator/consolidator adapter instances, and defaultConsolidationRegister are all taken as caller/factory-given dependencies with no hardcoded default value anywhere in source."
    from: "constraints/hypotheses-are-judged-in-isolated-parallel-calls' own fitness clause (the pool bound is configuration), and the fact that no production adapter exists yet for observation-source, hypothesis-evaluator or assessment-consolidator."
  - inferred: "the Investigation's own id arrives at runDiagnosis as a caller-given string, never generated inside this composition."
    from: "domain/investigation/investigation states id as a required string with no generation rule anywhere in the specification, and BuildInvestigationOptions already treats id as a bare pass-through field."
  - inferred: "evidenceByHypothesisOf (matching collected evidence to each required hypothesis by concept) is a private, unexported helper local to run-diagnosis.ts, rather than a new exported operation added to case-resolution.ts."
    from: "judgment-stage.ts's own module comment naming this exact matching as whoever composes this stage with evidence-collection-stage's own output, and case-resolution.ts's own scope to its three declared operations alone."
  - inferred: "the subject is built once, early, via subject.ts's own buildSubject, purely to obtain the Subject value collectEvidence's own signature requires and to fail fast on an empty attribute set before spending any collection/judgment budget; the same raw subjectType/subjectAttributes are still forwarded to buildInvestigation, which re-runs buildSubject and the async glossary check itself."
    from: "subject.ts's own module comment instructing every module that assembles a Subject to call through buildSubject, and investigation-factory.ts's own already-delivered signature, which takes raw subjectType/subjectAttributes rather than an already-built Subject."
deferred:
  - what: "draft-assessment-text.ts's own DraftAssessmentOptions takes no now/deadline parameter at all, so the writing/drafting stage has no mechanism, internal or external, to bound a slow consolidator call within its own four-second nominal share of the declared deadline."
    why: "closing this would require changing that already-delivered module's own signature and its fitness test, outside this task's own file set and its objective of composing the existing pipeline rather than reworking a stage it composes."
  - what: "judgment-stage.ts owns no exported nominal-budget constant of its own (unlike evidence-collection-stage.ts's COLLECTION_STAGE_BUDGET_MS); its own five-second share is enforced only from the outside, by this composition's own JUDGMENT_STAGE_BUDGET_MS."
    why: "judgment-stage.ts is not a file this task touches; adding an exported constant there would still be a modification of an already-delivered module outside this task's own stated file set."
  - what: "no port anywhere in this codebase reports actual token usage or a real per-stage elapsed duration, so Cost and Durations remain values this composition can only forward from its own caller, never compute from what it actually observed during a run."
    why: "closing this would require extending those already-delivered ports' own return shapes (and every adapter/fake implementing them), well outside this task's own objective."
---

## What it is

The composition-root function that wires collection, judgment, consolidation/drafting and persistence into one synchronous run over an already-resolved case/subject/narrative, propagating one absolute deadline instant across every stage it can bound, and refusing to answer without a written record.

## Notes

None.
