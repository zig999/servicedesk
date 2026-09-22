---
target: backend
title: Delete routes for connector, capability and concept — first review
summary: Four passes over the 11 tasks delivering DELETE routes and their supporting store/service/reader
  layers for connector-configuration, capability and concept removal.
reviewed:
- src/capability-registry/capability-store.port.ts
- src/persistence/relational-capability-store.repository.ts
- src/capability-registry/capability-registry.service.ts
- src/errors/capability-cited-by-evidence.error.ts
- src/http/dto/remove-capability.dto.ts
- src/http/remove-capability.controller.ts
- src/http/remove-capability.routes.ts
- src/errors/status-map.ts
- src/http/build-app.ts
- src/factories/build-app.factory.ts
- src/glossary/glossary-store.port.ts
- src/persistence/relational-glossary-store.repository.ts
- src/errors/concept-in-use.error.ts
- src/glossary/glossary.service.ts
- src/http/dto/remove-concept.dto.ts
- src/http/remove-concept.controller.ts
- src/http/remove-concept.routes.ts
- src/factories/glossary.factory.ts
- src/connector-registry/connector-configuration-store.port.ts
- src/persistence/relational-connector-configuration-store.repository.ts
- src/connector-registry/connector-configuration-registry.service.ts
- src/http/dto/remove-connector.dto.ts
- src/http/remove-connector.controller.ts
- src/http/remove-connector.routes.ts
- src/capability-registry/evidence-usage-reader.port.ts
- src/persistence/relational-investigation-store.repository.ts
- src/factories/investigation-store.factory.ts
- src/glossary/concept-usage-reader.port.ts
- src/factories/concept-usage-reader.factory.ts
- src/persistence/relational-case-store.repository.ts
tasks:
- task/capability-removal/capability-store-delete
- task/capability-removal/remove-capability-operation
- task/capability-removal/remove-capability-route
- task/concept-removal/concept-store-delete
- task/concept-removal/remove-concept-operation
- task/concept-removal/remove-concept-route
- task/connector-configuration-removal/connector-configuration-store-delete
- task/connector-configuration-removal/remove-connector-operation
- task/connector-configuration-removal/remove-connector-route
- task/cross-context-usage-reads/capability-evidence-usage-reader
- task/cross-context-usage-reads/concept-usage-reader
passes:
- pass: coverage
- pass: conformance
- pass: standard
- pass: failures
  missing: the captured run (run/delete-routes-connector-capability-concept) passed every step cleanly,
    so there was no failure to diagnose
coverage:
- criterion: The store port declares a removal taking name and version together, the composite identity
    a capability is registered at.
  state: partial
  tests:
  - file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
    name: issues exactly one parameterized DELETE against capabilities inside BEGIN and COMMIT, naming
      both name and version together, with no guard query ahead of it
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: removes the capability, so a subsequent read of the registry finds nothing registered at that
      identity, when the evidence-usage reader reports it is not cited
  why: 'Nothing in the set asserts ICapabilityStore''s own declaration: the two sibling store ports each
    have an expectTypeOf spec (glossary-store.port.spec.ts, connector-configuration-store.port.spec.ts)
    and this port has none. The name-and-version keying is exercised only on the relational implementation
    and on the in-memory double, whose `implements ICapabilityStore` is checked by the separate `tsc --noEmit`
    script and never by the `vitest run` the project''s own test script invokes, so a port that dropped
    or re-keyed the declaration would leave every test in the set passing.'
- criterion: The relational implementation issues a delete statement against the capability relation inside
    a transaction.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
    name: issues exactly one parameterized DELETE against capabilities inside BEGIN and COMMIT, naming
      both name and version together, with no guard query ahead of it
- criterion: After the removal, a read of the registered capabilities does not return that name and version.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: removes exactly the capability at the named identity, leaving a capability sharing that name
      at a different version exactly as it was
- criterion: A capability sharing the name at a different version is still returned after the removal.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: removes exactly the capability at the named identity, leaving a capability sharing that name
      at a different version exactly as it was
- criterion: The store port's existing write method keeps its current signature and behaviour, the removal
    being a method of its own rather than a new meaning for the write.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
    name: upserts each given capability by its own (name, version) identity, inside one transaction, and
      never sends a DELETE
  - file: src/__tests__/unit/persistence/relational-capability-store.repository.spec.ts
    name: sends no statement but BEGIN and COMMIT, and in particular no DELETE, when writing an empty
      set
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: persists and reads back a registration exactly as given — name, version, nature, both schemas,
      timeout, connector and concept
  - file: src/__tests__/integration/persistence/relational-capability-store.repository.spec.ts
    name: leaves capability-a exactly as it was when a different capability, capability-b, is written
      afterward
  - file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
    name: upserts each given configuration by its own connector identity, inside one transaction, and
      never sends a DELETE
  - file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
    name: sends no statement but BEGIN and COMMIT, and in particular no DELETE, when writing an empty
      set
  - file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
    name: leaves connector-a exactly as it was when a different connector, connector-b, is written afterward
  - file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
    name: keeps exactly one row for a connector name after two writes to the same identity, never appending
      a duplicate
- criterion: Where no collected evidence item names the identity, this rule does not refuse the removal,
    and a subsequent read of the registry finds nothing registered at that name and version.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: removes the capability, so a subsequent read of the registry finds nothing registered at that
      identity, when the evidence-usage reader reports it is not cited
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: completes with no refusal when nothing is registered at the requested identity, since nothing
      there is named by evidence either
