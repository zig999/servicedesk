---
title: Capability, concept and connector authoring — backend
summary: What four passes found over the 7 backend tasks delivering capability, concept and connector-configuration
  authoring plus the test-connector diagnostic.
reviewed:
- __tests__/unit/http/build-app.spec.ts
- src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
- src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
- src/__tests__/unit/glossary/glossary-query.port.spec.ts
- src/__tests__/unit/glossary/glossary.service.list-concepts.spec.ts
- src/__tests__/unit/glossary/glossary.service.spec.ts
- src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
- src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
- src/__tests__/unit/http/register-capability.routes.spec.ts
- src/__tests__/unit/http/register-concept.routes.spec.ts
- src/__tests__/unit/http/register-connector.routes.spec.ts
- src/__tests__/unit/http/test-connector.routes.spec.ts
- src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
- src/capability-registry/capability-registry.service.ts
- src/capability-registry/capability.ts
- src/connector-registry/connector-configuration-registry.service.ts
- src/errors/capability-connector-mismatch.error.ts
- src/errors/capability-not-registered-for-test.error.ts
- src/errors/capability-schema-not-well-formed.error.ts
- src/errors/connector-configuration-not-found.error.ts
- src/errors/connector-configuration-not-well-formed.error.ts
- src/errors/status-map.ts
- src/factories/build-app.factory.ts
- src/fixtures/capability/capability.json
- src/glossary/glossary-store.port.ts
- src/glossary/glossary.service.ts
- src/http-connector/connector-http-issuer.ts
- src/http/build-app.ts
- src/http/dto/list-connector-configurations.dto.ts
- src/http/dto/read-connector-configuration.dto.ts
- src/http/dto/register-capability.dto.ts
- src/http/dto/register-concept.dto.ts
- src/http/dto/register-connector.dto.ts
- src/http/dto/test-connector.dto.ts
- src/http/list-connector-configurations.controller.ts
- src/http/list-connector-configurations.routes.ts
- src/http/read-connector-configuration.controller.ts
- src/http/read-connector-configuration.routes.ts
- src/http/register-capability.controller.ts
- src/http/register-capability.routes.ts
- src/http/register-concept.controller.ts
- src/http/register-concept.routes.ts
- src/http/register-connector.controller.ts
- src/http/register-connector.routes.ts
- src/http/test-connector.controller.ts
- src/http/test-connector.routes.ts
- src/investigation/http-declarative-observation-source.adapter.ts
- src/persistence/relational-glossary-store.repository.ts
tasks:
- task/capability-authoring/register-capability-route
- task/concept-authoring/glossary-store-concept-write
- task/concept-authoring/register-concept-route
- task/connector-configuration-authoring/register-connector-route
- task/connector-configuration-authoring/read-connector-configuration-route
- task/connector-configuration-authoring/list-connector-configurations-route
- task/connector-diagnostics/test-connector-route
passes:
- pass: coverage
- pass: conformance
- pass: standard
  missing: the project's registry (standards/backend-node-service.yaml) was resolved and read at situate
    (pin sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3), but the standard-conformance-reviewer
    subagent failed four consecutive times over this file set (three stream-watchdog stalls after 600s
    of no progress, even after the file set was split into three internal stages of ~12-18 files each)
    before the human explicitly authorized skipping this pass rather than continuing to retry; no verdict
    was produced by any attempt
- pass: failures
  missing: the captured run (run/capability-connector-authoring-backend) passed every step in full (install,
    typecheck, lint, secret-scan, test — 1226 tests, 0 failures), so there was no failure to diagnose
coverage:
- criterion: Registering a capability at a (name, version) that does not yet exist creates it and the
    response reflects the registered contract.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: accepts a complete read-only contract and answers the capability as registered
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: persists an accepted registration through the store
  - file: src/__tests__/unit/http/register-capability.routes.spec.ts
    name: answers 200 with the held capability registerCapability resolved, for a valid registration at
      a (name, version) the path names
- criterion: Registering a capability at a (name, version) that already exists replaces it in place rather
    than creating a second entry.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: replaces the held record when a held name and version register again
- criterion: A registration whose input_schema or output_schema is not syntactically valid JSON is refused.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration whose input_schema is not syntactically valid JSON, naming the attribute
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration whose output_schema is not syntactically valid JSON, naming the attribute
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration whose input_schema and output_schema are both not syntactically valid
      JSON, naming both attributes
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: writes nothing to the store when it refuses a registration for a malformed schema
  - file: src/__tests__/unit/http/register-capability.routes.spec.ts
    name: refuses with the status the status map assigns CapabilitySchemaNotWellFormedError, naming every
      malformed attribute in the details
