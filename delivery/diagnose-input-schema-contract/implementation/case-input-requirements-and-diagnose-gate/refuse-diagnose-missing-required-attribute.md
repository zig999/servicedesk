---
title: Diagnose entry gate refusing a subject that misses a required case input
summary: handleDiagnoseRequest reads the pinned case version's derived input requirements and refuses,
  with a 422 SubjectDoesNotCoverCaseInputsError, before runDiagnose is ever called, if the subject leaves
  any required attribute missing or empty; test-connector's own diagnostic call stays structurally unable
  to reach this gate.
task: sha256:5452e397a7101bd8c7914c9fb2a367bef7c64cbb3b3df6142e903320462070e4
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-input-requirements-and-diagnose-gate-refuse-diagnose-missing-required-attribute-build-3
files:
- path: src/errors/subject-does-not-cover-case-inputs.error.ts
  effect: typed domain error SubjectDoesNotCoverCaseInputsError, carrying context.missing (one entry per
    uncovered required attribute, each with the capabilities that require it) and a message naming every
    one together
- path: src/investigation/subject-covers-case-input-requirements.ts
  effect: pure function refuseSubjectMissingRequiredCaseInputs(attributes, requirements) — the one place
    rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes is enforced — checks
    the raw subject attribute-value pairs against the derived case-input requirements, treating a missing
    pair or one with an empty string value as uncovered, and throws SubjectDoesNotCoverCaseInputsError
    naming every missing required attribute together with its capabilities
- path: src/http/diagnose.controller.ts
  effect: DiagnoseControllerDependencies carries a required caseInputRequirementsQuery field; handleDiagnoseRequest
    reads that pinned version's derived requirements and calls refuseSubjectMissingRequiredCaseInputs
    right after the existing released-state check, still before runDiagnose is ever called
- path: src/errors/status-map.ts
  effect: maps SubjectDoesNotCoverCaseInputsError -> 422 in STATUS_BY_ERROR_CLASS, with the header narrative
    naming it among the specification-fixed statuses
- path: src/factories/diagnose-server.factory.ts
  effect: createDiagnoseHttpServer builds caseInputRequirementsQuery via createCaseInputRequirementsQuery
    and threads it into the diagnose dependencies object
- path: src/__tests__/integration/http/diagnose-e2e.spec.ts
  effect: buildTestApp's dependencies literal carries caseInputRequirementsQuery, built via the same real,
    connection-backed createCaseInputRequirementsQuery(connection) this file already uses for caseQuery
- path: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  effect: buildDelayedTestApp's dependencies literal carries caseInputRequirementsQuery, built the same
    way against this file's own delayingConnection
- path: src/__tests__/unit/http/build-app.spec.ts
  effect: buildTestApp's dependencies literal carries caseInputRequirementsQuery, an inline fake object
    matching this file's existing sibling stub for the same interface
- path: src/__tests__/unit/http/diagnose.controller.spec.ts
  effect: buildDependencies carries a caseInputRequirementsQuery built with vi.fn().mockResolvedValue,
    overridable per test, defaulting to an empty requirements result
- path: src/__tests__/unit/http/diagnose.routes.spec.ts
  effect: buildTestApp's dependencies literal carries the identical vi.fn()-mock-based caseInputRequirementsQuery
criteria:
- criterion: A diagnose called with a subject missing an attribute-value for an attribute the case version's
    derived requirements name required is refused with an HTTP 422 response reporting SubjectDoesNotCoverCaseInputsError
    before any capability is called.
  met: true
  how: 'handleDiagnoseRequest reads the pinned version''s derived requirements and calls refuseSubjectMissingRequiredCaseInputs
    before ever calling runDiagnose (which is what starts collection and therefore any capability call);
    the thrown error resolves to 422 through status-map.ts. Re-read fresh against the current source in
    this re-delivery: unchanged.'
- criterion: The refusal names every missing required attribute together, each with the capabilities that
    require it.
  met: true
  how: 'refuseSubjectMissingRequiredCaseInputs collects every uncovered required entry into one missing
    array, each carrying its attribute and the capabilities the derived requirement already names, passed
    to one error constructor call whose message joins every entry. Re-read fresh against the current source
    in this re-delivery: unchanged.'
- criterion: A subject missing only an attribute the derived requirements leave optional is not refused
    by this gate.
  met: true
  how: 'refuseSubjectMissingRequiredCaseInputs filters on requirement.required before checking coverage;
    an optional requirement is never checked or included in missing. Re-read fresh against the current
    source in this re-delivery: unchanged.'
- criterion: A subject covering every required attribute reaches collection as before.
  met: true
  how: 'when the filtered missing list is empty, refuseSubjectMissingRequiredCaseInputs returns without
    throwing, and handleDiagnoseRequest proceeds to call runDiagnose with the same shape as before this
    task. Re-read fresh against the current source in this re-delivery: unchanged.'