- criterion: Where a collected evidence item names the identity, the operation refuses the removal.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses removal with CapabilityCitedByEvidenceError when the evidence-usage reader reports the
      identity is cited
- criterion: Where the operation refuses, the capability is still registered at that identity afterwards.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: leaves the capability registered at that identity when the removal is refused
- criterion: Where the operation refuses, it does so before any delete statement is issued, so no database
    constraint violation reaches the caller in place of the refusal.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses before any delete statement is issued, so a failure the store would raise on delete
      never reaches the caller in place of the refusal
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses before any delete statement is issued, so a database constraint violation the store
      would raise on delete never reaches the caller in place of the refusal (criterion 7)
- criterion: The refusal is raised as a domain error of its own, distinct from every error already raised
    by registering a capability.
  state: partial
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses removal with CapabilityCitedByEvidenceError when the evidence-usage reader reports the
      identity is cited
  why: That the refusal is an error of its own is exercised; its distinctness from every error registering
    a capability raises is not. The only assertion is `toBeInstanceOf(CapabilityCitedByEvidenceError)`,
    so a refusal class extending IncompleteCapabilityContractError, CapabilityNotReadOnlyError or CapabilitySchemaNotWellFormedError
    would still pass. The sibling glossary test does assert the negative (`not.toBeInstanceOf` the registration
    errors); nothing here does.
- criterion: The guard obtains its answer through the evidence usage reader port, the registry reading
    no investigation store directly.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses removal with CapabilityCitedByEvidenceError when the evidence-usage reader reports the
      identity is cited
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: removes the capability, so a subsequent read of the registry finds nothing registered at that
      identity, when the evidence-usage reader reports it is not cited
- criterion: The guard consults no case version's collection plan and no derived input requirement, nothing
    else persisting a reference to a capability by identity.
  state: partial
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: removes the capability, so a subsequent read of the registry finds nothing registered at that
      identity, when the evidence-usage reader reports it is not cited
  why: 'The removal tests simply inject no case or input-requirement source, which is weaker than asserting
    the guard consults none: no test constructs a case version whose collection plan or derived input
    requirement names the identity and shows the removal still completing, and no test injects a would-be
    second source that throws if read — the shape the sibling connector test (''consults no capability
    before removing, succeeding even though the injected capabilities reader would throw if invoked'')
    uses for exactly this claim.'
- criterion: The route is registered under the DELETE method on the same name-and-version path the existing
    identity read uses.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: answers the DELETE to /v1/capabilities/{name}/{version} through remove-capability and the GET
      to the identical path through read-capability-by-identity, neither one colliding with the other
  - file: src/__tests__/unit/http/remove-capability.routes.spec.ts
    name: answers 204 with a wholly empty body, identically for a capability identity currently registered
      and one nothing is registered under
- criterion: A request whose path segments fail the route's declared shape is refused with an HTTP 400
    response whose error code is VALIDATION_ERROR, whose message names the path as what failed validation,
    and whose details list the issues found.
  state: covered
  tests:
  - file: src/__tests__/unit/http/remove-capability.routes.spec.ts
    name: answers 400 via validation for a request with an empty :version segment, never reaching removeCapability
      — Fastify still matches the route with an empty string param for this segment, and removeCapabilityParamsSchema
      (z.string().min(1)) is what refuses it
- criterion: The operation's refusal error is named in the status map, so it is not answered with the
    HTTP 500 INTERNAL_ERROR response and fixed message that a domain error the map does not name receives.
  state: covered
  tests:
  - file: src/__tests__/unit/http/remove-capability.routes.spec.ts
    name: answers HTTP 409 naming CapabilityCitedByEvidenceError and its (name, version) context as details,
      when removeCapability rejects with that class
  - file: src/__tests__/unit/http/remove-capability.routes.spec.ts
    name: answers the unchanged generic envelope, never a partial body or leaked detail, when removeCapability
      rejects with a generic, non-domain error
  - file: src/__tests__/unit/http/remove-concept.routes.spec.ts
    name: answers HTTP 409 naming ConceptInUseError and its (concept, reference) context as details, when
      removeConcept rejects with that class
  - file: src/__tests__/unit/http/remove-concept.routes.spec.ts
    name: answers the unchanged generic envelope, never a partial body or leaked detail, when removeConcept
      rejects with a generic, non-domain error
- criterion: The route declares and invokes no authentication middleware, guard or check.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: dispatches every registered route for a request carrying no credential of any kind, refusing
      none of them for lacking one
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: registers at least one route on the assembled app, so the sweep below is never vacuous
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: names no authentication package in any file of the API layer
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: declares no authentication guard, middleware or credential check in any file of the API layer
- criterion: A request naming an identity no collected evidence names leaves nothing registered at that
    identity, a subsequent identity read answering as the specification already states it answers for
    an identity nothing is registered at.
  state: partial
  tests:
  - file: src/__tests__/unit/http/remove-capability.routes.spec.ts
    name: answers 204 with a wholly empty body, identically for a capability identity currently registered
      and one nothing is registered under
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: removes the capability, so a subsequent read of the registry finds nothing registered at that
      identity, when the evidence-usage reader reports it is not cited
  why: 'No test drives the DELETE against a real registry: the route spec''s removeCapability is a vi.fn()
    and build-app.spec''s is `async () => undefined`, so what the request leaves registered is never observed.
    The route half proven is only that the request''s two path segments reach the operation as (''a-capability'',
    ''1.0.0''); the registry half is proven separately, against the service. The subsequent identity read
    is stubbed in the built app to answer a capability for every name and version, so nothing exercises
    its answer for an identity nothing is registered at.'
