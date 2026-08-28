---
title: Proof for build-placeholder-declaration-check
summary: Tests the pure orphaned-placeholder check, its Subject-attribute-placeholder extraction, and
  both registries' narrow cross-reads (default-empty, delegating, failure-propagating, and store-backed
  through the real factories).
implementation: sha256:f97feb151478dad71726b9bb8d699540d41e165a13ce0d966cf634b4c3a117f9
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-and-placeholder-contract-build-placeholder-declaration-check-suite-3
tests:
- file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
  name: names a Subject-attribute placeholder as orphaned when the capability's declared properties does
    not name it
  proves: Given a connector configuration's call text embedding a placeholder naming a Subject attribute,
    and a capability's declared properties not naming that attribute, the check names that placeholder
    as orphaned.
  fails_when: orphanedPlaceholders stops naming an undeclared embedded Subject-attribute placeholder,
    or names the wrong one
- file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
  name: names no orphaned placeholder for a Subject-attribute placeholder the capability's declared properties
    does name
  proves: Given a connector configuration's call text embedding a placeholder naming a Subject attribute
    that a capability's declared properties does name, the check names no orphaned placeholder for it.
  fails_when: orphanedPlaceholders names a declared Subject-attribute placeholder as orphaned
- file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
  name: names only the undeclared placeholder, leaving a declared one out, when the call text embeds both
  proves: the two criteria above hold together, not only in isolation
  fails_when: orphanedPlaceholders reports the declared placeholder too, or omits the undeclared one,
    when both appear in the same text
- file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
  name: never names a requester placeholder orphaned, even when the capability declares no properties
    at all
  proves: A placeholder naming the requester or a credential is never named orphaned by the check.
  fails_when: orphanedPlaceholders names a requester placeholder orphaned
- file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
  name: never names a credential placeholder orphaned, even when the capability declares no properties
    at all
  proves: A placeholder naming the requester or a credential is never named orphaned by the check.
  fails_when: orphanedPlaceholders names a credential placeholder orphaned
- file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
  name: treats an undefined input_schema as declaring no properties, naming every embedded Subject-attribute
    placeholder as orphaned
  proves: the inference the implementation recorded — the check accepts a capability's raw input_schema
    (string | undefined) and calls declaredInputSchemaShape itself
  fails_when: an undefined input_schema is treated as declaring the embedded attribute, or throws, rather
    than reading as declaring nothing
- file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
  name: treats an input_schema that is not syntactically valid JSON as declaring no properties, naming
    every embedded Subject-attribute placeholder as orphaned rather than throwing
  proves: the same inference, over a malformed-JSON input_schema
  fails_when: orphanedPlaceholders throws, or silently declares the embedded attribute, for unparsable
    JSON text
- file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
  name: treats an input_schema whose properties is not declared as an object as declaring no properties,
    naming every embedded Subject-attribute placeholder as orphaned
  proves: the same inference, over a structurally malformed but parseable input_schema
  fails_when: orphanedPlaceholders reads a non-object properties value as declaring the attribute
- file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
  name: answers the empty array when the call text embeds no placeholder at all
  proves: the empty-input edge case for the pure check
  fails_when: orphanedPlaceholders returns anything but [] for text with no placeholder
- file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
  name: answers the empty array when the capability declares every attribute the call text embeds, across
    several placeholders at once
  proves: criteria 2 and 3 together over a realistic multi-placeholder text
  fails_when: any declared placeholder, or requester, is reported orphaned when several placeholders appear
    together
- file: src/__tests__/unit/connector-registry/connector-placeholder-declaration-check.spec.ts
  name: never throws for a bare "${subject}" placeholder naming no attribute, and does not name it orphaned
  proves: the inference the implementation recorded — a placeholder whose kind is 'subject' but whose
    argument is absent is silently skipped, never named orphaned, never thrown
  fails_when: orphanedPlaceholders throws, or names an empty-string placeholder orphaned, for a bare "${subject}"
    token
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: extracts a Subject-attribute placeholder's own attribute name from call text
  proves: subjectAttributePlaceholderNamesIn's own core extraction, which orphanedPlaceholders is built
    on
  fails_when: the function stops extracting, or extracts the wrong name, for one embedded Subject-attribute
    placeholder
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: extracts every Subject-attribute placeholder name when several sit inside one piece of call text
  proves: the extraction over several placeholders of mixed kinds at once
  fails_when: the function misses a Subject-attribute name, extracts a wrong order, or extracts a requester/credential
    name too
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: extracts no name at all for a requester placeholder
  proves: the requester half of "never a requester or credential placeholder" at the extraction level
  fails_when: a requester placeholder is extracted as a Subject-attribute name
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: extracts no name at all for a credential placeholder
  proves: the credential half of "never a requester or credential placeholder" at the extraction level
  fails_when: a credential placeholder is extracted as a Subject-attribute name
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: answers the empty array for call text embedding no placeholder at all
  proves: the empty-input edge case for the extraction function
  fails_when: the function returns anything but [] for text with no placeholder
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: skips a bare "${subject}" placeholder naming no attribute, rather than throwing or naming an empty
    attribute
  proves: the inference the implementation recorded — a malformed Subject placeholder (absent argument)
    is silently skipped, never named, never thrown
  fails_when: the function throws, or names an empty/undefined attribute, for a bare "${subject}" token