- criterion: A registration whose nature is not read-only is refused.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: refuses a registration whose nature is mutating
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: writes nothing to the store when it refuses a registration
  - file: src/__tests__/unit/http/register-capability.routes.spec.ts
    name: refuses with the status the status map assigns CapabilityNotReadOnlyError when the registry
      refuses a non-read-only nature
- criterion: A registration naming a concept a different capability already answers is refused.
  state: partial
  tests:
  - file: src/__tests__/unit/http/register-capability.routes.spec.ts
    name: refuses with the status the status map assigns ConceptAlreadyAnsweredError when the registry
      refuses an already-answered concept
  why: this test only proves the route maps an already-thrown ConceptAlreadyAnsweredError to 409 — it
    mocks registerCapability to reject with that error and never exercises the actual refusal condition;
    nothing in the supplied test set submits a registration naming a concept a different, already-held
    capability answers, so the half of the criterion that says the registry itself detects and refuses
    that case is unexercised in this file set (the file that does exercise it, capability-query.port.spec.ts,
    was not part of the reviewed set)
- criterion: A registration that states no timeout takes the default of sixty seconds.
  state: covered
  tests:
  - file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
    name: holds the default of sixty seconds, as 60000 milliseconds, for a registration that states no
      timeout
  - file: src/__tests__/unit/http/register-capability.routes.spec.ts
    name: calls registerCapability with no timeout key when the request body states none, leaving the
      default to the registry rather than defaulting it here
- criterion: A request to the route carrying no authentication credential is not refused for lacking one.
  state: covered
  tests:
  - file: src/__tests__/unit/http/register-capability.routes.spec.ts
    name: answers 200 for a request carrying no headers at all, reading no authentication or authorization
      header
  - file: src/__tests__/unit/http/register-capability.routes.spec.ts
    name: answers 200 for a request carrying an authorization header naming no credential this route recognizes,
      dispatching it exactly as one that carries none
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: answers 200 for a request carrying no headers at all, reading no authentication or authorization
      header
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: answers 200 for a request carrying an authorization header naming no credential this route recognizes,
      dispatching it exactly as one that carries none
  - file: src/__tests__/unit/http/register-connector.routes.spec.ts
    name: answers 200 for a request carrying no headers at all, reading no authentication or authorization
      header
  - file: src/__tests__/unit/http/register-connector.routes.spec.ts
    name: answers 200 for a request carrying an authorization header naming no credential this route recognizes,
      dispatching it exactly as one that carries none
  - file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
    name: does not refuse a request carrying no authentication credential
  - file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
    name: answers 200 for a request carrying no authentication credential of any kind, rather than refusing
      it for lacking one
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: answers 200 for a request carrying no headers at all, reading no authentication or authorization
      header
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: answers 200 for a request carrying an authorization header naming no credential this route recognizes,
      dispatching it exactly as one that carries none
- criterion: Writing a concept at a name that does not yet exist creates it with its accepts subject types
    and its ttl.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: creates a concept with its accepted subject types and its ttl, at a name the glossary does not
      yet hold
- criterion: Writing a concept at a name that already exists replaces it in place rather than creating
    a second entry.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: replaces a concept in place at a name the glossary already holds, rather than creating a second
      entry for it
- criterion: The relational implementation persists the same fields the new port method declares.
  state: covered
  tests:
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: inserts each given concept's own name and ttl into concepts, and no concept_accepts row where
      it accepts nothing
  - file: src/__tests__/unit/persistence/relational-glossary-store.repository.spec.ts
    name: inserts one concept_accepts row per subject type the given concept accepts, each carrying that
      concept's own name
- criterion: Registering a concept at a name that does not yet exist creates it and the response reflects
    the registered concept.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: creates a concept with its accepted subject types and its ttl, at a name the glossary does not
      yet hold
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: answers 200 with the held concept registerConcept resolved, for a valid registration at the
      name the path names
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: composes the path-carried name with the body into one registration, calling registerConcept
      with it exactly
- criterion: Registering a concept at a name that already exists replaces it in place rather than creating
    a second entry.
  state: covered
  tests:
  - file: src/__tests__/unit/glossary/glossary.service.spec.ts
    name: replaces a concept in place at a name the glossary already holds, rather than creating a second
      entry for it
  - file: src/__tests__/unit/http/register-concept.routes.spec.ts
    name: answers each of two requests at the same name with that request's own resolution, never a cached
      or joined value
- criterion: Registering a connector configuration at a name that does not yet exist creates it.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: persists an accepted registration through the store
  - file: src/__tests__/unit/http/register-connector.routes.spec.ts
    name: answers 200 with the held connector configuration registerConnector resolved, for a valid registration
      at the :connector the path names