- criterion: test-connector's own diagnostic call is not held to this gate.
  met: true
  how: 'reconfirmed by reading both controller files in full for this re-delivery: test-connector.controller.ts''s
    own import list names neither refuseSubjectMissingRequiredCaseInputs nor handleDiagnoseRequest nor
    diagnose.controller.js at all, and its handleTestConnectorRequest calls only resolveTestedCapability,
    resolveTestedConnectorConfiguration, resolveConnectorRequest and issueOutcome — no path from it reaches
    the gate. This criterion was never an implementation gap: the re-delivery''s own trigger (a /review-change
    finding) named a proof gap — the existing test only scans test-connector.controller.ts''s import specifiers
    rather than exercising behavior — which is the test-author''s and reviewer''s concern, not a fact
    about this source. No source change was made or was needed to satisfy this criterion.'
nodes:
- node: domain/knowledge/case-version
  how: consumed unchanged — the gate resolves the pinned version's own slug/version (already validated
    released above) and asks the case-input-requirements read for exactly that version.
- node: domain/knowledge/case-input-requirement
  how: consumed unchanged — the gate reads each entry's existing attribute, required and capabilities
    fields to decide the refusal.
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  how: this is the rule this task encodes in full — the refusal, its 422 status, the SubjectDoesNotCoverCaseInputsError
    class, and the checked-once-at-the-door placement. The same node's own statement that the test of
    one connector configuration through a registered capability is not held to this refusal is honored
    structurally, by test-connector.controller.ts never importing the gate.
  encoded_at:
  - src/investigation/subject-covers-case-input-requirements.ts
  - src/http/diagnose.controller.ts
  - src/errors/subject-does-not-cover-case-inputs.error.ts
  - src/errors/status-map.ts
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  how: consumed unchanged through ICaseInputRequirementsQuery.readCaseInputRequirements, already encoded
    by the depended-on task.
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  how: honored at this call site — the gate calls readCaseInputRequirements fresh on every diagnose request
    rather than caching across requests.
  encoded_at:
  - src/http/diagnose.controller.ts
- node: contracts/knowledge/case-input-requirements
  how: the diagnose entry point is the second published consumer this contract's own description names,
    realized by wiring caseInputRequirementsQuery into the diagnose route's own dependencies.
  encoded_at:
  - src/http/diagnose.controller.ts
  - src/factories/diagnose-server.factory.ts
- node: contracts/investigation/diagnosis
  how: the synchronous diagnose entry point refuses before its own pipeline runs where the subject fails
    to cover the case's required inputs, in addition to the pre-existing released-state refusal.
  encoded_at:
  - src/http/diagnose.controller.ts
  - src/errors/status-map.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  how: 'exercised end to end by the gate: a released case version whose collection plan resolves to a
    capability naming an attribute required, diagnosed with a subject missing that attribute-value, is
    refused before collection with the attribute and its capability named.'
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
- inferred: DiagnoseControllerDependencies carries a dedicated caseInputRequirementsQuery field, built
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
    own engineering choice, and status-map.ts's header narrative states so explicitly.
  from: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes's own statement,
    which names the status and the error class together.
- inferred: this re-delivery required no source change. The /review-change finding that triggered it —
    "the fifth criterion is only proven by a source-scan test, not a genuine behavioral test" — is a proof/test
    gap over test-connector.controller.spec.ts, not a fact about test-connector.controller.ts or diagnose.controller.ts
    themselves; both were re-read in full for this pass and both still stand exactly as the prior delivery
    described.
  from: reading task/case-input-requirements-and-diagnose-gate/refuse-diagnose-missing-required-attribute.md's
    re-delivery instructions together with the current text of src/http/test-connector.controller.ts and
    src/http/diagnose.controller.ts.
preserved:
- the pre-existing released-state refusal (CaseVersionNotReleasedError) still runs first, unchanged in
  shape or ordering; the gate is strictly a second check placed after it.
- a subject covering every required attribute still reaches runDiagnose with the exact same ProductionDiagnoseCall
  shape assembled exactly as before this task.
- test-connector.controller.ts and its route are untouched; no call path from it reaches the gate.
- status-map.ts's pre-existing entries and every status they already resolved to are unchanged; only the
  one SubjectDoesNotCoverCaseInputsError entry and the running counts in its own header comments were
  ever added.
---

## What it is
The diagnose entry point refuses, before any collection, a subject that leaves any of the pinned case version's required attributes missing or empty.

## Notes
REMAINDER, from the specification — rules/knowledge/a-case-versions-input-requirements-are-derived's statement carries two clauses this task's criteria never reach: that a concept the collection plan holds which no registered capability currently answers, or that more than one currently answers, contributes no attribute to the derived set; and that a capability whose own stored input schema does not currently hold a well-formed shape likewise contributes nothing and is named separately in the read rather than nested under an attribute. Neither clause is exercised by any of this task's criteria — they govern what the read itself returns, not whether a diagnose is refused — and scenarios/integration/a-legacy-capability-declares-no-input-attributes.md (excluded from this task's implements for the same reason) already exercises the malformed-schema clause. Belongs: the task implementing contracts/knowledge/case-input-requirements's read-case-input-requirements operation (derive-case-input-requirements).
This is a re-delivery: no source change was needed. It was prompted by a /review-change finding that criterion 5 ("test-connector's own diagnostic call is not held to this gate") was only proven by a source-scan test rather than a behavioral one — a proof gap, not an implementation gap. The implementation was re-read in full against the current tree and confirmed unchanged and still correct.
