---
contract_version: siegard-reconcile/1
title: Post-delivery drift over diagnose-input-schema-contract's own stale bindings
summary: 8 tasks (plus one re-delivery) delivered under the diagnose-input-schema-contract initiative
  each restamped only their own nodes on files they rewrote, leaving 17 backend files — read or written
  by those same deliveries but claimed by other nodes' earlier bindings — reporting `code` drift with
  no rebind. The human asked to reconcile this file set as it now stands, holding each file to every node
  the trace currently binds it to (not only the ones `--check` flagged as drifted).
target: backend
files:
- path: src/capability-registry/capability-registry.service.ts
  change: unchanged in behavior across this reconciliation window; drift was a digest mismatch from a
    sibling delivery rewriting the file, not an edit this reconciliation observed as a behavior change
- path: src/case/case-query.service.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/connector-registry/connector-configuration-registry.service.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/errors/status-map.ts
  change: gained entries mapping newly-introduced error classes to HTTP status codes across several deliveries;
    every entry read still matches its governing node
- path: src/factories/build-app.factory.ts
  change: composition-root wiring extended across several deliveries to supply new registries and readers
    to existing services; no domain fact restated
- path: src/factories/capability-registry.factory.ts
  change: gained a second factory export and a defaulted second constructor parameter for cross-registry
    reading; unchanged in what it states about persistence
- path: src/factories/diagnose-server.factory.ts
  change: gained a new dependency wired into the diagnose composition; unchanged in what it states about
    connection/persistence
- path: src/http-connector/connector-request-resolver.ts
  change: gained a new exported helper (subjectAttributePlaceholderNamesIn) reused by a sibling module;
    existing exports and behavior unchanged
- path: src/http/build-app.ts
  change: route wiring extended across several deliveries; no domain fact restated
- path: src/http/diagnose.controller.ts
  change: gained a second gate (case-input-requirements coverage) after the existing release-state check;
    the release-state check itself is unchanged
- path: src/http/dto/test-connector.dto.ts
  change: response schema gained a required orphaned_placeholders field, always present, reporting rather
    than refusing
- path: src/http/register-connector.controller.ts
  change: doc-comment-only change describing the orphaned-placeholder reconciliation now delegated to
    the registry; no behavior change
- path: src/http/test-connector.controller.ts
  change: response gained the same orphaned_placeholders field, computed and appended after the existing
    call/response handling; existing refusal and masking behavior unchanged
- path: src/investigation/evidence-collection-stage.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/investigation/http-declarative-observation-source.adapter.ts
  change: gained a wrapping catch around its one call-assembly step, degrading two additional typed failures
    to an unavailable evidence result instead of propagating
- path: src/investigation/judgment-stage.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
- path: src/investigation/run-diagnosis.ts
  change: unchanged in behavior; drift was a digest mismatch, no behavior change observed
nodes:
- node: constraints/listings-are-paged
  conforms: true
  how: capability-registry.service.ts's listCapabilities/pageCountOf and connector-configuration-registry.service.ts's
    listConnectorConfigurations/pageCountOf both still slice by offset/limit and compute pageCount via
    Math.ceil(total/limit), matching the node's own pagination shape.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/connector-registry/connector-configuration-registry.service.ts
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  conforms: true
  how: capability-registry.service.ts's readCapabilityByIdentityOrThrow raises CapabilityIdentityNotFoundError
    on a miss, and status-map.ts maps that class to 404 — both still match the node.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/errors/status-map.ts
- node: domain/integration/capability
  conforms: true
  how: capability-registry.service.ts's heldCapability/sameIdentity and http-declarative-observation-source.adapter.ts's
    effectiveTimeoutMsFor/resolveConnectorConfiguration both read a capability by name+version, timeout,
    connector and output_schema exactly as the element declares.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/a-capability-declares-its-contract
  conforms: true
  how: refuseContractDepartures/contractProblems in capability-registry.service.ts still refuse a registration
    leaving a required attribute undeclared, read fresh against the node's current (moved) text, which
    the file quotes verbatim.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-capability-declares-well-formed-schemas
  conforms: true
  how: refuseMalformedSchemas in capability-registry.service.ts still refuses a registration whose input
    or output schema is not syntactically valid JSON, matching the node.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/a-capability-input-schema-holds-a-well-formed-object
  conforms: true
  how: capability-registry.service.ts's refuseMalformedInputSchemaShape and status-map.ts's 422 mapping
    for MalformedCapabilityInputSchemaError both still match the node's declared shape.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/errors/status-map.ts
