---
title: Proof for the evidence-collection stage — parallel, budgeted, scoped observation over a case's plan
summary: Tests collectEvidence's five stated criteria plus the boundary, parallelism and rejection-propagation edge cases against a fake capability query, a scripted observation source and a delayed capability query, all under vitest fake timers so the stage's own internal setTimeout race is controlled deterministically.
implementation: sha256:9898101349202c19c9237fa0f57116f2d0ae1d25a28a48e91105c6b64f73dfaa
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:5bafeda7dbeb412de7d1cd74d5de75a5b6094735f3be751d451aec2adf300300
run: run/evidence-collection-evidence-collection-stage-suite
tests:
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: produces exactly one evidence per concept in the collection plan, deduplicating a concept two hypotheses both collect, each carrying its resolved capability and the stage own now as observed_at
  proves: Every concept in the case's collection plan produces exactly one Evidence, and no concept produces more than one — plus the implementation record's inferences on evidence.inputs' serialization, ttl's uniform default, and observed_at being the stage's own now sampled once.
  fails_when: collectEvidence produces more than one Evidence for a concept two hypotheses both collect, drops a concept, misassigns which capability's reference/origin/observation lands on which concept, or the serialized inputs, the default ttl, or the observed_at basis differs from what the record states it inferred.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: records a denied ending as the evidence result with an empty observation, rather than throwing and aborting the stage
  proves: A non-ok ending (unavailable, denied or timeout) is recorded as the evidence's result and never raised as a thrown failure that aborts the stage, the denied case, plus the inference that a non-ok result's observation is the empty string, never a fabricated value.
  fails_when: a denied ending throws instead of resolving into the stage's result array, or the resulting evidence carries anything other than the empty string for observation.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: records a concept nothing currently answers as unavailable, naming the concept, and never attempts to call observe-concept for it
  proves: the inference that a concept whose capability is not currently held is recorded as evidence-result 'unavailable' with a result_detail naming the concept, capability_name/capability_version empty, and origin empty, and that observe-concept is never called for it.
  fails_when: the stage still calls observe-concept when no capability is held, or records anything other than 'unavailable' with the empty capability-reference fields and a detail naming the concept.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: records a timeout at the stage's own seven-second ceiling for a capability declaring ten seconds, unaffected by the three seconds its own declared timeout still had left (scenarios/investigation/a-slow-capability-yields-to-the-collection-budget)
  proves: A capability whose observation has not returned by the collection stage's own budget (or whatever remains of the propagated deadline, whichever is smaller) is recorded as evidence with result timeout at that mark, never waiting for the capability's own longer declared timeout, reproduced with the scenario's own exact numbers.
  fails_when: the stage waits for the capability's own ten-second declared timeout instead of its own seven-second ceiling, or records a bound other than exactly 7000ms.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: records a timeout at a ceiling smaller than the nominal seven seconds when the propagated deadline is nearer
  proves: the same timeout criterion where the propagated remaining time, not the nominal seven-second budget, is the smaller figure, the collection ceiling shrinking to whatever the deadline still allows.
  fails_when: the stage ignores the nearer propagated deadline and uses the full nominal seven-second budget regardless.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: clamps the effective bound to zero, timing out immediately, once the propagated deadline has already elapsed by the time the stage starts
  proves: the lower boundary of the effective-bound range, Math.max(0, ...), where the propagated deadline is already behind now.
  fails_when: a negative remaining time is not clamped to zero, e.g. it throws from a negative timer delay or waits far longer than immediately before timing out.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: carries the requester unmodified into every observe-concept call, never a substituted or defaulted value
  proves: Every observation call carries the requester's own scope, never the service's.
  fails_when: any call substitutes, defaults or omits the requester actually passed to collectEvidence.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: calls observe-concept exactly once for each concept in the plan, never more
  proves: Collection calls observe-concept once per concept, the once-per-concept half of the criterion.
  fails_when: any concept's observe-concept is called more than once, or a held concept's call is skipped entirely.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: 'runs every concept in parallel: a slow capability that has to time out never adds its own bound to a fast sibling''s completion time, and both still complete correctly'
  proves: Collection calls observe-concept ... in parallel, never serially, the parallel half of the criterion, and the edge case that a slow concept never delays a fast sibling's own settling, with both still completing.
  fails_when: the two concepts are dispatched or awaited one after another, so the stage takes the sum of both bounds (5100ms) rather than the larger of the two (5000ms) to complete, or the slow concept's hang blocks the fast one's own evidence from ever being recorded.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: propagates a genuine rejection from observe-concept rather than swallowing it as a non-ok evidence
  proves: the inference that a genuine rejection from observe-concept (as opposed to the stage's own deadline-derived timeout) is left to propagate, never caught and turned into a non-ok Evidence.
  fails_when: the stage catches the rejection and resolves with a non-ok Evidence instead of letting collectEvidence's own promise reject.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: keeps the effective observation bound at the stage's own fixed seven-second ceiling, unaffected by how long the capability-registry read itself took
  proves: the inferences that stageCeilingMs is computed once at the stage's own start and reused unchanged, and that the capability-registry's own readCapability call is not itself raced or charged against the collection ceiling.
  fails_when: the effective bound is computed from time remaining at the moment observe-concept is actually called (charging the capability-registry read against the collection budget) rather than from the fixed ceiling established at the stage's own start, which would time out at a different, shorter mark.
not_applicable:
- edge_case: an empty collection plan (a case whose hypotheses collect nothing)
  why: rules/knowledge/a-case-has-at-least-one-hypothesis and rules/knowledge/a-hypothesis-collects-at-least-one-concept together guarantee collectionPlan(theCase) is never empty for any Case this stage can be given; constructing an empty plan would require an already-invalid Case the type and the upstream case-model validation exclude, so a test over it would prove nothing this stage itself decided.
- edge_case: two or more collectEvidence calls running at once, against the same or different subjects
  why: the stage holds no module-level or shared mutable state, stageCeilingMs, the concept list and every Evidence are derived solely from that one call's own options object, so two concurrent calls have nothing to contend over; a test asserting non-interference would only reprove that a closure captures its own local bindings, a language guarantee rather than behavior this task decided.
- edge_case: an empty-string or otherwise degenerate requester value
  why: no bound node constrains the requester's own shape, only that whatever value it carries passes through unmodified, already proven for a representative value by the requester-passthrough test; a second test over an empty string would prove the identical passthrough mechanism a second time.
- edge_case: the capability-registry's own readCapability rejecting (e.g. an inconsistent registry answering a duplicate-concept-answer fault)
  why: collectOneEvidence wraps neither call in a catch, so a rejection there propagates through the exact same unguarded path a rejection from observe-concept already does, proven by the rejection test, and the registry read's own correctness is, per the implementation record's own inference, the already-delivered capability-registry's concern, outside this task.
- edge_case: an observation-source answering a shape outside the four declared evidence-result endings (a malformed or garbage outcome)
  why: nothing in the port's contract or this task's criteria requires this stage to validate what its own dependency answers beyond what TypeScript's static types enforce for a conforming caller; the two cases the specification and criteria actually name, one of the four endings, or a genuine rejection, are both proven.
untested:
- Whether the collection stage's own seven-second ceiling is computed exactly once and literally reused, rather than incidentally recomputed to the same value on each read, is not independently distinguishable by any black-box test, since the module takes no clock reads of its own at all. The fixed-ceiling test (against a slow capability-registry read) shows the ceiling does not shrink from elapsed wall time during that read, which is the closest black-box approximation of this inference, but it does not rule out a semantically-identical recomputation elsewhere in the stage.
- 'The port-answered ''unavailable'' ending from a held capability (as opposed to the no-capability-held case, which is tested) is not separately exercised: it runs through the exact same generic non-ok branch as the denied ending already proven, so a dedicated third test over it would repeat that same code path rather than exercise anything new.'
---

## What it is

Unit tests proving the evidence-collection stage's five criteria across capability resolution, the observe-concept race against the collection ceiling, parallelism and rejection propagation.

## Notes

None.
