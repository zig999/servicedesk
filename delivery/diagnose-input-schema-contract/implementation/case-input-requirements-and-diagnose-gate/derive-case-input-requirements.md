---
title: Derive a case version's input requirements from its collection plan
summary: Adds a published read-case-input-requirements route that derives, fresh at every call, the union
  of subject attributes a case version's collection plan reaches through its currently registered capabilities,
  which are required, which capabilities ask for each, and which capabilities answer a plan concept with
  a currently malformed input schema.
task: sha256:c40ebd957e4eeeb80d9100301703bc462ace8e88dde8fdf1eddeb39851991d98
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/case-input-requirements-and-diagnose-gate-derive-case-input-requirements-build-2
files:
- path: src/case/case-input-requirements.ts
  effect: new domain module exporting CaseInputRequirement, CaseInputRequirementsResult, everyRegisteredCapability
    (reads every currently registered capability fresh through ICapabilityQuery.listCapabilities) and
    deriveCaseInputRequirements, the pure fold over a case's collectionPlan and the registered capabilities
    that builds the attribute union, its required flags, its askers and the separately named malformed
    capabilities, reusing capability-input-schema-shape.ts's declaredInputSchemaShape and inputSchemaShapeProblems
- path: src/case/case-input-requirements.port.ts
  effect: new published port ICaseInputRequirementsQuery declaring readCaseInputRequirements(slug, version),
    kept separate from ICaseQuery so no existing ICaseQuery stand-in needs to change
- path: src/case/case-query.service.ts
  effect: CaseQueryService now also implements ICaseInputRequirementsQuery; its new readCaseInputRequirements
    method reuses the same private heldVersion/structuralCase pipeline readCase already uses but never
    runs refuseIncoherence, then derives the result over every currently registered capability
- path: src/factories/case-input-requirements.factory.ts
  effect: new factory createCaseInputRequirementsQuery(connection) wiring a second CaseQueryService instance
    for this one published interface
- path: src/http/dto/case-input-requirements.dto.ts
  effect: new DTOs — caseInputRequirementsParamsSchema (slug, version) and caseInputRequirementsResponseSchema
    (requirements[], capabilities_with_malformed_input_schema[]), each capability referenced by its bare
    {name, version} identity
- path: src/http/case-input-requirements.controller.ts
  effect: new controller handleReadCaseInputRequirementsRequest mapping the validated params to ICaseInputRequirementsQuery.readCaseInputRequirements
    and projecting the result onto the wire shape unchanged
- path: src/http/case-input-requirements.routes.ts
  effect: new Fastify plugin registering GET /v1/cases/:slug/versions/:version/input-requirements, validating
    path params before the controller and leaving CaseNotFoundError/CaseNotValidError to the shared error
    handler
- path: src/http/build-app.ts
  effect: adds the readCaseInputRequirements field to BuildAppDependencies and registers createCaseInputRequirementsRoutesPlugin
    as a new entry in routePluginFactories, in the same position order as every other route
- path: src/factories/build-app.factory.ts
  effect: composeResources now also builds caseInputRequirementsQuery via createCaseInputRequirementsQuery(connection)
    and readDependencies wires it into the readCaseInputRequirements field
- path: src/__tests__/unit/http/build-app.spec.ts
  effect: stubBuildAppDependencies()'s existing object literal gains one entry for the new readCaseInputRequirements
    field, an inline stand-in satisfying ICaseInputRequirementsQuery with an empty-result async function, following
    the file's own existing convention for every other single-method dependency stub; no other line touched
criteria:
- criterion: For a case version whose collection plan resolves to capabilities declaring input-schema
    properties, the read returns one entry per distinct subject attribute named in any of those properties.
  met: true
  how: deriveCaseInputRequirements folds every concept in collectionPlan(theCase); foldContribution records
    each attribute from the sole answering, well-formed capability's declaredInputSchemaShape().properties
    once, in first-seen order, across every concept.
- criterion: An entry's required is true when any capability answering the plan's concepts names that
    attribute in its own input schema's required.
  met: true
  how: foldContribution adds every attribute from a contributing capability's own required array into
    the accumulator's requiredAttributes set, unioned across every concept's own sole answering capability.
- criterion: An entry names every currently registered capability that answers one of the plan's concepts
    and declares that attribute in properties.
  met: true
  how: capabilitiesByAttribute accumulates the identity of every sole-answering, well-formed capability
    that names the attribute in its own properties, across all concepts.
- criterion: A concept the collection plan holds that no registered capability currently answers, or that
    more than one currently answers, contributes no attribute to the result.
  met: true
  how: soleAnswerer(concept, capabilities) returns undefined unless exactly one registered capability's
    own concept field matches; foldConcept returns immediately without touching the accumulator when that
    happens.
- criterion: A capability whose stored input_schema does not currently hold a well-formed shape contributes
    no attribute and is named separately, apart from the attribute entries.
  met: true
  how: foldConcept checks hasWellFormedInputSchema before folding any attribute; a malformed sole answerer
    is pushed to accumulator.malformed and foldContribution is never called for it.
- criterion: The read answers for a case version in draft state exactly as it would for one in released
    state.
  met: true
  how: readCaseInputRequirements and deriveCaseInputRequirements never read theCase.state; the same pipeline
    and fold run unconditionally regardless of state.
- criterion: The read is computed fresh from the currently registered capabilities at every call, never
    a stored or cached result.
  met: true
  how: everyRegisteredCapability calls ICapabilityQuery.listCapabilities anew on every invocation with
    no memoization anywhere in the new files.
nodes:
- node: domain/knowledge/case-version
  how: the derivation reads theCase.manifest's own collectionPlan (case-resolution.ts, unmodified) as
    its source of concepts; this task adds no new attribute or operation to the aggregate itself.
