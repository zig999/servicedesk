---
title: Connector-configuration read responses answer configuration as a JSON string
summary: GET /v1/connectors/{connector} and GET /v1/connectors now both re-serialize
  the registry's held configuration object back to the JSON string domain/integration/connector-configuration
  declares, through one shared projection.
task: sha256:d0950c7720a3bb44293d6e2fa696344dc0d7b523648898d9378808fc8aec00c3
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/registry-reads-connector-configuration-response-wire-type-build
files:
- path: src/http/dto/read-connector-configuration.dto.ts
  effect: readConnectorConfigurationResponseSchema now declares configuration as z.string().min(1)
    instead of z.record(z.string(), z.unknown()), so ReadConnectorConfigurationResponseDto
    types configuration as a string; header comment rewritten to state the corrected
    wire shape and name the prior divergence and its fix.
- path: src/http/read-connector-configuration.controller.ts
  effect: exports a new toReadConnectorConfigurationResponse(configuration) function
    that projects the domain's ConnectorConfiguration onto the wire shape, JSON.stringify-ing
    the held configuration object; handleReadConnectorConfigurationRequest now returns
    through it instead of returning the domain-shaped resolution.configuration directly.
- path: src/http/list-connector-configurations.controller.ts
  effect: handleListConnectorConfigurationsRequest now maps every page entry through
    read-connector-configuration.controller.ts's exported toReadConnectorConfigurationResponse
    before answering, so its return type is PaginatedResponse<ReadConnectorConfigurationResponseDto>
    rather than PaginatedResponse<ConnectorConfiguration>; header comment rewritten
    to describe the corrected mapping and the reused projection.
- path: src/http/dto/list-connector-configurations.dto.ts
  effect: header comment corrected to say the response's item type is ReadConnectorConfigurationResponseDto
    rather than the domain ConnectorConfiguration type, and to record why (this task);
    no schema or behavior in this file changed, since it declares no response schema
    of its own.
criteria:
- criterion: A GET /v1/connectors/{connector} response for a registered connector
    returns configuration as a JSON string, never a parsed object.
  met: true
  how: readConnectorConfigurationResponseSchema now types configuration as z.string(),
    and handleReadConnectorConfigurationRequest answers through toReadConnectorConfigurationResponse,
    which JSON.stringify()s the held configuration object rather than returning it
    as-is.
- criterion: A list-connector-configurations response returns every entry's configuration
    as a JSON string, never a parsed object.
  met: true
  how: handleListConnectorConfigurationsRequest maps every entry of the resolved page
    through the same toReadConnectorConfigurationResponse projection before answering,
    so every entry's configuration is the JSON.stringify()'d string rather than the
    registry's held object.
- criterion: Parsing the returned configuration string reproduces the same JSON value
    the connector was registered with.
  met: true
  how: connector-configuration-registry.service.ts's own wellFormedConfiguration only
    ever holds a configuration value that already parsed from well-formed JSON text
    at registration, so JSON.stringify(held object) followed by JSON.parse on the
    caller's side reproduces a value deep-equal to what was registered, in both routes
    — string formatting (key order, whitespace) may differ, but the criterion asks
    for the same JSON value, not the same string.
nodes:
- node: domain/integration/connector-configuration
  encoded_at:
  - src/http/dto/read-connector-configuration.dto.ts
  - src/http/read-connector-configuration.controller.ts
  - src/http/list-connector-configurations.controller.ts
  how: this node declares configuration's attribute type as string. Both HTTP read
    paths now answer that attribute in that type, by re-serializing the registry's
    internally-held plain object back to a JSON string at the wire boundary (toReadConnectorConfigurationResponse);
    the registry's own internal representation (connector-configuration.ts's ConnectorConfiguration,
    configuration held as Readonly<Record<string, unknown>>) is unchanged, since this
    task's own scope is the wire response only, not what a connector configuration
    is or how it is validated on write.
- node: contracts/integration/connector-configuration-registry
  encoded_at:
  - src/http/read-connector-configuration.controller.ts
  - src/http/list-connector-configurations.controller.ts
  how: this contract's read-connector-configuration and list-connector-configurations
    operations are unchanged in the domain module (connector-configuration-registry.service.ts)
    — this task touches only the HTTP projection each route builds from what those
    published operations resolve, so both operations continue to answer exactly as
    the contract already established, now carried onto the wire consistent with the
    domain model's declared configuration type.
inferences:
- inferred: the corrected response schema field is z.string().min(1) rather than a
    bare z.string().
  from: register-connector.dto.ts's own registerConnectorBodySchema already types
    the same domain attribute as z.string().min(1) for the write side, and read-capability.dto.ts's
    own input_schema/output_schema fields use the identical z.string().min(1) shape
    for their own JSON-text attributes; a JSON.stringify() of any plain object is
    always at least "{}" (non-empty), so min(1) can never reject a value this projection
    produces.
- inferred: the shared serialization is placed as one exported function, toReadConnectorConfigurationResponse,
    in read-connector-configuration.controller.ts, reused by list-connector-configurations.controller.ts
    rather than restated per file.
  from: the identical, already-established pattern in this codebase — read-case.controller.ts
    exports toReadCaseResponse specifically so release.controller.ts and update-draft.controller.ts
    can reuse it (their own header comments cite MNT-03 for this exact reuse) — mirrored
    here for the same rule and the same reason, since both connector-configuration
    read routes need the identical projection.
deferred:
- what: register-connector.controller.ts's own PUT /v1/connectors/{connector} response
    also answers with the domain's ConnectorConfiguration type directly, so its configuration
    field is also currently an object rather than the JSON string the domain model
    declares.
  why: neither the task's criteria, its rationale (which names exactly two call sites,
    both reads, confirmed by the inventory), nor domain/integration/connector-configuration's
    own read/write framing name this write-acknowledgment response as a call site
    to fix; correcting it here would widen this task past the two read routes it was
    cut to answer, and is left for a task that reaches register-connector.controller.ts
    by name.
---

## What it is

A correction to two read responses so each answers configuration in the wire type the domain model declares, matching what the write side already does.
Both routes now project through one shared function, toReadConnectorConfigurationResponse, rather than restating the serialization twice.

## Notes

register-connector.controller.ts's own write-acknowledgment response carries the same divergence (configuration answered as an object rather than a string) and is deferred, named above, since this task's own two call sites are both reads.
