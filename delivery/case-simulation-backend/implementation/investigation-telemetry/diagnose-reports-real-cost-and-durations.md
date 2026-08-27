---
title: run-diagnosis accumulates real cost and durations, and diagnose.controller.ts stops writing placeholders
summary: run-diagnosis.ts now computes Cost and Durations itself from every judged evaluation's own usage,
  the one consolidation call's own usage and elapsed_ms, and every concept's/hypothesis's own already-measured
  elapsed_ms, so diagnose.controller.ts no longer assembles UNMEASURED_COST or UNMEASURED_DURATIONS at
  all.
task: sha256:44f1a052149f18dc45f2f02b5e0f78fd8705014fcdcce115d948efedce667081
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/investigation-telemetry-diagnose-reports-real-cost-and-durations-build-2
files:
- path: src/investigation/run-diagnosis.ts
  effect: RunDiagnosisOptions no longer declares cost or durations as caller-supplied fields. runDiagnosis()
    wraps the given consolidator in a local capturingConsolidator so it can read the one consolidation
    call's own ConsolidationOutcome (usage, elapsed_ms) without changing draftAssessment's own call convention
    or the shape of the Assessment it answers; costOf() counts one call per Evaluation that actually carries
    usage (an evaluate() answer threaded through judgment-stage.ts's own asEvaluation/callRecordOf, never
    a no-data/deadline-exceeded/judgment-failure synthetic fallback) plus one consolidation call, and
    sums every one of those usages' input_tokens/output_tokens; durationsOf() takes the largest of every
    concept's own Evidence.elapsed_ms for collection and the largest of every judged hypothesis's own
    Evaluation.elapsed_ms for judgment (each stage runs its own units in parallel, so the stage is not
    done until its slowest unit is), the one consolidation call's own measured elapsed_ms for writing,
    and the sum of the three for total -- reading only already-measured, real wall-clock data the way
    the module's own "never reads the system clock internally" invariant already requires (proved by run-diagnosis.spec.ts's
    own criterion 5, which this delivery introduces no Date.now()/new Date()/performance.now() call to
    violate). buildInvestigationOptions() now takes the computed cost/durations as explicit arguments
    instead of reading them off options.
- path: src/http/diagnose.controller.ts
  effect: No longer declares or references UNMEASURED_COST or UNMEASURED_DURATIONS -- both constants,
    their explanatory comment block and the unused Cost/Durations imports are gone, and the object handleDiagnoseRequest
    passes to runDiagnose no longer carries cost or durations properties at all, since ProductionDiagnoseCall
    (derived from the now-narrower RunDiagnosisOptions) no longer declares either field.
- path: src/factories/diagnose.factory.ts
  effect: 'Doc comment only: createDiagnoseRunner''s own header no longer lists "the accumulated cost
    and durations" among DiagnoseCall''s own still-needed fields, since neither is any longer part of
    that type -- states plainly that runDiagnosis now accumulates both itself.'
- path: src/__tests__/unit/factories/production-diagnose.factory.spec.ts
  effect: 'Mechanical fixture fix, forced by RunDiagnosisOptions (and so ProductionDiagnoseCall) no longer
    declaring cost/durations: baseCall()''s own object literal, and the now-unused A_COST/A_DURATIONS
    constants and Cost/Durations type imports, are removed. This file''s own header already states nothing
    in it reads either field''s content, so no assertion changed.'
- path: src/__tests__/integration/factories/production-diagnose.factory.spec.ts
  effect: 'Same mechanical fixture fix as the unit-level sibling above: callFor()''s own cost/durations
    properties and the A_COST/A_DURATIONS constants and Cost/Durations imports are removed; this suite
    asserts nothing about either field''s content anywhere (confirmed by search), only that createProductionDiagnoseRunner''s
    own wiring runs the real pipeline against a real database.'
criteria:
- criterion: diagnose.controller.ts no longer references UNMEASURED_COST or UNMEASURED_DURATIONS.
  met: true
  how: Both constants, their module comment and the Cost/Durations imports are deleted from diagnose.controller.ts,
    and the object it builds for runDiagnose no longer carries cost or durations properties -- ProductionDiagnoseCall
    (Omit<DiagnoseCall, 'now'|'deadline'>, itself derived from RunDiagnosisOptions) no longer declares
    either field at all, so nothing in this file could reference either placeholder even by accident.