- criterion: The route, its controller, its request shape and the operation it calls are four separate
    files, following the separation the existing delete routes use.
  state: partial
  tests:
  - file: src/__tests__/unit/http/remove-capability.routes.spec.ts
    name: answers 204 with a wholly empty body, identically for a capability identity currently registered
      and one nothing is registered under
  - file: src/__tests__/unit/http/remove-concept.routes.spec.ts
    name: answers 204 with a wholly empty body, identically for a concept currently held and one nothing
      answers, records, cites or collects
  - file: src/__tests__/unit/http/remove-connector.routes.spec.ts
    name: answers 204 with a wholly empty body, identically for a connector name currently registered
      and one nothing is registered under
  why: 'Only the route file''s separate existence is runtime-binding: the spec value-imports createRemoveCapabilityRoutesPlugin
    from http/remove-capability.routes.js. Its controller import is `import type`, erased before the test
    runs, so a controller merged into the route file would break nothing; the request-shape DTO is named
    in a test''s title but imported by nothing; and no test relates the operation''s file to the other
    three. Nothing asserts four files. | Only the route file''s separate existence is runtime-binding:
    the spec value-imports createRemoveConceptRoutesPlugin from http/remove-concept.routes.js. Its controller
    import is `import type`, erased before the test runs; the request-shape DTO is named in a test''s
    title but imported by nothing; and no test relates the operation''s file to the other three. Nothing
    asserts four files. | Only the route file''s separate existence is runtime-binding: the spec value-imports
    createRemoveConnectorRoutesPlugin from http/remove-connector.routes.js. Its controller import is `import
    type`, erased before the test runs; the request-shape DTO is named in a test''s title but imported
    by nothing; and no test relates the operation''s file to the other three. Nothing asserts four files.'
- criterion: The controller re-raises whatever the operation raises rather than mapping it to a response
    itself.
  state: partial
  tests:
  - file: src/__tests__/unit/http/remove-capability.routes.spec.ts
    name: answers HTTP 409 naming CapabilityCitedByEvidenceError and its (name, version) context as details,
      when removeCapability rejects with that class
  - file: src/__tests__/unit/http/remove-capability.routes.spec.ts
    name: answers the unchanged generic envelope, never a partial body or leaked detail, when removeCapability
      rejects with a generic, non-domain error
  - file: src/__tests__/unit/http/remove-concept.routes.spec.ts
    name: answers HTTP 409 naming ConceptInUseError and its (concept, reference) context as details, when
      removeConcept rejects with that class
  - file: src/__tests__/unit/http/remove-concept.routes.spec.ts
    name: answers the unchanged generic envelope, never a partial body or leaked detail, when removeConcept
      rejects with a generic, non-domain error
  - file: src/__tests__/unit/http/remove-connector.routes.spec.ts
    name: answers the unchanged generic envelope, never a partial body or leaked detail, when removeConnector
      rejects with a generic, non-domain error
  why: 'What is proven is the response a raised error produces, not who produced it: a controller that
    caught the refusal and replied 409 with the same code and details, and caught the generic error and
    replied with the same INTERNAL_ERROR envelope, would satisfy both assertions. Nothing distinguishes
    re-raising to the shared error handler from mapping inside the controller. | What is proven is the
    response a raised error produces, not who produced it: a controller that caught ConceptInUseError
    and replied 409 with the same code and details, and caught the generic error and replied with the
    same INTERNAL_ERROR envelope, would satisfy both assertions. Nothing distinguishes re-raising to the
    shared error handler from mapping inside the controller. | One rejection shape is exercised — a generic
    Error producing the shared 500 envelope — and it does not distinguish a controller that re-raises
    from one that catches and replies with the same envelope itself. Unlike the capability and concept
    routes, no test rejects with a domain error at all here, so what the controller does with the operation''s
    own refusals is unexercised in both respects.'
- criterion: The application build registers the route, so a built app answers the method and path.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: answers the DELETE to /v1/capabilities/{name}/{version} through remove-capability and the GET
      to the identical path through read-capability-by-identity, neither one colliding with the other
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: answers the DELETE to /v1/glossary/concepts/{name} through remove-concept and the PUT to the
      identical path through register-concept, neither one colliding with the other
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: answers the DELETE to /v1/connectors/{connector} through remove-connector and the PUT to the
      identical path through register-connector, neither one colliding with the other
- criterion: The store port declares a removal keyed by the concept name alone, the one identity a concept
    has.
  state: partial
  tests:
  - file: src/__tests__/unit/glossary/glossary-store.port.spec.ts
    name: declares deleteConcept keyed by the concept name alone, returning Promise<void>, alongside the
      existing read and write methods
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: deletes a concept's own concept_accepts rows before its concepts row, both parameterized to
      the given name alone, inside one BEGIN/COMMIT transaction with no guard query ahead of them
  why: The port spec's only assertions are `expectTypeOf` ones, which carry no runtime check; the project's
    test script is `vitest run --passWithNoTests` with no `--typecheck` and vitest.config.ts declares
    no typecheck block, so that spec passes whatever IGlossaryStore declares. The declared signature is
    enforced only by the separate `tsc --noEmit` script, outside the test set. What the set exercises
    is the relational implementation keyed by the name alone, not the port's declaration.
