---
title: Proof for the cockpit's staleness citation bind
summary: The three existing tests in use-case-simulation-cockpit-staleness.spec.ts remain the whole proof
  of the return-mount behavior the two nodes govern; the criterion asking for a test that directly proves
  history.markLastRunStale() itself was invoked is left unmet, disclosed here rather than satisfied by
  a technique the project's own standard forbids.
implementation: sha256:5153d4a7deb9e8ca3609adca1c0af2c3755f20e715f4e43618dd765d11b36fa4
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/simulation-staleness-binding-bind-cockpit-staleness-citations-and-proof-suite
tests:
- file: src/hooks/use-case-simulation-cockpit-staleness.spec.ts
  name: invalidates no query on this cockpit's first mount for a slug/version this tab has not visited
    before
  proves: a first mount for a never-visited slug/version is never treated as a return (criterion 6's negative
    case)
  fails_when: a first-visit mount ever calls queryClient.invalidateQueries
- file: src/hooks/use-case-simulation-cockpit-staleness.spec.ts
  name: invalidates exactly the version's own case-version query, keyed the same way use-case-simulation-version.ts
    reads it
  proves: a second mount for the same slug/version is treated as a return and invalidates exactly the
    ["case-version", slug, version] query
  fails_when: a return mount invalidates no query, invalidates the wrong key, or invalidates more than
    one query
- file: src/hooks/use-case-simulation-cockpit-staleness.spec.ts
  name: starts a return mount's own Case result run history empty, even though the earlier mount had already
    recorded a completed run
  proves: the disclosed limitation itself -- useCaseSimulationHistory's run list is component-scoped,
    so a genuine unmount/remount resets it to empty before markLastRunStale has anything left to mark
  fails_when: caseResultRuns on the return mount is non-empty, or carries the earlier mount's run
untested:
- The staleness spec suite includes a test proving that a return mount for a previously-visited slug/version
  invokes history.markLastRunStale() as an assertion distinct from the existing invalidate-queries assertion
  -- the return-detection effect fires exactly once, synchronously after a fresh instance's first commit,
  at which point that instance's own useCaseSimulationHistory() run list is unconditionally empty (a fresh
  useState([]) every mount), and markLastRunStale on an empty list is a documented no-op; the disclosed-limitation
  test above already establishes a genuine return mount's own run history is always empty at that moment,
  so there is no reachable configuration of this hook's real, public behavior in which the call's effect
  is observable through caseResultRuns or any other returned field. Proving the call itself happened requires
  intercepting history.markLastRunStale by mocking ./use-case-simulation-history, which TST-01 and TST-03
  forbid for this file, and which use-case-simulation-cockpit.test-support.ts's own header comment states
  explicitly does not extend to this hook's own composition logic.
contested:
- what: The task's own criterion literally asks for proof that history.markLastRunStale() was invoked
    as an internal call, distinct from invalidateQueries.
  why: the implementation is not believed to be wrong -- the call is exactly where the header comment
    says it is, and the disclosed limitation is honestly stated -- but the criterion, as worded, is not
    satisfiable by a test that also respects this project's own TST-01 ("never a component's internal
    state or a private method") and TST-03 ("a stand-in replaces a boundary the component does not own
    ... and never the component's own rendering logic"), given the architecture genuinely makes the call's
    effect unobservable on every reachable real mount. No test that violates those rules was written to
    force the letter of the criterion; the gap is recorded in `untested` instead.
---

## What it is

The proof record for task/simulation-staleness-binding/bind-cockpit-staleness-citations-and-proof.
The three pre-existing tests in use-case-simulation-cockpit-staleness.spec.ts are unmodified and
still hold up the return-mount behavior the two bound nodes govern; no new test was added.

## Notes

The one criterion this proof leaves unmet is contested rather than silently accepted as
undone: writing a test that intercepts history.markLastRunStale() directly is the only way to
observe the call apart from its (always-empty, per the disclosed limitation) effect, and doing so
would depart from this project's own TST-01/TST-03. This disagreement is a person's to settle,
through the scope or through the standard, and is left open here rather than resolved by
weakening either the test or the standard.
