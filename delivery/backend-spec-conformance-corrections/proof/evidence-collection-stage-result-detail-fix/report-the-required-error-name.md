---
title: unavailableEvidence result_detail matches its rule and the adapter's own path
summary: Tests that evidence-collection-stage.ts's unavailableEvidence() records result_detail as exactly
  "CapabilityNotResolvedForObservationError", and that this value is identical, character for character,
  to what http-declarative-observation-source.adapter.ts's own resolveCapability path records for the
  identical unresolved-capability condition — correcting one existing test that still asserted the free-text
  sentence the fix replaced.
implementation: sha256:a5309e46edd82fdad8691efd12de882b8ccf71921050364380db5706edc40468
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/evidence-collection-stage-result-detail-fix-report-the-required-error-name-suite
tests:
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: records a concept nothing currently answers as unavailable, carrying result_detail exactly equal
    to "CapabilityNotResolvedForObservationError", and never attempts to call observe-concept for it (rules/integration/an-unresolvable-observation-ends-unavailable)
  proves: Given a case whose collection plan names a concept no registered capability currently answers,
    the Evidence unavailableEvidence() records for it carries result_detail exactly equal to "CapabilityNotResolvedForObservationError".
  fails_when: unavailableEvidence() records result_detail as anything other than the exact string "CapabilityNotResolvedForObservationError"
    — the free-text sentence it used to carry, an empty value, or no result_detail at all.
- file: src/__tests__/unit/investigation/evidence-collection-stage.spec.ts
  name: 'reports the same result_detail, character for character, whichever of the two paths reaches the
    unresolved-capability condition: the collection stage''s own pre-check, reached through collectEvidence(),
    against http-declarative-observation-source.adapter.ts''s own later-resolution path, reached directly
    through observeConcept()'
  proves: Given the same scenario reached through the collection stage's own pre-check (capabilities.readCapability(concept)
    resolving unheld before observe-concept is ever called), the recorded result_detail is identical,
    character for character, to what http-declarative-observation-source.adapter.ts's own resolveCapability
    path already records for the same condition.
  fails_when: the collection stage's own recorded result_detail differs, in any character, from what HttpDeclarativeObservationSource.observeConcept()
    answers as result_detail for the identical unresolved-capability condition — e.g. the stage restates
    its own literal instead of reading the same class's .name the adapter reads, or either path's wording
    changes independently of the other.
not_applicable:
- edge_case: absent or empty concept name
  why: neither criterion states a range or shape for the concept string; the condition under test is fixed
    (a concept no capability currently answers), not a property of the concept's own text, and no bound
    node gives this task a boundary to test at.
- edge_case: an empty collection plan
  why: collectEvidence's own handling of zero concepts is unchanged by this task and already outside what
    its two criteria state; introducing a new assertion over it here would test behavior this corrective
    task never touched.
- edge_case: a duplicate concept, or more than one capability answering it
  why: that is a different condition (DuplicateConceptAnswerError), already covered by the existing it.each
    block above these tests and untouched by this task — this task's criteria name only the no-capability-currently-answers
    condition.
- edge_case: operation against state that forbids it
  why: this is exactly the scenario both criteria describe — a concept no registered capability currently
    answers — and it is what both new tests exercise directly.
- edge_case: a dependency that fails or answers slowly
  why: deriving CapabilityNotResolvedForObservationError's own .name is synchronous and deterministic,
    reading a string literal set once in the error class's own constructor; no dependency call is on the
    path either criterion describes.
- edge_case: two operations against one subject at once
  why: neither criterion states or implies concurrent behavior; the second test's own two calls (the stage's
    and the adapter's) are sequential and independent, comparing two separately-produced values rather
    than exercising concurrency.
untested:
- 'the implementation record''s own inference — that the class''s own name is read by instantiating CapabilityNotResolvedForObservationError(concept)
  and taking .name, rather than writing the literal string directly — has no separate test, because it
  is not an observable difference: both approaches produce the identical result_detail string, and a test
  can only assert what collectEvidence() returns, never which of the two ways the source arrived at that
  string. The first test above already pins the resulting value, which is the whole of what any test could
  observe about this choice.'
---

## What it is

Two unit tests proving unavailableEvidence() reports the rule's required error name, and that it agrees character for character with the adapter's own path for the identical condition.

## Notes

None.
