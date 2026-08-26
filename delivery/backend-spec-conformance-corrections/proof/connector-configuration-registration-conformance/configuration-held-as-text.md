---
title: Proof for configuration held as text across registration, single read and list
summary: Tests prove configuration is held and answered as JSON object text — never a parsed object —
  through readConnectorConfigurationOrThrow and listConnectorConfigurations after an object-supplied registration,
  that both round-trip to the exact registered content including the empty-object boundary, corroborated
  by the controller/route pass-through and persistence-layer re-serialization tests this task's own file
  set also touches.
implementation: sha256:863716430d88b9b47a5f80b501c68a13713f1dbb6681a035b1d87820c77b656b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-registration-conformance-configuration-held-as-text-suite-3
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: answers configuration as a JSON text string, never a parsed object, through readConnectorConfigurationOrThrow
    after a registration supplied it as a parsed object
  proves: A connector configuration read back after registration answers `configuration` as a JSON text
    string, not a parsed object, from read-connector-configuration.
  fails_when: readConnectorConfigurationOrThrow answers configuration as a parsed object (or anything
    but a string) after a registration supplied it as a plain object — i.e. wellFormedConfiguration stops
    re-serializing an object-supplied registration to text before it is held.
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: answers a configuration through readConnectorConfigurationOrThrow that parses back to exactly
    the object the connector was registered with
  proves: A connector configuration registered with the configuration supplied as a parsed object round-trips
    to the same content as text on every subsequent read. — the read-connector-configuration half.
  fails_when: JSON.parse(resolved.configuration) no longer equals the object the connector was registered
    with — a key dropped, reordered content that changes meaning, or a value coerced during the register-then-hold
    path.
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: answers every entry's configuration as a JSON text string, never a parsed object, through listConnectorConfigurations
    after registrations each supplied as a parsed object
  proves: A connector configuration read back after registration answers `configuration` as a JSON text
    string, not a parsed object, from list-connector-configurations.
  fails_when: any entry's configuration answered by listConnectorConfigurations is not a string (e.g.
    is answered as the parsed object) after being registered as a plain object.
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: answers each entry through listConnectorConfigurations parsing back to exactly the object its
    own connector was registered with
  proves: A connector configuration registered with the configuration supplied as a parsed object round-trips
    to the same content as text on every subsequent read. — the list-connector-configurations half, across
    two distinct connectors so a mix-up between entries would also be caught.
  fails_when: JSON.parse of either entry's own text no longer equals its own connector's registered content,
    or an entry answers the other connector's content.
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: round-trips an empty object supplied as configuration to the empty-object JSON text "{}" through
    readConnectorConfigurationOrThrow, the smallest well-formed JSON object this criterion applies to
  proves: the round-trip criterion holds at its own boundary — an empty plain object, the smallest value
    wellFormedConfiguration's isPlainObject branch accepts — not just for configurations carrying keys.
  fails_when: registering with configuration `{}` answers anything other than the text "{}" on a subsequent
    read (e.g. an empty string, "null", or a re-serialization that adds whitespace).
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: holds a string-supplied configuration exactly as given, not re-parsed and re-serialized, so its
    own non-canonical formatting survives a read back through readConnectorConfigurationOrThrow
  proves: a configuration supplied to registerConnector as a genuine JS string is held exactly as supplied,
    never re-parsed and re-serialized, while one supplied as a plain object is held as JSON.stringify's
    own canonical serialization of it — the implementation record's own inference.
  fails_when: a string-supplied configuration's own spacing or key order is normalized away (i.e. wellFormedConfiguration
    starts round-tripping a string through JSON.parse/JSON.stringify instead of holding it verbatim).
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: parsedConnectorConfiguration parses a well-formed held configuration back into exactly the object
    its own text holds
  proves: the ordinary-path half of the implementation record's inference that "parsedConnectorConfiguration's
    isPlainObject guard ... raises the existing ConnectorConfigurationNotWellFormedError rather than a
    new error class or a silent fallback" — this test pins the non-error branch the guard sits ahead of.
  fails_when: parsedConnectorConfiguration stops answering the exact object a well-formed held configuration's
    own text parses to.
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: parsedConnectorConfiguration throws ConnectorConfigurationNotWellFormedError, naming the same
    reason the write side raises, for a held configuration whose text does not parse to a plain object
  proves: parsedConnectorConfiguration's isPlainObject guard, which can only fail for a persisted row
    this registry itself never writes, raises the existing ConnectorConfigurationNotWellFormedError rather
    than a new error class or a silent fallback — the implementation record's own inference, defensive-floor
    half.
  fails_when: parsedConnectorConfiguration stops throwing ConnectorConfigurationNotWellFormedError (or
    throws a different class, or throws with a different reason than the write side's own "configuration
    does not parse to a JSON object") for a corrupted held configuration.
- file: src/__tests__/unit/http/read-connector-configuration.controller.spec.ts
  name: answers the wire projection of exactly the configuration its readConnectorConfiguration dependency
    resolves, performing no held-check of its own
  proves: the read-connector-configuration.controller.ts half of criterion 1 — toReadConnectorConfigurationResponse
    passes the registry's held text straight through unchanged (no re-JSON.stringify), which is what lets
    the registry-level round trip above reach the wire unmodified, since read-connector-configuration.controller.ts's
    own header comment and build-app.factory.ts both confirm this controller's dependency is wired to
    readConnectorConfigurationOrThrow — exactly the method the registry-level tests above exercise.
  fails_when: the projected response's configuration differs from the dependency's own resolved configuration
    string (e.g. the controller re-serializes it, producing a double-encoded string).
- file: src/__tests__/unit/http/list-connector-configurations.routes.spec.ts
  name: 'answers every entry''s configuration as a JSON string, never a parsed object (and its sibling:
    answers every entry''s configuration string parsing back to the same JSON value each connector was
    registered with)'
  proves: the list-connector-configurations wire-layer half of criteria 2 and 3 — every page entry's configuration
    reaches the wire as text and parses back to the registered content, corroborating that handleListConnectorConfigurationsRequest's
    own per-entry mapping through toReadConnectorConfigurationResponse (MNT-03, the identical function
    criterion-1's controller test exercises) introduces no transformation of its own.
  fails_when: any entry in the wire response's data array answers configuration as something other than
    a string, or as text that no longer parses back to the object each connector was registered with.
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: answers a read with the connector identity and its configuration exactly as the row holds them
  proves: toConnectorConfiguration re-serializes a driver-parsed jsonb row object back into the JSON object
    text the domain type now holds — the persistence-layer instance of "every subsequent read" answers
    text, for the store implementation registerConnector and readConnectorConfiguration actually use in
    production.
  fails_when: a row whose driver-parsed configuration is a plain object stops being re-serialized to the
    expected JSON text (e.g. the store starts answering the raw parsed object instead).
- file: src/__tests__/unit/persistence/relational-connector-configuration-store.repository.spec.ts
  name: deletes every existing row and inserts exactly the given configurations, in that order, inside
    one transaction
  proves: insertStatementFor passes the domain's own already-held JSON text straight through as the write
    parameter, without re-serializing it a second time — the write-side half of the persistence-layer
    round trip.
  fails_when: the recorded INSERT params no longer carry the domain's own held text verbatim (e.g. a re-JSON.stringify
    wraps it a second time, or the object is passed unserialized).