- criterion: The relational implementation deletes the concept's accepted-subject-type rows and the concept
    row in one transaction, so neither is left behind when the other is gone.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: deletes a concept's own concept_accepts rows before its concepts row, both parameterized to
      the given name alone, inside one BEGIN/COMMIT transaction with no guard query ahead of them
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: raises this store's own typed error, carrying the driver failure as its cause, and rolls back
      leaving nothing committed, when a concept delete is refused
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: removes the named concept and its own accepts declaration so a subsequent read no longer returns
      it, leaving a different concept and the subject types either concept accepted exactly as they were
- criterion: After the removal, a read of the registered concepts does not return that name.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: removes the named concept and its own accepts declaration so a subsequent read no longer returns
      it, leaving a different concept and the subject types either concept accepted exactly as they were
- criterion: The subject types the removed concept accepted are still held in their own vocabulary after
    the removal.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: removes the named concept and its own accepts declaration so a subsequent read no longer returns
      it, leaving a different concept and the subject types either concept accepted exactly as they were
- criterion: The store port's existing concept write method keeps its current signature and behaviour,
    the removal being a method of its own rather than a new meaning for the write.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: never issues a DELETE against concepts — not an unfiltered one, and not one scoped to the given
      names either — no matter how many concepts are given
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: runs exactly one statement against concepts per given concept, always the same upsert-by-identity
      INSERT ... ON CONFLICT (name) DO UPDATE, never a SELECT or any other form
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: reconciles concept_accepts once per given concept, each one's own DELETE and INSERTs carrying
      only that concept's own name — for every concept in the given array, not only the first
  - file: src/__tests__/integration/persistence/relational-glossary-store.repository.spec.ts
    name: creates a concept at a brand-new name without failing, and leaves a different, already-held
      concept — permanently referenced by a capability — exactly as it was, even though that referenced
      concept is not named anywhere in this call
- criterion: Where nothing answers, records, cites or collects the name, this rule does not refuse the
    removal, and a subsequent read of the glossary by that name answers as the specification already states
    it answers for a name the glossary does not hold.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: removes the concept, so a subsequent read finds nothing held at that name, when nothing answers,
      records, cites or collects it (criterion 1)
- criterion: Where a registered capability answers the concept, the operation refuses the removal.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses removal with a ConceptInUseError naming the capability reference, distinct from every
      error registerConcept raises, when a registered capability answers the concept (criteria 2, 8)
- criterion: Where a collected evidence item names the concept, the operation refuses the removal.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses removal with a ConceptInUseError naming the evidence reference when a collected evidence
      item names the concept (criterion 3)
- criterion: Where an evaluation citation names the concept and no collected evidence item names it, the
    operation refuses the removal.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses removal with a ConceptInUseError naming the citation reference when an evaluation citation
      names the concept (criterion 4)
  - file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
    name: answers that a concept is named, through reference "citation", when a stored evaluation citation
      records that exact concept and no stored evidence item does
- criterion: Where a hypothesis-revision's own collects lists the concept and no case version manifests
    that revision, the operation refuses the removal.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses removal with a ConceptInUseError naming the hypothesis-revision-collects reference when
      a hypothesis-revision's own collects lists the concept (criterion 5)
  - file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
    name: answers that a concept is named, through reference "hypothesis-revision-collects", when a hypothesis-revision's
      own collects lists that exact concept and no case version manifests that revision
- criterion: Where the operation refuses, the concept is still held in the glossary afterwards.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: leaves the concept held in the glossary after the removal is refused (criterion 6)
- criterion: The refusal is raised as a domain error of its own, distinct from every error already raised
    by registering a concept.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses removal with a ConceptInUseError naming the capability reference, distinct from every
      error registerConcept raises, when a registered capability answers the concept (criteria 2, 8)
- criterion: The guard obtains all four answers through the concept usage reader port, the glossary reading
    no capability, case or investigation store directly.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses removal with a ConceptInUseError naming the capability reference, distinct from every
      error registerConcept raises, when a registered capability answers the concept (criteria 2, 8)
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses removal with a ConceptInUseError naming the evidence reference when a collected evidence
      item names the concept (criterion 3)
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses removal with a ConceptInUseError naming the citation reference when an evaluation citation
      names the concept (criterion 4)
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: refuses removal with a ConceptInUseError naming the hypothesis-revision-collects reference when
      a hypothesis-revision's own collects lists the concept (criterion 5)
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: removes the concept, so a subsequent read finds nothing held at that name, when nothing answers,
      records, cites or collects it (criterion 1)
- criterion: The route is registered under the DELETE method on the same concept-name path the existing
    concept registration route uses.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: answers the DELETE to /v1/glossary/concepts/{name} through remove-concept and the PUT to the
      identical path through register-concept, neither one colliding with the other
  - file: src/__tests__/unit/http/remove-concept.routes.spec.ts
    name: answers 204 with a wholly empty body, identically for a concept currently held and one nothing
      answers, records, cites or collects
- criterion: A request whose path segment fails the route's declared shape is refused with an HTTP 400
    response whose error code is VALIDATION_ERROR, whose message names the path as what failed validation,
    and whose details list the issues found.
  state: covered
  tests:
  - file: src/__tests__/unit/http/remove-concept.routes.spec.ts
    name: answers 400 via validation for a request with an empty :name segment, never reaching removeConcept
      — Fastify still matches the route with an empty string param for this segment, and removeConceptParamsSchema
      (z.string().min(1)) is what refuses it
  - file: src/__tests__/unit/http/remove-connector.routes.spec.ts
    name: answers 400 via validation for a request with an empty :connector segment, never 404 "route
      not found" — Fastify still matches the route with an empty string param for this segment, and removeConnectorParamsSchema
      (z.string().min(1)) is what refuses it
