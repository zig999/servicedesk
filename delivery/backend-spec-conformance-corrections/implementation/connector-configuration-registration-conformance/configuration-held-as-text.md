---
title: Connector-configuration registry holds configuration as text
summary: ConnectorConfiguration.configuration is now typed and held as JSON object text throughout registration,
  storage, single read and listing, with every consumer that derives an HTTP call parsing it back through
  one shared seam, for task/connector-configuration-registration-conformance/configuration-held-as-text.
task: sha256:24d8835aa74490b1b6199dcfed5cf9ba52eb19e11ba88398805afbf4e41fcda7
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-registration-conformance-configuration-held-as-text-build-2
files:
- path: src/connector-registry/connector-configuration.ts
  effect: ConnectorConfiguration.configuration is now typed string (JSON object text) instead of Readonly<Record<string,
    unknown>>, matching domain/integration/connector-configuration's declared type.
- path: src/connector-registry/connector-configuration-registry.service.ts
  effect: wellFormedConfiguration now resolves a registration's configuration to held JSON object text
    — a string input is validated (JSON.parse succeeds and parses to a plain object) and held verbatim;
    a genuine plain-object input is re-serialized via JSON.stringify. registrationProblems now checks
    typeof registration.configuration !== 'string' instead of !isPlainObject(...), over the same trigger
    set as before. A new exported function, parsedConnectorConfiguration, parses one held ConnectorConfiguration's
    text back into the plain object a call-deriving consumer needs, guarded by isPlainObject and raising
    the existing ConnectorConfigurationNotWellFormedError as a defensive floor.
- path: src/http/read-connector-configuration.controller.ts
  effect: toReadConnectorConfigurationResponse no longer calls JSON.stringify on configuration.configuration
    — it now passes the registry own held text straight through.
- path: src/http/dto/read-connector-configuration.dto.ts
  effect: header comment corrected — no code change.
- path: src/http/list-connector-configurations.controller.ts
  effect: header/JSDoc comments corrected — no code change, since this route already delegated per-entry
    projection to toReadConnectorConfigurationResponse.
- path: src/http/test-connector.controller.ts
  effect: resolveTestedConnectorConfiguration now parses the registry held configuration text back into
    a plain object through parsedConnectorConfiguration, instead of reading resolution.configuration.configuration
    directly as an object.
- path: src/investigation/http-declarative-observation-source.adapter.ts
  effect: the private resolveConnectorConfiguration now parses the registry held configuration text back
    into a plain object through parsedConnectorConfiguration.
- path: src/persistence/relational-connector-configuration-store.repository.ts
  effect: toConnectorConfiguration now re-serializes the driver-parsed jsonb row object back into the
    JSON object text the domain type now holds; insertStatementFor now passes configuration.configuration
    straight through as the insert parameter, since the domain value is already that text.
- path: src/http-connector/connector-call-descriptor.ts
  effect: header comment corrected — no code change; now names parsedConnectorConfiguration as the seam
    a caller uses to derive the plain-object shape from the registry held text.
- path: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  effect: connectorConfigurationRecord()'s own configuration field now built with JSON.stringify(...)
    instead of a bare object literal — mechanical fixture fix for compilation, no assertion changed.
- path: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  effect: connectorConfigurationRecord()'s own configuration field switched to JSON.stringify(...); the
    mocked driver row is now built by JSON.parse-ing that text back into the plain object shape the real
    jsonb-column driver hands the store — mechanical fixture fix, no assertion changed.
- path: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  effect: default and override configuration fixtures switched to JSON.stringify(...); two tests that
    read a registered configuration back now JSON.parse it before comparing — mechanical fixture fix,
    no assertion changed.
- path: src/__tests__/unit/http/build-app.spec.ts
  effect: three minimal ConnectorConfiguration stand-ins now hold JSON.stringify({}) instead of a bare
    {} — mechanical fixture fix, none of the three is asserted on for content.
- path: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  effect: fixture configuration fields switched to JSON.stringify(...) text; two assertions dropped a
    now-redundant extra JSON.stringify — mechanical fixture fix, no assertion meaning changed.
- path: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
  effect: fixture configuration fields switched to JSON.stringify(...) text; one assertion dropped a now-redundant
    extra JSON.stringify — mechanical fixture fix.
- path: src/__tests__/unit/http/read-connector-configuration.routes.spec.ts
  effect: fixture configuration fields switched to JSON.stringify(...) text; one assertion dropped a now-redundant
    extra JSON.stringify — mechanical fixture fix.
- path: src/__tests__/unit/http/register-connector.routes.spec.ts
  effect: fixture configuration fields switched to JSON.stringify(...) text; two content assertions now
    JSON.parse the wire response before comparing — mechanical fixture fix.
- path: src/__tests__/unit/http/test-connector.routes.spec.ts
  effect: heldConnectorConfigurationResolution()'s own inner configuration object now wrapped in JSON.stringify(...)
    — mechanical fixture fix.
- path: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  effect: FakeConnectorConfigurationQuery.readConnectorConfiguration now answers its held branch with
    configuration.configuration set to JSON.stringify(configuration) — mechanical fixture fix, matching
    what the adapter own resolveConnectorConfiguration now parses back.
criteria:
- criterion: A connector configuration read back after registration answers `configuration` as a JSON
    text string, not a parsed object, from read-connector-configuration.
  met: true
  how: ConnectorConfiguration.configuration is now typed and held as string; toReadConnectorConfigurationResponse
    answers it unchanged rather than JSON.stringify-ing an internally-held object.