- node: rules/integration/a-capability-is-read-only
  conforms: true
  how: heldCapability in capability-registry.service.ts still throws CapabilityNotReadOnlyError for a
    non-read-only nature, matching the node.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: rules/integration/one-capability-answers-one-concept
  conforms: true
  how: refuseAnsweredConcept and readCapability in capability-registry.service.ts still refuse a concept
    already answered and a concept answered by more than one capability, matching the node.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
- node: domain/integration/capability-registry
  conforms: true
  how: capability-registry.service.ts's class/method doc comments and capability-registry.factory.ts's
    own factory doc comments both still restate the node's Responsibility (contract-completeness refusal,
    concept resolution, cross-registry placeholder read) with an explicit citation rather than as a second,
    free-standing authority.
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/factories/capability-registry.factory.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  conforms: false
  how: capability-registry.service.ts's refuseOrphanedPlaceholders/orphanedAcrossEveryConfiguration, status-map.ts's
    422 mapping, connector-request-resolver.ts's subjectAttributePlaceholderNamesIn, and both test-connector.dto.ts's
    and test-connector.controller.ts's orphaned_placeholders reporting all still match the node — but
    connector-configuration-registry.service.ts's orphanedAcrossEveryCapability resolves a placeholder
    as not-orphaned once *any one* of several capabilities sharing one connector declares it, and the
    node's own statement speaks only of "a capability currently registered against that connector's name"
    (existentially, one capability) — it never says how the check resolves once more than one such capability
    exists, so this file's "at least one clears it" resolution is a fact this file decided that no node
    states.
  observed_at:
  - src/capability-registry/capability-registry.service.ts
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/errors/status-map.ts
  - src/http-connector/connector-request-resolver.ts
  - src/http/dto/test-connector.dto.ts
  - src/http/test-connector.controller.ts
- node: constraints/a-case-is-read-whole
  conforms: true
  how: case-query.service.ts's readCase still assembles, validates and returns the case as one structural
    unit, matching the node.
  encoded_at:
  - src/case/case-query.service.ts
- node: contracts/knowledge/case-query
  conforms: true
  how: case-query.service.ts's five public methods still match the published case-query contract's own
    operations.
  encoded_at:
  - src/case/case-query.service.ts
- node: contracts/system/case-authoring
  conforms: true
  how: structuralCase in case-query.service.ts still joins every violated structural rule into one InvalidCaseDocumentError,
    matching the node.
  encoded_at:
  - src/case/case-query.service.ts
- node: domain/knowledge/case
  conforms: true
  how: case-query.service.ts threads slug as the sole case identity through every method, matching the
    node.
  encoded_at:
  - src/case/case-query.service.ts
- node: domain/knowledge/hypothesis
  conforms: true
  how: case-query.service.ts's trustedHypothesisOf and HypothesisIdentity usage match the node's own identity
    shape.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/investigation/replay-is-pinned
  conforms: true
  how: case-query.service.ts's replayCase and run-diagnosis.ts's own citation both still resolve a version
    by slug and version alone, with no content digest read, matching the node.
  encoded_at:
  - src/case/case-query.service.ts
  - src/investigation/run-diagnosis.ts