- node: domain/knowledge/case-input-requirement
  encoded_at:
  - src/case/case-input-requirements.ts
  - src/http/dto/case-input-requirements.dto.ts
  how: CaseInputRequirement declares exactly the node's three attributes (attribute, required, capabilities),
    each capability named by its own bare identity rather than restating its registration, and the DTO
    mirrors the same shape for the wire.
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  encoded_at:
  - src/case/case-input-requirements.ts
  - src/case/case-query.service.ts
  how: soleAnswerer/hasWellFormedInputSchema/foldConcept/foldContribution together encode the exact statement
    — the union over sole well-formed answerers' properties, required as the union of their required,
    an unanswered or multiply-answered concept contributing nothing, and a malformed answerer contributing
    nothing and being named apart.
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  encoded_at:
  - src/case/case-input-requirements.ts
  - src/case/case-query.service.ts
  how: everyRegisteredCapability re-reads ICapabilityQuery.listCapabilities on every call and readCaseInputRequirements
    builds nothing ahead of time, so the registration this read answers against is always the one standing
    at the moment of reading.
- node: contracts/knowledge/case-input-requirements
  encoded_at:
  - src/case/case-input-requirements.port.ts
  - src/factories/case-input-requirements.factory.ts
  - src/http/case-input-requirements.controller.ts
  - src/http/case-input-requirements.routes.ts
  - src/http/dto/case-input-requirements.dto.ts
  - src/http/build-app.ts
  - src/factories/build-app.factory.ts
  how: the published read-case-input-requirements route is reachable at GET /v1/cases/:slug/versions/:version/input-requirements,
    available for a case version in either state, and its response names malformed capabilities apart
    from the attribute entries.
- node: scenarios/integration/a-legacy-capability-declares-no-input-attributes
  encoded_at:
  - src/case/case-input-requirements.ts
  how: a capability whose stored input schema holds syntactically valid JSON but no well-formed properties/required
    shape is read via hasWellFormedInputSchema as failing the shape check; foldConcept then skips foldContribution
    entirely and records the capability's identity in accumulator.malformed instead.
inferences:
- inferred: every currently-held capability's own input_schema is guaranteed syntactically valid JSON,
    so hasWellFormedInputSchema calls JSON.parse directly rather than defending against a parse failure.
  from: rules/integration/a-capability-declares-well-formed-schemas, which refuses a not-well-formed-JSON
    schema at registration before it is ever written — only the declared shape, never the JSON syntax,
    can still depart for a capability registered before the shape rule existed.
- inferred: read-case-input-requirements reads every currently registered capability via the existing
    ICapabilityQuery.listCapabilities with an internal, effectively unbounded limit, rather than a new
    unpaginated port method.
  from: the standard's API-04 page-limit bound applies only to .controller.ts/.routes.ts files, never
    to a service-internal call reading its own upstream registry in full, and ICapabilityQuery already
    exposes no other "every capability" read.
- inferred: a case version this route names that is unstored, or that fails a structural rule, is refused
    the same way read-case already refuses it (CaseNotFoundError, CaseNotValidError).
  from: no node states this route's own not-found/invalid behavior directly, and reusing the identical
    typed errors read-case already raises through the same pipeline keeps this read's own refusal shape
    aligned with the sibling read it composes with.
divergences:
- from: existing-conventions-and-reuse.md's own "one composition root builds one instance per registry
    service and reuses it" convention (seen at src/factories/build-app.factory.ts)
  departure: case-input-requirements.factory.ts's createCaseInputRequirementsQuery builds a second CaseQueryService
    instance from the same connection, rather than reusing the one createCaseQuery already builds for
    caseQuery.
  why: CaseQueryService holds no state of its own — every method reads fresh through the ports it composes
    on each call — so a second instance built from the identical connection answers identically to the
    shared one; widening ICaseQuery itself would force every existing ICaseQuery stand-in across roughly
    two dozen already-delivered test files, none of which this task touches, to also implement the new
    method.
preserved:
- read-case's own existing behavior (CaseQueryService.readCase, including refuseIncoherence and its own
  CaseNotFoundError/CaseNotValidError refusals) is unchanged — only a new sibling method was added to
  the class.
- ICaseQuery itself was not widened, so every existing ICaseQuery stand-in across the test suite keeps
  satisfying it unchanged.
- every previously registered route in build-app.ts's routePluginFactories keeps its own registration,
  order and behavior unchanged; only one new entry was appended.
- capability-input-schema-shape.ts (the dependency task's own already-delivered file) was read but not
  modified.
- ICapabilityQuery.readCapability, listCapabilities and every other existing method keep their existing
  signatures and behavior unchanged.
deferred:
- what: CaseNotValidError has no entry in src/errors/status-map.ts, so a structurally invalid case version
    answers 500 through the generic error handler rather than a more specific status — for read-case-input-requirements
    exactly as it already does for read-case.
  why: this is a pre-existing gap in an already-delivered sibling route (read-case-route); no criterion
    of this task asks for a particular status for CaseNotValidError, and fixing that mapping would reach
    a route this task does not touch.
- what: widening ICaseQuery itself to carry read-case-input-requirements directly, which would let build-app.factory.ts
    reuse the one existing caseQuery instance instead of building a second CaseQueryService.
  why: reaches every existing ICaseQuery stand-in across this project's own query-side unit and route
    tests, none of which this task's own file set includes — recorded as the disclosed divergence above
    instead.
---

## What it is
Adds a published read-case-input-requirements route that derives, fresh at every call, the union of subject attributes a case version's collection plan reaches through its currently registered capabilities, which are required, which capabilities ask for each, and which capabilities answer a plan concept with a currently malformed input schema.

## Notes
None.