- file: src/__tests__/integration/persistence/relational-connector-configuration-store.repository.spec.ts
  name: persists and reads back a connector configuration exactly as given
  proves: against a real PostgreSQL database, a connector configuration's JSON-text `configuration` field
    survives a genuine write-then-read round trip through the jsonb column unchanged — the strongest available
    instance of criterion 3, over the actual store the deployed registry uses.
  fails_when: a configuration written as JSON text is answered back by a real database read as anything
    other than that exact text (e.g. reordered keys, added/removed whitespace, or the raw parsed object).
- file: src/__tests__/unit/investigation/http-declarative-observation-source.adapter.spec.ts
  name: issues exactly one outbound call per observeConcept invocation
  proves: http-declarative-observation-source.adapter.ts's own resolveConnectorConfiguration also needed
    to change, parsing the registry held text back into a plain object through the new parsedConnectorConfiguration
    — the implementation record's own inference. FakeConnectorConfigurationQuery answers configuration
    as JSON.stringify(...) text on every call (matching the registry's own held representation), so this
    test — and, on the same premise, essentially every positive-path test in this file — only passes if
    resolveConnectorConfiguration correctly parses that text back into the plain object asHttpConnectorCallConfiguration
    reads method/responseMap/statusMap from.
  fails_when: resolveConnectorConfiguration stops parsing the held text (e.g. reverts to reading the ConnectorConfiguration's
    own configuration field as if it were already a plain object) — the string would carry no .method,
    httpConfigurationProblems would refuse it as malformed, and the call would never reach httpClient
    at all, yielding an 'unavailable' outcome instead of an issued call.
not_applicable:
- edge_case: two concurrent registrations, or a registration racing a read, against the same connector
  why: no node this task implements states concurrent behavior for the registry, and each read (readConnectorConfigurationOrThrow,
    listConnectorConfigurations) is a fresh, uncached lookup through the store on every call — unchanged
    by this task and already proven elsewhere (e.g. "resolves the connector configuration registered after
    an earlier resolution already answered its absence"). The text-versus-object representation this task
    changes is not a function of timing.
- edge_case: a configuration value that is not a well-formed JSON object at all (null, an array, unparsable
    text)
  why: those are refused before ever being held (ConnectorConfigurationNotWellFormedError), so no such
    value ever reaches a "read back after registration" — this task's own three criteria presuppose an
    accepted registration. That refusal classification is a different task's own ground (malformed-object-classification),
    already proved there.
- edge_case: a dependency (store, network, filesystem) failing or answering slowly during the round trip
  why: the text-versus-object representation this task changes is a pure, synchronous transformation (JSON.stringify/JSON.parse)
    with no dependency call of its own; a failing store is already proven, unaffected by this task, by
    "propagates a failure the underlying store read itself raises."
untested:
- No single test registers a connector through the real HTTP PUT route and then reads it back through
  the real HTTP GET route or the real GET list route against one live, unstubbed registry. The round trip
  is proven in two separately-verified halves instead — the service-level register-then-read/list round
  trip against an in-memory store (tests above), and the controller/route-level pass-through against a
  mocked registry read (also above) — composing soundly because read-connector-configuration.controller.ts's
  own header comment and build-app.factory.ts both confirm the controllers are wired to exactly the service
  methods the first half exercises, and the pass-through tests show the controllers add no transformation
  of their own. No test exercises the full stack together in one request/response pair.
---

## What it is

Tests prove configuration is held and answered as JSON object text through single read and list, round-tripping to the exact registered content at the service, controller, route and persistence layers.

## Notes

None.