- criterion: A request naming a concept nothing answers, records, cites or collects leaves that name unheld
    by the glossary, a subsequent read of it answering as the specification already states it answers
    for an unheld name.
  state: partial
  tests:
  - file: src/__tests__/unit/http/remove-concept.routes.spec.ts
    name: answers 204 with a wholly empty body, identically for a concept currently held and one nothing
      answers, records, cites or collects
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: removes the concept, so a subsequent read finds nothing held at that name, when nothing answers,
      records, cites or collects it (criterion 1)
  why: 'No test drives the DELETE against a real glossary: the route spec''s removeConcept is a vi.fn()
    and build-app.spec''s is `async () => undefined`, so the name''s unheldness after the request is never
    observed. Only the request''s path segment reaching the operation as ''a-concept'' is proven at the
    route; the unheld outcome is proven separately at the service. The built app''s readConcept stub answers
    held for every name, so the read''s answer for an unheld name is exercised nowhere in the set.'
- criterion: The store port declares a removal keyed by the connector name alone, the one identity a connector
    configuration has.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-store.port.spec.ts
    name: declares deleteConnectorConfiguration keyed by the connector name alone, returning Promise<void>,
      alongside the existing read and write methods
  - file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
    name: issues exactly one parameterized DELETE against connector_configurations inside BEGIN and COMMIT,
      naming only the connector, with no guard query ahead of it
  why: The port spec's only assertions are `expectTypeOf` ones, which carry no runtime check; the project's
    test script is `vitest run --passWithNoTests` with no `--typecheck` and vitest.config.ts declares
    no typecheck block, so that spec passes whatever IConnectorConfigurationStore declares. The declared
    signature is enforced only by the separate `tsc --noEmit` script, outside the test set. What the set
    exercises is the relational implementation keyed by the connector alone, not the port's declaration.
- criterion: The relational implementation issues a delete statement against the connector-configuration
    relation inside a transaction.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
    name: issues exactly one parameterized DELETE against connector_configurations inside BEGIN and COMMIT,
      naming only the connector, with no guard query ahead of it
  - file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
    name: raises this store's own typed error, carrying the driver failure as its cause, and rolls back,
      when the delete is refused
- criterion: After the removal, a read of the registered connector configurations does not return that
    name.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
    name: removes the named connector configuration so a subsequent read no longer includes it, leaving
      a different, unrelated connector configuration untouched
- criterion: Where a configuration is registered under the name, the operation removes it and a subsequent
    read of the registry does not return it.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: removes the configuration registered under the name, so a subsequent read of the registry no
      longer returns it
- criterion: Where a capability currently names that connector as its own, this rule does not refuse the
    removal.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: does not refuse removing a connector currently named by a registered capability, capability-naming
      being the only condition about a connector's use this domain declares
- criterion: A capability naming the removed connector is still registered after the removal, the removal
    writing to no capability.
  state: uncovered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: still answers a capability naming the removed connector after the removal, unchanged, since
      the operation writes to no capability
  why: 'The one test on this criterion reads the capability back through an ICapabilitiesReader stub whose
    body is `async () => [capability]` — a constant independent of anything the removal does. Its assertion
    cannot fail for this criterion: were removeConnector to write to a capability store, the stub would
    still answer the same array. Nothing in the set observes a capability''s registration across a removal
    against a store the removal could have written to, so neither half — still registered afterwards,
    writing to no capability — is exercised. The test is named here because a reader opening the file
    will otherwise see it and take the criterion as proven.'
- criterion: The operation consults no capability and performs no placeholder check before removing.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: consults no capability before removing, succeeding even though the injected capabilities reader
      would throw if invoked
- criterion: The operation raises no refusal of its own on any condition about the connector's use.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: does not refuse removing a connector currently named by a registered capability, capability-naming
      being the only condition about a connector's use this domain declares
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: consults no capability before removing, succeeding even though the injected capabilities reader
      would throw if invoked
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: succeeds without refusal against a connector nothing is registered under, leaving every registered
      configuration exactly as it stood
- criterion: The route is registered under the DELETE method on the same connector-name path the existing
    registration route uses.
  state: covered
  tests:
  - file: src/__tests__/unit/http/build-app.spec.ts
    name: answers the DELETE to /v1/connectors/{connector} through remove-connector and the PUT to the
      identical path through register-connector, neither one colliding with the other
  - file: src/__tests__/unit/http/remove-connector.routes.spec.ts
    name: answers 204 with a wholly empty body, identically for a connector name currently registered
      and one nothing is registered under
- criterion: A request naming a registered connector leaves that connector unregistered, a subsequent
    read of the name answering as the specification already states it answers for a name nothing is registered
    at.
  state: partial
  tests:
  - file: src/__tests__/unit/http/remove-connector.routes.spec.ts
    name: answers 204 with a wholly empty body, identically for a connector name currently registered
      and one nothing is registered under
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: removes the configuration registered under the name, so a subsequent read of the registry no
      longer returns it
  why: 'No test drives the DELETE against a real registry: the route spec''s removeConnector is a vi.fn()
    and build-app.spec''s is `async () => undefined`, so nothing observes the connector unregistered after
    a request. Only the path segment reaching the operation as ''a-connector'' is proven at the route;
    the unregistered outcome is proven separately at the service, where the read answers `{ held: false,
    connector }`. The built app''s readConnectorConfiguration stub answers a configuration for every name,
    so the route-level read of an unregistered name is exercised nowhere.'
