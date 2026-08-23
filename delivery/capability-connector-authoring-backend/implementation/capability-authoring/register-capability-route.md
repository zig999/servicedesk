---
title: Expose register-capability as a write HTTP route
summary: A PUT route that creates or replaces a capability, enacting the registry's contract-completeness,
  read-only-nature, one-concept-one-capability and new schema-well-formedness refusals.
task: sha256:e9ccbe4f103bb1ef31cb3b70a5c0a3fc1cb34aa44522b738004c927d9a69580f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/capability-authoring-register-capability-route-suite-4
files:
- path: src/capability-registry/capability-registry.service.ts
  effect: registerCapability holds a registration to name+version identity (replace-in-place via sameIdentity
    filtering), refuses contract-incompleteness (refuseContractDepartures), refuses a non-well-formed
    input_schema/output_schema (refuseMalformedSchemas/isWellFormedJson, new), refuses a non-read-only
    nature, and refuses a concept a different held capability already answers (refuseAnsweredConcept)
    — all before any write — defaulting an absent timeout to DEFAULT_CAPABILITY_TIMEOUT_MS and returning
    the held Capability.
- path: src/capability-registry/capability.ts
  effect: 'Declares the capability vocabulary as data: Capability, CapabilityRegistration, CAPABILITY_NATURES/READ_ONLY_NATURE,
    DEFAULT_CAPABILITY_TIMEOUT_MS (60000), REQUIRED_REGISTRATION_ATTRIBUTES, and the new SCHEMA_ATTRIBUTES
    ([''input_schema'', ''output_schema'']) the well-formedness check iterates over.'
- path: src/errors/status-map.ts
  effect: Maps IncompleteCapabilityContractError, CapabilityNotReadOnlyError and CapabilitySchemaNotWellFormedError
    to 422, and ConceptAlreadyAnsweredError to 409, so a refusal the registry raises now reaching HTTP
    resolves to a transport status through the one table COR-04 requires rather than a handler choosing
    one inline.
- path: src/factories/build-app.factory.ts
  effect: composeResources builds one CapabilityRegistryService and reuses that same instance for both
    capabilityQuery (read-capability/list-capabilities, unchanged) and the new registerCapability field,
    rather than constructing a second instance; registrationDependencies() narrows it to the one operation
    register-capability's own controller needs.
- path: src/http/build-app.ts
  effect: BuildAppDependencies gains a registerCapability field typed by RegisterCapabilityControllerDependencies,
    and routePlugins() adds createRegisterCapabilityRoutesPlugin to the registration loop — the twentieth
    route registered exactly like every other, none of the existing nineteen changed in shape.
- path: src/errors/capability-schema-not-well-formed.error.ts
  effect: 'New typed domain error (name, message, context: { attributes }) raised when a registration''s
    input_schema or output_schema fails JSON.parse.'
- path: src/http/dto/register-capability.dto.ts
  effect: 'New Zod DTOs: registerCapabilityParamsSchema (name, version, from the path) and registerCapabilityBodySchema
    (nature restricted to CAPABILITY_NATURES, input_schema/output_schema/connector/concept required non-empty,
    timeout optional positive integer) — validation happens here, before the registry''s own JSON-syntax
    check is ever reached.'
- path: src/http/register-capability.controller.ts
  effect: 'New controller: handleRegisterCapabilityRequest composes the path params and validated body
    into one CapabilityRegistration and hands it straight to the injected registerCapability operation,
    adding no refusal or error-mapping logic of its own.'
- path: src/http/register-capability.routes.ts
  effect: 'New Fastify plugin registering PUT /v1/capabilities/:name/:version: validates params then body
    (400 with a VALIDATION_ERROR envelope on failure), otherwise calls the controller and answers 200
    with the held capability; sets no authentication guard and leaves every domain refusal to the app''s
    shared error handler.'
- path: __tests__/unit/http/build-app.spec.ts
  effect: the fixture's BuildAppDependencies object gains a registerCapability entry, built by a new stubRegisterCapability()
    helper stubbed the same way its sibling dependency fields already are, so the file typechecks against
    the widened type.
- path: fixtures/capability/capability.json
  effect: 'the two real seed registrations'' input_schema values change from the non-JSON placeholder
    "contract-identifier-input" to the syntactically valid JSON Schema string {"type":"object","properties":{"contract_id":{"type":"string"}}},
    so running the real seed script no longer trips the new schema-well-formedness refusal; output_schema,
    name, version, nature, timeout, connector and concept are unchanged for both entries.'
criteria:
- criterion: Registering a capability at a (name, version) that does not yet exist creates it and the
    response reflects the registered contract.
  met: true
  how: registerCapability's kept array (held minus same-identity) plus the new capability is written whole;
    the route answers 200 with the full Capability object (all eight attributes) the service returns.