- node: rules/knowledge/a-slug-identifies-one-case
  conforms: true
  how: case-query.service.ts's slug-only identity, used across every method, is unchanged and matches
    the node.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/every-case-version-remains-readable
  conforms: false
  how: trustedCaseOf's own docblock cites this node for a version-immutability fact — "A version is written
    once and never altered (rules/knowledge/every-case-version-remains-readable)" — but the node's own
    current text states only retention ("the store keeps every version, not the last"), not immutability;
    the immutability fact this citation actually needs is a different node (rules/knowledge/a-case-version-is-written-once),
    which already states it. The citation is wrong, not the behavior.
  observed_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/validation-runs-at-every-read
  conforms: true
  how: case-query.service.ts's file header and replayCase docblock still state every validator rule holds
    at read time, matching the node.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/a-case-versions-input-requirements-are-derived
  conforms: true
  how: case-query.service.ts's readCaseInputRequirements delegates the actual derivation to case-input-requirements.ts's
    deriveCaseInputRequirements, supplying exactly the case and the registered-capabilities set the node
    requires, and states nothing about the derivation that departs from it.
  encoded_at:
  - src/case/case-query.service.ts
- node: rules/knowledge/the-contract-check-reads-the-current-registration
  conforms: true
  how: case-query.service.ts's readCaseInputRequirements and diagnose.controller.ts's own gate both still
    read the registered-capability set fresh on every call, never cached, matching the node.
  encoded_at:
  - src/case/case-query.service.ts
  - src/http/diagnose.controller.ts
- node: constraints/the-domain-depends-on-no-infrastructure
  conforms: true
  how: connector-configuration-registry.service.ts's port-only constructor, connector-request-resolver.ts's
    module-level isolation comment, and http-declarative-observation-source.adapter.ts's file header all
    still match the node.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/http-connector/connector-request-resolver.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/integration/connector-configuration
  conforms: true
  how: connector-configuration-registry.service.ts's replace-whole write, register-connector.controller.ts's
    type imports, and test-connector.controller.ts's raw/parsed distinction all still match the node's
    own value-object shape.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/http/register-connector.controller.ts
  - src/http/test-connector.controller.ts
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  conforms: true
  how: connector-configuration-registry.service.ts's wellFormedConfiguration/textConfigurationOrThrow
    and status-map.ts's 422 mappings for ConnectorConfigurationNotWellFormedError/IncompleteConnectorConfigurationError
    still match the node.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/errors/status-map.ts
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  conforms: true
  how: connector-configuration-registry.service.ts's readConnectorConfigurationOrThrow, status-map.ts's
    404 mapping, build-app.factory.ts's own wiring comment, and test-connector.controller.ts's resolveTestedConnectorConfiguration
    (which throws the identical ConnectorConfigurationNotFoundError on the identical miss) all still match
    the node — the fourth file was not previously bound to this node and is added here as a file the node's
    own judge found it also encodes.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/errors/status-map.ts
  - src/factories/build-app.factory.ts
  - src/http/test-connector.controller.ts
- node: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
  conforms: true
  how: connector-configuration-registry.service.ts's registerConnector still throws ConnectorPlaceholderOutsideInputSchemaError
    over the single-capability case the scenario states, matching it.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
- node: rules/integration/a-connector-configuration-names-its-connector
  conforms: true
  how: status-map.ts's 422 mapping for a connector configuration registration missing its connector name
    still matches the node.
  encoded_at:
  - src/errors/status-map.ts
- node: rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  conforms: true
  how: status-map.ts's 404 mapping for HypothesisNotInManifestError still matches the node.
  encoded_at:
  - src/errors/status-map.ts
- node: contracts/investigation/diagnosis
  conforms: true
  how: diagnose.controller.ts's handleDiagnoseRequest still matches the published contract's own shape
    (case/subject/narrative/requester in, optional ticket_ref, Assessment out); status-map.ts states nothing
    that departs from it.
  encoded_at:
  - src/http/diagnose.controller.ts
- node: rules/investigation/a-diagnosed-subject-covers-its-cases-required-attributes
  conforms: true
  how: status-map.ts's 422 mapping for SubjectDoesNotCoverCaseInputsError and diagnose.controller.ts's
    own gate placement (after reading case-input-requirements, before runDiagnose) both still match the
    node.
  encoded_at:
  - src/errors/status-map.ts
  - src/http/diagnose.controller.ts
