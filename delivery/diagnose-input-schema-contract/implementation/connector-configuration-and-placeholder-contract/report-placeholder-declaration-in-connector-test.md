---
title: Report orphaned placeholders in the connector test response
summary: test-connector's response now names, for the pair under test, every Subject-attribute placeholder
  the connector configuration's call text embeds that the tested capability's input_schema does not declare,
  computed through the shared orphanedPlaceholders check and never refusing the test.
task: sha256:c718452305cdcdf7dc192800157fda2822cbd570d74ba2137a5e5406f40c078a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/connector-configuration-and-placeholder-contract-report-placeholder-declaration-in-connector-test-build
files:
- path: src/http/test-connector.controller.ts
  effect: resolveTestedConnectorConfiguration now resolves and holds both the raw ConnectorConfiguration
    (its own JSON object text) and the parsed object, so the raw call text survives past the point it
    is parsed for issuing the call. handleTestConnectorRequest computes orphanedPlaceholders(configuration.raw.configuration,
    capability.input_schema) after issuing the one HTTP call and adds the result as orphaned_placeholders
    on the returned response — a pure, non-throwing read, so nothing about issuing or reporting the outcome
    is refused on its account.
- path: src/http/dto/test-connector.dto.ts
  effect: testConnectorResponseSchema gains a required orphaned_placeholders field (z.array(z.string()).readonly()),
    always present — an empty array where every embedded placeholder is already declared — extending TestConnectorResponseDto
    with the new field the controller now populates.
criteria:
- criterion: Testing a connector configuration through a capability whose input schema does not declare
    a Subject-attribute placeholder the configuration's call text embeds reports that placeholder in the
    response.
  met: true
  how: orphanedPlaceholders(configuration.raw.configuration, capability.input_schema) extracts every Subject-attribute
    placeholder the connector configuration's own call text embeds and filters to those the capability's
    declared input-schema properties does not hold; the result is returned verbatim as orphaned_placeholders
    on the response, so a placeholder the schema does not declare is named there.
- criterion: Testing a connector configuration through a capability whose input schema declares every
    Subject-attribute placeholder the configuration's call text embeds reports none.
  met: true
  how: orphanedPlaceholders answers the empty array once every embedded placeholder's name is already
    present among the declared properties, and that empty array is what orphaned_placeholders carries
    unchanged.
- criterion: The test is not refused on account of an orphaned placeholder its own response reports.
  met: true
  how: orphanedPlaceholders is pure and never throws (it names the departure as data, per its own header
    comment); it is called only after issueOutcome has already produced the response, so its result is
    appended to a 2xx body already being returned rather than gating whether the call is issued or the
    response is sent.
nodes:
- node: rules/integration/a-connector-placeholder-is-declared-by-its-capability
  encoded_at:
  - src/http/test-connector.controller.ts
  - src/http/dto/test-connector.dto.ts
  how: this task answers only the node's own diagnostic-reporting clause — "Testing a connector configuration
    through its capability ... reports this same check for the pairing under test, since that diagnostic
    exists exactly to expose this seam to an operator" — by surfacing the shared orphanedPlaceholders
    check's answer on test-connector's own success response. The node's write-time refusal clauses (registering
    or editing a connector configuration or a capability with an orphaned placeholder) are out of this
    task's scope entirely, per its own Notes REMAINDER entry, and are addressed by the sibling tasks named
    there.
inferences:
- inferred: the new field is named orphaned_placeholders (snake_case) and sits at the top level of the
    response body, always present as an array rather than an optional field.
  from: 'this codebase''s own established convention for a computed, non-domain-passthrough field on a
    JSON response body — diagnose.dto.ts''s determining_hypothesis and ticket_ref, and most directly case-input-requirements.dto.ts''s
    own capabilities_with_malformed_input_schema, which is the closest sibling: an array the response
    always carries, empty where the condition it reports does not hold, named snake_case for the same
    "an operator can find and act on it" diagnostic purpose this field serves.'
- inferred: the placeholder names reported are exactly orphanedPlaceholders's own return value (bare Subject-attribute
    names), never paired with the capability or connector identity the way OrphanedPlaceholder (the write-time
    refusal's own richer shape) does.
  from: the task's own instruction to compute the field "via orphanedPlaceholders(configuration.configuration,
    capability.input_schema)" — that function's own declared return type is readonly string[], and test-connector
    already carries both the capability and connector identity in its own request/response elsewhere,
    so restating them per placeholder here would only duplicate what the caller already has.
preserved:
- test-connector's own existing criteria 1-7 (raw outcome shape, criteria 3/4 refusals, the credential-redaction
  masking, the subject built fresh per request, and the absence of any authentication guard) — none of
  the existing control flow inside handleTestConnectorRequest was reordered or altered; the new computation
  is appended after issueOutcome and only adds a field to the object already being returned.
- resolveTestedConnectorConfiguration's own existing refusal (ConnectorConfigurationNotFoundError for
  an unregistered connector) and its reuse of parsedConnectorConfiguration — both unchanged; the function
  now also retains the raw ConnectorConfiguration it already read, rather than reading it a second time.
- the two pre-existing tests in test-connector.controller.spec.ts and every test in test-connector.routes.spec.ts,
  none of which assert the whole response body by exact equality, so none is broken by the response gaining
  a new required field.
deferred:
- what: the write-time refusal pipelines (registerConnector's and registerCapability's own ConnectorPlaceholderOutsideInputSchemaError
    422 responses) that the same rule's other two clauses require.
  why: explicitly out of this task's own scope per its Notes REMAINDER entry; those refusals are delivered
    by the sibling tasks refuse-connector-registration-with-orphaned-placeholder and refuse-capability-registration-with-orphaned-placeholder,
    already delivered per the inventory and the risks note.
---

## What it is
test-connector's response names, for the pair under test, any placeholder the tested capability's input schema does not declare, without refusing the test.

## Notes
None.
