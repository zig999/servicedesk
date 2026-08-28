---
title: Diagnose entry gate refusing a subject that misses a required case input
summary: handleDiagnoseRequest now reads the pinned case version's derived input requirements and refuses,
  with a 422 SubjectDoesNotCoverCaseInputsError, before runDiagnose is ever called, if the subject leaves
  any required attribute missing or empty.
task: sha256:5452e397a7101bd8c7914c9fb2a367bef7c64cbb3b3df6142e903320462070e4
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-input-requirements-and-diagnose-gate-refuse-diagnose-missing-required-attribute-build-2
files:
- path: src/errors/subject-does-not-cover-case-inputs.error.ts
  effect: new typed domain error SubjectDoesNotCoverCaseInputsError, carrying context.missing (one entry
    per uncovered required attribute, each with the capabilities that require it) and a message naming
    every one together
- path: src/investigation/subject-covers-case-input-requirements.ts
  effect: new pure function refuseSubjectMissingRequiredCaseInputs(attributes, requirements) — the one
    place rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes is enforced — checks
    the raw subject attribute-value pairs against the derived case-input requirements, treating a missing
    pair or one with an empty string value as uncovered, and throws SubjectDoesNotCoverCaseInputsError
    naming every missing required attribute together with its capabilities
- path: src/http/diagnose.controller.ts
  effect: DiagnoseControllerDependencies gains a required caseInputRequirementsQuery field; handleDiagnoseRequest
    reads that pinned version's derived requirements and calls refuseSubjectMissingRequiredCaseInputs
    right after the existing released-state check, still before runDiagnose is ever called
- path: src/errors/status-map.ts
  effect: adds SubjectDoesNotCoverCaseInputsError -> 422 to STATUS_BY_ERROR_CLASS; updates the header
    narrative to include it
- path: src/factories/diagnose-server.factory.ts
  effect: createDiagnoseHttpServer now also builds caseInputRequirementsQuery via createCaseInputRequirementsQuery,
    threading it into the diagnose dependencies object
- path: src/__tests__/integration/http/diagnose-e2e.spec.ts
  effect: buildTestApp's dependencies literal gains caseInputRequirementsQuery, built via the same real,
    connection-backed createCaseInputRequirementsQuery(connection) this file already uses for caseQuery
- path: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  effect: buildDelayedTestApp's dependencies literal gains caseInputRequirementsQuery, built the same way
    against this file's own delayingConnection
- path: src/__tests__/unit/http/build-app.spec.ts
  effect: buildTestApp's dependencies literal gains caseInputRequirementsQuery, an inline fake object
    matching this file's existing sibling stub for the same interface
- path: src/__tests__/unit/http/diagnose.controller.spec.ts
  effect: buildDependencies gains a caseInputRequirementsQuery built with vi.fn().mockResolvedValue(an
    empty requirements result), matching this file's vi.fn()-mock convention for every other dependency
- path: src/__tests__/unit/http/diagnose.routes.spec.ts
  effect: buildTestApp's dependencies literal gains the identical vi.fn()-mock-based caseInputRequirementsQuery
criteria:
- criterion: A diagnose called with a subject missing an attribute-value for an attribute the case version's
    derived requirements name required is refused with an HTTP 422 response reporting SubjectDoesNotCoverCaseInputsError
    before any capability is called.
  met: true
  how: handleDiagnoseRequest reads the pinned version's derived requirements and calls refuseSubjectMissingRequiredCaseInputs
    before ever calling runDiagnose (which is what starts collection and therefore any capability call);
    the thrown error resolves to 422 through status-map.ts.
- criterion: The refusal names every missing required attribute together, each with the capabilities that
    require it.
  met: true
  how: refuseSubjectMissingRequiredCaseInputs collects every uncovered required entry into one missing
    array, each carrying its attribute and the capabilities the derived requirement already names, passed
    to one error constructor call whose message joins every entry.
- criterion: A subject missing only an attribute the derived requirements leave optional is not refused
    by this gate.
  met: true
  how: refuseSubjectMissingRequiredCaseInputs filters on requirement.required before checking coverage;
    an optional requirement is never checked or included in missing.
- criterion: A subject covering every required attribute reaches collection as before.
  met: true
  how: when the filtered missing list is empty, refuseSubjectMissingRequiredCaseInputs returns without
    throwing, and handleDiagnoseRequest proceeds to call runDiagnose with the same shape as before this
    task.
- criterion: test-connector's own diagnostic call is not held to this gate.
  met: true
  how: test-connector.controller.ts calls neither handleDiagnoseRequest nor refuseSubjectMissingRequiredCaseInputs;
    this task added no call from that controller into the new gate.