- node: scenarios/investigation/a-diagnose-refuses-a-subject-missing-a-required-attribute
  conforms: true
  how: diagnose.controller.ts's gate ordering (release-state check, then requirements read, then coverage
    check, all before runDiagnose) still matches the scenario; status-map.ts states nothing that departs
    from it.
  encoded_at:
  - src/http/diagnose.controller.ts
- node: contracts/glossary/glossary-authoring
  conforms: true
  how: build-app.factory.ts's and build-app.ts's registerConcept wiring still matches the published glossary-authoring
    contract.
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: contracts/integration/capability-registry
  conforms: true
  how: build-app.factory.ts's, build-app.ts's and judgment-stage.ts's read/list/register-capability wiring
    and output-schema reads all still match the published capability-registry contract's operations.
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
  - src/investigation/judgment-stage.ts
- node: contracts/integration/connector-configuration-registry
  conforms: true
  how: build-app.factory.ts's read/list/register-connector wiring and register-connector.controller.ts's
    own transport-mapping doc comment both still match the published contract's operations.
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/register-connector.controller.ts
- node: contracts/knowledge/case-input-requirements
  conforms: true
  how: build-app.factory.ts's, build-app.ts's, diagnose-server.factory.ts's and diagnose.controller.ts's
    readCaseInputRequirements wiring all still match the published contract's one operation.
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
  - src/factories/diagnose-server.factory.ts
  - src/http/diagnose.controller.ts
- node: domain/integration/connector-configuration-registry
  conforms: true
  how: build-app.factory.ts's and build-app.ts's shared registry instance, built with the cross-registry
    reader, still matches the node.
  encoded_at:
  - src/factories/build-app.factory.ts
  - src/http/build-app.ts
- node: constraints/the-system-persists-to-one-relational-database
  conforms: true
  how: capability-registry.factory.ts's and diagnose-server.factory.ts's own doc comments still state
    every store answers from the one shared connection, with no file-backed store, matching the node.
  encoded_at:
  - src/factories/capability-registry.factory.ts
  - src/factories/diagnose-server.factory.ts
- node: constraints/the-database-is-externally-provisioned
  conforms: true
  how: diagnose-server.factory.ts still builds its one connection from env.DATABASE_URL, matching the
    node.
  encoded_at:
  - src/factories/diagnose-server.factory.ts
- node: contracts/integration/concept-observation
  conforms: true
  how: http-declarative-observation-source.adapter.ts's observeConcept still matches the published contract;
    connector-request-resolver.ts states nothing that departs from it.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/integration/corporate-records-source
  conforms: true
  how: connector-request-resolver.ts's asConnectorCallDescriptor/resolveConnectorRequest and http-declarative-observation-source.adapter.ts's
    own class doc both still narrow a connector's opaque configuration the same way the contract states.
  encoded_at:
  - src/http-connector/connector-request-resolver.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/system/corporate-records
  conforms: true
  how: http-declarative-observation-source.adapter.ts's file header still matches the node; connector-request-resolver.ts
    names no external system, stating nothing that departs from it.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/collection-runs-in-the-requester-scope
  conforms: true
  how: connector-request-resolver.ts's requester-placeholder substitution, evidence-collection-stage.ts's
    unfiltered requester pass-through, and http-declarative-observation-source.adapter.ts's own doc comment
    all still match the node.
  encoded_at:
  - src/http-connector/connector-request-resolver.ts
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: contracts/system/guided-diagnosis
  conforms: true
  how: diagnose.controller.ts's handleDiagnoseRequest still takes case/subject/narrative in and answers
    the resulting Assessment unchanged, matching the node.
  encoded_at:
  - src/http/diagnose.controller.ts
- node: rules/investigation/only-a-released-case-version-is-diagnosed
  conforms: true
  how: diagnose.controller.ts's release-state check still throws CaseVersionNotReleasedError for a non-released
    pinned version, matching the node.
  encoded_at:
  - src/http/diagnose.controller.ts
