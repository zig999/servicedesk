---
title: Risks the input-schema contract change surfaces
summary: Named consumers that would observe a break if the shape check, the cross-registry
  reconciliation, or the placeholder degrade change behaves differently than these
  existing call sites expect.
area:
- src/src/capability-registry
- src/src/connector-registry
- src/src/investigation/http-declarative-observation-source.adapter.ts
- src/src/factories/build-app.factory.ts
sources:
- work/diagnose-input-schema-contract/intake/scope.md
risks:
- risk: registerCapability and registerConnector today construct their registry service
    with only their own store (ICapabilityStore / IConnectorConfigurationStore); the
    two-point reconciliation (placeholder ⊆ properties) needs each registration to
    read the other registry's held records, which no current port exposes without
    widening a constructor or threading a second dependency through composeResources.
  consumers:
  - src/src/http/register-capability.controller.ts
  - src/src/http/register-connector.controller.ts
  - src/src/factories/build-app.factory.ts's composeResources
- risk: declaredFieldsOf is exported and already consumed by citation-validation.ts,
    judgment-stage.ts and http-declarative-observation-source.adapter.ts for output_schema;
    extending or duplicating its shape-reading logic for input_schema without care
    could change its answer for those three existing call sites if the change is made
    in the shared function rather than a sibling.
  consumers:
  - src/src/investigation/judgment-stage.ts
  - src/src/investigation/http-declarative-observation-source.adapter.ts
  - src/src/investigation/citation-validation.ts
- risk: resolveConnectorRequest (called uncaught inside observeConcept) is the one
    call the scope requires wrapping to degrade ConnectorPlaceholderNotResolvedError
    to 'unavailable'; test-connector.controller.ts calls the same resolver directly
    and its own current behavior (propagating the throw so the diagnostic route can
    report it) must not be altered by a fix scoped to the observation adapter alone.
  consumers:
  - src/src/http/test-connector.controller.ts
  - src/src/investigation/http-declarative-observation-source.adapter.ts
- risk: the diagnose entry-point gate (subject covers case's required attributes)
    must run inside handleDiagnoseRequest before runDiagnose, but that function currently
    receives no ICapabilityQuery; DiagnoseControllerDependencies and every place that
    constructs it (diagnose-server.factory.ts, build-app.factory.ts) would need the
    added dependency, and a caller left unwired would silently skip the gate rather
    than fail loudly.
  consumers:
  - src/src/factories/diagnose-server.factory.ts
  - src/src/factories/build-app.factory.ts
  - src/src/http/diagnose.routes.ts
- risk: status-map.ts's STATUS_BY_ERROR_CLASS relies on insertion order and an explicit
    note that none of its twenty-two entries currently extends another; three new
    error classes must be checked against that same non-subclassing invariant before
    being appended, or a later refusal could resolve to the wrong entry silently.
  consumers:
  - src/src/errors/status-map.ts
  - src/src/http/error-handler.middleware.ts (COR-04's shared resolver)
---

## What it is
What the change could break, each naming who would observe it.

## Notes
None.
