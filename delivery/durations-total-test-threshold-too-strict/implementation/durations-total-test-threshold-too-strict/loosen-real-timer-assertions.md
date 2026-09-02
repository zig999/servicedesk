---
title: Loosen two real-timer test assertions to tolerate 1ms-resolution near-misses
summary: Loosens diagnose-server.factory.spec.ts's durations_total-vs-stage-sum assertion from strict
  greater-than to greater-than-or-equal, and anthropic-hypothesis-evaluator.adapter.spec.ts's rejected-call
  elapsed_ms floor from 15 to 14, with no other line in either file and no production file touched.
task: sha256:5f4997f17a6fcde0a7896c2174b909186f1ff57bfb1ce463131c7a1ab0037a2b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/durations-total-test-threshold-too-strict-loosen-real-timer-assertions-build
files:
- path: src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  effect: Changed the single assertion expect(written?.durations_total).toBeGreaterThan(...) to toBeGreaterThanOrEqual(...)
    against the same stage-sum expression. Every other line in the file, including the test's other three
    assertions and the test's own descriptive title string, is unchanged.
- path: src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  effect: Changed the single assertion expect(outcome.elapsed_ms).toBeGreaterThanOrEqual(15) to toBeGreaterThanOrEqual(14)
    in the test covering a provider call that rejects after a real 15ms setTimeout. No other line in the
    file is changed.
criteria:
- criterion: diagnose-server.factory.spec.ts's "persists real, non-zero cost and durations for the judgment
    and consolidation calls" test no longer asserts durations_total strictly greater than the sum of durations_collection,
    durations_judgment and durations_writing -- it asserts durations_total is greater than or equal to
    that sum, since domain/investigation/durations states only that total is never derived as that sum,
    not that its value must exceed it.
  met: true
  how: The assertion at that test now reads expect(written?.durations_total).toBeGreaterThanOrEqual(...)
    against the unchanged stage-sum expression.
- criterion: The same test's other assertions -- durations_judgment and durations_writing each greater
    than or equal to MOCK_RESPONSE_DELAY_MS, and durations_collection greater than 0 -- are unchanged;
    none of the three failed in the three runs that surfaced this defect, and rules/investigation/a-measured-duration-below-one-millisecond-is-zero
    states that a measured 0 is itself a legitimate reading for a genuine sub-millisecond span, so nothing
    here treats 0 as inherently invalid -- only total's own strict inequality against the stage sum is
    loosened.
  met: true
  how: Only the one line naming durations_total's comparator was touched; the three other expect(...)
    lines in the same test body are byte-identical to what they were before this edit.
- criterion: anthropic-hypothesis-evaluator.adapter.spec.ts's "reports elapsed_ms and the exact prompt
    sent, but never invents a usage field, when the provider call itself throws before any response arrives"
    test no longer fails when the measured elapsed_ms lands one millisecond below the mocked delay's own
    nominal value.
  met: true
  how: The floor changed from toBeGreaterThanOrEqual(15) to toBeGreaterThanOrEqual(14), admitting a measured
    14ms for the mock's own 15ms setTimeout-then-reject delay.
- criterion: Neither test's loosened assertion is weakened to the point of no longer failing where the
    measured value would indicate the call or stage never ran at all (an entirely missing measurement,
    or a value far below what the test's own mocked delay would produce) -- each retains a lower bound
    wide enough to admit a genuine 1ms-resolution near-miss but not an absent or wildly wrong measurement.
  met: true
  how: The durations_total assertion still fails if total were recorded below the stage sum at all; it
    only stops failing on exact or near-equal parity with the sum. The elapsed_ms assertion still fails
    on undefined, null, 0, or any value below 14 against a mock that runs for 15ms.
- criterion: No file under src other than the two named test files is modified by this task.
  met: true
  how: Only the two files listed under files above were opened for writing; no production file, configuration
    file or third test file was touched.
- criterion: The full suite (src/__tests__/integration/factories/diagnose-server.factory.spec.ts and src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
    included) passes on ten consecutive real-timer runs with no failure in either test.
  met: true
  how: Verified by the orchestrating session running the suite repeatedly via bin/run.py after this record
    was composed (see the proof record's own run).
nodes:
- node: domain/investigation/durations
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  how: The node states total "is never the sum of collection, judgment and writing" but never states total's
    value must exceed that sum -- it describes total as the whole call's own real elapsed time, independently
    measured, which can legitimately land at or arbitrarily near the stage sum on a fast run. The loosened
    assertion (>= instead of >) matches exactly this.
- node: domain/investigation/evaluation
  encoded_at:
  - src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  how: The node describes elapsed_ms as present "exactly when a call happened" and as "how long the call
    took" for that call -- the loosened floor of 14 still requires a value close to that span rather than
    accepting an absent or near-zero one.
- node: rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  encoded_at:
  - src/__tests__/integration/factories/diagnose-server.factory.spec.ts
  - src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  how: The rule establishes that the clock resolves whole milliseconds and that a sub-millisecond span
    legitimately reads lower than its true duration without that being an invented or invalid measurement
    -- the direct justification for both loosenings.
inferences:
- inferred: The literal 14 needs no named constant despite the standard's TYP-04, because the same file
    already carries unnamed literal delays used the identical way for the identical purpose (15 and 20
    as raw milliseconds), and this task's own criteria forbid touching any other line in either file.
  from: The pre-existing unnamed literals 15 (at the exact assertion this task edits) and 20 (three tests
    above it) already present in anthropic-hypothesis-evaluator.adapter.spec.ts.
preserved:
- diagnose-server.factory.spec.ts's assertions that durations_judgment and durations_writing are each
  greater than or equal to MOCK_RESPONSE_DELAY_MS, and that durations_collection is greater than 0.
- Every other test in both files, and every other line of the two edited tests' own bodies.
deferred:
- what: diagnose-server.factory.spec.ts's it()-title still reads "...with durations_total exceeding the
    sum of the three stage figures since it measures the whole pipeline's own real elapsed time," which
    now overstates what the loosened assertion (>=) actually requires.
  why: 'The task''s criteria and its ## Notes name only the one assertion expression to change and explicitly
    instruct leaving the test''s other content untouched; rewording the test''s own descriptive title
    is not among the two edits enumerated and would widen this task beyond what it was cut to do.'
---

## What it is

Loosens two pre-existing test assertions that demanded a stricter real-timer millisecond guarantee
than domain/investigation/durations actually makes, so they stop failing on a fast run where the
genuine sub-millisecond overhead between stages is invisible at 1ms clock resolution.

## Notes

Deferred: diagnose-server.factory.spec.ts's test title still describes the old (incorrect) strict
guarantee -- left as-is since only the one assertion was in scope.