- criterion: The port takes a capability identity as name and version together, the composite identity
    a capability is registered at.
  state: covered
  tests:
  - file: src/__tests__/unit/factories/investigation-store.factory.spec.ts
    name: forwards a composite identity's own name and version, in that order, as the underlying query's
      own parameters, and answers true when a row comes back — through the same factory function build-app.factory.ts's
      composeResources calls beside createConnectorConfigurationsReader
- criterion: Given a stored evidence item recording that name and version as what produced it, the reader
    answers that the identity is named.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: answers true from isCapabilityNamedByEvidence when a stored evidence item names that exact capability
      name and version as what produced it
  - file: src/__tests__/unit/factories/investigation-store.factory.spec.ts
    name: forwards a composite identity's own name and version, in that order, as the underlying query's
      own parameters, and answers true when a row comes back — through the same factory function build-app.factory.ts's
      composeResources calls beside createConnectorConfigurationsReader
- criterion: Given no stored evidence item recording that name and version, the reader answers that the
    identity is not named.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: answers false from isCapabilityNamedByEvidence when no stored evidence item names the given
      capability name and version at all
- criterion: Given a stored evidence item recording the same name at a different version, the reader answers
    that the queried identity is not named.
  state: covered
  tests:
  - file: src/__tests__/integration/persistence/relational-investigation-store.repository.spec.ts
    name: answers false from isCapabilityNamedByEvidence when the only stored evidence item names the
      same capability name at a different version
- criterion: The port is declared in the capability-registry module and the adapter answering it reads
    the recorded evidence through the relational store that holds it, the capability-registry module importing
    no database driver to obtain the answer.
  state: partial
  tests:
  - file: src/__tests__/unit/capability-registry/evidence-usage-reader.port.spec.ts
    name: declares IEvidenceUsageReader and its composite capability identity with no import statement
      at all, so the capability-registry module reaches no database driver through this file
  - file: src/__tests__/unit/factories/investigation-store.factory.spec.ts
    name: forwards a composite identity's own name and version, in that order, as the underlying query's
      own parameters, and answers true when a row comes back — through the same factory function build-app.factory.ts's
      composeResources calls beside createConnectorConfigurationsReader
  why: 'The no-import assertion reads one file, capability-registry/evidence-usage-reader.port.ts; no
    test sweeps the rest of the capability-registry module for a driver import, so a driver reached from
    any other file of that module leaves the set green (contrast the http layer, which build-app.spec
    does sweep directory-wide). And the adapter''s reading "through the relational store that holds it"
    is unexercised: the factory test drives a fake connection and asserts the parameters a query receives,
    which an adapter issuing its own SQL would satisfy identically.'
- criterion: The adapter is constructible from the same composition point that already builds the capability
    registry's other cross-module reader.
  state: partial
  tests:
  - file: src/__tests__/unit/factories/investigation-store.factory.spec.ts
    name: forwards a composite identity's own name and version, in that order, as the underlying query's
      own parameters, and answers true when a row comes back — through the same factory function build-app.factory.ts's
      composeResources calls beside createConnectorConfigurationsReader
  why: 'Constructibility from a factory function taking a connection is exercised; the composition point
    is not. The test calls createEvidenceUsageReader directly and only its title claims the tie to build-app.factory.ts''s
    composeResources and to createConnectorConfigurationsReader — a title is not evidence. No test in
    the set exercises build-app.factory.ts at all: build-app.spec assembles the app from hand-written
    stub dependencies, never through that composition point, so the two readers being built together there
    would break no test if it stopped being true.'
- criterion: Given a registered capability whose own concept is the queried name, the reader answers that
    the concept is named.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
    name: answers that a concept is named, through reference "capability", when a registered capability
      answers that exact concept
- criterion: Given a stored evidence item recording the queried concept, the reader answers that the concept
    is named.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
    name: answers that a concept is named, through reference "evidence", when a stored evidence item records
      that exact concept and no capability answers it
- criterion: Given a stored evaluation citation recording the queried concept and no stored evidence item
    recording it, the reader answers that the concept is named.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
    name: answers that a concept is named, through reference "citation", when a stored evaluation citation
      records that exact concept and no stored evidence item does
- criterion: Given a hypothesis-revision whose own collects lists the queried concept and which no case
    version manifests, the reader answers that the concept is named.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
    name: answers that a concept is named, through reference "hypothesis-revision-collects", when a hypothesis-revision's
      own collects lists that exact concept and no case version manifests that revision
  - file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
    name: answers that a concept is not named when a hypothesis-revision's own collects lists it but a
      case version already manifests that revision
- criterion: Given nothing that answers, records, cites or collects the queried name, the reader answers
    that the concept is not named.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
    name: answers that a concept is not named when nothing answers, records, cites or collects it
- criterion: The reader reports which of the four kinds of reference it found, so a caller can refuse
    for a stated reason rather than for an unexplained one.
  state: covered
  tests:
  - file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
    name: answers that a concept is named, through reference "capability", when a registered capability
      answers that exact concept
  - file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
    name: answers that a concept is named, through reference "evidence", when a stored evidence item records
      that exact concept and no capability answers it
  - file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
    name: answers that a concept is named, through reference "citation", when a stored evaluation citation
      records that exact concept and no stored evidence item does
  - file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
    name: answers that a concept is named, through reference "hypothesis-revision-collects", when a hypothesis-revision's
      own collects lists that exact concept and no case version manifests that revision
