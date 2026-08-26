---
title: Proof for register-connector's malformed-object classification
summary: Tests pin that a null or array configuration value is refused as ConnectorConfigurationNotWellFormedError
  rather than as incomplete, that unparsable-text and accepted-object behavior held unchanged, and that
  ConnectorConfigurationNotWellFormedError still maps to 422 — the last two by pointing at the pre-existing
  tests that already prove them.
implementation: sha256:0218942380df9f2d663d60ff9cd7e10250b35505eb9be2115eb502741cb4d6e9
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-registration-conformance-malformed-object-classification-suite
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: refuses a registration whose configuration value is null as ConnectorConfigurationNotWellFormedError,
    naming the reason, rather than as an incomplete configuration
  proves: Registering a connector configuration whose configuration value is null is refused as ConnectorConfigurationNotWellFormedError,
    not as an incomplete configuration.
  fails_when: a null configuration value stops throwing ConnectorConfigurationNotWellFormedError with
    reason 'configuration is not a JSON object', or throws IncompleteConnectorConfigurationError instead
    (or in addition, if the throw were somehow swallowed and both raised)
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: refuses a registration whose configuration value is an array as ConnectorConfigurationNotWellFormedError,
    naming the reason, rather than as an incomplete configuration
  proves: Registering a connector configuration whose configuration value is an array is refused as ConnectorConfigurationNotWellFormedError,
    not as an incomplete configuration.
  fails_when: an array configuration value stops throwing ConnectorConfigurationNotWellFormedError with
    reason 'configuration is not a JSON object', or throws IncompleteConnectorConfigurationError instead
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: writes nothing to the store when it refuses a registration whose configuration value is null or
    an array
  proves: the EDG-04 discipline this registry already holds for every other refusal (a refusal never reaches
    a partial or unwanted write) now holds for the two new branches too — an edge case the classification
    change raises, since the new throw sits inside wellFormedConfiguration, ahead of the store call, but
    nothing before this proof asserted that ordering for these two input shapes
  fails_when: a store write happens before, or despite, the null/array refusal
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: accepts a configuration value supplied already as a plain object, holding it as exactly the same
    text a JSON-text registration of the same content would resolve to
  proves: Registering a connector configuration whose configuration value is already a plain object is
    accepted, exactly as the same content given as JSON text would be.
  fails_when: the text stored for an object-supplied registration differs, byte for byte, from the text
    stored for a text-supplied registration of the identical content — e.g. if the object path started
    re-ordering keys, changing whitespace, or diverging from JSON.stringify in any way the text path does
    not also produce
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: (pre-existing, narrowed) refuses a registration whose configuration value is entirely undeclared,
    treating that as an incomplete registration
  proves: the inference the implementation recorded — an entirely absent configuration value is left out
    of this task's scope and stays classified as incomplete — and keeps the suite internally consistent,
    since the test this replaces asserted the opposite of the new criteria for null and an array
  fails_when: an undeclared configuration value stops being refused as IncompleteConnectorConfigurationError
    naming 'configuration'
not_applicable:
- edge_case: a configuration value that is a number or a boolean primitive
  why: the task's own rationale states these are out of scope ("I left an entirely absent configuration
    value out of this task's criteria since the node does not clearly decide..."), and the implementation
    record's inference extends that same scoping to every primitive other than a well-formed JSON-parsing
    string — this task changes nothing about their classification, so a test here would prove code this
    task did not touch
- edge_case: an empty array ([]) as the configuration value, as distinct from a non-empty array
  why: wellFormedConfiguration's check is Array.isArray(configuration), which does not read length — an
    empty and a non-empty array take the identical branch, so a second test would exercise no code path
    the non-empty-array test above does not already exercise
- edge_case: a dependency that fails or answers slowly
  why: wellFormedConfiguration's null/array check is a synchronous type test with no dependency call —
    nothing here reaches the store, the network or the filesystem
- edge_case: two operations against one subject at once
  why: no node this task implements states concurrent behavior for register-connector, and the classification
    this task adds is a pure, synchronous function of the input value alone — concurrency raises nothing
    new for it to prove
- edge_case: an operation attempted against state that forbids it
  why: this task's refusal is about the shape of one input value, not about the resource's current state
    — there is no state for a second registration to conflict with here, unlike the create-or-replace
    mechanics tested elsewhere in this file
untested:
- 'Criterion 5 (ConnectorConfigurationNotWellFormedError answers with HTTP 422) is proven only by pre-existing
  tests this proof did not write: register-connector.routes.spec.ts''s own criterion-3 and criterion-4
  tests, which mock registerConnector to reject with ConnectorConfigurationNotWellFormedError for the
  two text-based reasons and assert the response is 422. statusForError resolves that mapping by class
  (instanceof), never by reason string, so those two tests already exercise the exact code path a null/array-triggered
  instance of the same class would take — but no test anywhere sends a request that specifically triggers
  the new ''configuration is not a JSON object'' reason through the HTTP layer, because register-connector''s
  own DTO (src/http/dto/register-connector.dto.ts, z.string().min(1)) accepts only string configuration
  and a caller cannot reach the service with a null or array value over HTTP today (the implementation
  record''s own deferred note). That gap is a fact about the DTO, unchanged by and outside this task''s
  file set, not a fact this proof can close.'
---

## What it is

Tests prove a null or array configuration value is refused as ConnectorConfigurationNotWellFormedError rather than incomplete, and that the pre-existing unparsable-text, accepted-object and 422-mapping behavior held unchanged.

## Notes

None.
