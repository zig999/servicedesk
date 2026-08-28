---
title: Proof for refuse-diagnose-missing-required-attribute
summary: Tests the case-input-requirements gate in isolation and through handleDiagnoseRequest and its
  wire route, its 422 status mapping, and test-connector's exclusion from it.
implementation: sha256:73c20672de19af625dcb09b86c23574258625c90e787b9d4e9fe06897fbf5f05
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-input-requirements-and-diagnose-gate-refuse-diagnose-missing-required-attribute-suite-2
tests:
- file: src/__tests__/unit/investigation/subject-covers-case-input-requirements.spec.ts
  name: throws a SubjectDoesNotCoverCaseInputsError when the subject holds no attribute-value for an attribute
    a requirement names required
  proves: A diagnose called with a subject missing an attribute-value for an attribute the case version's
    derived requirements name required is refused with an HTTP 422 response reporting SubjectDoesNotCoverCaseInputsError
    before any capability is called. (the pure comparison this gate is built on)
  fails_when: refuseSubjectMissingRequiredCaseInputs stops throwing SubjectDoesNotCoverCaseInputsError
    for a subject that leaves a required attribute unmatched by any attribute-value pair
- file: src/__tests__/unit/investigation/subject-covers-case-input-requirements.spec.ts
  name: names every missing required attribute together, each with the capabilities that require it, when
    more than one required attribute is missing at once
  proves: The refusal names every missing required attribute together, each with the capabilities that
    require it.
  fails_when: the thrown error's context.missing stops naming every missing required attribute together,
    drops the capabilities recorded against any one of them, or reports only the first missing attribute
    instead of all
- file: src/__tests__/unit/investigation/subject-covers-case-input-requirements.spec.ts
  name: does not refuse a subject missing only an attribute a requirement leaves optional
  proves: A subject missing only an attribute the derived requirements leave optional is not refused by
    this gate.
  fails_when: refuseSubjectMissingRequiredCaseInputs throws for a subject missing only an attribute whose
    own requirement is not required
- file: src/__tests__/unit/investigation/subject-covers-case-input-requirements.spec.ts
  name: does not throw when the subject covers every required attribute the requirements name
  proves: A subject covering every required attribute reaches collection as before. (the pure comparison's
    own non-refusal side)
  fails_when: refuseSubjectMissingRequiredCaseInputs throws even though the given attributes cover every
    required attribute
- file: src/__tests__/unit/investigation/subject-covers-case-input-requirements.spec.ts
  name: does not throw when the derived requirements hold no entries at all
  proves: the edge case of an empty derived-requirements collection — nothing required, so nothing to
    refuse over
  fails_when: refuseSubjectMissingRequiredCaseInputs throws when given no requirements at all
- file: src/__tests__/unit/investigation/subject-covers-case-input-requirements.spec.ts
  name: treats an attribute-value pair whose value is the empty string as uncovered, the same as the attribute's
    outright absence
  proves: the implementation's own recorded inference — "'empty' is read as an attribute-value pair whose
    value is the empty string; such a pair counts as uncovered the same as the attribute's outright absence."
  fails_when: an attribute-value pair carrying the empty string as its value is treated as covering the
    requirement instead of leaving it uncovered
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  name: refuses a diagnose request whose subject leaves a required case input missing, throwing exactly
    a SubjectDoesNotCoverCaseInputsError
  proves: A diagnose called with a subject missing an attribute-value for an attribute the case version's
    derived requirements name required is refused with an HTTP 422 response reporting SubjectDoesNotCoverCaseInputsError
    before any capability is called. (the controller boundary)
  fails_when: handleDiagnoseRequest resolves instead of rejecting, or rejects with anything other than
    SubjectDoesNotCoverCaseInputsError, for a subject leaving a required derived attribute uncovered
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  name: never calls runDiagnose when the subject fails to cover a required case input, so no capability
    is ever called
  proves: the "before any capability is called" clause of criterion 1
  fails_when: runDiagnose is called even though the subject leaves a required attribute uncovered
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  name: reads the case-input-requirements by the pinned case's own slug and version, not a fixed or unrelated
    value
  proves: the gate consults the pinned case version's own derived requirements rather than a stale or
    unrelated pair
  fails_when: readCaseInputRequirements is called with any slug/version other than the pinned case's own
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  name: never queries the case-input-requirements for a draft-state pinned version, so the existing released-state
    refusal still runs first
  proves: the task's own rationale — the new gate is placed after the existing released-state check
  fails_when: readCaseInputRequirements is called before the released-state refusal for a draft-state
    pinned version
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  name: names every missing required attribute together with the capabilities that require it, on the
    refusal thrown by the controller
  proves: The refusal names every missing required attribute together, each with the capabilities that
    require it. (through the real controller call, not the pure function directly)
  fails_when: the error thrown by handleDiagnoseRequest stops naming every missing required attribute
    together with its capabilities
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  name: does not refuse a subject missing only an attribute the derived requirements leave optional
  proves: A subject missing only an attribute the derived requirements leave optional is not refused by
    this gate. (controller level)
  fails_when: handleDiagnoseRequest refuses, or answers with anything other than the resolved assessment,
    for a subject missing only an optional attribute
