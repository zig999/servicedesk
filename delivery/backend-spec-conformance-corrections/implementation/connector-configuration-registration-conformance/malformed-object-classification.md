---
title: Malformed connector-configuration values classified as not-well-formed, not incomplete
summary: registerConnector now refuses a null or array configuration value as ConnectorConfigurationNotWellFormedError
  instead of IncompleteConnectorConfigurationError, alongside the unparsable-text and accepted-object
  cases that already worked correctly.
task: sha256:3da9da217c02afb4cbe936e00ff90b7bc9e386740d3fac0ef446b63203efbe0b
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-registration-conformance-malformed-object-classification-build
files:
- path: src/connector-registry/connector-configuration-registry.service.ts
  effect: wellFormedConfiguration now throws ConnectorConfigurationNotWellFormedError('configuration is
    not a JSON object') when the configuration value is already null or an array (checked after the string
    and plain-object branches, which are unchanged), instead of letting those values fall through unclassified
    to registrationProblems, where they were previously flagged as IncompleteConnectorConfigurationError.
    Updated wellFormedConfiguration's and refuseRegistrationDepartures's doc comments to describe the
    new branch and its ordering relative to the unaffected undeclared/other-primitive path.
criteria:
- criterion: Registering a connector configuration whose configuration value is null is refused as ConnectorConfigurationNotWellFormedError,
    not as an incomplete configuration.
  met: true
  how: wellFormedConfiguration's new `configuration === null` check throws ConnectorConfigurationNotWellFormedError
    before heldConfiguration's later refuseRegistrationDepartures call ever sees the value, so null never
    reaches the incomplete-configuration path.
- criterion: Registering a connector configuration whose configuration value is an array is refused as
    ConnectorConfigurationNotWellFormedError, not as an incomplete configuration.
  met: true
  how: The same new branch's `Array.isArray(configuration)` check throws ConnectorConfigurationNotWellFormedError
    for an array value, for the identical reason.
- criterion: Registering a connector configuration whose configuration value is text that does not parse
    as a JSON object is refused as ConnectorConfigurationNotWellFormedError, not as an incomplete configuration.
  met: true
  how: Unchanged pre-existing behavior — textConfigurationOrThrow (called from the string branch of wellFormedConfiguration)
    already throws ConnectorConfigurationNotWellFormedError both when JSON.parse fails and when the parsed
    value is not a plain object (an array or a primitive), verified by reading the function; no change
    was needed here.
- criterion: Registering a connector configuration whose configuration value is already a plain object
    is accepted, exactly as the same content given as JSON text would be.
  met: true
  how: Unchanged pre-existing behavior — wellFormedConfiguration's isPlainObject branch (checked before
    the new null/array branch, so no interference) re-serializes a genuine plain object with JSON.stringify
    and holds that text, the same text form a JSON-text registration of the same content would resolve
    to; no change was needed here.
- criterion: ConnectorConfigurationNotWellFormedError answers with the HTTP 422 response the specification
    states.
  met: true
  how: Unchanged pre-existing mapping — STATUS_BY_ERROR_CLASS in src/errors/status-map.ts already maps
    ConnectorConfigurationNotWellFormedError to 422, confirmed by reading that file; no change was needed
    here.
nodes:
- node: rules/integration/a-connector-configuration-holds-a-well-formed-object
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  how: The rule's invariant ("the registry refuses to register or update a connector configuration whose
    configuration is not syntactically valid JSON object text ... with an HTTP 422 response reporting
    a ConnectorConfigurationNotWellFormedError") now holds for a configuration supplied already as a parsed
    null or array, not only for unparsable text — closing the gap where those two shapes fell through
    to the incomplete-configuration classification instead.
- node: domain/integration/connector-configuration
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  how: Honored, not changed by this task — "what it must be is a well-formed JSON object" is the statement
    the fix enforces more completely; the value-object's own shape (connector, configuration as string)
    is untouched.
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/connector-registry/connector-configuration-registry.service.ts
  how: Honored, not changed — register-connector's published behavior (create or replace by name) is unaffected;
    only the classification of one malformed input shape changed.
inferences:
- inferred: The refusal reason string for a directly-supplied null or array value is 'configuration is
    not a JSON object', distinct from textConfigurationOrThrow's 'configuration does not parse to a JSON
    object'.
  from: No node or existing test states the exact wording for this new case. Wording accurate to what
    happened — the value was never parsed, since it was already a JS value rather than text — rather than
    reusing the parse-oriented phrasing that describes a different code path (JSON.parse over string input),
    following the same ConnectorConfigurationNotWellFormedError class and this file's own existing convention
    of one short, specific reason string per branch.
- inferred: An entirely absent configuration value, and every configuration value that is a primitive
    other than a well-formed JSON-parsing string (a number, a boolean), are left unchanged as IncompleteConnectorConfigurationError,
    out of this fix's scope.
  from: The task's own rationale field states this scoping explicitly ("I left an entirely absent configuration
    value out of this task's criteria since the node does not clearly decide whether that is malformed
    or incomplete") and names only null, array and unparsable text as the cases the node's statement clearly
    covers; extended to the other untouched primitives since the task's criteria name only null and array
    among directly-supplied values.
deferred:
- what: 'register-connector''s own HTTP DTO (src/http/dto/register-connector.dto.ts) accepts only `configuration:
    z.string().min(1)` at the route boundary, so a caller cannot actually reach registerConnector with
    a null or array configuration value over HTTP today — only through a direct call to the service, which
    is where this task''s own criteria and the existing unit test suite for this file exercise the classification.'
  why: The task names only rules/integration/a-connector-configuration-holds-a-well-formed-object, domain/integration/connector-configuration
    and contracts/integration/connector-configuration-registry as the nodes it implements, and its own
    "What it is" section names wellFormedConfiguration and registrationProblems as the two functions in
    scope — the DTO's own accepted shape is a pre-existing, unrelated decision this task's file set does
    not reach, and widening it would be widening the task.
---

## What it is

wellFormedConfiguration and registrationProblems classify a null, an array, or unparsable text as not-well-formed rather than incomplete.
An already-parsed object is accepted the same as the text it would parse to.

## Notes

None.