- criterion: Registering a connector configuration at a name that already exists replaces it whole rather
    than merging into what stood before.
  state: partial
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: replaces the held configuration when a connector re-registers, rather than holding a second
      row
  why: the one test exercising re-registration at a held connector identity uses a held configuration
    and a new configuration that share the identical single key ('version'), so a shallow-merge implementation
    and a whole-replace implementation would produce the same observed result; nothing registers a second
    time with a configuration whose key set differs from what was previously held, so the 'whole rather
    than merging' half is unexercised, though 'replaces rather than duplicating' is proven
- criterion: A registration whose configuration text is not syntactically valid JSON is refused.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose configuration text is not syntactically valid JSON, naming the
      reason
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: writes nothing to the store when it refuses a registration for configuration text that is not
      syntactically valid JSON
  - file: src/__tests__/unit/http/register-connector.routes.spec.ts
    name: refuses with the status the status map assigns ConnectorConfigurationNotWellFormedError when
      the configuration text is not syntactically valid JSON
- criterion: A registration whose configuration text parses to something other than a JSON object is refused.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose configuration text is valid JSON but a JSON array, naming the reason
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose configuration text is valid JSON but a string primitive, naming
      the reason
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: refuses a registration whose configuration text is valid JSON but the null primitive, naming
      the reason
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: writes nothing to the store when it refuses a registration for configuration text that parses
      to something other than a JSON object
  - file: src/__tests__/unit/http/register-connector.routes.spec.ts
    name: refuses with the status the status map assigns ConnectorConfigurationNotWellFormedError when
      the configuration text parses to something other than a JSON object
- criterion: Reading a connector configuration by a currently registered name returns its connector and
    configuration fields exactly as currently held.
  state: covered
  tests:
  - file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
    name: resolves a registered connector to its currently held configuration
  - file: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
    name: answers 200 with the connector and configuration fields exactly as currently held under the
      named connector
- criterion: Listing connector configurations returns every connector configuration currently registered,
    each with its connector and configuration fields.
  state: covered
  tests:
  - file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
    name: answers 200 with every connector configuration the registry read resolved, each carrying its
      connector and configuration fields unchanged
  - file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
    name: answers a data array whose single entry carries exactly the connector and configuration fields
      the domain model declares, unchanged from what the connector-configuration read resolved
  - file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
    name: answers the paginated envelope with an empty data array and a total of zero, unchanged, when
      the registry holds no connector configuration at all
- criterion: Requesting test-connector for a capability that is registered and whose connector matches
    the connector configuration named returns the raw HTTP status, headers, body and timing of the call
    actually made.
  state: covered
  tests:
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: returns the raw HTTP status, headers, body and elapsed time of the call actually made, distinct
      from the route's own 200 wrapper
- criterion: The request issued is the one resolveConnectorRequest assembles from the given subject and
    the capability's connector configuration, the same translation a real observation uses.
  state: covered
  tests:
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: issues the exact request resolveConnectorRequest assembles from the given subject and the connector
      configuration — the subject-attribute and requester placeholders resolved, not left as literal template
      text
- criterion: Requesting test-connector for a capability that is not registered at all is refused.
  state: covered
  tests:
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: refuses a request naming a capability that is not registered at all, with the status the status
      map assigns CapabilityNotRegisteredForTestError
- criterion: Requesting test-connector naming a connector configuration the capability's own connector
    does not match is refused.
  state: covered
  tests:
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: refuses a request naming a connector configuration the capability's own connector does not match,
      with the status the status map assigns CapabilityConnectorMismatchError
- criterion: The subject examined is assembled from the subject type and attribute-values supplied in
    the request, never read back from a store.
  state: covered
  tests:
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: assembles the subject examined from each request's own subject type and attribute-values alone
      — two requests at the same capability and connector each address the outbound call with their own
      request's own subject, never a shared or cached one
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: demonstrates structurally, not by observing an absent side effect, that TestConnectorControllerDependencies
      exposes only two reads and an HTTP client
- criterion: No evidence and no citation is written as a result of the operation.
  state: partial
  tests:
  - file: src/__tests__/unit/http/test-connector.routes.spec.ts
    name: demonstrates structurally, not by observing an absent side effect, that TestConnectorControllerDependencies
      exposes only two reads and an HTTP client
  why: this test proves only that the dependency-injection shape the controller was built from carries
    no evidence-writing or citation-writing member — it binds to the type surface of TestConnectorControllerDependencies
    rather than to the controller's actual runtime behavior, and would not catch an implementation that
    wrote evidence or a citation by importing a store directly inside the controller module; no test runs
    the operation and then inspects an evidence or citation store to confirm nothing was written to it
