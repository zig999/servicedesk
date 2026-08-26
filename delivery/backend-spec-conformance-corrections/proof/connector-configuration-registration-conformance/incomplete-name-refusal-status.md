---
title: Register-connector's IncompleteConnectorConfigurationError resolves to 422, proof
summary: Existing tests across status-map.spec.ts, register-connector.routes.spec.ts and connector-configuration-registry.service.spec.ts
  jointly prove that an absent or empty-string connector name is refused with HTTP 422 reporting IncompleteConnectorConfigurationError,
  not the registry's unmapped default.
implementation: sha256:536fb95d092888308f11001c932bfc86c47027256f16a42d7b02d86b550e9726
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-registration-conformance-incomplete-name-refusal-status-suite-5
tests:
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: resolves IncompleteConnectorConfigurationError to 422
  proves: Registering a connector configuration whose connector attribute is absent is refused with HTTP
    422 reporting IncompleteConnectorConfigurationError. / ...is an empty string... (the shared status
    entry both criteria depend on), and the implementation's own inference that one map entry answers
    both conditions without further branching.
  fails_when: IncompleteConnectorConfigurationError's entry is removed from STATUS_BY_ERROR_CLASS, or
    remapped to any status other than 422, so statusForError(error) returns undefined or a value other
    than 422 for an instance of this class.
- file: src/__tests__/unit/http/register-connector.routes.spec.ts
  name: refuses with the status the status map assigns IncompleteConnectorConfigurationError, reporting
    it by name, when registerConnector rejects with it
  proves: Registering a connector configuration whose connector attribute is absent is refused with HTTP
    422 reporting IncompleteConnectorConfigurationError. / ...is an empty string... / Neither case falls
    back to the registry's default, unmapped error response.
  fails_when: the status-map entry for this class is removed or changed, so the propagated IncompleteConnectorConfigurationError
    falls through error-handler.middleware.ts's unmapped path and answers 500 with code INTERNAL_ERROR
    instead of 422 with code IncompleteConnectorConfigurationError and its problems as details.
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: refuses a registration that declares no connector identity
  proves: the precondition of "Registering a connector configuration whose connector attribute is absent
    is refused with HTTP 422 reporting IncompleteConnectorConfigurationError" — that an absent connector
    attribute is exactly the condition the status-map and route tests above resolve to 422.
  fails_when: an absent connector attribute stops raising IncompleteConnectorConfigurationError naming
    "connector" as a problem — e.g. is silently accepted or raises a different error class.
- file: src/__tests__/unit/connector-registry/connector-configuration-registry.service.spec.ts
  name: treats a connector identity declared as the empty string as undeclared
  proves: the precondition of "Registering a connector configuration whose connector attribute is an empty
    string is refused with HTTP 422 reporting IncompleteConnectorConfigurationError", and the implementation's
    own inference that both the absent and empty-string conditions raise the identical error class, so
    one map entry answers both without branching.
  fails_when: an empty-string connector attribute stops raising IncompleteConnectorConfigurationError,
    or raises it with the same reason wording as a different, distinct condition rather than "connector
    is undeclared".
not_applicable:
- edge_case: a connector name present but blank/whitespace-only (e.g. " ")
  why: isUndeclared() (connector-configuration-registry.service.ts) only treats an entirely absent value
    or the exact empty string "" as undeclared; this task's own criteria name only "absent" and "empty
    string", and that throw-side classification is explicitly out of this task's scope per the implementation
    record's own `deferred` entry — it belongs to the malformed-object-classification/persistence tasks,
    not the status-mapping task this proof answers.
untested:
- 'The genuine, un-mocked HTTP path from an absent or empty connector identity through to the registry''s
  own throw: registerConnectorParamsSchema (z.string().min(1)) refuses an empty :connector path segment
  with 400 before the controller is ever reached, and the request body carries no connector field at all,
  so no request this route actually accepts can reach ConnectorConfigurationRegistryService.registerConnector
  with an absent or empty connector. register-connector.routes.spec.ts''s own header comment discloses
  this and stands in for the boundary (TST-03) with a mocked rejection instead; the resolution to 422
  is proved through the real route and error handler, but the throw side is proved only at the unit (service)
  level, never exercised together with the live registry through this route.'
---

## What it is

Existing tests already in the tree prove an absent or empty-string connector name is refused with HTTP 422 reporting IncompleteConnectorConfigurationError, not the registry's unmapped default — no new test was needed.

## Notes

The service-level throw (absent/empty connector → IncompleteConnectorConfigurationError) and the status-map resolution (that class → 422) and the route-level end-to-end refusal were each already covered by pre-existing tests, written by earlier deliveries against this same fact, so no new test file was added.
