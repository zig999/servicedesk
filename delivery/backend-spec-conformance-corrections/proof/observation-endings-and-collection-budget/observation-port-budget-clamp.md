---
title: Observation port budget clamp — proof
summary: Four new tests on the production HTTP adapter's fake-timer-driven settling prove the two criteria
  — a smaller remaining-budget bound governs the call over a capability's own longer timeout, and a capability's
  own timeout governs it wherever the given bound is equal to or larger than it — while every pre-existing
  assertion in the files the implementation touched for compilation stays unread and unchanged.
implementation: sha256:a227537131f2b3dcf54ea049899d161fabdf596c5ca8ca01c0b50aa5027e2250
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/observation-endings-and-collection-budget-observation-port-budget-clamp-suite-3
tests:
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: bounds its call by the caller's own smaller remaining-budget bound, settling to timeout before
    the capability's own longer declared timeout would have elapsed
  proves: Criterion 1 — given a remaining-budget bound smaller than the capability's own declared timeout,
    the HTTP call the adapter issues is bounded by the remaining-budget value, not the capability's own
    timeout.
  fails_when: effectiveTimeoutMsFor ignores remainingBudgetMs and applies capability.timeout alone — the
    call would still be pending at the 200ms mark this test asserts settlement at, since the capability's
    own declared timeout is 5000ms
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: remains bounded by the capability's own declared timeout when the caller's given remaining-budget
    bound is larger, not waiting for that larger bound to elapse
  proves: Criterion 2 (the 'above' half) — given a remaining-budget bound above the capability's own declared
    timeout, the HTTP call remains bounded by the capability's own timeout.
  fails_when: effectiveTimeoutMsFor applies remainingBudgetMs whenever it is given, regardless of which
    is smaller — the call would still be pending at the 150ms mark this test asserts settlement at, since
    the given bound is 5000ms
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: remains bounded by the capability's own declared timeout when the caller's given remaining-budget
    bound equals it exactly, the shared boundary 'at or above' names
  proves: Criterion 2's own stated boundary word 'at' — a remaining-budget bound exactly equal to the
    capability's own timeout still leaves the call bounded by that shared value, settling at 250ms and
    not a moment before.
  fails_when: the clamp fires strictly before 250ms or strictly after it
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: resolves to timeout immediately when the remaining-budget bound is zero, the lower boundary, even
    though the capability declares a much longer timeout of its own
  proves: Criterion 1's lower boundary — an exhausted (zero) remaining budget clamps the call to zero,
    not to the capability's much longer declared timeout of 5000ms.
  fails_when: effectiveTimeoutMsFor treats 0 as falsy/absent and falls back to capability.timeout — the
    outcome would still be pending, not resolved, at the 0ms mark this test asserts settlement at
not_applicable:
- edge_case: A negative remainingBudgetMs
  why: nothing in the port's own contract, the rule it implements, or the task's criteria states this
    as a value a caller may legitimately hand in — remainingBudgetMs is documented as whatever of the
    budget the caller still has left, which is never negative by construction of the caller that will
    supply it
- edge_case: Two concurrent observeConcept calls carrying different remainingBudgetMs values interfering
    with each other
  why: effectiveTimeoutMsFor is a pure module-level function closing over no shared state, and the pre-existing
    concurrent-call test already establishes that two calls settle independently from their own inputs
untested:
- FakeObservationSource.observeConcept destructures {concept, subject} and never reads remainingBudgetMs
  at all — accepted but silently unused, per the implementation record's own effect note. This task's
  two criteria are both stated over the HTTP call the adapter issues, i.e. the production HTTP adapter
  specifically, not the fixture-driven fake, so no test of this task's own proves or needs to prove the
  fake's non-behavior here.
- A caller omitting remainingBudgetMs entirely (the field's own documented default posture, unchanged
  by this task) is not covered by a new test this delivery adds — it is already exercised by this same
  file's own pre-existing criterion tests, which call observeConcept with no remainingBudgetMs field and
  already assert settlement tracks capability.timeout alone.
---

## What it is

Four tests over the production adapter's fake-timer-driven settling, proving the remaining-budget clamp at, below and above the capability's own declared timeout, plus the zero-budget lower bound.

## Notes

First suite attempt (run/observation-endings-and-collection-budget-observation-port-budget-clamp-suite) failed on the same pre-existing domain-boundary false positive as the sibling task, fixed by task/domain-boundary-scan-fix/narrow-bypass-mention-scan (cause: test, diagnosed by failure-diagnostician). Second attempt (-suite-2) failed on two unrelated real-database hook timeouts in files outside this task's own set (cause: setup, diagnosed by failure-diagnostician). Third attempt (-suite-3) passed clean.