- criterion: The port is declared in the glossary module and the glossary module imports no database driver
    to obtain the answer.
  state: partial
  tests:
  - file: src/__tests__/unit/glossary/concept-usage-reader.port.spec.ts
    name: declares IConceptUsageReader and its resolution types with no import statement at all, so the
      glossary module reaches no database driver, framework or provider client through this file
  why: The assertion reads one file, glossary/concept-usage-reader.port.ts, and only that the file contains
    no `import` line. Nothing sweeps the rest of the glossary module — glossary.service.ts, glossary-store.port.ts,
    terms.ts — so a database driver imported anywhere else in the module leaves every test in the set
    passing; the http layer's own sweep in build-app.spec is the directory-wide shape this criterion would
    need.
- criterion: The adapter is constructible from the same composition point that already builds the other
    cross-module readers.
  state: partial
  tests:
  - file: src/__tests__/integration/factories/concept-usage-reader.factory.spec.ts
    name: answers that a concept is named, through reference "capability", when a registered capability
      answers that exact concept
  why: Constructibility from a factory is exercised — every test in the file builds the adapter through
    createConceptUsageReader(pool, createCapabilityRegistry(pool)) against the real database — but the
    composition point is not. No test in the set exercises build-app.factory.ts, where the other cross-module
    readers are built; build-app.spec assembles the app from hand-written stub dependencies instead, so
    the adapter ceasing to be built there, or being built from somewhere else, would break nothing.
findings:
- pass: standard
  file: src/persistence/relational-capability-store.repository.ts
  where: line 24, the constructor
  evidence: 'public constructor(private readonly connection: DatabaseConnection) {}'
  cost: DatabaseConnection is a type alias for pg's concrete Pool class, not the IConnectableQueryable
    interface this same codebase already defines and that runStatement/runInTransaction accept. A test
    of RelationalCapabilityStore has to construct or cast to an actual Pool rather than passing a small
    object matching IConnectableQueryable, and the sibling RelationalGlossaryStore and RelationalInvestigationStore
    in this same file set already take the interface, so the inconsistency is visible without leaving
    these files.
  correction: Type the constructor parameter as IConnectableQueryable, matching RelationalGlossaryStore
    and RelationalInvestigationStore.
  cites: ARC-01
- pass: standard
  file: src/persistence/relational-connector-configuration-store.repository.ts
  where: line 15, the constructor
  evidence: 'public constructor(private readonly connection: DatabaseConnection) {}'
  cost: 'Same coupling to the concrete pg Pool type as RelationalCapabilityStore: a test of this repository
    has to stand up something typed as Pool instead of the IConnectableQueryable interface the connection
    is actually used through (runStatement/runInTransaction).'
  correction: Type the constructor parameter as IConnectableQueryable.
  cites: ARC-01
- pass: standard
  file: src/persistence/relational-case-store.repository.ts
  where: line 124, the constructor
  evidence: 'public constructor(private readonly connection: DatabaseConnection) {}'
  cost: Same concrete-Pool coupling as the other two repositories; this is the largest of the three classes
    reviewed, so the cost of standing up a real Pool (or an unsafe cast) to exercise any one of its many
    methods in a test is paid across the whole class.
  correction: Type the constructor parameter as IConnectableQueryable.
  cites: ARC-01
- pass: standard
  file: src/factories/glossary.factory.ts
  where: lines 7-9, the module-level NO_CONCEPT_NAMED constant
  evidence: "const NO_CONCEPT_NAMED: IConceptUsageReader = {\n  readConceptUsage: () => Promise.resolve({\
    \ named: false }),\n};"
  cost: The identical constant already exists as GlossaryService's own default for an omitted conceptUsageReader
    (glossary.service.ts, lines 17-19). The default policy for "no usage reader supplied" is now defined
    twice; a change to what "no concept named" means (e.g. adding a field to ConceptUsageResolution) can
    be made in the service and missed here, and createGlossary would keep constructing the stale shape.
  correction: Drop the factory's own default and let GlossaryService's own default apply, e.g. `new GlossaryService(new
    RelationalGlossaryStore(connection), conceptUsageReader)` with conceptUsageReader left optional.
  cites: MNT-03
- pass: standard
  file: src/capability-registry/capability-registry.service.ts
  where: listCapabilities, lines 85-96
  evidence: 'const held = await this.store.readCapabilities();

    const total = held.length;

    const data = held.slice(pagination.offset, pagination.offset + pagination.limit);'
  cost: 'Every page request reads every registered capability''s full row — including input_schema and
    output_schema text — and discards all but one page''s worth in memory. RelationalCaseStore''s listing
    methods, reviewed in this same file set, show the alternative already in use elsewhere: a dedicated
    SQL query with LIMIT/OFFSET and a separate COUNT.'
  correction: Give ICapabilityStore a paginated read (LIMIT/OFFSET at the query) and a separate count,
    and have listCapabilities call that instead of slicing a full in-memory read.
  cites: PER-02
