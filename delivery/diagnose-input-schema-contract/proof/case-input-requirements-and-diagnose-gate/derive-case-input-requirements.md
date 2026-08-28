---
title: Proof for derive-case-input-requirements
summary: Tests the pure input-requirements fold, its composition into CaseQueryService's read-case-input-requirements,
  and the HTTP surface that carries it, over all seven stated criteria and the implementation's three
  disclosed inferences.
implementation: sha256:a3d97c6b4a5b82eaa846f72db7e874de10374e5a4d7f025550c247f0c387536f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-input-requirements-and-diagnose-gate-derive-case-input-requirements-suite-3
tests:
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: returns one entry per distinct subject attribute the sole answering capability declares in its
    own input schema properties
  proves: For a case version whose collection plan resolves to capabilities declaring input-schema properties,
    the read returns one entry per distinct subject attribute named in any of those properties.
  fails_when: deriveCaseInputRequirements stops naming an attribute a sole answering capability declares
    in properties, or names an attribute it does not declare
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: dedupes an attribute two different concepts' own sole answerers both declare into the one entry,
    naming every asking capability on it
  proves: the union/dedupe half of criterion 1, and "An entry names every currently registered capability
    that answers one of the plan's concepts and declares that attribute in properties."
  fails_when: an attribute two capabilities both declare is split into two entries, or either capability
    is dropped from its asker list
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: marks an attribute required when any answering capability's own input schema names it in required,
    and not required when none do
  proves: An entry's required is true when any capability answering the plan's concepts names that attribute
    in its own input schema's required.
  fails_when: required stays false when a contributing capability does name the attribute in its own required,
    or becomes true when none do
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: names every currently registered capability that answers a plan concept and declares the attribute,
    not only the first one seen
  proves: An entry names every currently registered capability that answers one of the plan's concepts
    and declares that attribute in properties.
  fails_when: only the first-seen capability is listed on a shared attribute's entry instead of every
    one that declares it
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: contributes no attribute for a concept the collection plan holds that no registered capability
    currently answers
  proves: the unanswered half of "A concept the collection plan holds that no registered capability currently
    answers, or that more than one currently answers, contributes no attribute to the result."
  fails_when: an unanswered concept starts contributing an attribute
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: contributes no attribute for a concept more than one registered capability currently answers,
    even though each declares its own attribute
  proves: the multiply-answered half of the same criterion, and that this case is not flagged malformed
    either
  fails_when: a multiply-answered concept's capabilities start contributing attributes, or start being
    named as malformed
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: contributes no attribute and names the capability apart, for a sole answerer whose stored input
    schema does not currently hold a well-formed properties object
  proves: A capability whose stored input_schema does not currently hold a well-formed shape contributes
    no attribute and is named separately, apart from the attribute entries.
  fails_when: a malformed sole answerer contributes an attribute, or stops being named in capabilities_with_malformed_input_schema
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: still derives the attributes of a well-formed capability while naming a different, currently malformed
    one apart
  proves: the malformed criterion holds independently per capability rather than aborting the whole derivation
  fails_when: a malformed capability elsewhere in the plan suppresses a different, well-formed capability's
    own attributes
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: contributes no attribute, and does not name the capability as malformed, for a sole answerer whose
    stored input schema simply omits properties
  proves: this consumer reuses declaredInputSchemaShape/inputSchemaShapeProblems's own established "absent
    properties is empty, not a departure" reading
  fails_when: an omitted-properties schema starts being listed as malformed
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: answers no requirements and no malformed capability for a case version whose collection plan holds
    no concept at all
  proves: the empty-collection edge case is handled without throwing or fabricating an entry
  fails_when: an empty collection plan throws, or answers a non-empty requirements or malformed list
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: answers identically regardless of the case version state, since nothing here reads it at all
  proves: the pure-fold half of "The read answers for a case version in draft state exactly as it would
    for one in released state."
  fails_when: the derivation's own answer changes when only theCase.state changes, all else equal
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: throws when a sole answering capability's own stored input_schema is not syntactically valid JSON
    at all, since this derivation trusts the registration invariant rather than guarding the parse itself
  proves: the implementation's inference that every currently-held capability's own input_schema is guaranteed
    syntactically valid JSON
  fails_when: hasWellFormedInputSchema starts guarding the JSON.parse call and treats invalid JSON as
    an ordinary malformed shape instead of throwing
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: reads every currently registered capability rather than truncating at a typical page size, so
    a concept only the 200th-registered capability answers still contributes its attribute
  proves: the implementation's inference that read-case-input-requirements reads every currently registered
    capability via ICapabilityQuery.listCapabilities with an internal, effectively unbounded limit
  fails_when: everyRegisteredCapability starts requesting a bounded page and a capability beyond that
    page stops contributing its attribute