- criterion: Registering a capability at a (name, version) that already exists replaces it in place rather
    than creating a second entry.
  met: true
  how: sameIdentity(candidate, capability) filters out any held record matching (name, version) before
    the write, so the store always holds exactly one record per identity after registerCapability.
- criterion: A registration whose input_schema or output_schema is not syntactically valid JSON is refused.
  met: true
  how: refuseMalformedSchemas iterates SCHEMA_ATTRIBUTES through isWellFormedJson (JSON.parse in a try/catch)
    and throws CapabilitySchemaNotWellFormedError, naming every malformed attribute, mapped to 422 in
    status-map.ts.
- criterion: A registration whose nature is not read-only is refused.
  met: true
  how: heldCapability compares registration.nature to READ_ONLY_NATURE and throws CapabilityNotReadOnlyError
    otherwise; the DTO restricts nature to the CAPABILITY_NATURES vocabulary so a 'mutating' value still
    reaches this check rather than being rejected at 400.
- criterion: A registration naming a concept a different capability already answers is refused.
  met: true
  how: refuseAnsweredConcept looks up the registering concept among the kept (identity-excluded) records
    and throws ConceptAlreadyAnsweredError if a different capability already answers it, mapped to 409.
- criterion: A registration that states no timeout takes the default of sixty seconds.
  met: true
  how: heldCapability computes timeout as registration.timeout ?? DEFAULT_CAPABILITY_TIMEOUT_MS, and DEFAULT_CAPABILITY_TIMEOUT_MS
    is 60_000 milliseconds; REQUIRED_REGISTRATION_ATTRIBUTES excludes timeout so its absence is not itself
    a contract-completeness refusal.
- criterion: A request to the route carrying no authentication credential is not refused for lacking one.
  met: true
  how: register-capability.routes.ts declares no authentication middleware, guard or check anywhere in
    its plugin body, consistent with constraints/no-route-enforces-authentication.
nodes:
- node: domain/integration/capability
  encoded_at:
  - src/capability-registry/capability.ts
  - src/capability-registry/capability-registry.service.ts
  how: Capability's eight attributes (name, version, nature, input_schema, output_schema, timeout, connector,
    concept) are exactly the type's fields and exactly what registerCapability returns as the registered
    contract; the register route's response body is that value unmodified.
- node: domain/integration/capability-registry
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/http/register-capability.routes.ts
  - src/http/register-capability.controller.ts
  how: CapabilityRegistryService.registerCapability is now reachable synchronously via PUT /v1/capabilities/:name/:version,
    and it refuses non-read-only, contract-incomplete, malformed-schema and already-answered-concept registrations
    before any write, matching the node's stated Responsibility.
- node: rules/integration/a-capability-declares-its-contract
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
  how: refuseContractDepartures/contractProblems refuse a registration missing any of REQUIRED_REGISTRATION_ATTRIBUTES
    (name, version, nature, input_schema, output_schema, connector, concept); a stated timeout must be
    an integer; an absent timeout defaults to 60000ms exactly as the invariant states.
- node: rules/integration/a-capability-is-read-only
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  how: heldCapability throws CapabilityNotReadOnlyError whenever registration.nature !== READ_ONLY_NATURE,
    so the registry refuses any capability whose nature is not read-only, exactly as the invariant states.
- node: rules/integration/one-capability-answers-one-concept
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  how: refuseAnsweredConcept refuses a registration whose concept a different held capability (excluding
    the registering identity) already answers, holding the one-to-one resolution the policy states; readCapability
    separately refuses a holding that answers a concept more than once.
- node: rules/integration/a-capability-declares-well-formed-schemas
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/errors/capability-schema-not-well-formed.error.ts
  how: refuseMalformedSchemas checks input_schema and output_schema for JSON syntax via JSON.parse and
    throws the new CapabilitySchemaNotWellFormedError before any write, matching the invariant's statement
    that the registry refuses a registration or update whose schema is not syntactically valid JSON.
- node: contracts/integration/capability-registry
  encoded_at:
  - src/http/register-capability.routes.ts
  - src/http/register-capability.controller.ts
  - src/http/dto/register-capability.dto.ts
  how: register-capability is now published as PUT /v1/capabilities/:name/:version alongside the already-published
    read-capability and list-capabilities routes, creating at a new (name, version) or replacing whatever
    already stood there — exactly the operation the contract's Description now names.
- node: constraints/no-route-enforces-authentication
  encoded_at:
  - src/http/register-capability.routes.ts
  how: The route plugin declares no authentication middleware, guard or check; a request reaching it is
    dispatched on the identity it claims, unverified, matching the constraint's fitness function.
