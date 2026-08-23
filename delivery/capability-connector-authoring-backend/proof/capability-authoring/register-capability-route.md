---
title: Proof for register-capability exposed as a write HTTP route
summary: HTTP-level tests for PUT /v1/capabilities/{name}/{version} (wiring, status mapping, DTO boundary,
  no-auth) plus new service-level tests for the schema-well-formedness refusal this task added, together
  proving the task's seven criteria and excluding the omitted-schema-attribute reading the task's own
  Notes rules out.
implementation: sha256:c79fee801d1548e94f2b2aa388b43f974e31ce1ea1ce97fd5bb563746fc1d8a2
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/capability-authoring-register-capability-route-suite-4
tests:
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: refuses a registration whose input_schema is not syntactically valid JSON, naming the attribute
  proves: A registration whose input_schema or output_schema is not syntactically valid JSON is refused.
  fails_when: refuseMalformedSchemas stops checking input_schema, or stops throwing/naming it when JSON.parse
    fails on it
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: refuses a registration whose output_schema is not syntactically valid JSON, naming the attribute
  proves: A registration whose input_schema or output_schema is not syntactically valid JSON is refused.
  fails_when: refuseMalformedSchemas stops checking output_schema, or stops throwing/naming it when JSON.parse
    fails on it
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: refuses a registration whose input_schema and output_schema are both not syntactically valid JSON,
    naming both attributes
  proves: A registration whose input_schema or output_schema is not syntactically valid JSON is refused
    — specifically that both malformed attributes are named together rather than only the first found
  fails_when: the refusal names only one of the two malformed attributes, or stops iterating both schema
    attributes
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: writes nothing to the store when it refuses a registration for a malformed schema
  proves: the schema-well-formedness refusal is raised before any write (mirrors the existing before-any-write
    guarantee the other three refusals already carry)
  fails_when: the store is written to (or mutated) before or despite the malformed-schema refusal being
    raised
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: accepts a registration whose input_schema and output_schema are syntactically valid JSON, holding
    both unchanged
  proves: the well-formedness check is not a blanket refusal — a syntactically valid JSON document registers
    and is held unchanged; the positive control that makes the refusal tests above meaningful
  fails_when: a syntactically valid JSON schema is refused, or its stored value is mutated from what was
    submitted
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: answers 200 with the held capability registerCapability resolved, for a valid registration at
    a (name, version) the path names
  proves: Registering a capability at a (name, version) that does not yet exist creates it and the response
    reflects the registered contract. (the route/DTO/controller wiring half — the actual creation is proven
    at the service layer, see untested)
  fails_when: the route answers a status other than 200, or a response body that is not exactly what registerCapability
    resolved
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: composes the path-carried name and version with the body into one registration, calling registerCapability
    with it exactly
  proves: the route/controller compose one CapabilityRegistration from the path's name/version and the
    body's other attributes, with nothing added, dropped or altered
  fails_when: registerCapability is called with a registration missing the path-carried name/version,
    or with body attributes altered from what was submitted
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: answers each of two requests at the same (name, version) with that request's own resolution, never
    a cached or joined value
  proves: Registering a capability at a (name, version) that already exists replaces it in place rather
    than creating a second entry. (the route's own half — it never caches or reuses a prior response for
    a repeated identity; the store-level no-second-entry fact is the registry's own, see untested)
  fails_when: the second request answers the first request's resolved capability instead of its own, or
    registerCapability is not called once per request
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: answers 200 rather than 201, both for a registration at a new (name, version) and for one at an
    already-held (name, version) — this task's own disclosed inference that the route does not distinguish
    the two by status
  proves: the implementation's own disclosed inference that create and replace answer the same status
  fails_when: the route answers a different status (e.g. 201) for either case
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: answers 404 for a POST to the same URL, since this task's own disclosed inference registers the
    route under PUT alone
  proves: the implementation's own disclosed inference that the route is registered under PUT, never POST
  fails_when: the route also answers a POST to the same URL (e.g. registered under app.all or duplicated
    under app.post)
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses with the status the status map assigns CapabilitySchemaNotWellFormedError, naming every
    malformed attribute in the details
  proves: A registration whose input_schema or output_schema is not syntactically valid JSON is refused.
    (the HTTP-mapping half — status-map.ts's own new entry for this error, unreachable via HTTP before
    this task)
  fails_when: the response status is not 422, or the body's code/details do not carry the error's own
    name and context
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses with the status the status map assigns CapabilityNotReadOnlyError when the registry refuses
    a non-read-only nature
  proves: A registration whose nature is not read-only is refused. (the HTTP-mapping half; the refusal
    decision itself is proven at the service layer, see untested)
  fails_when: the response status is not 422, or the body's code/details do not carry the error's own
    name and context
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: answers 400 for an out-of-vocabulary nature, without ever reaching registerCapability
  proves: the implementation's own disclosed inference that an out-of-vocabulary nature is refused at
    the DTO boundary rather than reaching the registry
  fails_when: an out-of-vocabulary nature reaches registerCapability, or the route answers anything but
    400 for it
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses with the status the status map assigns ConceptAlreadyAnsweredError when the registry refuses
    an already-answered concept
  proves: A registration naming a concept a different capability already answers is refused. (the HTTP-mapping
    half; the refusal decision itself is proven at the service layer, see untested)
  fails_when: the response status is not 409, or the body's code/details do not carry the error's own
    name and context
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: calls registerCapability with no timeout key when the request body states none, leaving the default
    to the registry rather than defaulting it here
  proves: A registration that states no timeout takes the default of sixty seconds. (the route/DTO wiring
    half — it injects no default of its own; the actual defaulting is proven at the service layer, see
    untested)
  fails_when: the route or DTO supplies its own timeout value (defaulted or otherwise) when the body states
    none
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: passes a stated timeout through to registerCapability unchanged, never substituting the default
    for it
  proves: the route/DTO never override a stated timeout
  fails_when: a stated timeout reaches registerCapability altered from what was submitted
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: answers 400 for a timeout of 0, one below the schema's own positive lower boundary, without ever
    reaching registerCapability
  proves: the DTO's stated positive-integer bound on timeout is enforced at the validation boundary
  fails_when: a timeout of 0 reaches registerCapability, or the route answers anything but 400 for it
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: answers 200 for a request carrying no headers at all, reading no authentication or authorization
    header
  proves: A request to the route carrying no authentication credential is not refused for lacking one.
  fails_when: the route answers 401 or 403 (or any refusal) for a request carrying no headers
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: answers 200 for a request carrying an authorization header naming no credential this route recognizes,
    dispatching it exactly as one that carries none
  proves: A request to the route carrying no authentication credential is not refused for lacking one.
    — a request that does carry a header is dispatched identically, since the route enforces no credential
    check at all
  fails_when: the presence of an authorization header changes the route's answer
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses a registration whose body omits input_schema outright, never calling registerCapability
    with it absent or empty
  proves: the Notes' UNDERDETERMINED entry — excludes an implementation that accepts a registration omitting
    input_schema and stores an empty/null value while answering success
  fails_when: the route answers success (or otherwise calls registerCapability) for a body omitting input_schema
    entirely
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses a registration whose body omits output_schema outright, never calling registerCapability
    with it absent or empty
  proves: the Notes' UNDERDETERMINED entry — excludes an implementation that accepts a registration omitting
    output_schema and stores an empty/null value while answering success
  fails_when: the route answers success (or otherwise calls registerCapability) for a body omitting output_schema
    entirely
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: answers 400 for a wholly empty body, without ever reaching registerCapability
  proves: absent input at the boundary is refused before the operation is ever reached
  fails_when: an empty body reaches registerCapability, or the route answers anything but 400
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: answers 400 via validation for a request with an empty :name segment, never 404 route not found
  proves: the path identity's own required, non-empty name is enforced at the validation boundary rather
    than left to a generic route-not-found
  fails_when: the route answers 404 instead of 400 for an empty :name segment, or reaches registerCapability
    with one
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: answers 400 via validation for a request with an empty :version segment, never 404 route not found
  proves: the path identity's own required, non-empty version is enforced at the validation boundary rather
    than left to a generic route-not-found
  fails_when: the route answers 404 instead of 400 for an empty :version segment, or reaches registerCapability
    with one
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: answers the unchanged generic envelope, never the rejected call's own error text, when registerCapability
    rejects with a generic, non-domain error
  proves: an unmapped/unexpected failure of the injected dependency answers the generic 500 envelope,
    leaking no internal detail
  fails_when: the route answers anything other than the fixed 500 envelope, or leaks the rejected error's
    own message
not_applicable:
- edge_case: two registrations against the same (name, version) submitted concurrently
  why: no node this task implements or binds states concurrent-write behavior, and the store's own concurrency
    guarantees are a persistence-layer concern belonging to whichever ICapabilityStore implementation
    composeResources wires in production — outside this task's own file set (the route, controller, DTO
    and the one new service-level check)