- file: src/__tests__/unit/case/case-input-requirements.spec.ts
  name: answers exactly the data page listCapabilities resolves, changing nothing about it
  proves: everyRegisteredCapability is a plain pass-through onto ICapabilityQuery.listCapabilities's own
    data page
  fails_when: everyRegisteredCapability starts filtering, reordering or otherwise transforming the resolved
    page
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers identical input requirements for a draft version and the same version once released
  proves: the service composition half of "The read answers for a case version in draft state exactly
    as it would for one in released state."
  fails_when: readCaseInputRequirements answers differently for the same content once the version is released
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: answers a draft version's input requirements even though the same content currently fails read-case's
    own coherence check
  proves: rules/knowledge/a-case-versions-input-requirements-are-derived's and contracts/knowledge/case-input-requirements's
    own "a curator composing a draft wants the same read a diagnose will one day be held to"
  fails_when: readCaseInputRequirements starts rejecting for the same reason readCase would, instead of
    answering
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: derives from the currently registered capabilities read fresh at every call, answering differently
    once a capability is registered between two calls for the same version
  proves: The read is computed fresh from the currently registered capabilities at every call, never a
    stored or cached result.
  fails_when: a capability registered after the first call is not reflected in a later call's answer for
    the identical version
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: refuses with CaseNotFoundError, naming the slug and version, when no version is stored at all
  proves: the not-found half of the implementation's inference about this route's own refusal shape
  fails_when: an unstored version answers instead of refusing, or refuses with a different error or context
- file: src/__tests__/unit/case/case-query.service.spec.ts
  name: refuses a structurally invalid case version the same way read-case does, naming the violation
    in a CaseNotValidError
  proves: the structurally-invalid half of the same disclosed inference
  fails_when: a structurally invalid version answers instead of refusing, or refuses with a different
    error or violation list
- file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
  name: answers 200 with the requirements and the malformed capabilities named apart, exactly as the query
    resolved them
  proves: contracts/knowledge/case-input-requirements — the published route carries the derived result
    onto the wire unchanged
  fails_when: the controller or DTO drop, rename or reshape either the requirements or the malformed-capabilities
    field
- file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
  name: resolves the slug and version exactly as the path names them, the version coerced from its string
    segment into a number
  proves: the route validates and forwards its two path parameters to the published query unchanged
  fails_when: the route calls the query with the wrong slug/version, or forwards version as a string
- file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
  name: refuses with the status the status map assigns CaseNotFoundError, when no version answers the
    named slug and version
  proves: the disclosed inference's wire consequence — CaseNotFoundError reaches the shared error handler
    unmapped by this route
  fails_when: the route starts mapping CaseNotFoundError to a different status or swallowing it
- file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
  name: answers the unchanged generic envelope, never a partial body, when the named version fails a structural
    rule
  proves: the disclosed inference's wire consequence — CaseNotValidError reaches the shared error handler
    unmapped by this route
  fails_when: the route starts answering a partial body, or a status other than what the shared handler
    assigns
- file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
  name: answers 400 for a non-numeric version segment, without ever reaching the query
  proves: DTO-01/EDG-01 — the version path parameter is validated before the query is ever reached
  fails_when: a non-numeric version reaches the query instead of being refused at validation
- file: src/__tests__/unit/http/case-input-requirements.routes.spec.ts
  name: answers 400 for a version of zero, one below the positive range the domain declares, without ever
    reaching the query
  proves: the version parameter's positive-integer boundary is enforced at the validation boundary
  fails_when: a version of zero reaches the query instead of being refused at validation
- file: src/__tests__/unit/http/build-app.spec.ts
  name: reaches read-case-input-requirements's own controller through buildApp()'s registration, answering
    the query's own result unchanged, on the very first request a freshly built app instance ever receives
  proves: contracts/knowledge/case-input-requirements's own "reachable at GET /v1/cases/:slug/versions/:version/input-requirements"
    — the route is actually wired into buildApp()
  fails_when: build-app.ts stops registering the route, or wires it to the wrong dependency
untested:
- createCaseInputRequirementsQuery's own wiring against a real database connection is not covered here,
  mirroring case-query.factory.spec.ts's own integration-level proof for the sibling read-case factory
  — no criterion of this task states database-level behavior, and the derivation and its composition are
  already proven against port fakes above.
- 'A rejecting or slow ICapabilityQuery.listCapabilities (or ICaseStore.assembleVersion) during readCaseInputRequirements
  is not exercised: no node or criterion of this task states a distinct behavior for it, and the code
  adds no handling of its own around either call.'
not_applicable:
- edge_case: two concurrent readCaseInputRequirements calls against the same version
  why: no bound node states any concurrency guarantee, and the derivation reads no mutable state of its
    own between calls
- edge_case: a duplicate concept appearing twice in the collection plan array itself
  why: collectionPlan (case-resolution.ts, unmodified by this task) already dedupes concepts before deriveCaseInputRequirements
    ever sees them, and that dedup is proven in case-resolution.spec.ts
- edge_case: two properties with the same name declared twice on one capability's own input schema
  why: a parsed JSON object cannot hold two keys of the same name at all, so this is not a state the derivation
    could ever observe
---

## What it is
Tests the pure input-requirements fold, its composition into CaseQueryService's read-case-input-requirements, and the HTTP surface that carries it, over all seven stated criteria and the implementation's three disclosed inferences.

## Notes
The first suite attempt (run/case-input-requirements-and-diagnose-gate-derive-case-input-requirements-suite) failed on two independent groups: 3 failures on a test-fixture gap (FakeCapabilityQuery.listCapabilities in case-query.service.spec.ts left unwired to the held-capabilities map, cause: test — fixed by explicit human authorization) and 3 failures from a real-PostgreSQL hook timeout in an untouched file (relational-case-store.repository.spec.ts, cause: setup). The second attempt (suite-2) failed again, cause: setup, on vitest's own global setup failing to connect to the same PostgreSQL instance (ETIMEDOUT) before any test ran — a second consecutive setup-class red per the framework's own stop rule. The human then confirmed the database was reachable again; the third attempt (recorded above) passed.
