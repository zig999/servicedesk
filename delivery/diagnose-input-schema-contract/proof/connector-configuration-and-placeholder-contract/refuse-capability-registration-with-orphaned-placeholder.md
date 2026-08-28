---
title: Proof for refusing a capability registration with an orphaned placeholder
summary: Tests proving registerCapability refuses a registration whose named connector already holds a
  configuration embedding an undeclared Subject-attribute placeholder, names every such placeholder with
  the registering capability, succeeds once the capability declares it, and is untouched when the connector
  holds no configuration — plus the three disclosed inferences and the malformed-input-schema-declares-nothing
  edge case.
implementation: sha256:b01011b671f697e3c6e7861fb5f6e9ea52a4304ee649f7d6a122bbe9fffcbf8d
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-and-placeholder-contract-refuse-capability-registration-with-orphaned-placeholder-suite
tests:
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: refuses a registration naming a connector that already holds a registered configuration embedding
    a Subject-attribute placeholder its own input_schema properties does not declare, as ConnectorPlaceholderOutsideInputSchemaError
  proves: Registering a capability naming a connector that already holds a registered configuration whose
    call text embeds a Subject-attribute placeholder this registration's own input-schema properties does
    not declare is refused with an HTTP 422 response reporting ConnectorPlaceholderOutsideInputSchemaError.
  fails_when: registerCapability stops calling refuseOrphanedPlaceholders, or that check stops throwing
    ConnectorPlaceholderOutsideInputSchemaError when a filtered configuration embeds an undeclared placeholder
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: writes nothing to the store when it refuses a registration for an orphaned placeholder
  proves: the refusal is raised before any write, the same before-any-write guarantee every other registerCapability
    refusal already holds
  fails_when: the store is written to before or despite the orphaned-placeholder refusal
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: names the orphaned placeholder together with the capability being registered
  proves: The refusal names every such orphaned placeholder together with the capability being registered.
  fails_when: the thrown error's context.orphaned omits the placeholder name, omits the registering capability,
    or names a different shape
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: names both orphaned placeholders together when the connector's registered configuration embeds
    two the registration does not declare
  proves: The refusal names every such orphaned placeholder together with the capability being registered.
    (multiple placeholders in one call text)
  fails_when: only the first orphaned placeholder is named, or the second is dropped
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: names one orphaned placeholder once, not once per occurrence, when the registered configuration
    embeds it more than once
  proves: orphanedAcrossEveryConfiguration deduplicates by placeholder name rather than naming one entry
    per occurrence
  fails_when: the same placeholder name appears twice in context.orphaned for two occurrences of one placeholder
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: unions the orphaned placeholder across every registered configuration for the connector, named
    once even though only one of two configurations embeds it
  proves: the check iterates over every currently-registered connector configuration whose connector matches
    this registration's own connector, rather than assuming the filtered list holds at most one entry
    (the implementation's own recorded inference), exercised with one orphaning and one non-orphaning
    configuration for the same connector
  fails_when: the check stops iterating over every matching configuration (e.g. reads only the first),
    or a non-orphaning configuration causes the orphaning one to be missed or duplicated
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: names the registering capability by exactly its connector and input_schema, in a one-element capabilities
    array, adding no wider identity of its own
  proves: the registering capability is named in the refusal's context.orphaned by exactly the {connector,
    input_schema} shape RegisteredCapabilityForPlaceholderCheck already carries, in a one-element capabilities
    array (the implementation's own recorded inference)
  fails_when: the capabilities entry carries additional keys (e.g. name, version), or more than one element
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: succeeds when the registration's own input_schema properties declares the placeholder's attribute,
    even though the connector already holds a configuration embedding it
  proves: Registering the same capability succeeds when its own input-schema properties declares the placeholder's
    attribute.
  fails_when: the registration is still refused despite declaring the attribute, or the store's held input_schema
    differs from what was submitted
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: is not refused by this check when the connector it names holds no registered configuration at
    all
  proves: Registering a capability naming a connector that holds no registered configuration is not refused
    by this check.
  fails_when: the registration is refused, or throws, when the injected reader answers an empty list for
    the named connector
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: is not refused by this check when every registered configuration names a different connector
  proves: the connector filter inside refuseOrphanedPlaceholders excludes a configuration registered against
    a different connector, so a placeholder embedded there can never orphan an unrelated registration
  fails_when: a configuration registered against a different connector is still checked against this registration,
    causing a refusal
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: succeeds when constructed with the default (no) connector-configurations reader, since every pre-existing
    single-argument construction of this class has no use for this capacity
  proves: the "preserved" guarantee that registerCapability constructed with the default reader keeps
    succeeding regardless of this new check — every pre-existing single-argument composition root and
    test is unaffected
  fails_when: constructing CapabilityRegistryService with one argument starts refusing a registration
    this check would not otherwise refuse
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: refuses a registration missing a required attribute as IncompleteCapabilityContractError, even
    though the named connector already holds a configuration that would also embed an orphaned placeholder
  proves: refuseOrphanedPlaceholders runs immediately after heldCapability's own sync checks (the implementation's
    own recorded inference) — the contract-completeness refusal takes priority
  fails_when: the orphaned-placeholder check runs, or is reached, before the contract-completeness refusal
    for an incomplete registration
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: refuses a registration whose connector holds an orphaning configuration as ConnectorPlaceholderOutsideInputSchemaError
    even though its concept is already answered by another capability, since this check runs before the
    concept-uniqueness refusal
  proves: refuseOrphanedPlaceholders runs ahead of the existing concept-uniqueness refusal (refuseAnsweredConcept)
    (the implementation's own recorded inference)
  fails_when: the concept-already-answered refusal fires instead of, or before, the orphaned-placeholder
    refusal for a registration that triggers both
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: treats a registration whose own input_schema declares no properties key at all as declaring nothing,
    so every placeholder the connector's registered configuration embeds is orphaned
  proves: the "malformed/absent input_schema reads as declaring nothing" convention, exercised at the
    registerCapability wiring level with an input_schema that passes the sync shape check but declares
    no properties — every embedded placeholder is then orphaned
  fails_when: an input_schema declaring no properties key is read as declaring the placeholder anyway,
    or the refusal does not fire
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: succeeds without any orphaned-placeholder refusal when the connector's registered configuration
    embeds no placeholder at all
  proves: a registered configuration whose call text embeds no Subject-attribute placeholder never orphans
    a registration, whatever it declares
  fails_when: a configuration embedding no placeholder still causes a refusal
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: propagates a failure the connector-configurations reader itself raises while checking for an orphaned
    placeholder during registerCapability, rather than swallowing it
  proves: a dependency failure (the connector-configurations reader rejecting) surfaces as itself through
    registerCapability's own call path, never swallowed or reported as ConnectorPlaceholderOutsideInputSchemaError
  fails_when: the reader's own rejection is swallowed, or misreported as the orphaned-placeholder refusal
- file: src/__tests__/unit/http/register-capability.routes.spec.ts
  name: refuses with the status the status map assigns ConnectorPlaceholderOutsideInputSchemaError, naming
    every orphaned placeholder together with the capability that fails to declare it
  proves: Registering a capability ... is refused with an HTTP 422 response reporting ConnectorPlaceholderOutsideInputSchemaError.
    and The refusal names every such orphaned placeholder together with the capability being registered.
    — proven at the wire through the actual route and shared error handler
  fails_when: the route answers a status other than 422 for this error, the error code in the response
    body is not ConnectorPlaceholderOutsideInputSchemaError, or the response's details do not carry the
    orphaned array unchanged
not_applicable:
- edge_case: a requester or credential placeholder never counted as orphaned
  why: this task reuses orphanedPlaceholders (connector-placeholder-declaration-check.ts) unmodified —
    that exclusion is already exhaustively proven at the shared pure-function level (connector-placeholder-declaration-check.spec.ts)
    and at the reciprocal register-connector direction's own criterion-4 tests; re-deriving it here would
    test the identical reused function rather than this task's own new wiring
- edge_case: two registrations racing against the same connector at once
  why: no bound node (domain/integration/capability-registry, rules/integration/a-connector-placeholder-is-declared-by-its-capability)
    states concurrent behavior for this reconciliation, and this task's own criteria say nothing about
    it — a test would assert a guarantee nobody made
- edge_case: the connector-configurations reader answering slowly rather than failing
  why: no criterion or node states a timeout or latency behavior for this reader; only its failure (rejection)
    is a stated concern, and that path is covered
- edge_case: a genuinely malformed (non-JSON) or absent input_schema on the registration reaching this
    check
  why: heldCapability's own sync well-formedness and shape checks (refuseMalformedSchemas, refuseMalformedInputSchemaShape)
    always run first and throw before refuseOrphanedPlaceholders is ever reached, so neither is reachable
    through registerCapability's own entry point — only a valid, well-formed input_schema declaring no
    properties (tested above) reaches this check as "declaring nothing"
untested:
- the real, store-backed IConnectorConfigurationsReader implementation's own behavior against a live database
  — this file exercises only the stand-in per TST-03; the real implementation is proven separately in
  __tests__/integration/factories/capability-registry.factory.spec.ts, outside this task's own file set
---

## What it is
Tests proving registerCapability refuses a capability registration whose named connector already holds a configuration embedding an undeclared Subject-attribute placeholder, names every such placeholder with the registering capability, succeeds once the capability declares it, and is untouched when the connector holds no configuration.

## Notes
None.
