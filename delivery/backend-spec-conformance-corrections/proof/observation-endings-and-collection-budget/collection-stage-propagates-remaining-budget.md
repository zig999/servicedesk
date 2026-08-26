---
title: Proof for collection stage propagates its remaining budget into observe-concept
summary: Three tests on evidence-collection-stage.spec.ts assert the exact remainingBudgetMs value the
  stage sends across the observation-source port on every call, reproducing the propagation failure the
  sibling task's local race alone cannot surface.
implementation: sha256:0d037266e683312a51a454906fcdec6c4c55f86ed22f97241d6472bbeae37ac4
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/observation-endings-and-collection-budget-collection-stage-propagates-remaining-budget-suite
tests:
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: propagates the stage's own seven-second budget as observe-concept's remaining-budget bound for
    every concept, rather than leaving a capability's own longer declared timeout to reach the call ungoverned
    (rules/investigation/collection-has-its-own-budget-within-the-total)
  proves: A capability declaring a ten-second timeout, collected while the stage's seven-second budget
    is still fully available, ends at seven seconds with result timeout, unaffected by the three seconds
    its own declared timeout still had left.
  fails_when: collectOneEvidence's call to observationSource.observeConcept stops sending remainingBudgetMs
    (leaving it undefined) or sends any value other than the stage's own seven-second ceiling — the exact
    regression named by the task, under which a capability's own longer declared timeout would reach a
    real adapter's effectiveTimeoutMsFor ungoverned by the stage's budget, since Math.min(capability.timeout,
    undefined) is not what that function computes and it would fall back to the capability's own full
    timeout. Also asserted for a second concept whose capability declares a shorter timeout, so the propagated
    value is shown to be the stage's own ceiling rather than derived per-concept from each capability.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: propagates the smaller, deadline-derived ceiling as remaining-budget when the propagated deadline
    is nearer than the nominal seven seconds, rather than the nominal figure or the capability's own timeout
  proves: A capability declaring a ten-second timeout, collected while the stage's seven-second budget
    is still fully available, ends at seven seconds with result timeout, unaffected by the three seconds
    its own declared timeout still had left.
  fails_when: the value handed to observeConcept as remainingBudgetMs is a hardcoded seven seconds rather
    than the stage's own computed stageCeilingMs, or is the capability's own declared timeout, when the
    propagated deadline leaves less than seven seconds.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: propagates zero as remaining-budget, never undefined or a negative value, once the propagated
    deadline has already elapsed by the time the stage starts
  proves: A capability declaring a ten-second timeout, collected while the stage's seven-second budget
    is still fully available, ends at seven seconds with result timeout, unaffected by the three seconds
    its own declared timeout still had left.
  fails_when: the propagated value is undefined, negative, or anything other than the zero-clamped stageCeilingMs
    once the deadline has already elapsed, exercising the low boundary of the range this task's propagation
    covers, mirroring the pre-existing local-race test for that same boundary.
---

## What it is

Tests assert the exact remainingBudgetMs value the collection stage sends to observe-concept on every call, for the nominal, deadline-narrowed and already-elapsed cases.

## Notes

This task's second criterion — the investigation proceeds without waiting past the seven-second budget — is proven by two pre-existing tests already in evidence-collection-stage.spec.ts ("records a timeout at the stage's own seven-second ceiling for a capability declaring ten seconds..." and "runs every concept in parallel: a slow capability that has to time out never adds its own bound to a fast sibling's completion time..."), over a mechanism (raceObservation's local timer) this task's implementation record states is unchanged. No new test was written for it, to avoid re-pinning behavior nobody moved.