- node: scenarios/investigation/a-draft-case-version-refuses-diagnosis
  conforms: true
  how: the same release-state check still refuses a draft-state version before the collection pipeline
    starts, matching the scenario.
  encoded_at:
  - src/http/diagnose.controller.ts
- node: contracts/integration/connector-diagnostics
  conforms: true
  how: test-connector.dto.ts's response schema and test-connector.controller.ts's handleTestConnectorRequest
    both still match the published contract's own description, including the newly-added orphaned_placeholders
    field's report-never-refuse behavior.
  encoded_at:
  - src/http/dto/test-connector.dto.ts
  - src/http/test-connector.controller.ts
- node: constraints/no-route-enforces-authentication
  conforms: true
  how: test-connector.controller.ts still carries no authentication check on either resolveConnectorRequest
    call path, matching the node.
  encoded_at:
  - src/http/test-connector.controller.ts
- node: rules/integration/a-connector-configuration-is-tested-through-a-registered-capability
  conforms: true
  how: test-connector.controller.ts's resolveTestedCapability still refuses an unregistered capability
    and a connector mismatch, matching the node.
  encoded_at:
  - src/http/test-connector.controller.ts
- node: rules/integration/a-diagnostic-response-masks-a-resolved-credential
  conforms: true
  how: test-connector.controller.ts's redactingEnv/echoedRequest still mask a resolved credential in the
    echoed request, matching the node.
  encoded_at:
  - src/http/test-connector.controller.ts
- node: constraints/the-deadline-is-an-absolute-propagated-instant
  conforms: false
  how: evidence-collection-stage.ts's stageCeilingMs and judgment-stage.ts's now/deadline parameters still
    take an explicit instant and never read the system clock, matching the node — but run-diagnosis.ts's
    writeWithinDeadline computes persistence's own bound from the original request-entry `now` alone,
    never subtracting the time collectEvidence/judgeHypotheses/resolveAndNarrow/draftAssessment already
    consumed, which is exactly the redistribution the node's own "a late stage takes from those that follow,
    and the last to run pays" requires and this composition does not perform.
  observed_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/observation-source
  conforms: true
  how: evidence-collection-stage.ts's Promise.all over observeConcept calls still matches the published
    contract.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: domain/investigation/evidence-result
  conforms: true
  how: evidence-collection-stage.ts's evidenceOf and http-declarative-observation-source.adapter.ts's
    ending classification both still match the node's four-ending shape.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/investigation/subject
  conforms: true
  how: evidence-collection-stage.ts still passes the subject through unfiltered, matching the node.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/integration/an-http-connector-configuration-declares-its-call
  conforms: true
  how: evidence-collection-stage.ts still forwards an unavailable ending's own result_detail rather than
    inventing one, matching the node.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/integration/an-unresolvable-observation-ends-unavailable
  conforms: true
  how: evidence-collection-stage.ts's unavailableEvidence still sets resultDetail from the port's own
    resolved error class name, matching the node.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: rules/investigation/collection-has-its-own-budget-within-the-total
  conforms: true
  how: evidence-collection-stage.ts's COLLECTION_STAGE_BUDGET_MS/effectiveBoundMsFor and http-declarative-observation-source.adapter.ts's
    effectiveTimeoutMsFor both still match the node's budget-within-total shape.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/investigation/no-stage-aborts-on-its-deadline
  conforms: false
  how: 'http-declarative-observation-source.adapter.ts''s TIMED_OUT handling and judgment-stage.ts''s
    synthesized-Evaluation-on-every-deadline-path both still degrade rather than abort, matching the node
    — but two other files bound to it do not: evidence-collection-stage.ts''s own timeout ending invents
    specific result_detail wording (`no observation within ${effectiveBoundMs}ms`) that no node states
    content for, and run-diagnosis.ts''s writeWithinDeadline raises InvestigationWriteDeadlineExceededError
    after exactly one write attempt, contradicting the node''s own "[persistence] holds its own budget
    and retries within what remains" — there is no retry anywhere in that function.'
  observed_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/judgment-stage.ts
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/one-evidence-per-collected-concept
  conforms: true
  how: evidence-collection-stage.ts still runs exactly one collectOneEvidence per concept in the collection
    plan, matching the node.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