- edge_case: an empty collection answered where one is expected
  why: this route answers one resource, never a collection; that edge case belongs to list-capabilities,
    a different task's own surface
- edge_case: a dependency that answers slowly (latency, as distinct from an outright rejection)
  why: app.inject drives requests against an in-process Fastify instance with no real network boundary
    to introduce latency over, and no criterion or bound node states a timeout-handling requirement specific
    to this route; a rejected dependency call is covered by the generic-error test above
untested:
- the actual creation of a capability at a new (name, version) — as opposed to the route echoing back
  whatever registerCapability resolved — is proven only by the pre-existing capability-registry.service.spec.ts
  tests 'accepts a complete read-only contract and answers the capability as registered' and 'persists
  an accepted registration through the store', not by anything newly written here; the route itself holds
  no creation logic of its own to test independently
- the store-level fact that a second registration at an already-held (name, version) replaces the record
  in place rather than adding a second one is proven only by the pre-existing capability-registry.service.spec.ts
  test 'replaces the held record when a held name and version register again'; this proof's own route-level
  tests establish only that the route never answers a cached or stale response across repeated requests
- the actual computation of the sixty-second default (registration.timeout ?? DEFAULT_CAPABILITY_TIMEOUT_MS)
  is proven only by the pre-existing capability-registry.service.spec.ts test 'holds the default of sixty
  seconds, as 60000 milliseconds, for a registration that states no timeout'; this proof's own route-level
  tests establish only that the route/DTO inject no default of their own
