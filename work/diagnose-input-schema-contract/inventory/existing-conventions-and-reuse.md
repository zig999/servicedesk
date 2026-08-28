---
title: Conventions and reusable helpers this contract must not re-derive
summary: The evidenced patterns for schema-shape reading, registration refusal ordering,
  and cross-registry composition, plus what would be duplicated by inventing new ones.
area:
- src/src/investigation/citation-validation.ts
- src/src/capability-registry
- src/src/connector-registry
- src/src/factories/build-app.factory.ts
- src/src/http-connector/connector-request-resolver.ts
sources:
- work/diagnose-input-schema-contract/intake/scope.md
conventions:
- statement: A JSON-shape-over-an-opaque-schema-string reader parses defensively and
    answers "nothing declared" for anything malformed, never throwing — the exact
    posture the scope's own "read as declaring properties and required both empty,
    never a failure" for a pre-existing malformed input_schema must match.
  seen_at: src/src/investigation/citation-validation.ts
- statement: A registry's registerX function runs its refusals in an ordered pipeline
    inside one held<Thing> function — contract-completeness first, then well-formedness,
    then any semantic refusal — before ever touching the store.
  seen_at: src/src/capability-registry/capability-registry.service.ts
- statement: A registry service never touches infrastructure directly; it takes its
    store through a narrow port (ICapabilityStore, IConnectorConfigurationStore),
    and a controller adds no business logic — it delegates straight to a plain function-typed
    dependency (ARC-01/ARC-02).
  seen_at: src/src/http/register-capability.controller.ts
- statement: Every typed domain error extends Error, sets this.name to its own class
    name, carries a readonly `context` object naming exactly what a caller can act
    on, and never carries the value that failed (SEC-04 for placeholder resolution
    failures).
  seen_at: src/src/errors/connector-placeholder-not-resolved.error.ts
- statement: One composition root (build-app.factory.ts's composeResources) builds
    one instance per registry service and reuses it for every route that needs it
    — a second same-shaped instance is a duplication the file's own header comments
    call out explicitly.
  seen_at: src/src/factories/build-app.factory.ts
- statement: 'A resolution result is reported as data (`{ held: boolean, ... }`) for
    an ordinary miss, and only escalated to a thrown error by a distinct "OrThrow"
    wrapper method that a specific route or gate calls — the raw method keeps answering
    the miss as data for every other consumer.'
  seen_at: src/src/capability-registry/capability-registry.service.ts
must_not_duplicate:
- what: declaredFieldsOf — parses an opaque schema string defensively, reads only
    the top-level `properties` object's keys, and answers [] for anything malformed.
    The new input_schema shape check (properties as object, required as subset of
    its keys) is the direct structural sibling of this exact function and must reuse
    or extend it rather than write a second JSON-shape parser.
  at: src/src/investigation/citation-validation.ts
- what: parsedConnectorConfiguration — the one seam that turns a registry's held JSON-object
    text back into a plain object; the reconciliation check's placeholder-extraction
    over a connector's configuration must reuse the existing placeholder-token walk
    (PLACEHOLDER_PATTERN) rather than re-deriving a second regex over the raw text.
  at: src/src/connector-registry/connector-configuration-registry.service.ts and src/src/http-connector/connector-request-resolver.ts
- what: The status map's single Map<DomainErrorClass, number> — every new error this
    contract introduces (MalformedCapabilityInputSchemaError, SubjectDoesNotCoverCaseInputsError,
    ConnectorPlaceholderOutsideInputSchemaError) is one more entry in this one table,
    never a status chosen inline in a controller or middleware.
  at: src/src/errors/status-map.ts
- what: The registry's own re-registration-replaces-by-identity holding (`kept = held.filter(...);
    write([...kept, x])`) — any new registry-level read needed for the reconciliation
    check should read through the same store.readCapabilities()/readConnectorConfigurations()
    calls already used, not a new bespoke query.
  at: src/src/capability-registry/capability-registry.service.ts and src/src/connector-registry/connector-configuration-registry.service.ts
---

## What it is
Patterns actually evidenced in the code that a plan must reuse rather than reinvent.

## Notes
None.