- file: src/__tests__/unit/http/diagnose.controller.spec.ts
  name: reaches runDiagnose when the subject covers every required attribute the derived requirements
    name
  proves: A subject covering every required attribute reaches collection as before.
  fails_when: runDiagnose is not called, or is called more than once, when the subject covers every required
    attribute the derived requirements name
- file: src/__tests__/unit/http/diagnose.routes.spec.ts
  name: answers 422 with the SubjectDoesNotCoverCaseInputsError envelope naming the missing attribute
    and the capabilities that require it, for a subject missing a required case input
  proves: A diagnose called with a subject missing an attribute-value for an attribute the case version's
    derived requirements name required is refused with an HTTP 422 response reporting SubjectDoesNotCoverCaseInputsError
    ... (the wire-level HTTP response)
  fails_when: the response status is not 422, its error.code is not SubjectDoesNotCoverCaseInputsError,
    or its details.missing does not name the uncovered attribute together with the capabilities that require
    it
- file: src/__tests__/unit/http/diagnose.routes.spec.ts
  name: never calls the wired diagnose runner when the subject fails to cover a required case input, at
    the route level
  proves: the "before any capability is called" clause of criterion 1, at the wire
  fails_when: the wired runDiagnose is called even though the request's subject fails to cover a required
    case input
- file: src/__tests__/unit/http/diagnose.routes.spec.ts
  name: answers 200 with the resolved assessment when the subject covers every required attribute the
    derived requirements name
  proves: A subject covering every required attribute reaches collection as before. (at the wire)
  fails_when: the response is not 200 with the resolved assessment when the subject covers every required
    attribute
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves SubjectDoesNotCoverCaseInputsError to 422
  proves: the HTTP 422 status half of criterion 1
  fails_when: statusForError(a SubjectDoesNotCoverCaseInputsError) stops answering 422
- file: src/__tests__/unit/http/test-connector.controller.spec.ts
  name: imports neither the new required-case-inputs gate function nor the diagnose controller, so its
    own diagnostic call has no path into the gate
  proves: test-connector's own diagnostic call is not held to this gate.
  fails_when: test-connector.controller.ts starts importing refuseSubjectMissingRequiredCaseInputs or
    handleDiagnoseRequest, signalling the gate has been wired into its own diagnostic call path
untested:
- criterion 2's 'together' clause is exercised only with two missing attributes at once; a third or more
  entry would exercise the same single filter/map pass without adding new evidence.
- 'criterion 5 is proven only by a static scan of test-connector.controller.ts''s own import specifiers:
  TestConnectorRequestDto carries no case reference at all, so no runtime scenario exists through which
  the gate could even be attempted against that route.'
- 'that the case-input-requirements read is never cached across separate diagnose requests (rules/knowledge/the-contract-check-reads-the-current-registration)
  is not directly tested: no criterion of this task states it, and no caching code exists in the gate
  to exercise.'
not_applicable:
- edge_case: a numeric boundary at either end of a stated range
  why: no criterion or bound node of this task states a numeric range or count this gate must respect
    — the comparison is a set-membership check over attribute names, not a bound
- edge_case: a duplicate entry among the derived requirements
  why: the derived-requirements read this gate consumes (a separate, already-depended-on task) is what
    guarantees one entry per attribute; this gate takes that list as already given and performs no de-duplication
    of its own
- edge_case: the case-input-requirements read failing or answering slowly
  why: no criterion or bound node of this task states a specific handling for that failure; handleDiagnoseRequest
    simply awaits the read and lets a rejection propagate unchanged, the same as the pre-existing readCase
    call
- edge_case: two diagnose requests against the same subject running at once
  why: the gate reads no shared state and performs no write of its own; no node bound to this task states
    a concurrency guarantee
---

## What it is
Tests the case-input-requirements gate in isolation and through handleDiagnoseRequest and its wire route, its 422 status mapping, and test-connector's exclusion from it.

## Notes
The first suite attempt (run/case-input-requirements-and-diagnose-gate-refuse-diagnose-missing-required-attribute-suite) failed on two independent assertions, neither in a file this delivery's own producers wrote: diagnose-persistence-deadline-e2e.spec.ts's fixture seeded a capability with a syntactically invalid input_schema ('an-input-schema'), which this task's new gate now parses ahead of the delayed write the test exists to exercise (owning task/service-on-the-database/diagnose-end-to-end, work root work/relational-persistence, closed); and status-map.spec.ts's own stale-count assertion, previously bumped from "four" to "five" earlier in this same delivery, needed bumping again to "six" for this task's own legitimate sixth citation (owning task/stale-specification-citations-round-two/citations-corrected-again, work root work/backend-spec-conformance-corrections, closed). Both routes were formally blocked by their owning work roots being closed; the human explicitly authorized direct, minimal fixes to both — the fixture's input_schema changed to '{}', and the stale-count test's literal, title and assertions updated the same way the two prior increments already did. Second suite attempt (recorded above) passed.