- the actual read-only-nature refusal decision (registration.nature !== READ_ONLY_NATURE) is proven only
  by the pre-existing capability-registry.service.spec.ts test 'refuses a registration whose nature is
  mutating'; this proof's own route-level test establishes only the new HTTP status-mapping half
- the actual concept-already-answered refusal decision is proven only by the pre-existing capability-query.port.spec.ts
  test 'refuses a registration naming a concept a different capability already answers'; this proof's
  own route-level test establishes only the new HTTP status-mapping half
- 'the new status-map entry for IncompleteCapabilityContractError (422) is exercised by no test in this
  proof: every attribute it could refuse (name, version, nature, input_schema, output_schema, connector,
  concept, and timeout''s own integer shape) is already required and shape-checked by registerCapabilityParamsSchema/registerCapabilityBodySchema
  before the controller is ever reached, so as far as this route is concerned the mapping is unreachable
  from HTTP and no criterion of the seven asks for its demonstration'
- the no-second-Zod-response-schema inference is not independently isolated by any test; it is only indirectly
  supported by the criterion-1 test's exact response-body equality, since an absence of behavior (declaring
  no schema) has nothing further to observe beyond what that assertion already covers
divergences:
- from: the closed initiatives' own fixture default
  departure: Two shared test-fixture helpers — heldCapability/completeRegistration in __tests__/unit/capability-registry/capability-registry.service.spec.ts,
    and registerCoherentCapability in __tests__/integration/case/release.operation.spec.ts — originally
    written by tasks under the now-closed initiatives case-authoring-mvp and retire-case-file-medium-convention,
    defaulted a capability registration's input_schema/output_schema to the placeholder strings 'an-input-schema'
    and 'an-output-schema', neither of which is syntactically valid JSON. Both defaults were changed to
    a syntactically valid JSON value ('{}', or a value matching an existing sibling convention in the
    same file) directly in this proof, rather than through a proof-only re-delivery of the owning (closed)
    task.
  why: 'This task''s own new invariant (rules/integration/a-capability-declares-well-formed-schemas) correctly
    refuses those placeholders, so every pre-existing test reusing a shared helper without overriding
    the schema fields was refused before reaching what it meant to test — a captured suite run first surfaced
    10 such failures, and a second, longer capture (after the registry''s own declared test-step timeout
    was separately raised, also disclosed on the implementation record) surfaced 7 more across additional
    files the first, timed-out capture never reached: __tests__/integration/capability-registry/capability-query.port.spec.ts,
    __tests__/integration/case/manifest-collects-survive-release.spec.ts, __tests__/integration/factories/capability-registry.factory.spec.ts,
    __tests__/integration/factories/case-query.factory.spec.ts, __tests__/integration/factories/store-wiring.spec.ts,
    __tests__/integration/persistence/relational-capability-store.repository.spec.ts, and __tests__/unit/capability-registry/capability-query.port.spec.ts.
    Both owning initiatives'' work roots hold closure.md, so /implement-task refuses to write new source
    against either closed plan; the ordinary proof-only re-delivery route is unavailable. The human explicitly
    authorized fixing every one of these fixtures directly, since the change is purely placeholder data
    with no semantic weight (any string satisfied the old, non-existent invariant equally) and changes
    no assertion''s meaning except a small number of echoing expectations, updated to match.'
---

## What it is

Unit tests proving register-capability's seven criteria at both the service layer (the new schema-well-formedness refusal) and the HTTP layer (routing, status mapping, DTO validation, no-auth), plus the fixture corrections a full suite run required across nine pre-existing test files and one production seed fixture (recorded on the implementation, since it is not a test) so this task's new, always-on invariant does not break what it does not govern.

## Notes

None.