- node: scenarios/investigation/a-collection-timeout-degrades-to-no-data
  conforms: true
  how: evidence-collection-stage.ts's, http-declarative-observation-source.adapter.ts's and judgment-stage.ts's
    own timeout-handling paths still degrade to the scenario's stated ending, independent of the result_detail
    wording finding above.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  conforms: true
  how: evidence-collection-stage.ts's and http-declarative-observation-source.adapter.ts's effective-bound
    computations still match the scenario.
  encoded_at:
  - src/investigation/evidence-collection-stage.ts
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: domain/investigation/evidence
  conforms: false
  how: evidence-collection-stage.ts's evidenceOf/unavailableEvidence still assemble the record from the
    concept and one of the four endings, but settle, by a convention no node states, that observation/origin/capabilityName/capabilityVersion
    each read the empty string when an ending carries no data — the node requires these as always-present
    facts but says nothing about what value they hold when there is nothing to report.
  observed_at:
  - src/investigation/evidence-collection-stage.ts
- node: constraints/evidence-normalization-is-an-anticorruption-layer
  conforms: true
  how: http-declarative-observation-source.adapter.ts's outcomeFromResponse still keys the ok observation
    by the capability's own output_schema property names, matching the node.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/an-unclassified-status-ends-unavailable
  conforms: true
  how: http-declarative-observation-source.adapter.ts's DEFAULT_STATUS_ENDING still classifies an unmapped
    status as unavailable, matching the node.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: rules/integration/evidence-arrives-in-the-glossary-vocabulary
  conforms: true
  how: http-declarative-observation-source.adapter.ts's outcomeFromResponse still never keys an observation
    by a field name taken from the response's own structure, matching the node.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: scenarios/integration/an-optional-attribute-absent-degrades-its-observation
  conforms: true
  how: http-declarative-observation-source.adapter.ts's resolveAssembledRequest/unavailableFor still degrade
    a Subject-attribute placeholder resolving to nothing to unavailable/ConnectorPlaceholderNotResolvedError,
    matching the scenario.
  encoded_at:
  - src/investigation/http-declarative-observation-source.adapter.ts
- node: constraints/hypotheses-are-judged-in-isolated-parallel-calls
  conforms: true
  how: judgment-stage.ts's judgeHypotheses/judgeOneHypothesis still acquire a pool slot before each isolated
    call, matching the node; run-diagnosis.ts no longer performs this itself (the stage moved out of it)
    and states nothing that contradicts the node.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/judgment-runs-behind-a-port
  conforms: true
  how: judgment-stage.ts's evaluator parameter and its one call site still match the IHypothesisEvaluator
    port, matching the node.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: constraints/the-judgment-prompt-is-closed
  conforms: true
  how: judgment-stage.ts's caseContext construction still passes only title and when_to_use, matching
    the node.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/evaluation-reason
  conforms: true
  how: judgment-stage.ts's noDataEvaluation/deadlineExceededEvaluation/judgmentFailureEvaluation still
    set one of the declared reason values, matching the node.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/hypothesis-evaluator
  conforms: true
  how: judgment-stage.ts's evaluate() call signature still matches the node's own port shape.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/verdict
  conforms: true
  how: judgment-stage.ts's asEvaluation verdict branches still match the node's declared values.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/knowledge/case-version
  conforms: true
  how: judgment-stage.ts's requiresEvaluationOf(theCase)/theCase.title/theCase.when_to_use reads still
    match the node.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
  conforms: true
  how: judgment-stage.ts's HypothesisCitationContext/isStructurallyValid still hold a citation to hypothesis.collects,
    matching the node.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  conforms: true
  how: judgment-stage.ts's outputSchemasFor/toEvidenceItems still feed declaredFields into the same structural
    check, matching the node.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/a-decided-evaluation-cites-evidence
  conforms: true
  how: judgment-stage.ts's isStructurallyValid still refuses a decided answer with zero citations, matching
    the node.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
  conforms: true
  how: judgment-stage.ts's noDataEvaluation still declares its reason, matching the node.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: rules/investigation/one-evaluation-per-required-hypothesis
  conforms: true
  how: judgment-stage.ts's judgeHypotheses still answers exactly one Evaluation per required hypothesis
    name, matching the node.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-foreign-citation-is-refused
  conforms: true
  how: judgment-stage.ts's retryOrFail branch structure still matches the scenario.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  conforms: true
  how: judgment-stage.ts's acquireSlotOrDeadline false path still matches the scenario.
  encoded_at:
  - src/investigation/judgment-stage.ts
