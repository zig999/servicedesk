---
title: Register-connector maps a missing connector name to its stated refusal
summary: IncompleteConnectorConfigurationError is added to the shared status map so an absent or empty
  connector name is answered with HTTP 422 instead of the registry's unmapped 500 default, for task/connector-configuration-registration-conformance/incomplete-name-refusal-status.
task: sha256:7a116ec853f742c255b37da83b401b626a82f35920af99cdf6ff8bf08d8109f5
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-registration-conformance-incomplete-name-refusal-status-build
files:
- path: src/errors/status-map.ts
  effect: imports IncompleteConnectorConfigurationError and adds it to STATUS_BY_ERROR_CLASS mapped to
    422, so statusForError resolves it instead of falling through to undefined; also updates the header
    comment's 422 grouping and entry-count prose (nineteen to twenty) to name the fifth 422 class and
    its rule citation.
criteria:
- criterion: Registering a connector configuration whose connector attribute is absent is refused with
    HTTP 422 reporting IncompleteConnectorConfigurationError.
  met: true
  how: connector-configuration-registry.service.ts's isUndeclared/refuseRegistrationDepartures already
    throws IncompleteConnectorConfigurationError for an absent connector, and register-connector.controller.ts
    already lets it propagate; the status map now resolves that class to 422, so error-handler.middleware.ts
    answers 422 instead of its unmapped 500 default.
- criterion: Registering a connector configuration whose connector attribute is an empty string is refused
    with HTTP 422 reporting IncompleteConnectorConfigurationError.
  met: true
  how: The same isUndeclared check treats an empty string identically to an absent one, throwing the same
    IncompleteConnectorConfigurationError, which the same new map entry now resolves to 422.
- criterion: Neither case falls back to the registry's default, unmapped error response.
  met: true
  how: Before this change IncompleteConnectorConfigurationError held no entry in STATUS_BY_ERROR_CLASS,
    so statusForError returned undefined and the error reached the generic 500 path; the new map entry
    means statusForError now returns 422 for every instance of this class.
nodes:
- node: rules/integration/a-connector-configuration-names-its-connector
  encoded_at:
  - src/errors/status-map.ts
  how: The rule states that a registration whose connector name is absent or an empty string is refused
    with HTTP 422 reporting IncompleteConnectorConfigurationError. The throw side (isUndeclared, refuseRegistrationDepartures)
    already existed and is out of this task's scope (the malformed-object classification task owns what
    is raised); this task closes the one remaining gap — that the raised class maps to 422 rather than
    the registry's unmapped default.
inferences:
- inferred: IncompleteConnectorConfigurationError is a single, non-subclassed error class with no siblings
    needing separate treatment, so one map entry answers both the absent-name and empty-name criteria
    without further branching.
  from: reading incomplete-connector-configuration.error.ts and the isUndeclared/refuseRegistrationDepartures
    code, which throws this one class uniformly for both conditions per the rule's own "an empty string
    is treated as no name at all."
deferred:
- what: Whether wellFormedConfiguration/refuseRegistrationDepartures correctly distinguish IncompleteConnectorConfigurationError
    from ConnectorConfigurationNotWellFormedError for other malformed-object cases.
  why: task/connector-configuration-registration-conformance/malformed-object-classification's own objective,
    explicitly out of this task's scope per its own rationale.
---

## What it is

A connector-configuration registration with no connector name, or an empty one, now answers HTTP 422 IncompleteConnectorConfigurationError instead of the registry's unmapped default.

## Notes

None.
