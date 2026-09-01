---
implementation: sha256:347600965348ecb71c8ad6c516e5d645891207ca1de4978fcc6abdefdceca193
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/deadline-arithmetic-clock-read-hotfix-stage-bounds-read-the-clock-against-the-propagated-deadline-suite-2
title: Stage bounds read the clock against the propagated deadline — proof
summary: Three new tests, added into the two pre-existing spec files that already cover run-diagnosis.ts
  and simulate-hypothesis-pipeline.ts, each constructed to fail against the pre-fix (durations-summing
  / entry-instant-anchored) implementation and pass only against the delivered clock-read fix; plus one
  pre-existing test corrected to expect the now-correct refusal instead of the old buggy pass-through.
tests:
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: computes persistence's own bound from the actual wall-clock time elapsed before persistence begins,
    never from durations.collection + durations.judgment + durations.writing -- a write still proceeds
    even where those reported durations would sum to more than the whole deadline
  proves: criteria 1 and 2 (persistence's bound is a clock-read against the propagated deadline, and never
    depends on any Durations field, including durations.writing)
  fails_when: persistenceStageBoundMs is computed by subtracting durations.collection + durations.judgment
    + durations.writing from the request's entry instant; the evaluator reports elapsed_ms:20_000 and
    the consolidator reports elapsed_ms:1_000 while both resolve on the same fake-timer tick (zero real
    elapsed time), so the old computation would clamp the bound to zero and skip the write, while the
    fix leaves the full nominal budget and the write proceeds
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: issues no write attempt when persistence begins after the propagated deadline has already been
    consumed by real wall-clock time inside judgment, even though a deadline-exceeded judgment carries
    no elapsed_ms of its own and so durations.collection + durations.judgment + durations.writing reads
    as zero
  proves: criterion 3 (a non-positive computed bound skips the write attempt entirely) and criterion 5,
    specifically where a deadline-exceeded evaluation carries no elapsed_ms and durations would read as
    zero even though real time was fully consumed
  fails_when: persistenceStageBoundMs is computed from durations (0+0+0) subtracted from the entry instant,
    yielding a strictly positive bound that would let the old code attempt (and complete) a write instead
    of raising InvestigationWriteDeadlineExceededError
- file: src/__tests__/unit/investigation/simulate-hypothesis-pipeline.spec.ts
  name: measures judgment's own deadline from the clock at the moment judgment actually begins, so a collection
    stage that consumed part of the propagated deadline leaves judgment correspondingly less real time
    than its own nominal budget -- never the full nominal budget measured from the pipeline's entry instant
  proves: criterion 4 (judgment's deadline is read from the clock at the moment judgment begins, never
    anchored to the run's entry instant) and criterion 5 for simulate-hypothesis-pipeline.ts
  fails_when: judgment's deadline/now pair is computed anchored to the stale entry-instant options.now;
    with a 3000ms collection delay and a 6000ms overall deadline, the prior code would grant judgment
    a full 5000ms window from the moment judgment is invoked, so the deadline guard would not fire until
    2 seconds past the declared deadline, and the test's final assertion (at real-elapsed exactly 6000ms)
    would find the result promise still unsettled rather than resolved with the deadline-exceeded evaluation
- file: src/__tests__/unit/investigation/run-diagnosis.spec.ts
  name: tightens judgment's own deadline to no more than what remains of the declared deadline, when that
    is smaller than the nominal five-second budget
  proves: corrected pre-existing test; still proves judgment's own timeout fires at the tightened deadline-minus-now
    bound (via the settle-boundary assertions, unsettled at 1499ms, settled at 1500ms) rather than the
    nominal budget, and now correctly asserts that a judgment stage which consumes the whole 1500ms declared
    deadline leaves persistence a zero bound, so no write attempt is issued and InvestigationWriteDeadlineExceededError
    is thrown -- matching rules/investigation/no-stage-aborts-on-its-deadline's own stated behavior for
    a zero-or-less bound
  fails_when: persistence completes a write and returns a resolved assessment even though judgment alone
    consumed the entire declared deadline, the exact pre-fix behavior this task closes
not_applicable:
- edge_case: Inference 2 in the implementation record -- that the shared readClockMs() helper belongs
    specifically in investigation-pipeline.ts rather than in a new dedicated module.
  why: a pure code-location choice with no independent observable consequence beyond the clock-based bound
    behavior the tests above already exercise end to end; both placements would satisfy every criterion
    identically
- edge_case: That durations.writing being genuinely absent leaves persistenceStageBoundMs correct (criterion
    2's own hypothetical).
  why: criterion 2 itself states durations.writing is currently always present because investigation-pipeline.ts's
    own consolidation call is unconditional -- no code path produces a Durations value missing that field,
    so no test can construct this input without inventing a fact the current code refuses to produce;
    the two run-diagnosis.ts tests above establish the stronger fact that no Durations field of any kind
    affects the computed bound at all
- edge_case: run-diagnosis.spec.ts's pre-existing (now, deadline, durations) three-argument call shape
    for persistenceStageBoundMs.
  why: persistenceStageBoundMs is not exported, and no test in the three spec files touching these two
    source files ever calls it directly or asserts its argument shape; nothing needed updating there
untested:
- Whether a second pre-existing test elsewhere in the suite (beyond the one corrected here) implicitly
  relied on the old duration-summing computation without being caught by this run is not separately audited
  beyond the two-file scope this delivery touches -- the full suite (141 files, 1662 tests) passing after
  both fixes is the evidence this proof relies on for that absence.
---

## What it is

The proof for the deadline arithmetic clock-read fix: run-diagnosis.ts's persistence stage and
simulate-hypothesis-pipeline.ts's judgment stage now bound themselves against a real clock read,
never reconstructed stage durations or a stale entry instant.

## Notes

One suite run found two failures. One (vitest-global-setup.spec.ts's migration-count check) was
an artifact of this delivery's worktree sharing a remote test database with the
consolidation-call-record-chain-hotfix delivery's own migration, resolved by removing that
migration's tracking row from the shared database -- unrelated to this task's own code, not
disclosed as a test/code finding. The other (a pre-existing run-diagnosis.spec.ts test asserting
the old duration-summing bug's own behavior) was diagnosed cause `test` and corrected above. A
second suite run passed clean, 141 files / 1662 tests.