- file: src/__tests__/unit/http-connector/connector-request-resolver.spec.ts
  name: skips a "${subject:}" placeholder naming an empty attribute, rather than throwing or naming the
    empty string
  proves: the same inference, over an explicitly empty argument rather than an absent one
  fails_when: the function throws, or includes the empty string, for a "${subject:}" token
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: answers every connector configuration the injected reader currently holds, exactly as that reader
    answers it
  proves: The capability registry can read every currently registered connector configuration through
    a narrow port the composition root supplies — the delegation half
  fails_when: readRegisteredConnectorConfigurations() does not delegate to, or alters, what the injected
    IConnectorConfigurationsReader answers
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: answers the empty array from readRegisteredConnectorConfigurations when constructed with no connector-configurations
    reader at all
  proves: the inference the implementation recorded — the second constructor dependency is optional, defaulting
    to an always-empty reader
  fails_when: a single-argument construction throws, or answers anything but [] from readRegisteredConnectorConfigurations
- file: src/__tests__/unit/capability-registry/capability-registry.service.spec.ts
  name: propagates a failure the injected connector-configurations reader itself raises, rather than swallowing
    it
  proves: the dependency-failure edge case for this delegation
  fails_when: readRegisteredConnectorConfigurations() swallows or reshapes a failure the injected reader
    raises
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: answers every capability the injected reader currently holds, exactly as that reader answers it
  proves: The connector-configuration registry can read every currently registered capability through
    a narrow port the composition root supplies — the delegation half
  fails_when: readRegisteredCapabilities() does not delegate to, or alters, what the injected ICapabilitiesReader
    answers
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: answers the empty array from readRegisteredCapabilities when constructed with no capabilities
    reader at all
  proves: the inference the implementation recorded — the second constructor dependency is optional, defaulting
    to an always-empty reader
  fails_when: a single-argument construction throws, or answers anything but [] from readRegisteredCapabilities
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: propagates a failure the injected capabilities reader itself raises, rather than swallowing it
  proves: the dependency-failure edge case for this delegation
  fails_when: readRegisteredCapabilities() swallows or reshapes a failure the injected reader raises
- file: src/__tests__/integration/factories/capability-registry.factory.spec.ts
  name: reads a connector configuration registered through the connector-configuration registry's own
    real wiring, through readRegisteredConnectorConfigurations backed by the same store
  proves: the real-store half of criterion 4, and the inference that a second store instance over the
    shared connection is behaviorally indistinguishable from one
  fails_when: a connector configuration registered through createConnectorConfigurationRegistry(pool)
    is not visible through createCapabilityRegistry(pool, createConnectorConfigurationsReader(pool)).readRegisteredConnectorConfigurations()
- file: src/__tests__/integration/factories/connector-configuration-registry.factory.spec.ts
  name: reads a capability registered through the capability registry's own real wiring, through readRegisteredCapabilities
    backed by the same store
  proves: the real-store half of criterion 5, and the same shared-connection inference from the other
    direction
  fails_when: a capability registered through createCapabilityRegistry(pool) is not visible through createConnectorConfigurationRegistry(pool,
    createCapabilitiesReader(pool)).readRegisteredCapabilities()
not_applicable:
- edge_case: a duplicate placeholder repeated more than once in one connector configuration's call text
  why: no node or criterion claims the orphaned-placeholder list, or the extraction it is built on, is
    deduplicated
- edge_case: two operations against the check, or against either new read method, running at once
  why: orphanedPlaceholders is a pure function of its own arguments and both new read methods only delegate
    to a given reader on every call, remembering nothing between calls
- edge_case: an operation attempted against state that forbids it
  why: neither the pure check nor either new read method holds any state of its own to forbid an operation
    against; nothing here writes
untested:
- that connector-placeholder-declaration-check.ts and its own subjectAttributePlaceholderNamesIn dependency
  live under connector-registry/http-connector rather than under capability-registry is not independently
  verified by any test written in this proof; it is enforced only by the pre-existing domain-depends-on-no-infrastructure.spec.ts
  sweep of the capability-registry directory, which this proof did not extend.
---

## What it is
Tests the pure orphaned-placeholder check, its Subject-attribute-placeholder extraction, and both registries' narrow cross-reads (default-empty, delegating, failure-propagating, and store-backed through the real factories).

## Notes
The first suite attempt (run/connector-configuration-and-placeholder-contract-build-placeholder-declaration-check-suite) failed at typecheck: two integration test files imported createConnectorConfigurationsReader and createCapabilitiesReader from the wrong factory module (swapped), fixed by test-author. The second attempt (suite-2) failed at test: createCapabilitiesReader (capability-registry.factory.ts) forwarded the full stored Capability shape instead of the narrow { connector, input_schema } the ICapabilitiesReader port declares (cause: code) — fixed by task-implementer, which then introduced a lint naming-convention violation (a destructured `input_schema` parameter), fixed in a follow-up pass. Third attempt (recorded above) passed.