- criterion: A connector configuration read back after registration answers `configuration` as a JSON
    text string, not a parsed object, from list-connector-configurations.
  met: true
  how: handleListConnectorConfigurationsRequest maps every page entry through the same toReadConnectorConfigurationResponse,
    which now answers the held text unchanged.
- criterion: A connector configuration registered with the configuration supplied as a parsed object round-trips
    to the same content as text on every subsequent read.
  met: true
  how: wellFormedConfiguration re-serializes a genuine plain-object input via JSON.stringify before it
    is ever held or written, so every subsequent read (single or list) answers that same JSON content
    as text.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/connector-registry/connector-configuration.ts
  - src/connector-registry/connector-configuration-registry.service.ts
  - src/http/read-connector-configuration.controller.ts
  - src/persistence/relational-connector-configuration-store.repository.ts
  how: ConnectorConfiguration.configuration is typed string and every layer that holds, persists or answers
    it treats it as JSON object text rather than a parsed object, matching "Its configuration is held
    and answered as JSON object text, whatever form a registration supplied it in."
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  how: wellFormedConfiguration/textConfigurationOrThrow still refuse a registration whose configuration
    is not syntactically valid JSON object text with ConnectorConfigurationNotWellFormedError, and now
    hold a text-supplied registration's text verbatim and a plain-object-supplied registration's re-serialized
    text — "a registration may supply the configuration as that text or as the object it parses to, and
    the registry holds and answers it as text either way."
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/http/read-connector-configuration.controller.ts
  - src/http/list-connector-configurations.controller.ts
  how: read-connector-configuration and list-connector-configurations, this contract's own published read
    operations, now both answer configuration as the text the registry holds it as.
inferences:
- inferred: http-declarative-observation-source.adapter.ts's own resolveConnectorConfiguration also needed
    to change, parsing the registry held text back into a plain object through the new parsedConnectorConfiguration,
    even though only test-connector.controller.ts was named in the task's own risk section as the one
    call site consuming configuration as an object.
  from: the inventory's own risk entry names this file as a fourth consumer; reading it confirmed its
    resolveConnectorConfiguration reads resolution.configuration.configuration directly as an object to
    derive an HTTP call.
- inferred: a configuration supplied to registerConnector as a genuine JS string is held exactly as supplied,
    never re-parsed and re-serialized, while one supplied as a plain object is held as JSON.stringify's
    own canonical serialization of it.
  from: domain/integration/connector-configuration's own wording ("held and answered as JSON object text,
    whatever form a registration supplied it in") states that text is held as text, not that it is canonicalized.
- inferred: parsedConnectorConfiguration's isPlainObject guard, which can only fail for a persisted row
    this registry itself never writes, raises the existing ConnectorConfigurationNotWellFormedError rather
    than a new error class or a silent fallback.
  from: TYP-02 requires a type assertion be accompanied by a narrowing guard, and COR-02 requires a typed
    error over a generic one; no specification node addresses a corrupted persisted configuration at read
    time.
- inferred: the second build attempt's ten test/fixture files needed a mechanical representation fix (JSON.stringify
    at construction, JSON.parse or a dropped redundant stringify at comparison) rather than any change
    to what they assert.
  from: the first build attempt failed typecheck across ten files constructing configuration as a plain-object
    literal against the now string-typed field; every fix is a construction/read-shape change with no
    assertion, expected value or coverage touched.
preserved:
- register-connector's own refusal classification (IncompleteConnectorConfigurationError versus ConnectorConfigurationNotWellFormedError)
  — registrationProblems and wellFormedConfiguration trigger on exactly the same input classes as before,
  only the intermediate representation changed.
- readConnectorConfigurationOrThrow's miss-to-ConnectorConfigurationNotFoundError relocation, and readConnectorConfiguration's
  own ordinary-data miss answer for every other direct caller — untouched.
- listConnectorConfigurations' in-memory pagination over the store's whole read — untouched.
- http-declarative-observation-source.adapter.ts's other three presently-unresolvable endings and its
  four-evidence-result classification — untouched; only the configuration text-to-object parse step was
  added ahead of them.
- test-connector.controller.ts's credential redaction and its raw request/response echo — untouched.
- The relational store's whole-replace write inside one transaction and its schema-qualified statements
  — untouched; only which side of the read/write path calls JSON.stringify moved.
- No test's assertions, expected values, refusal conditions or coverage changed across the ten fixture
  files touched for compilation.
- 'connector-configuration-registry.factory.spec.ts and diagnose-server.factory.spec.ts needed no change:
  both call registerConnector with a plain object, which ConnectorConfigurationRegistration.configuration''s
  own unknown type already accepts and the service serializes internally.'
---

## What it is

The connector-configuration registry stores and answers configuration as JSON object text everywhere it is read, matching the domain node's declared string type; every consumer that derives a call from it parses through one shared seam.

## Notes

The first build attempt failed typecheck across ten pre-existing test/fixture files constructing `configuration` as a plain-object literal (run/connector-configuration-registration-conformance-configuration-held-as-text-build). Fixed mechanically in a second pass — construction and read-shape only, no assertion changed — and the build passed on run/connector-configuration-registration-conformance-configuration-held-as-text-build-2.
