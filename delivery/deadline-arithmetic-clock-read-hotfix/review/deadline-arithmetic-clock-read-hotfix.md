---
title: deadline-arithmetic-clock-read-hotfix, review
summary: What four passes found over the source and tests making run-diagnosis.ts's persistence bound
  and simulate-hypothesis-pipeline.ts's judgment bound read the real clock against the propagated deadline.
reviewed:
- src/investigation/investigation-pipeline.ts
- src/investigation/run-diagnosis.ts
- src/investigation/simulate-hypothesis-pipeline.ts
- src/__tests__/unit/investigation/run-diagnosis.spec.ts
- src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
tasks:
- task/deadline-arithmetic-clock-read-hotfix/stage-bounds-read-the-clock-against-the-propagated-deadline
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
coverage:
- criterion: run-diagnosis.ts's persistence stage bound is computed as the minimum of PERSISTENCE_STAGE_BUDGET_MS
    and the time remaining before the propagated deadline, measured from the clock at the moment persistence
    begins — never by subtracting durations.collection, durations.judgment and durations.writing from
    the request's original entry instant.
  state: covered
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: bounds persistence at the nominal two-second budget, never waiting the whole of an ample remaining
      deadline
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: bounds persistence at what remains of the declared deadline when that is smaller than the nominal
      two-second budget
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: bounds persistence by the time actually remaining once collection has already consumed part
      of the declared deadline, never by the deadline computed against the request's original entry instant
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: computes persistence's own bound from the actual wall-clock time elapsed before persistence
      begins, never from durations.collection + durations.judgment + durations.writing — a write still
      proceeds even where those reported durations would sum to more than the whole deadline
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: issues no write attempt when persistence begins after the propagated deadline has already been
      consumed by real wall-clock time inside judgment, even though a deadline-exceeded judgment carries
      no elapsed_ms of its own and so durations.collection + durations.judgment + durations.writing reads
      as zero
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: clamps persistence's own bound to zero rather than negative, once the given deadline has already
      elapsed relative to now
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: computes the persistence deadline from the given now/deadline pair alone, unaffected by the
      real system clock
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: raises InvestigationWriteDeadlineExceededError instead of resolving, when persistence does not
      conclude within what remains of the declared deadline
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: holds the first write attempt to the whole of the persistence stage bound — its own unchanged
      2000ms nominal budget — rather than capping it below to reserve time for a retry
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: bounds the retry by whatever of the stage bound the first attempt's own elapsed time left unspent,
      rather than granting it a fresh budget of its own
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: does not retry when the first attempt runs until the stage bound itself elapses without settling
  why: A companion test, 'reads no system clock anywhere in its own body...', is a regex over run-diagnosis.ts's
    own text that binds the module's shape rather than this criterion — named so a reader does not read
    it as part of this criterion's proof.
- criterion: That computation is written so it remains correct if durations.writing were ever absent —
    it never assumes the attribute is present — even though, for a diagnosis, durations.writing is currently
    always present, because investigation-pipeline.ts's own consolidation call is unconditional.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: computes persistence's own bound from the actual wall-clock time elapsed before persistence
      begins, never from durations.collection + durations.judgment + durations.writing — a write still
      proceeds even where those reported durations would sum to more than the whole deadline
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: issues no write attempt when persistence begins after the propagated deadline has already been
      consumed by real wall-clock time inside judgment, even though a deadline-exceeded judgment carries
      no elapsed_ms of its own and so durations.collection + durations.judgment + durations.writing reads
      as zero
  why: No run in the set reaches persistence with durations.writing genuinely absent — every options builder
    seeds a consolidation outcome carrying an elapsed_ms. The two named tests exercise the weaker fact
    that the bound does not collapse or widen based on the reported durations, not that the computation
    tolerates an absent durations.writing specifically.
- criterion: Where the persistence stage's own bound (computed as above) is zero or less at the moment
    persistence begins, no write attempt is issued at all and the store is never called — InvestigationWriteDeadlineExceededError
    is raised immediately, exactly as rules/investigation/no-stage-aborts-on-its-deadline already states
    for this case.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: issues no write attempt at all when persistence's own bound is zero or less, raising immediately
      instead
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: issues no write attempt when persistence begins after the propagated deadline has already been
      consumed by real wall-clock time inside judgment, even though a deadline-exceeded judgment carries
      no elapsed_ms of its own and so durations.collection + durations.judgment + durations.writing reads
      as zero
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: clamps persistence's own bound to zero rather than negative, once the given deadline has already
      elapsed relative to now
  why: 'The store-is-never-called half and the raised error''s identity are exercised. ''Immediately''
    is not: both tests drain the whole fake timer queue with vi.runAllTimersAsync() before reading the
    rejection, so a refusal that arrived only after waiting out an interval would pass either test unchanged.'
