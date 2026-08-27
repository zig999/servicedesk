---
contract_version: siegard-reconcile/1
title: Backend final sweep — 10 files still carrying stale bindings from this initiative's own deliveries
summary: The last delivery in this initiative (12b769c, stale-specification-citations-round-two) restamped
  only the 5 nodes it implemented, leaving every other node bound to the same 6 files stale. The earlier
  corrective delivery (bea2d2a) and the two /analyse increments (b6012c3, 5427816) had the same effect
  on other files across this initiative's whole backend surface. None of these 10 files' behavior changed
  beyond what those deliveries already documented — this closes the remaining 'code' drift the initiative's
  own work left behind on files it did not directly rewrite this round.
target: backend
files:
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: unchanged this round
- path: src/capability-registry/capability-registry.service.ts
  change: unchanged this round
- path: src/connector-registry/connector-configuration-registry.service.ts
  change: unchanged this round
- path: src/http/test-connector.controller.ts
  change: unchanged this round
- path: src/errors/status-map.ts
  change: unchanged this round
- path: src/glossary/glossary-store.port.ts
  change: unchanged this round
- path: src/investigation/fake-observation-source.adapter.ts
  change: unchanged this round (rebound already once this session for its own delivery)
- path: src/investigation/observation-source.port.ts
  change: unchanged this round
- path: src/persistence/relational-investigation-store.repository.ts
  change: unchanged this round
- path: src/capability-registry/capability.ts
  change: unchanged this round
nodes:
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  conforms: true
  how: observationOf() filters extracted fields to declaredFields from the capability's own output_schema,
    never a field the response's own structure carries but the schema doesn't declare.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/listings-are-paged
  conforms: true
  how: offset/limit are read from the caller's PaginationRequest, no default or maximum asserted in these
    files.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/connector-registry/connector-configuration-registry.service.ts
- node: constraints/no-route-enforces-authentication
  conforms: true
  how: no authentication mechanism declared or invoked anywhere in the request path.
  encoded_at:
  - src/http/test-connector.controller.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: readCapabilityByIdentityOrThrow/the status map both answer CapabilityIdentityNotFoundError, 404,
    for a miss.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/errors/status-map.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: each file's own import list carries no framework, driver or provider client — only local domain/port
    modules.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/glossary/glossary-store.port.ts
  - src/investigation/fake-observation-source.adapter.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/observation-source.port.ts
- node: constraints/the-stored-schema-mirrors-the-declared-model
  conforms: true
  how: every column in the five row interfaces traces to a declared attribute or relationship.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: write()/read() run through runInTransaction over the injected connection.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: writeConcepts' create-or-replace-in-place shape matches the node.
  encoded_at:
  - src/glossary/glossary-store.port.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: the class exposes all four declared operations (register, read, read-by-identity, list).
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: contracts/integration/concept-observation
  conforms: true
  how: observeConcept is each file's one operation, matching the read-only single-operation shape the
    contract declares.
  encoded_at:
  - src/investigation/fake-observation-source.adapter.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/observation-source.port.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: the class exposes all three published operations (register, read, list).
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: contracts/integration/connector-diagnostics
  conforms: true
  how: writes nothing of its own; every dependency called is a read.
  encoded_at:
  - src/http/test-connector.controller.ts
- node: contracts/integration/corporate-records-source
  conforms: true
  how: the class-level doc comment states a generic, data-driven HTTP call naming no external system.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: each class/interface implements or declares IObservationSource, matching the published port.
  encoded_at:
  - src/investigation/fake-observation-source.adapter.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/observation-source.port.ts
- node: contracts/system/corporate-records
  conforms: true
  how: which system a call reaches is resolved by the capability's own connector, never a name fixed in
    this file.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/glossary/concept
  conforms: true
  how: the imported Concept type and writeConcepts' doc comment match the node's declared shape.
  encoded_at:
  - src/glossary/glossary-store.port.ts
- node: domain/integration/capability
  conforms: true
  how: capability.timeout and capability.output_schema are read as the node's own declared attributes,
    unchanged.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/integration/capability-registry
  conforms: true
  how: registerCapability/readCapability implement create-or-replace and one-capability-per-concept resolution.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: configuration is held and answered as JSON object text either way; heldConfiguration/parsedConnectorConfiguration
    match.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/http/test-connector.controller.ts
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: registerConnector replaces whole by connector name after well-formedness is checked.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: domain/investigation/assessment
  conforms: true
  how: assessmentParams/assessmentOf carry the assessment's five columns flattened from its referral.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/citation
  conforms: true
  how: citationStatement inserts one row of one evaluation's own citations.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/cost
  conforms: true
  how: costParams carries the cost's own three columns.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/durations
  conforms: true
  how: durationsParams carries the durations' own four columns.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation
  conforms: true
  how: evaluationStatement/evaluationOf insert one evaluation's hypothesis, verdict and, where inconclusive,
    its reason.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: EVALUATION_REASON_VALUES/reasonOf reuse every value the node declares.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence
  conforms: true
  how: the four endings never throw; absence is a recorded fact, matching the node.
  encoded_at:
  - src/investigation/observation-source.port.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: the four-ending enumeration (ok, unavailable, denied, timeout) is reused from EVIDENCE_RESULTS/ObservationOutcome
    rather than restated, matching the node exactly.
  encoded_at:
  - src/investigation/fake-observation-source.adapter.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/observation-source.port.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/investigation
  conforms: true
  how: IInvestigationRow/investigationOf/identityParams hold the whole investigation in the node's declared
    shape.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject
  conforms: true
  how: the subject's whole attribute-value set is passed through unfiltered, none selected or dropped.
  encoded_at:
  - src/investigation/fake-observation-source.adapter.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/subject-attribute-value
  conforms: true
  how: fixtureKey/subjectAttributeValueStatement read exactly the attribute/value pair the node declares.
  encoded_at:
  - src/investigation/fake-observation-source.adapter.ts
  - src/persistence/relational-investigation-store.repository.ts
