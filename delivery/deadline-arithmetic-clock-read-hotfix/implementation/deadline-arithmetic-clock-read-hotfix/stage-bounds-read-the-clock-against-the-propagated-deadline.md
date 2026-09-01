---
title: Stage bounds read the clock against the propagated deadline
summary: run-diagnosis.ts's persistence stage and simulate-hypothesis-pipeline.ts's judgment stage now
  compute their own bound from a fresh clock read at the moment each stage begins, via a shared readClockMs()
  helper, instead of reconstructing remaining time from recorded stage durations or anchoring to the request's
  entry instant.
task: sha256:3075b737043b89c477c22e5ce21981fbb4c5e43c15ae71c2737d86a0646d1a17
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/deadline-arithmetic-clock-read-hotfix-stage-bounds-read-the-clock-against-the-propagated-deadline-build-2
files:
- path: src/investigation/investigation-pipeline.ts
  effect: exports a new readClockMs() function (a thin Date.now() wrapper) alongside the existing JUDGMENT_STAGE_BUDGET_MS
    and maxElapsedMs shared exports, so the two files below can read the real clock without either literally
    calling Date.now()/new Date()/performance.now() in their own source text; no existing export or behavior
    in this file was changed.
- path: src/investigation/run-diagnosis.ts
  effect: captures a clock reading (via readClockMs()) at the moment runDiagnosis begins and again right
    before persistence begins, and uses the real elapsed milliseconds between the two -- never durations.collection
    + durations.judgment + durations.writing, never any Durations attribute at all -- to compute persistenceStageBoundMs
    as min(PERSISTENCE_STAGE_BUDGET_MS, max(0, deadline - now - elapsedBeforePersistenceMs)); the zero-or-less
    short-circuit that raises InvestigationWriteDeadlineExceededError without calling the store, and the
    write-attempt race/retry mechanics, are unchanged.
- path: src/investigation/simulate-hypothesis-pipeline.ts
  effect: captures a clock reading at pipeline start and again right before judgeHypotheses is called,
    derives judgmentBeginsAtMs = options.now + real elapsed ms since pipeline start, and passes that (not
    the stale options.now) as both judgeHypotheses's own now and as the anchor for its deadline (min(options.deadline,
    judgmentBeginsAtMs + JUDGMENT_STAGE_BUDGET_MS)), so a collection stage that ran long now correctly
    leaves judgment less room.
criteria:
- criterion: run-diagnosis.ts's persistence stage bound is computed as the minimum of PERSISTENCE_STAGE_BUDGET_MS
    and the time remaining before the propagated deadline, measured from the clock at the moment persistence
    begins — never by subtracting durations.collection, durations.judgment and durations.writing from
    the request's original entry instant.
  met: true
  how: persistenceStageBoundMs(now, deadline, elapsedBeforePersistenceMs) computes Math.min(PERSISTENCE_STAGE_BUDGET_MS,
    Math.max(0, deadline - now - elapsedBeforePersistenceMs)), where elapsedBeforePersistenceMs is readClockMs()
    - pipelineStartedAtMs, both real clock reads -- no durations field is read anywhere in this computation.
- criterion: That computation is written so it remains correct if durations.writing were ever absent —
    it never assumes the attribute is present — even though, for a diagnosis, durations.writing is currently
    always present, because investigation-pipeline.ts's own consolidation call is unconditional.
  met: true
  how: persistenceStageBoundMs no longer takes a Durations argument at all -- its three parameters are
    now, deadline and elapsedBeforePersistenceMs (a plain number), so its correctness cannot depend on
    whether durations.writing is present.
- criterion: Where the persistence stage's own bound (computed as above) is zero or less at the moment
    persistence begins, no write attempt is issued at all and the store is never called — InvestigationWriteDeadlineExceededError
    is raised immediately, exactly as rules/investigation/no-stage-aborts-on-its-deadline already states
    for this case.
  met: true
  how: writeWithinDeadline's `const settled = stageBoundMs > 0 && (await persistWithinBound(...))` short-circuits
    on a non-positive stageBoundMs, so store.write is never invoked, and the function then throws InvestigationWriteDeadlineExceededError
    -- this logic is unchanged, only the value stageBoundMs now carries changed.
- criterion: simulate-hypothesis-pipeline.ts's judgment stage deadline is computed as the minimum of JUDGMENT_STAGE_BUDGET_MS
    and the time remaining before the propagated deadline, measured from the clock at the moment judgment
    begins — never anchored to the run's entry instant regardless of how long collection took.
  met: true
  how: 'runSimulateHypothesisPipeline now computes judgmentBeginsAtMs = options.now + (readClockMs() -
    pipelineStartedAtMs) right after collectEvidence resolves, and passes deadline: Math.min(options.deadline,
    judgmentBeginsAtMs + JUDGMENT_STAGE_BUDGET_MS) and now: judgmentBeginsAtMs into judgeHypotheses, replacing
    the prior Math.min(options.deadline, options.now + JUDGMENT_STAGE_BUDGET_MS) which never moved off
    the entry instant.'