- criterion: simulate-hypothesis-pipeline.ts's judgment stage deadline is computed as the minimum of JUDGMENT_STAGE_BUDGET_MS
    and the time remaining before the propagated deadline, measured from the clock at the moment judgment
    begins — never anchored to the run's entry instant regardless of how long collection took.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
    name: measures judgment's own deadline from the clock at the moment judgment actually begins, so a
      collection stage that consumed part of the propagated deadline leaves judgment correspondingly less
      real time than its own nominal budget — never the full nominal budget measured from the pipeline's
      entry instant
  why: Only the remaining-deadline side of the minimum is exercised (3000ms of a 6000ms deadline consumed
    by collection). Nothing in this file runs judgment against a propagated deadline ample enough for
    the nominal budget to be the smaller of the two, so the JUDGMENT_STAGE_BUDGET_MS cap itself is never
    the operative bound in this module.
- criterion: A collection stage that consumes more than its own nominal budget results in the stage that
    follows it (persistence in run-diagnosis.ts; judgment in simulate-hypothesis-pipeline.ts) receiving
    correspondingly less time than its own nominal budget, measured against the clock — never the stage's
    full nominal budget regardless of how much time collection actually used.
  state: partial
  tests:
  - file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
    name: bounds persistence by the time actually remaining once collection has already consumed part
      of the declared deadline, never by the deadline computed against the request's original entry instant
  - file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
    name: measures judgment's own deadline from the clock at the moment judgment actually begins, so a
      collection stage that consumed part of the propagated deadline leaves judgment correspondingly less
      real time than its own nominal budget — never the full nominal budget measured from the pipeline's
      entry instant
  why: In neither module does collection actually consume more than its own nominal budget (700ms and
    3000ms, both under the 7000ms collection budget); the shrinkage observed instead comes from a propagated
    deadline set below the sum of the nominal budgets. An over-running collection stage under a deadline
    still ample enough to leave the next stage its full nominal budget is never produced by this set.
findings:
- pass: conformance
  file: src/investigation/investigation-pipeline.ts
  where: judgeHypothesesOptions, lines 131-143
  evidence: 'now: options.now, deadline: Math.min(options.deadline, options.now + JUDGMENT_STAGE_BUDGET_MS),'
  cost: judgment's own bound for the diagnose flow is built from options.now -- the instant the whole
    request entered -- never adjusted by the real wall-clock time collection actually spent, even though
    enteredAtMs = readClockMs() is captured a few lines above and available for exactly this. A collection
    stage that consumes real time is invisible to this computation, so a collection stage that used most
    of the propagated deadline still leaves judgment appearing to hold a fresh budget measured from the
    request's entry rather than from where the clock now stands -- the per-stage isolation constraints/the-deadline-is-an-absolute-propagated-instant
    states judgment does not receive here, in the diagnose flow specifically, even though this same task
    fixed the identical computation in simulate-hypothesis-pipeline.ts. No test in run-diagnosis.spec.ts
    pairs a collection delay with an assertion on judgment's own bound to catch this.
  correction: read the clock the same way runSimulateHypothesisPipeline and persistenceStageBoundMs already
    do for the identical problem -- derive judgment's own now as options.now + (readClockMs() - enteredAtMs)
    and use that reading, not the stale options.now.
- pass: standard
  file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
  where: lines 31-51 and 69-71, the aHypothesis, manifestEntryOf and schemaDeclaring fixture helpers
  cites: MNT-03
  evidence: 'function aHypothesis(name: string, collects: readonly string[]): Hypothesis { ... } function
    manifestEntryOf(hypothesis: Hypothesis, position: number): ManifestEntry { ... } function schemaDeclaring(...fields:
    readonly string[]): string { ... }'
  cost: run-diagnosis.spec.ts holds these three functions character for character at its own lines 39-46,
    48-59 and 78-80, so the shape of a ManifestEntry and of a Capability's output_schema is encoded twice.
    When either type changes, the copy that gets fixed keeps its suite green and the copy that does not
    keeps passing against a shape production no longer produces.
  correction: move the case, hypothesis, manifest-entry and capability builders, and the shared fake capability/glossary
    queries, into one fixture module both spec files import.