- pass: standard
  file: src/glossary/glossary.service.ts
  where: listVocabularyTerms (lines 83-96) and listConcepts (lines 98-108)
  evidence: 'const held = await this.terms(vocabulary);

    const data = held.slice(pagination.offset, pagination.offset + pagination.limit);'
  cost: Both listings load the entire vocabulary or concept table before discarding everything outside
    the requested page, the same pattern PER-02 names, and the same codebase already has a dedicated-query
    alternative (RelationalCaseStore's listing methods) to compare against.
  correction: Add paginated reads to IGlossaryStore (LIMIT/OFFSET plus a count) instead of slicing a full
    in-memory read for each listing.
  cites: PER-02
- pass: standard
  file: src/connector-registry/connector-configuration-registry.service.ts
  where: listConnectorConfigurations, lines 60-73
  evidence: 'const held = await this.store.readConnectorConfigurations();

    const total = held.length;

    const data = held.slice(pagination.offset, pagination.offset + pagination.limit);'
  cost: Every page of connector configurations is produced by reading every configured connector's full
    configuration JSON and discarding all but one page in memory.
  correction: Give IConnectorConfigurationStore a paginated read and a separate count, and call that from
    listConnectorConfigurations instead of slicing a full read.
  cites: PER-02
- pass: conformance
  file: src/factories/concept-usage-reader.factory.ts
  where: resolveConceptUsage, the fourth conditional branch, lines 36-38
  evidence: "if (await sources.caseStore.isConceptCollectedByUnmanifestedHypothesisRevision(concept))\
    \ {\n  return { named: true, reference: 'hypothesis-revision-collects' };\n}"
  cost: A concept collected by a hypothesis-revision that a case version's manifest currently points at
    (a manifested one) never trips this branch, so remove-concept can proceed against a concept the rule's
    own decided text requires it still refuse; the glossary row is removed while a manifested hypothesis_revision_collects
    row still names it, stranding exactly the reference the rule exists to keep from stranding.
  correction: rules/glossary/a-registered-concept-is-never-removed's decided text (per this initiative's
    own decision log) covers a concept collected by any hypothesis-revision, manifested or not — the reader's
    fourth branch should check whether any hypothesis-revision's collects lists the concept, not only
    an unmanifested one.
- pass: conformance
  file: src/persistence/relational-glossary-store.repository.ts
  where: readTerms (lines 30-36) and readWholeConcepts (lines 111-119)
  evidence: "return runStatement<GlossaryTerm>(\n      this.connection,\n      { text: `SELECT name FROM\
    \ ${VOCABULARY_TABLES[vocabulary]}` },\n      raiseReadFailure,\n    );\n...\nreturn rows.map((row)\
    \ => ({ name: row.name, accepts: accepts.get(row.name) ?? [], ttl: row.ttl, description: row.description\
    \ }));"
  cost: If the underlying table ever holds two rows sharing one name, readTerms and readConcepts hand
    both rows to the caller silently instead of refusing the read — the caller never sees the distinct
    HTTP 500 DuplicateGlossaryNameError the rule promises, so a corrupted store is read as an odd-but-valid
    one and the next reader has to notice a duplicate downstream rather than trusting the store layer
    to have already refused it. (glossary.service.ts's assertUniqueNames does enforce this one layer up,
    so the fact is likely held elsewhere — just not in this file, which the node's own text reaches.)
- pass: conformance
  file: src/persistence/relational-case-store.repository.ts
  where: overwriteRevision (used by RelationalCaseStore.overwriteHypothesisRevision)
  evidence: "async function overwriteRevision(tx: IQueryable, input: OverwriteHypothesisRevisionInput):\
    \ Promise<void> {\n  const key: IRevisionKey = { slug: input.slug, hypothesis_name: input.hypothesis_name,\
    \ revision: input.revision };\n  await runStatement(tx, revisionOverwriteStatement(input), raiseOverwriteFailure(input));\n\
    \  await runStatement(tx, revisionCollectsDeleteStatement(key), raiseWriteFailure);"
  cost: overwriteRevision never calls requireCaseHoldsDraft — the guard its sibling insertRevision applies
    immediately (`await requireCaseHoldsDraft(tx, input.slug);`) before touching a hypothesis-revision.
    An in-place edit of a hypothesis-revision therefore reaches the UPDATE whether or not the case currently
    holds a draft, so an overwrite issued after the draft was released or discarded proceeds silently
    instead of being refused with CaseHoldsNoDraftError, and the concept-acceptance check the rule anchors
    to a draft's declared subject type has no draft to anchor to. The next reader who trusts this guard
    because insertRevision enforces it will not find it enforced on the overwrite path.
  correction: Call requireCaseHoldsDraft(tx, input.slug) at the top of overwriteRevision, mirroring insertRevision.
- pass: conformance
  file: src/persistence/relational-investigation-store.repository.ts
  where: readWholeInvestigation and the contentHash helper it calls
  evidence: "const document = investigationOf({ id, row, attributes, evidence, evaluations });\nreturn\
    \ { document, hash: contentHash(document) };\n...\nfunction contentHash(document: Investigation):\
    \ string {\n  return createHash('sha256').update(JSON.stringify(document), 'utf8').digest('hex');\n\
    }"
  cost: Every read of an investigation now answers a SHA-256 hex digest of the JSON-serialized record
    alongside the document itself. No node states that a read carries such a digest, what it is for, or
    that JSON.stringify plus sha256 is the exact scheme a caller may depend on; whoever reads the specification
    to learn what read() answers will not learn this attribute exists at all, and a later change to the
    serialization or the algorithm has no node holding it accountable.
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
reconciliation: siegard-reconcile/delete-routes-connector-capability-concept.md
---

## What it is
Coverage, conformance, and standard passes over the 11 delivered delete-route tasks; the failures pass did not run because the captured full-suite run passed cleanly.

## Notes
Several criteria across the three sibling delete-route tasks (capability, concept, connector) are worded identically by their own task files (e.g. "The route declares and invokes no authentication middleware, guard or check."); this record answers each such text once, with the union of every test bearing on any of the sibling criteria it stands for, per the validator's own one-record-one-answer rule for identical criterion text.