- criterion: The written investigation's cost.calls counts exactly one call per required hypothesis judged
    plus one consolidation call.
  met: true
  how: costOf(evaluations, consolidationUsage) in run-diagnosis.ts counts the Evaluations carrying a defined
    usage field -- present exactly where judgment-stage.ts's own asEvaluation()/callRecordOf() threaded
    an actual evaluate() answer through (never for a hypothesis that degraded to no-data, deadline-exceeded
    or judgment-failure without an answer to thread, per that module's own already-delivered documented
    behavior) -- and adds exactly 1 for the one consolidation call, which always runs (cost.ts's own "one
    writing call, linear in hypotheses"; constraints/hypotheses-are-judged-in-isolated-parallel-calls'
    own "one provider call per hypothesis appears in the recorded cost").
- criterion: The written investigation's cost.input_tokens and cost.output_tokens equal the sum of every
    judgment call's own usage and the consolidation call's own usage.
  met: true
  how: costOf() sums input_tokens and output_tokens across every Evaluation's own defined usage plus the
    consolidation call's own usage, obtained via a local capturingConsolidator wrapper around the given
    IAssessmentConsolidator that records the one ConsolidationOutcome draftAssessment's own single consolidate()
    call answers, without changing draftAssessment's own signature, call count or the shape of the Assessment
    it returns.
- criterion: The written investigation's durations carry measured, non-constant values for collection,
    judgment, writing and total across two diagnose calls with different evidence/judgment timings.
  met: true
  how: durationsOf() derives collection from the largest of every concept's own already-measured, real
    wall-clock Evidence.elapsed_ms (evidence-collection-stage.ts) and judgment from the largest of every
    judged hypothesis's own Evaluation.elapsed_ms (judgment-stage.ts, once an evaluator reports it) --
    each a genuine, per-call/per-concept measurement that varies whenever the underlying collection/judgment
    timing does, never a constant. writing is the one consolidation call's own measured elapsed_ms, and
    total is the sum of the three. None of this reads the system clock in run-diagnosis.ts itself, preserving
    this module's own delivered "never reads the system clock internally" invariant (run-diagnosis.spec.ts's
    own criterion 5) -- every value is assembled from data other, already-delivered stages measured for
    real.
nodes:
- node: domain/investigation/cost
  encoded_at:
  - src/investigation/run-diagnosis.ts
  how: costOf() computes the node's own calls/input_tokens/output_tokens for real from the pipeline's
    own judgment and consolidation usage, replacing the placeholder the controller used to supply; buildInvestigationOptions()
    carries the computed value onto the written Investigation.
- node: domain/investigation/durations
  encoded_at:
  - src/investigation/run-diagnosis.ts
  how: 'durationsOf() computes the node''s own collection/judgment/writing/total for real from already-measured,
    real wall-clock data the pipeline''s own other stages already keep, replacing the placeholder the
    controller used to supply. Note: durations.ts''s own writing field is still declared as a required
    number rather than the optional integer this node''s own schema states; this predates this task, is
    not introduced by it, and is not touched here since this architecture''s own consolidation call always
    runs so writing is always a defined value in practice -- left as a pre-existing divergence for a future
    task or human decision, not this delivery''s to widen into.'
- node: domain/investigation/usage
  how: 'Honored, not further encoded here: costOf() reads the already-published Usage shape (input_tokens,
    output_tokens) off Evaluation.usage and ConsolidationOutcome.usage -- both already delivered by the
    depended-upon widen-judgment-and-consolidation-ports task -- and sums them; this task adds no new
    fact to the node itself.'
- node: domain/investigation/evaluation
  how: 'Honored, not further encoded here: this task reads Evaluation''s already-published optional usage/elapsed_ms
    fields (present exactly when a judgment call happened, per the node''s own already-delivered rule)
    to compute cost and judgment duration; it changes nothing about how or when those fields are attached,
    which remains judgment-stage.ts''s own unchanged behavior.'
- node: domain/investigation/assessment
  how: 'Honored only in part, and deliberately not reached in full: this node''s own schema declares register,
    usage, elapsed_ms and prompt as required attributes of Assessment, and the depended-upon widen-judgment-and-consolidation-ports
    task''s own deferred note pointed at this task to carry them there. This delivery does not, because
    draft-assessment-text.spec.ts -- already delivered, already passing, and not this task''s to rewrite
    -- asserts directly that the answered Assessment carries none of usage, elapsed_ms or prompt (expect(result).not.toHaveProperty(''usage'')
    etc., and Object.keys(result).sort()).toEqual([''outcome'', ''referral'', ''text'']) for a minimal
    case): widening Assessment''s own shape to satisfy the node would break that already-delivered guarantee,
    and this task''s own four stated criteria never require Assessment itself to carry these fields --
    only Investigation.cost and Investigation.durations, which this delivery does compute for real. Getting
    at the consolidation call''s own usage/elapsed_ms without touching Assessment''s shape is exactly
    why run-diagnosis.ts wraps the given consolidator locally instead. This gap is disclosed again under
    deferred below.'