- pass: standard
  file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
  where: lines 199-210, the test 'carries exactly evidence, evaluation and durations...'
  cites: TST-01
  evidence: it('carries exactly evidence, evaluation and durations...', async () => { expectTypeOf<SimulateHypothesisPipelineResult>().toEqualTypeOf<{...}>();
    const result = await runSimulateHypothesisPipeline(baseOptions()); expect(Object.keys(result).sort()).toEqual(['durations',
    'evaluation', 'evidence']);
  cost: The type assertion stands before anything is arranged or acted on, so a reader working down the
    test meets a claim, then a call, then two more claims, and cannot tell from the layout which assertions
    belong to the call and which do not.
  correction: put the expectTypeOf claim after the act, beside the two expect calls it belongs with, or
    split the type-shape claim into its own test.
- pass: standard
  file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
  where: lines 240-250, the test 'carries durations with collection and judgment only...'
  cites: TST-01
  evidence: 'it(''carries durations with collection and judgment only...'', async () => { expectTypeOf<SimulateHypothesisDurations>().toEqualTypeOf<{...}>();
    const result = await runSimulateHypothesisPipeline(baseOptions()); expect(result.durations).toEqual({
    collection: 0, judgment: 5, total: 0 }); expect(result.durations).not.toHaveProperty(''writing'');'
  cost: 'Same inversion as above: the assertion precedes the arrangement and act, so the test''s claim
    about measured values sits below an unrelated type claim rather than beside the setup that produced
    them.'
  correction: order the body arrange, act, assert, or separate the type-shape claim into its own named
    test.
- pass: standard
  file: src/investigation/simulate-hypothesis-pipeline.ts
  where: lines 44-72, runSimulateHypothesisPipeline -- specifically the judgment stage bound at line 68
  cites: MNT-03
  evidence: 'const pipelineStartedAtMs = readClockMs(); ... const judgmentBeginsAtMs = options.now + (readClockMs()
    - pipelineStartedAtMs); ... deadline: Math.min(options.deadline, judgmentBeginsAtMs + JUDGMENT_STAGE_BUDGET_MS),'
  cost: 'The collect-then-judge sequence and the judgment stage bound already exist in investigation-pipeline.ts''s
    judgeHypothesesOptions, whose own arithmetic reads Math.min(options.deadline, options.now + JUDGMENT_STAGE_BUDGET_MS)
    -- and the two copies have already diverged: here the window is measured from a fresh clock reading
    advanced past collection, there it is measured from the stale options.now with no clock read at all
    (see this review''s own conformance finding on that file). The same concept is spelled a third way
    in run-diagnosis.ts, which clamps at zero where neither judgment site does.'
  correction: extract one exported helper that takes the propagated (now, deadline) pair, the elapsed
    real time since entry and a stage budget, and answers that stage's bound -- then have all three call
    sites use it.
- pass: failures
  file: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  where: persists real, non-zero cost and durations for the judgment and consolidation calls, now that
    the Anthropic adapters themselves report real usage and elapsed_ms, with durations_total exceeding
    the sum of the three stage figures since it measures the whole pipeline's own real elapsed time --
    line 373
  evidence: 'AssertionError: expected 229 to be greater than 229 (expect(written?.durations_total).toBeGreaterThan((written?.durations_collection
    ?? 0) + (written?.durations_judgment ?? 0) + (written?.durations_writing ?? 0)))'
  cost: 'domain/investigation/durations states as fact that total is never the sum of collection, judgment
    and writing because it must carry the overhead and the gaps between stages; runInvestigationPipeline
    measures total with Date.now() millisecond resolution against per-stage elapsed_ms values measured
    the same way, so when a run completes inside one millisecond tick the overhead is lost to rounding
    and total ties the sum instead of exceeding it -- the invariant the node states can silently stop
    holding depending on how fast the machine runs. Note: an independent review of a different task in
    this same batch (consolidation-call-record-chain-hotfix) diagnosed this identical failure and classified
    its cause as test (the assertion is stronger than what the node states); this review''s own diagnostician
    classified it as code (the millisecond-resolution clock is what lets the tie occur). Both readings
    are recorded as returned, not reconciled.'
  correction: measure the pipeline's entry-to-completion elapsed time and the per-stage elapsed_ms figures
    it is compared against with a monotonic clock precise enough that inter-stage overhead is not lost
    to millisecond rounding (e.g. process.hrtime.bigint() or performance.now() rather than Date.now()).
  cause: code
failures_counted: 1
run: run/deadline-arithmetic-clock-read-hotfix
---

## What it is

The first review of deadline-arithmetic-clock-read-hotfix: coverage over its five criteria,
specification conformance over the four nodes it implements, standard conformance over the
project's own registry, and diagnosis of the one failure the captured suite run reported.

## Notes

The specification-conformance pass surfaced that investigation-pipeline.ts's own judgment stage
bound (judgeHypothesesOptions, feeding the diagnose flow through run-diagnosis.ts) still anchors
to the stale options.now instead of a fresh clock read -- the identical arithmetic bug this task
fixed in simulate-hypothesis-pipeline.ts, left uncorrected in the sibling the task's own criteria
did not name. The one captured failure is the same real-wall-clock timing tie found in the review
of consolidation-call-record-chain-hotfix; that review's diagnostician classified its cause as
test, this review's independently classified it as code -- both readings are recorded as returned.