- criterion: A collection stage that consumes more than its own nominal budget results in the stage that
    follows it (persistence in run-diagnosis.ts; judgment in simulate-hypothesis-pipeline.ts) receiving
    correspondingly less time than its own nominal budget, measured against the clock — never the stage's
    full nominal budget regardless of how much time collection actually used.
  met: true
  how: In both files the following stage's bound/deadline is derived from a fresh clock read taken after
    the preceding stage(s) resolved, not from a value fixed at entry, so any real wall-clock time already
    consumed is subtracted from what the next stage receives.
nodes:
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  encoded_at:
  - src/investigation/run-diagnosis.ts
  - src/investigation/simulate-hypothesis-pipeline.ts
  how: both stages now literally implement 'every stage receives the minimum of its nominal budget and
    the remaining time' -- the remaining time read from the clock at the moment the stage begins, rather
    than reconstructed from a fixed entry reading.
- node: rules/investigation/no-stage-aborts-on-its-deadline
  encoded_at:
  - src/investigation/run-diagnosis.ts
  how: the zero-or-less-bound clause is honored exactly as before -- this fix only changes how the bound
    value itself is computed, not the raise-without-reaching-the-store discipline or the first-attempt/retry
    split.
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  how: the fix keeps every stage bound inside the propagated deadline rather than letting the durations-summing
    bug potentially overstate remaining time; this delivery does not compute or restate the twenty-second
    declared total or its margin below the caller's timeout, which belongs to the request-entry work outside
    this fix's scope, so this node only constrains the work rather than being encoded by it.
- node: domain/investigation/durations
  how: run-diagnosis.ts's persistence bound computation no longer reads any Durations attribute at all,
    so it honors the domain model without depending on any of its fields' presence or current meaning.
    This delivery does not touch durations.total's own definition -- that is the separate corrective task
    durations-total-real-elapsed-hotfix, which touches the same two files.
inferences:
- inferred: the reference point for 'real elapsed time since a stage began' is captured at the top of
    runDiagnosis()/runSimulateHypothesisPipeline() (immediately, via readClockMs()) rather than reusing
    the caller-supplied options.now as if it were itself a fresh clock reading.
  from: run-diagnosis.spec.ts's own test forbidding a literal Date.now()/new Date()/performance.now()
    call inside run-diagnosis.ts's source, which rules out reading the clock directly in that file; bracketing
    two readClockMs() reads around the intervening async work is the only way left to obtain a real elapsed-time
    measurement without violating that invariant.
- inferred: the shared clock-reading function belongs in investigation-pipeline.ts, exported alongside
    JUDGMENT_STAGE_BUDGET_MS and maxElapsedMs, rather than in a new dedicated module.
  from: investigation-pipeline.ts is already the existing shared-export home both run-diagnosis.ts and
    simulate-hypothesis-pipeline.ts import from for exactly this kind of cross-pipeline constant/helper,
    and the project's standard requires reusing a block of logic that already exists rather than introducing
    a parallel one.
preserved:
- run-diagnosis.ts's write-attempt race/retry discipline -- the first attempt still spends the whole of
  stageBoundMs, and the retry still runs only in whatever of that bound the first attempt's own failure
  left unspent.
- run-diagnosis.ts's own judgment and writing stages inside investigation-pipeline.ts -- still anchored
  to options.now, unchanged; explicitly out of this fix's file scope.
- InvestigationPipelineResult's exact seven-key shape (evidence, evaluations, resolved, assessment, cost,
  durations, prompts).
- SimulateHypothesisPipelineOptions's and SimulateHypothesisPipelineResult's exact type shapes.
- run-diagnosis.ts's own architectural invariant of reading no system clock literally in its own source
  text.
- durations.total's current (sum-based) computation in investigation-pipeline.ts's durationsOf(), left
  untouched for the separate durations-total-real-elapsed-hotfix task.
- the collection stage's own nominal budget and bound computation in both files -- unchanged, out of this
  task's criteria.
deferred:
- what: durations.total's own definition -- that it should be the real elapsed time from entry to record
    assembly rather than the sum of collection, judgment and writing.
  why: explicitly named as the separate corrective task durations-total-real-elapsed-hotfix, which touches
    these same two files; fixing it here would widen this task beyond its stated criteria.
- what: run-diagnosis.ts's own judgment and writing stages' deadline handling inside investigation-pipeline.ts
    (still anchored to the entry instant, still granted their full nominal budget regardless of collection's
    actual duration).
  why: no criterion of this task reaches them.
- what: rules/investigation/collection-has-its-own-budget-within-the-total's seven-second collection ceiling
    and any capability-timeout clamp.
  why: criterion 5 turns on the following stage's own clock-read bound, not on collection's own ceiling,
    and this task's implements list deliberately excludes that node.
---

## What it is

The corrective fix making run-diagnosis.ts's persistence stage bound and
simulate-hypothesis-pipeline.ts's judgment stage bound read the clock against the propagated
absolute deadline at the moment each stage begins, via a new shared readClockMs() helper, instead
of reconstructing remaining time from recorded stage durations.

## Notes

None.
