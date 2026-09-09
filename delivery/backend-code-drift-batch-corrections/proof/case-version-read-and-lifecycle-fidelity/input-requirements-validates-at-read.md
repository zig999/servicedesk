---
target: backend
title: readCaseInputRequirements revalidates at every read, excluding capability availability — proof
summary: Three tests over CaseQueryService prove the narrowed coherence gate refuses a stored version
  whose structural or glossary/concept rules fail, exactly as read-case does, while a concept whose answering
  capability disappears folds into no attribute rather than refusing, and replayCase's stated exception
  stays untouched.
implementation: sha256:70755bf7f2b037f2c0393e67beafd1896e35e6a07741b4a0f7145b8fb2d2491f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:4050ccb93004dfd5a71749b73d5d0a5e09de427ccddf202095ecbd7e6db18898
run: run/case-version-read-and-lifecycle-fidelity-input-requirements-validates-at-read-suite-3
tests:
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: refuses a draft version's input requirements once a coherence rule stops holding for its collected
    concept, the same CaseVersionNotValidError read-case itself throws for the identical content
  proves: Criteria 1 (the glossary/concept portion of the shared check), 2 and 5 -- readCaseInputRequirements
    refuses a stored version whose glossary/concept coherence fails at that reading, the same CaseVersionNotValidError
    class and violation text read-case throws for the identical content, and that refusal is not a CaseNotFoundError.
  fails_when: readCaseInputRequirements resolves with a CaseInputRequirementsResult instead of refusing
    for this content, or refuses with anything other than a CaseVersionNotValidError carrying this slug,
    version and violation, or refuses with CaseNotFoundError instead.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: folds a concept whose answering capability is later forgotten into no attribute for that concept,
    rather than refusing the read — the derivation node's own carve-out for capability availability, which
    this method's gate deliberately leaves to deriveCaseInputRequirements instead of refusing over
  proves: 'The corrected inference the implementation record states: readCaseInputRequirements''s gate
    excludes the capability-availability check (capabilityViolations) that readCase''s own gate still
    runs, because rules/knowledge/a-case-versions-input-requirements-are-derived requires a concept with
    no (or more than one) currently answering capability to contribute no attribute rather than fail the
    read. It proves the remove direction (an answering capability forgotten narrows requirements to none,
    without refusing), complementing the pre-existing, unmodified fresh-read test that proves the add
    direction.'
  fails_when: readCaseInputRequirements throws instead of resolving once the concept's sole answering
    capability is forgotten, or resolves with anything other than an empty requirements list for that
    concept.
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: leaves replayCase unrevalidated by this change — a replay still answers the pinned version's content
    even though the same content now fails readCaseInputRequirements's coherence check, honoring the specification's
    own stated replay exception rather than extending validation onto it
  proves: 'The task''s own UNDERDETERMINED note: an implementation that also revalidated a replay''s read
    of its pinned version, refusing it, would satisfy every stated criterion of this task while contradicting
    rules/knowledge/validation-runs-at-every-read''s own express replay exception. This test fails over
    exactly that candidate.'
  fails_when: replayCase itself starts refusing (or otherwise revalidating) the same pinned version this
    test shows readCaseInputRequirements refuses.
not_applicable:
- edge_case: two reads of readCaseInputRequirements for the same version running concurrently
  why: no criterion or bound node states a concurrency guarantee for this read path; a test would assert
    a guarantee nobody made.
- edge_case: an absent, non-numeric or out-of-range version segment at the HTTP boundary
  why: this is the route's own input-shape validation (already refused at 400 before the query is ever
    reached), unrelated to and unaffected by the validator-rule check this task adds; it is proven by
    the pre-existing, unmodified case-input-requirements.routes.spec.ts.
- edge_case: a duplicate stored version for one slug
  why: no uniqueness invariant is at stake in this task; the case-store assigns versions and that invariant
    belongs to the write path, not this read-time check.
- edge_case: a capability-registry integrity failure (e.g. DuplicateConceptAnswerError from capabilities.readCapability)
    reaching readCaseInputRequirements
  why: withdrawn after re-tracing the corrected call path. refuseGlossaryIncoherence never calls capabilities.readCapability
    at all (it composes only vocabularyViolations and conceptViolations), and deriveCaseInputRequirements
    reads the registry solely through the paginated everyRegisteredCapability/listCapabilities, never
    readCapability. rules/knowledge/a-case-versions-input-requirements-are-derived requires exactly this
    exclusion, so an integrity failure raised only by readCapability has no path left into readCaseInputRequirements
    after the correction -- it remains reachable only through readCase, already proven by the pre-existing,
    unmodified test over readCase in this same file. A test asserting this failure through readCaseInputRequirements
    would now be vacuous.
---
## What it is
Three tests prove readCaseInputRequirements's corrected coherence gate: a glossary/concept coherence failure still refuses it exactly as read-case refuses, a concept whose answering capability disappears folds into no attribute instead of refusing (the derivation node's own carve-out), and replayCase stays untouched by the new gate, per the task's own UNDERDETERMINED note.
A fourth candidate test, over a capability-registry integrity failure reaching readCaseInputRequirements, was withdrawn to not_applicable after tracing the corrected call path: that failure can no longer reach this method once the capability-availability check was excluded from its gate.
## Notes
run/case-version-read-and-lifecycle-fidelity-input-requirements-validates-at-read-suite failed one pre-existing test (case-query.service.spec.ts's capability-freshness test) against a first version of the implementation that ran the identical caseCoherenceViolations readCase runs, including capability-availability; a failure-diagnostician read the run and returned cause=code, since that version contradicted rules/knowledge/a-case-versions-input-requirements-are-derived's own carve-out for a concept with no currently answering capability.
The task-implementer then revised the source (case-query.service.ts, validate-case-coherence.ts) to exclude capability-availability from readCaseInputRequirements's own gate; against that revision, run/case-version-read-and-lifecycle-fidelity-input-requirements-validates-at-read-suite-2 failed two tests this proof had originally written against the first, now-superseded implementation.
This proof was revised to match the corrected source: one of those two tests was rewritten to prove the corrected fold-not-refuse behavior and one was withdrawn to not_applicable as no longer reachable through this method. run/case-version-read-and-lifecycle-fidelity-input-requirements-validates-at-read-suite-3, pinned above, passed in full.
