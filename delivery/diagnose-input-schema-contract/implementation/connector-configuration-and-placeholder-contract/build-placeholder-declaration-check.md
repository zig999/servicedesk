---
title: Shared placeholder-declared-by-its-capability check and cross-registry read ports
summary: A pure check names every Subject-attribute placeholder a connector configuration's call text
  embeds that a capability's declared input-schema properties does not hold, and the capability and connector-configuration
  registries can each read the other's currently registered records through a narrow port the composition
  root supplies.
task: sha256:3610049a990701247ae2830c68014646b53e7d505b01a6237bcb7bb3ca940456
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-and-placeholder-contract-build-placeholder-declaration-check-build-3
files:
- path: src/http-connector/connector-request-resolver.ts
  effect: additionally exports subjectAttributePlaceholderNamesIn(configurationText), which walks one
    connector configuration's own call text with the same PLACEHOLDER_PATTERN/splitPlaceholderToken already
    used by substituteString, and answers every Subject-attribute placeholder name it finds (never requester/credential,
    never throwing on a malformed token). No existing export's behavior changed.
- path: src/connector-registry/connector-placeholder-declaration-check.ts
  effect: new file exporting orphanedPlaceholders(configurationText, inputSchema) — extracts Subject-attribute
    placeholders via subjectAttributePlaceholderNamesIn and the capability's declared properties via declaredInputSchemaShape,
    returning every extracted placeholder name the declared properties do not hold.
- path: src/capability-registry/connector-configurations-reader.port.ts
  effect: new file declaring IConnectorConfigurationsReader (readConnectorConfigurations) and the narrow
    RegisteredConnectorConfigurationForPlaceholderCheck type (connector, configuration) — the capability
    registry's own read of the connector-configuration registry's current state.
- path: src/connector-registry/capabilities-reader.port.ts
  effect: new file declaring ICapabilitiesReader (readCapabilities) and the narrow RegisteredCapabilityForPlaceholderCheck
    type (connector, input_schema) — the connector-configuration registry's own read of the capability
    registry's current state.
- path: src/capability-registry/capability-registry.service.ts
  effect: CapabilityRegistryService's constructor gains a second, defaulted IConnectorConfigurationsReader
    parameter (defaulting to an always-empty reader); a new public method readRegisteredConnectorConfigurations()
    delegates to it. No existing method's behavior changed.
- path: src/connector-registry/connector-configuration-registry.service.ts
  effect: ConnectorConfigurationRegistryService's constructor gains a second, defaulted ICapabilitiesReader
    parameter; a new public method readRegisteredCapabilities() delegates to it. No existing method's
    behavior changed.
- path: src/factories/capability-registry.factory.ts
  effect: createCapabilityRegistry(connection, connectorConfigurationsReader?) takes a second, defaulted
    parameter passed through to the service; a new export createCapabilitiesReader(connection) builds
    an ICapabilitiesReader backed by its own store, mapping each row down to exactly { connector,
    input_schema } before returning it, so the port's own narrow contract is honored rather than
    leaking the full stored capability shape.
- path: src/factories/connector-configuration-registry.factory.ts
  effect: createConnectorConfigurationRegistry(connection, capabilitiesReader?) takes a second, defaulted
    parameter; a new export createConnectorConfigurationsReader(connection) builds an IConnectorConfigurationsReader
    backed by its own store.
- path: src/factories/build-app.factory.ts
  effect: composeResources now builds capabilityRegistry via createCapabilityRegistry(connection, createConnectorConfigurationsReader(connection))
    and connectorConfigurationRegistry via createConnectorConfigurationRegistry(connection, createCapabilitiesReader(connection))
    — the composition root supplying each registry with the other's own narrow reader.
criteria:
- criterion: Given a connector configuration's call text embedding a placeholder naming a Subject attribute,
    and a capability's declared properties not naming that attribute, the check names that placeholder
    as orphaned.
  met: true
  how: orphanedPlaceholders extracts every Subject-attribute placeholder name from the given call text
    via subjectAttributePlaceholderNamesIn, reads the capability's declared properties via declaredInputSchemaShape,
    and returns every extracted name that array does not include.