- node: domain/investigation/verdict
  conforms: true
  how: VERDICT_VALUES/verdictOf reuse every value the node declares.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  conforms: true
  how: insertMissingTerms adds only what is missing, never deleting or rewriting an already-held row.
  encoded_at:
  - src/glossary/glossary-store.port.ts
- node: rules/integration/a-capability-declares-its-contract
  conforms: true
  how: refuseContractDepartures enforces the required-attribute list; the timeout default and positivity
    boundary are both now correctly cited and enforced via the DTO schema.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/capability.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: refuseMalformedSchemas filters both schema attributes through isWellFormedJson.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: heldCapability throws CapabilityNotReadOnlyError for a non-read-only nature.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: null/array refused as malformed, absent (and any other non-string/non-object) refused as incomplete
    — matching the node's now-complete classification, correctly cited in both files.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: true
  how: resolveTestedCapability checks the capability lookup first, then the connector match, in the rule's
    own order.
  encoded_at:
  - src/http/test-connector.controller.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: the status map's IncompleteConnectorConfigurationError entry matches the node's absent-or-empty-name
    condition and 422 status.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: readConnectorConfigurationOrThrow/the status map both answer ConnectorConfigurationNotFoundError,
    404, for a miss.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/errors/status-map.ts
- node: rules/integration/a-diagnostic-response-masks-a-resolved-credential
  conforms: true
  how: a second resolveConnectorRequest call with a redacting environment substitute masks the echoed
    request, now correctly cited to this node.
  encoded_at:
  - src/http/test-connector.controller.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: true
  how: httpConfigurationProblems validates method/responseMap/statusMap before use, throwing MalformedHttpConnectorConfigurationError
    otherwise.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unclassified-status-ends-unavailable
  conforms: true
  how: endingForStatus returns DEFAULT_STATUS_ENDING ('unavailable') for any status statusMap does not
    classify.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  conforms: true
  how: resolveCapability/resolveConnectorConfiguration answer unavailable with the exact reported error
    class name for each of the four unresolvable conditions.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/observation-source.port.ts
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  conforms: true
  how: observationOf keys the ok observation by the capability's own output_schema property names.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: refuseAnsweredConcept/readCapability refuse a second capability or a duplicate answer for one concept.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: write-once decided by the root insert's own primary key; no UPDATE statement anywhere in the file.
  encoded_at:
  - src/persistence/relational-investigation-store.repository.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: true
  how: effectiveTimeoutMsFor/effectiveBoundMsFor bound each call by the smaller of the capability's timeout
    and the remaining budget.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/observation-source.port.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: the requester is passed straight through to every observe-concept call, never substituted; required
    on every ObserveConceptOptions call.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/observation-source.port.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: true
  how: 'a timed-out call answers { result: ''timeout'' } rather than throwing.'
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: the timeout branch records the evidence-recording half of the scenario.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  conforms: true
  how: the smaller-of-two-bounds computation matches the scenario exactly.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/integration/capability-nature
  conforms: false
  how: '[src/capability-registry/capability.ts] CAPABILITY_NATURES = [''read-only'', ''mutating''] as
    const matches the node''s enumeration values exactly, but is a hand-maintained literal with no mechanical
    link back to the node''s own value list — a maintainability risk (silent future divergence) rather
    than a current factual departure, per the judge''s own finding. Out of scope for this initiative''s
    6 tracked findings; left unbound as an open item.'
  observed_at:
  - src/capability-registry/capability.ts
notes: 'Judgment shape: 10 independent specification-conformance-reviewer delegations, one per file, handed
  each file''s own trace-bound node set plus, as candidates, the union of nodes bound across this batch
  (excluding glossary.service.ts and its findings, deliberately reconciled separately below to avoid folding
  an unrelated candidate-attributed finding onto files otherwise clean for the same node). All node/file
  pairs cleared. capability.ts''s own judge also returned a finding against domain/integration/capability-nature
  — a hand-maintained enumeration with no mechanical link back to the node''s own value list — outside
  the scope of this initiative''s 6 tracked findings; left unbound as an open item for a future reconciliation
  or citation task.'
---