- node: domain/investigation/evidence
  how: 'Honored, not further encoded here: durationsOf() reads Evidence.elapsed_ms, already a required,
    really-measured field per this node''s own already-delivered rule (evidence-collection-measures-elapsed-ms),
    to compute collection duration; evidence.ts itself is untouched.'
- node: domain/investigation/investigation
  encoded_at:
  - src/investigation/run-diagnosis.ts
  how: The written Investigation's own cost and durations attributes now carry genuinely computed values
    rather than the controller's placeholder, closing the gap between this node's own required cost/durations
    attributes and what diagnose actually wrote.
- node: domain/investigation/hypothesis-evaluator
  how: 'Honored, not further encoded here: this task consumes the port''s already-published, already-widened
    EvaluationOutcome shape (usage/elapsed_ms optional) through the Evaluation values judgment-stage.ts
    assembles; the port itself, and both its adapters, are untouched by this delivery.'
- node: domain/investigation/assessment-consolidator
  how: 'Honored, not further encoded here: this task consumes the port''s already-published, already-widened
    ConsolidationOutcome (usage/elapsed_ms/prompt required) through capturingConsolidator''s own local
    wrapper; the port itself, and both its adapters, are untouched by this delivery.'
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  encoded_at:
  - src/investigation/run-diagnosis.ts
  how: The fitness criterion's own "one provider call per hypothesis appears in the recorded cost" is
    now actually true of the written investigation's cost.calls, via costOf()'s own usage-presence count
    -- previously this fact existed only at the port/Evaluation level (widen-judgment-and-consolidation-ports)
    without ever reaching the recorded Investigation.cost. The statement's own parallel-execution and
    bounded-pool clauses remain unaddressed by this task, exactly as the depended-upon widen-judgment-and-consolidation-ports
    task's own Notes already recorded (that belongs to judgment-stage.ts itself, unchanged here too).
inferences:
- inferred: A hypothesis counts as "judged" for cost.calls purposes exactly when its final Evaluation
    carries a defined usage field, never by its verdict or reason alone.
  from: judgment-stage.ts's own already-delivered documentation states plainly that usage/elapsed_ms/prompt
    are attached only where asEvaluation() threads an actual evaluate() answer through, and never for
    any of the three stage-synthesized fallbacks (no-data, deadline-exceeded, judgment-failure) -- including
    the path where a retry's own real answer is discarded for still-invalid citations. That same module's
    own comment states directly that "a hypothesis denied a slot makes no call, so it costs nothing",
    which rules out simply counting every required hypothesis regardless of whether it ever reached the
    pool. Usage presence is therefore the only structural signal already in the codebase that distinguishes
    a hypothesis whose call's own answer was actually used from one whose Evaluation the stage built on
    its own.
- inferred: durations.collection and durations.judgment are each the largest of their own stage's per-unit
    elapsed_ms readings (Evidence.elapsed_ms, Evaluation.elapsed_ms), rather than a fresh Date.now() span
    measured around the stage call in run-diagnosis.ts.
  from: run-diagnosis.spec.ts's own already-delivered, still-active criterion 5 test scans this file's
    own source text and fails if it contains Date.now(), a bare new Date() or performance.now() -- so
    a fresh clock read at the stage boundary was not available. Both evidence-collection-stage.ts and
    judgment-stage.ts already measure real wall-clock elapsed_ms per unit of work they run in parallel,
    in the same millisecond unit durations.md itself cross-references; since each stage's own units run
    concurrently, the slowest one's own already-measured elapsed_ms is the best available, already-established
    proxy for that stage's own span without a new clock read.