- criterion: Given a connector configuration's call text embedding a placeholder naming a Subject attribute
    that a capability's declared properties does name, the check names no orphaned placeholder for it.
  met: true
  how: the same filter excludes a name the declared properties array does hold, so nothing is returned
    for it.
- criterion: A placeholder naming the requester or a credential is never named orphaned by the check.
  met: true
  how: subjectAttributePlaceholderNamesIn only keeps a token whose split kind equals SUBJECT_PLACEHOLDER_KIND;
    a requester or credential token's kind never matches, so it is never even collected.
- criterion: The capability registry can read every currently registered connector configuration through
    a narrow port the composition root supplies, backed by the same connector-configuration store already
    in use.
  met: true
  how: CapabilityRegistryService takes a second, defaulted IConnectorConfigurationsReader dependency and
    exposes readRegisteredConnectorConfigurations(); build-app.factory.ts supplies the real implementation
    via createConnectorConfigurationsReader(connection), backed by a RelationalConnectorConfigurationStore
    built from the same connection.
- criterion: The connector-configuration registry can read every currently registered capability through
    a narrow port the composition root supplies, backed by the same capability store already in use.
  met: true
  how: ConnectorConfigurationRegistryService takes a second, defaulted ICapabilitiesReader dependency
    and exposes readRegisteredCapabilities(); composeResources supplies createCapabilitiesReader(connection),
    backed by a RelationalCapabilityStore built from the same connection.
nodes:
- node: domain/integration/capability
  how: the check reads a capability's own input_schema attribute exactly as declared, and the narrow RegisteredCapabilityForPlaceholderCheck
    type projects only connector and input_schema from the existing element.
  encoded_at:
  - src/connector-registry/connector-placeholder-declaration-check.ts
  - src/connector-registry/capabilities-reader.port.ts
- node: domain/integration/capability-registry
  how: the registry gains the narrow read capacity this task delivers; running the check against a registration
    in progress and raising the refusal itself is out of this task's reach (see the sibling tasks named
    in Notes).
  encoded_at:
  - src/capability-registry/capability-registry.service.ts
  - src/capability-registry/connector-configurations-reader.port.ts
  - src/factories/capability-registry.factory.ts
- node: domain/integration/connector-configuration
  how: the check reads a connector configuration's own configuration attribute as its call text; the narrow
    RegisteredConnectorConfigurationForPlaceholderCheck type projects only connector and configuration
    from the existing element.
  encoded_at:
  - src/capability-registry/connector-configurations-reader.port.ts
  - src/connector-registry/connector-placeholder-declaration-check.ts
- node: domain/integration/connector-configuration-registry
  how: symmetrically, this registry gains the narrow read of the capability registry's current state its
    own future refusal will need; wiring that refusal is out of this task's reach.
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/connector-registry/capabilities-reader.port.ts
  - src/factories/connector-configuration-registry.factory.ts
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  how: orphanedPlaceholders is this rule's own comparison — a Subject-attribute placeholder in a connector
    configuration's own text against the properties a capability's declared input schema holds — as one
    pure, direction-agnostic function either registration's own refusal can call. Wiring the check into
    either write path and issuing the stated 422 refusal is a REMAINDER left to the sibling tasks.
  encoded_at:
  - src/connector-registry/connector-placeholder-declaration-check.ts
  - src/http-connector/connector-request-resolver.ts
- node: contracts/integration/capability-registry
  how: unaffected in its published surface — read-capability, read-capability-by-identity, list-capabilities
    and register-capability are unchanged; readRegisteredConnectorConfigurations is an added, unpublished
    method alongside them.
- node: contracts/integration/connector-configuration-registry
  how: unaffected in its published surface — read-connector-configuration, list-connector-configurations
    and register-connector are unchanged; readRegisteredCapabilities is an added, unpublished method alongside
    them.