nodes:
- node: domain/knowledge/case-version
  how: consumed unchanged — the gate resolves the pinned version's own slug/version (already validated
    released above) and asks the case-input-requirements read for exactly that version.
- node: domain/knowledge/case-input-requirement
  how: consumed unchanged — the gate reads each entry's existing attribute, required and capabilities
    fields to decide the refusal.
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  how: this is the rule this task encodes in full — the refusal, its 422 status, the SubjectDoesNotCoverCaseInputsError
    class, and the checked-once-at-the-door placement.
  encoded_at:
  - src/investigation/subject-covers-case-input-requirements.ts
  - src/http/diagnose.controller.ts
  - src/errors/subject-does-not-cover-case-inputs.error.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  how: consumed unchanged through ICaseInputRequirementsQuery.readCaseInputRequirements, already encoded
    by the depended-on task.
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  how: honored at this new call site too — the gate calls readCaseInputRequirements fresh on every diagnose
    request rather than caching across requests.
  encoded_at:
  - src/http/diagnose.controller.ts
- node: contracts/knowledge/case-input-requirements
  how: the diagnose entry point is now the second published consumer this contract's own description names,
    realized by wiring caseInputRequirementsQuery into the diagnose route's own dependencies.
  encoded_at:
  - src/http/diagnose.controller.ts
  - src/factories/diagnose-server.factory.ts
- node: contracts/investigation/diagnosis
  how: the synchronous diagnose entry point now refuses before its own pipeline runs where the subject
    fails to cover the case's required inputs, in addition to the pre-existing released-state refusal.
  encoded_at:
  - src/http/diagnose.controller.ts
  - src/errors/status-map.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  how: 'exercised end to end by the new gate: a released case version whose collection plan resolves to
    a capability naming an attribute required, diagnosed with a subject missing that attribute-value,
    is refused before collection with the attribute and its capability named.'
  encoded_at:
  - src/http/diagnose.controller.ts
  - src/investigation/subject-covers-case-input-requirements.ts
  - src/errors/subject-does-not-cover-case-inputs.error.ts
  - src/errors/status-map.ts
inferences:
- inferred: the comparison/refusal logic lives in a new pure function (investigation/subject-covers-case-input-requirements.ts)
    rather than inline in diagnose.controller.ts.
  from: ARC-04 (business logic lives in a service; a controller maps transport to a call and back) plus
    investigation-factory.ts's own established throw-a-typed-error-before-constructing-anything, one pure
    refuseX function per rule convention.
- inferred: DiagnoseControllerDependencies gained a dedicated caseInputRequirementsQuery field, built
    as a second CaseQueryService instance in diagnose-server.factory.ts, rather than widening the existing
    caseQuery field's declared type.
  from: the already-disclosed convention in case-input-requirements.factory.ts and build-app.factory.ts's
    own composeResources, which build a second same-connection instance for exactly this reason.
- inferred: '"empty" is read as an attribute-value pair whose value is the empty string; such a pair counts
    as uncovered the same as the attribute''s outright absence.'
  from: 'the rule''s own statement ("holds no attribute-value, or an empty one"); the wire schema already
    enforces value: z.string().min(1) at the HTTP boundary, so this branch is currently unreachable through
    the validated route, but the gate still checks the raw value directly rather than relying on that
    upstream bound.'
- inferred: SubjectDoesNotCoverCaseInputsError's HTTP 422 is a specification-fixed fact, not this project's
    own engineering choice, and status-map.ts's header narrative was updated to say so explicitly.
  from: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes's own statement,
    which names the status and the error class together.
preserved:
- the pre-existing released-state refusal (CaseVersionNotReleasedError) still runs first, unchanged in
  shape or ordering; the new gate is strictly a second check placed after it.
- a subject covering every required attribute still reaches runDiagnose with the exact same ProductionDiagnoseCall
  shape assembled exactly as before this task.
- test-connector.controller.ts and its route are untouched; no call path from it reaches the new gate.
- status-map.ts's pre-existing entries and every status they already resolved to are unchanged; only one
  new entry and the running counts in its own header comments were added.
deferred:
- what: existing test files that construct a DiagnoseControllerDependencies literal will need a caseInputRequirementsQuery
    stand-in added to keep type-checking, since that field is now required.
  why: writing or editing tests is the test-author's own judgment, not this task-implementer's.
---

## What it is
handleDiagnoseRequest now reads the pinned case version's derived input requirements and refuses, with a 422 SubjectDoesNotCoverCaseInputsError, before runDiagnose is ever called, if the subject leaves any required attribute missing or empty.

## Notes
None.
