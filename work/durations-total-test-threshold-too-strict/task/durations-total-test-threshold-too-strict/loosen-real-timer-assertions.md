---
title: Loosen two real-timer test assertions to tolerate 1ms-resolution equality and near-misses
summary: Changes diagnose-server.factory.spec.ts's strict durations_total > stage-sum assertion to >=,
  and anthropic-hypothesis-evaluator.adapter.spec.ts's hard elapsed_ms >= 15 threshold to tolerate the
  same class of 1ms-resolution near-miss, without changing any production code.
objective: Both named tests pass reliably on real timers across at least ten consecutive runs, with no
  change to any file under src other than the two test files themselves.
criteria:
- diagnose-server.factory.spec.ts's "persists real, non-zero cost and durations for the judgment and consolidation
  calls" test no longer asserts durations_total strictly greater than the sum of durations_collection,
  durations_judgment and durations_writing -- it asserts durations_total is greater than or equal to that
  sum, since domain/investigation/durations states only that total is never derived as that sum, not that
  its value must exceed it.
- The same test's other assertions -- durations_judgment and durations_writing each greater than or
  equal to MOCK_RESPONSE_DELAY_MS, and durations_collection greater than 0 -- are unchanged; none of the
  three failed in the three runs that surfaced this defect, and rules/investigation/a-measured-duration-below-one-millisecond-is-zero
  states that a measured 0 is itself a legitimate reading for a genuine sub-millisecond span, so nothing
  here treats 0 as inherently invalid -- only total's own strict inequality against the stage sum is
  loosened.
- anthropic-hypothesis-evaluator.adapter.spec.ts's "reports elapsed_ms and the exact prompt sent, but
  never invents a usage field, when the provider call itself throws before any response arrives" test
  no longer fails when the measured elapsed_ms lands one millisecond below the mocked delay's own nominal
  value.
- Neither test's loosened assertion is weakened to the point of no longer failing where the measured
  value would indicate the call or stage never ran at all (an entirely missing measurement, or a value
  far below what the test's own mocked delay would produce) -- each retains a lower bound wide enough to
  admit a genuine 1ms-resolution near-miss but not an absent or wildly wrong measurement.
- No file under src other than the two named test files is modified by this task.
- The full suite (src/__tests__/integration/factories/diagnose-server.factory.spec.ts and src/__tests__/unit/investigation/anthropic-hypothesis-evaluator.adapter.spec.ts
  included) passes on ten consecutive real-timer runs with no failure in either test.
implements:
- domain/investigation/durations
- domain/investigation/evaluation
- rules/investigation/a-measured-duration-below-one-millisecond-is-zero
sources:
- intake/scope.md
---

## What it is

Loosens two pre-existing test assertions that demanded a stricter real-timer millisecond guarantee
than domain/investigation/durations actually makes, so they stop failing on a fast run where the
genuine sub-millisecond overhead between stages is invisible at 1ms clock resolution.

## Notes

REMAINDER, from the specification — rules/investigation/a-measured-duration-below-one-millisecond-is-zero's clause on an evidence item's own elapsed_ms reaches no criterion of this task, since neither named test asserts anything about evidence's own elapsed_ms.
Decision, beyond the covers — stand: domain/investigation/evidence is not claimed in implements — this task's file set never reads or asserts an evidence item's elapsed_ms.
REMAINDER, from the specification — the invariant's final clause ("no measured duration is ever raised to one millisecond to avoid recording a zero") constrains production code, which this task's own criteria forbid touching; it belongs to whichever task delivers or re-delivers that production code.
ADVISORY, from the binder — criterion 2 preserves durations_collection's existing `greater than 0` assertion on empirical grounds (it did not fail in the three runs that surfaced this defect), even though rules/investigation/a-measured-duration-below-one-millisecond-is-zero permits a genuine 0 for that same stage figure. If that assertion later flakes for the identical reason total's did, the criterion — not the implementation — is what needs to change.