- node: scenarios/integration/a-connector-configuration-with-an-orphaned-placeholder-is-refused
  how: only the scenario's second then line — naming customer_document as a placeholder the capability
    naming erp-http does not declare — is within this task's reach, and orphanedPlaceholders is exactly
    that naming. Its first then line ("the registration is refused") is a REMAINDER left to the sibling
    tasks named in Notes.
  encoded_at:
  - src/connector-registry/connector-placeholder-declaration-check.ts
inferences:
- inferred: '"backed by the same ... store already in use" is satisfied by building a second instance
    of the same store class from the same shared connection, rather than by literally passing one JS object
    instance to both sides.'
  from: both stores are stateless, connection-pooled, read-fresh-every-call wrappers, so two instances
    over the same connection are behaviorally indistinguishable from one; build-app.factory.ts's own composeResources
    already discloses the identical pattern for caseInputRequirementsQuery.
- inferred: both new constructor dependencies (IConnectorConfigurationsReader, ICapabilitiesReader) are
    optional, defaulting to an always-empty reader, rather than required.
  from: CapabilityRegistryService and ConnectorConfigurationRegistryService are each constructed with
    a single argument at dozens of existing call sites across this codebase's own test suite and several
    other production factories that this task must not touch or widen into.
- inferred: the check accepts a capability's raw input_schema (string | undefined) and calls declaredInputSchemaShape
    itself, rather than taking a pre-extracted properties array from its caller.
  from: the task's own instruction to reuse the existing placeholder-token walk and the shape reader describes
    what the check itself does, and declaredInputSchemaShape's own established malformed-reads-as-declaring-nothing
    posture extends automatically — no node states otherwise for this reconciliation.
- inferred: a placeholder whose kind is 'subject' but whose argument is absent or empty is silently skipped
    by subjectAttributePlaceholderNamesIn — never named orphaned, never thrown.
  from: neither the rule nor any criterion states what such a malformed token answers to this reconciliation
    check; this codebase's own established defensive posture for shape/placeholder readers is 'malformed
    reads as nothing', which this function follows.
- inferred: the shared check and the placeholder-extraction it reuses live under connector-registry/http-connector
    rather than under capability-registry.
  from: domain-depends-on-no-infrastructure.spec.ts's own already-delivered sweep holds every file under
    capability-registry to importing nothing from http-connector; connector-registry carries no such restriction.
preserved:
- every existing single-argument construction of CapabilityRegistryService and ConnectorConfigurationRegistryService
  across this codebase's own unit and integration test suites compiles and behaves identically, since
  both new constructor parameters default to an always-empty reader.
- createCapabilityRegistry(connection) and createConnectorConfigurationRegistry(connection), called with
  exactly one argument, from every existing composition root other than build-app.factory.ts, and from
  the integration test suite, are unchanged.
- store-wiring.spec.ts's own regex sweep of createCapabilityRegistry's exported signature, which still
  finds a DatabaseConnection parameter and no other mention.
- 'domain-depends-on-no-infrastructure.spec.ts''s own sweep of capability-registry: no import of http-connector,
  connector-request-resolver, connector-call-descriptor, the connector-configuration store or its relational
  adapter.'
- connector-request-resolver.ts's own existing exports and behavior (resolveConnectorRequest, asConnectorCallDescriptor)
  are unchanged; only a new export was added.
- registerCapability's and registerConnector's own existing refusal pipelines and stored data shape are
  unchanged — this task adds no new refusal and touches neither write path.
deferred:
- what: wiring the shared orphaned-placeholder check into registerCapability's and registerConnector's
    own refusal pipelines, and raising the HTTP 422 ConnectorPlaceholderOutsideInputSchemaError refusal.
  why: a REMAINDER the specification states but this task's criteria stop short of; it belongs to the
    epic's own refuse-connector-registration-with-orphaned-placeholder and refuse-capability-registration-with-orphaned-placeholder
    tasks.
---

## What it is
A pure check names every Subject-attribute placeholder a connector configuration's call text embeds that a capability's declared input-schema properties does not hold, and the capability and connector-configuration registries can each read the other's currently registered records through a narrow port the composition root supplies.

## Notes
None.