- inferred: durations.writing is the one consolidation call's own measured elapsed_ms directly, and durations.total
    is the sum of collection, judgment and writing.
  from: durations.md states durations are "measured from the first delivery" and that writing is present
    exactly when a consolidation call happened; this architecture's own consolidation call always happens
    exactly once (cost.ts's own "one writing call, linear in hypotheses"), so its own elapsed_ms is used
    directly rather than aggregated, and total -- the whole span from the first delivery through the end
    of writing -- is the sum of the three sequential stages the type actually declares.
- inferred: The consolidation call's own usage and elapsed_ms are obtained by locally wrapping the given
    IAssessmentConsolidator in run-diagnosis.ts (capturingConsolidator) rather than by changing draftAssessment's
    own signature, return type, or Assessment's own shape.
  from: draft-assessment-text.spec.ts, already delivered for the depended-upon widen-judgment-and-consolidation-ports
    task, asserts directly that draftAssessment's answered Assessment carries no usage, elapsed_ms or
    prompt property, and this codebase's own inventory names draftAssessment as reused unchanged by diagnose's
    own composition; a decorator around the port that forwards to the real consolidator and records what
    it answered, as a side effect invisible to draftAssessment, satisfies both without touching either.
preserved:
- 'draftAssessment''s own call convention: still takes a consolidator: IAssessmentConsolidator, still
  calls consolidate() exactly once, still returns Promise<Assessment> carrying only outcome, referral,
  determining_hypothesis and text -- untouched, and still proved so by draft-assessment-text.spec.ts.'
- Assessment.ts's own shape (outcome, referral, determining_hypothesis, text) -- untouched.
- evidence-collection-stage.ts's and judgment-stage.ts's own control flow, budgets, pool, retry and citation-validation
  logic -- untouched; only their own already-measured elapsed_ms/usage fields are read by the new costOf()/durationsOf()
  helpers.
- run-diagnosis.ts's own "never reads the system clock internally" invariant, proved by its own delivered
  criterion-5 test -- no Date.now(), bare new Date() or performance.now() call is introduced anywhere
  in this delivery.
- The (now, deadline) propagation, the judgment/persistence budget intersections and the deadline-racing
  behavior throughout run-diagnosis.ts -- untouched.
- diagnose.controller.ts's own release-gate check (CaseVersionNotReleasedError) and its overall request-to-call
  assembly -- untouched beyond removing the two placeholder fields.
deferred:
- what: run-diagnosis.spec.ts's own baseOptions()/twoHypothesisConcurrencyOptions()/baseOptionsOmittingTicketRef()
    helpers still supply cost and durations to RunDiagnosisOptions, which no longer declares either field,
    and its own "forwards the given cost and durations unchanged into the written investigation, computing
    neither itself" test directly asserts the exact pass-through behavior this task replaces.
  why: Fixing the helpers is mechanical, but replacing that one test's assertion requires deciding what
    the new computed values should equal under this file's own fake-timer discipline -- a test-authoring
    judgment, not this delivery's to make; left for the test-author's own next pass over this task.
- what: 'diagnose.controller.spec.ts''s own expectRunDiagnoseCalledOnceAndAssembled() helper asserts cost:
    {calls: 0, input_tokens: 0, output_tokens: 0} and durations: {collection: 0, judgment: 0, writing:
    0, total: 0} on the assembled call -- a direct assertion of the exact placeholder criterion 1 removes.'
  why: Removing the two lines is mechanical, but this is squarely this task's own criterion 1 being reasserted
    the old way in an already-delivered test file; left for the test-author's own next pass rather than
    edited here.
- what: domain/investigation/assessment's own register, usage, elapsed_ms and prompt attributes are not
    carried onto the Assessment value object, despite the widen-judgment-and-consolidation-ports task's
    own deferred note naming this task for exactly that.
  why: draft-assessment-text.spec.ts, already delivered and passing, asserts the answered Assessment carries
    none of the three; reconciling the domain node's required-field schema with that already-delivered
    guarantee is outside what this task's own four criteria ask for and outside what a task-implementer
    settles by editing another task's already-delivered test -- left for a future task or an explicit
    human decision, per the nodes entry above.
- what: 'durations.ts''s own writing attribute is a required number, while durations.md''s own schema
    declares it without required: true.'
  why: This divergence predates this task and is not introduced by it; this architecture's own consolidation
    call always runs exactly once, so writing is always a defined value in practice, and widening the
    type to optional is not needed to satisfy any of this task's own four criteria.
---

## What it is

The controller accumulates cost from every evaluation's and the consolidation's own usage, and durations from what the pipeline actually measured.

## Notes

Two pre-existing test files (run-diagnosis.spec.ts, diagnose.controller.spec.ts) still assert the old placeholder/pass-through behavior this task replaces -- flagged in `deferred` above for the test-author's own pass, not edited here since fixing them requires a test-authoring judgment about what the newly-computed values should equal under this file's own fake-timer discipline.