- node: domain/investigation/evaluation
  conforms: false
  how: judgment-stage.ts's asEvaluation still carries usage/elapsed_ms/prompt exactly where a completed
    call returned them — but judgmentFailureEvaluation() drops all three even on the two paths where a
    call genuinely did complete (the deadline elapsing after the first attempt, and a retry whose own
    answer came back but whose citations still failed structural validation), while the node states these
    fields are present "exactly when a call happened, absent when reason no-data means judgment was never
    called at all" — a rule that does not extend the absence to judgment-failure's own completed-call
    paths.
  observed_at:
  - src/investigation/judgment-stage.ts
- node: constraints/diagnosis-answers-synchronously
  conforms: true
  how: run-diagnosis.ts still never re-resolves the case itself, matching the node.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: contracts/investigation/case-source
  conforms: true
  how: run-diagnosis.ts's module header still matches the published contract.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/cost
  conforms: true
  how: run-diagnosis.ts still reads the run's accumulated cost from runInvestigationPipeline, matching
    the node.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/durations
  conforms: true
  how: run-diagnosis.ts still reads the run's measured durations from runInvestigationPipeline, matching
    the node.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: domain/investigation/investigation
  conforms: false
  how: buildInvestigationOptions still stamps written_at from options.now — the instant the whole request
    began, before collection/judgment/writing have run — rather than from the instant the write actually
    happens; the node states written_at "records when the one write happened," which this value does not.
  observed_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/an-answer-arrives-within-the-declared-deadline
  conforms: true
  how: run-diagnosis.ts's PERSISTENCE_STAGE_BUDGET_MS constant still matches the node's own two-second
    slice.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/an-investigation-is-written-once
  conforms: true
  how: run-diagnosis.ts still answers only the written investigation's own value, never computed a second
    time, matching the node.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: rules/investigation/the-response-follows-the-record
  conforms: true
  how: run-diagnosis.ts's runDiagnosis/writeWithinDeadline still return the assessment only after the
    awaited write settles, and raise rather than ever answering with no record behind it, matching the
    node.
  encoded_at:
  - src/investigation/run-diagnosis.ts
- node: scenarios/investigation/no-response-without-a-record
  conforms: true
  how: run-diagnosis.ts's writeWithinDeadline still raises rather than ever answering with no record behind
    it, matching the scenario (independent of the retry-count finding above).
  encoded_at:
  - src/investigation/run-diagnosis.ts
notes: 'Two observations surfaced beyond this reconciliation''s own node set, neither bound here since
  the trace does not currently claim these (file, node) pairs at all: (1) connector-request-resolver.ts''s
  own descriptor-shape and placeholder-refusal logic is also governed by rules/integration/an-http-connector-configuration-declares-its-call,
  which this file is not currently bound to (decision-log.md records this fact landing in that rule by
  reading this very file) — a candidate for a future binding correction. (2) The ''moved'' drift over
  rules/integration/a-capability-declares-its-contract and rules/knowledge/a-release-refusal-with-no-named-violation-says-so,
  reported separately by trace.py --check, is unaffected by this reconciliation (it heals when each node''s
  own task is next delivered) and is not addressed here.'
---