findings:
- pass: conformance
  file: src/http/dto/register-capability.dto.ts
  where: registerCapabilityBodySchema, the timeout field
  evidence: 'timeout: z.number().int().positive().optional(),'
  cost: A registration whose timeout is 0 or negative never reaches the registry at all — Zod refuses
    it at this boundary with the generic validation envelope before IncompleteCapabilityContractError
    or any registry refusal is ever raised. No node states that a capability's timeout must be positive,
    only that it is an integer count of milliseconds defaulting to sixty seconds when absent (rules/integration/a-capability-declares-its-contract,
    domain/integration/capability), so a caller cannot learn this constraint from the specification, and
    this file's own comment even claims the opposite of what it does ("this schema states only the shape,
    never that default").
  correction: Drop .positive() so the boundary schema enforces only int().optional() as its own comment
    claims, or have the specification's rule state the minimum and cite it here.
- pass: conformance
  file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  where: heldConfiguration() fixture and the tests asserting configuration is held/returned as a parsed
    object
  evidence: 'configuration: { whatever: ''the connector alone interprets this'' } ... expect(registered.configuration).toEqual({
    whatever: ''the connector alone interprets this'' });'
  cost: 'domain/integration/connector-configuration declares configuration a plain string ("what it must
    be is a well-formed JSON object, never what that object''s keys mean" is a statement about its content,
    not its stored type). connector-configuration.ts''s own ConnectorConfiguration type (line 130 of connector-configuration-registry.service.ts)
    instead declares configuration: Readonly<Record<string, unknown>> — the delivered implementation itself,
    not only its tests, holds and returns configuration as a parsed object once accepted. A reader who
    opens the node to learn what this attribute is finds "string"; a reader who opens the service or its
    tests finds an object asserted as what the registry holds and answers with. No decision-log entry
    discloses this move from wire string to stored object.'
  correction: Either correct the node's configuration attribute to state that the registry holds it as
    the parsed object once accepted (distinguishing the wire representation, still a string on PUT /v1/connectors/{connector},
    from what read/list operations answer with), or change the service to hold and return the string as
    registered.
- pass: conformance
  file: src/http/test-connector.controller.ts
  where: lines 31-43 (block comment) and REDACTED_CREDENTIAL_MARKER
  evidence: The echoed request masks any value a `${credential:...}` placeholder resolved to ... this
    project's own standard (SEC-03, SEC-04) forbids a credential reaching a client response, and no specification
    node or task criterion states that this diagnostic operation's echoed request must carry the real
    credential value rather than a marker standing in for it, so this is this controller's own inference
    over an otherwise-silent point.
  cost: Whether a test-connector response may echo a resolved credential value, or must mask it (and with
    what literal marker), is exactly what the system tells the caller about a diagnostic call — the kind
    of fact the specification is supposed to hold. contracts/integration/connector-diagnostics says the
    operation is diagnostic-only but says nothing about credential visibility in the echo; a reader who
    wants to know what a test-connector response may contain finds nothing there and has to open this
    comment instead, where the decision was made by inference from a standard rule rather than by the
    specification.
  correction: State the fact — whether an echoed request may carry a resolved credential value, and if
    not, what replaces it — in contracts/integration/connector-diagnostics (or a rule it constrains),
    decided through the specification's own silence-closing process and disclosed in decision-log.md;
    the source then reads that decision instead of deciding it here.
- pass: conformance
  file: src/http/dto/test-connector.dto.ts
  where: header comment, lines 31-33 (testConnectorResponseSchema)
  evidence: testConnectorResponseSchema answers the raw request actually assembled (credential-redacted,
    this route's own SEC-03/SEC-04 accommodation — see test-connector.controller.ts)
  cost: The comment asserts, as settled fact, that a connector configuration's assembled request carries
    a credential that must be stripped before the diagnostic response echoes it back. domain/integration/connector-configuration
    deliberately leaves the configuration's content unspecified, so nothing in the specification says
    a credential exists there at all, let alone that one must be redacted from a diagnostic echo — the
    same underlying gap as the controller.ts finding, observed at this second file.
  correction: 'Same as the test-connector.controller.ts finding: state the redaction rule as a specification
    fact (domain/integration/connector-configuration or the connector-diagnostics contract) and have this
    comment cite it.'
---

## What it is

Coverage and specification-conformance passes over the 7 delivered backend tasks (register-capability, glossary-store-concept-write, register-concept, register-connector, read-connector-configuration, list-connector-configurations, test-connector); the standard pass did not run (repeated infrastructure stalls, human-authorized skip) and the failures pass did not run (the captured suite passed in full).

## Notes

The standard-conformance pass was attempted five times over this file set (one whole-set attempt, one three-stage attempt, both stalling) before the human authorized skipping it; no rule-conformance judgment exists for this backend change. The trace shows 55 code-drift bindings over 13 backend files, all pre-existing from earlier deliveries in this same session (register-capability-route's own delivery and others rewriting shared files like build-app.factory.ts, capability-registry.service.ts and status-map.ts under later tasks' own binds) — none of it is new drift this review's own file set introduces beyond what each task's own delivery already restamped for its own nodes.