inferences:
- inferred: The route uses PUT rather than POST.
  from: The operation creates at a new (name, version) or replaces in place at an existing one — a known-identity
    create-or-replace, the same semantics place-hypothesis.routes.ts already answers with PUT — and the
    identity (name, version) is known before the call and carried in the path rather than assigned by
    the server, unlike create-draft.routes.ts's own POST. Disclosed in register-capability.routes.ts's
    own header comment.
- inferred: The route answers 200 with the held capability's whole contract for both the create case and
    the replace case, rather than distinguishing the two with different statuses.
  from: Criterion 1 asks for a response reflecting the registered contract; registerCapability never itself
    distinguishes a creation from a replacement (both go through one write), and no criterion asks the
    two to be told apart by status. Disclosed in register-capability.routes.ts's own header comment.
- inferred: No response schema is declared for this DTO; the controller returns the domain Capability
    type directly.
  from: read-capability.dto.ts's own readCapabilityResponseSchema already wire-encodes the same eight
    attributes; list-capabilities.dto.ts's own precedent is not to declare a second Zod-inferred shape
    for the same wire contract. Disclosed in register-capability.dto.ts's own header comment.
- inferred: An out-of-vocabulary nature value is refused at 400 by the DTO boundary (z.enum(CAPABILITY_NATURES)),
    while an in-vocabulary but non-read-only nature ('mutating') is left to reach the registry's own 422
    refusal.
  from: capability.ts's own CAPABILITY_NATURES exists expressly so the registry has a value to refuse
    (rules/integration/a-capability-is-read-only), which only makes sense if 'mutating' is allowed to
    reach that check rather than being rejected earlier as invalid shape.
divergences:
- cites: MNT-03
  file: src/capability-registry/capability-registry.service.ts
  departure: pageCountOf is restated in this file rather than imported from relational-case-store.repository.ts's
    own identical private helper.
  why: 'Pre-existing from an earlier task (list-capabilities-query-extension), disclosed in this file''s
    own comment: pageCountOf there is a private, unexported function of an unrelated persistence module,
    and lifting it into a shared module reaches outside this task''s own file set. Not introduced by this
    task''s registerCapability/schema-check additions, but present in a file this task modifies, so disclosed
    again here.'
- from: this task's own new invariant, applied for the first time to the project's real seed fixture data
  departure: Both real seed registrations in fixtures/capability/capability.json carried the non-JSON placeholder
    "contract-identifier-input" as input_schema; both were replaced with a syntactically valid JSON Schema
    string describing an object input carrying a contract_id string, matching the style of the sibling
    output_schema values already present in the same file.
  why: CapabilityRegistryService.registerCapability now refuses any registration whose input_schema or
    output_schema is not syntactically valid JSON, and the real seed fixture used by src/seed.ts's seedCapabilities
    carried a value that fails this new check — without the correction, running the actual seed script
    fails, which a captured full-suite run (src/__tests__/integration/seed.spec.ts) demonstrated directly.
    No criterion or specification node calls for changing what the seed data means, only for it to be
    syntactically valid JSON as the new invariant requires.
preserved:
- readCapability and listCapabilities (read-capability, list-capabilities) resolve exactly as before —
  same one-to-one concept lookup, same in-memory pagination — unaffected by adding registerCapability
  to the same service.
- 'The diagnose route''s registration is unchanged in shape or behavior: dependencies.diagnose still flows
  straight into createDiagnoseRoutesPlugin from inside the shared routePlugins() loop.'
- The other nineteen existing routes' own BuildAppDependencies slices, and composeResources' construction
  of caseStore, glossaryQuery and caseLifecycle, are untouched by the capabilityRegistry/registerCapability
  wiring added for this task.
- The three refusals CapabilityRegistryService already enforced before this task (contract-completeness,
  read-only-nature, one-concept-one-capability) keep exactly the same conditions and typed errors; this
  task adds the schema-well-formedness check and the HTTP route beside them without altering how the existing
  three are decided.
---

## What it is

A Fastify route, controller and DTO pair exposing register-capability over PUT /v1/capabilities/:name/:version, following the project's existing three-file route convention, with a new JSON-syntax well-formedness check added to the registry service alongside the refusals it already enforces.

## Notes

UNDERDETERMINED, from the specification — no criterion demonstrates the contract-completeness refusal for a registration that omits input_schema or output_schema outright (as opposed to supplying one that is syntactically invalid JSON). rules/integration/a-capability-declares-its-contract states that a registered capability declares its input schema, its output schema and its timeout, and domain/integration/capability-registry's own Responsibility says the registry refuses any registration that lacks its declared contract — but the task's criteria only test the invalid-JSON case and the missing-timeout default, never a request where input_schema or output_schema is absent from the payload entirely. This carries forward from the task's own binder-authored note; the test author must exclude it.
