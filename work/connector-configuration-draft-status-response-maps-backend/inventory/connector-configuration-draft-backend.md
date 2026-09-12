---
title: Connector-configuration draft backend surface
summary: The area the connector-configuration-draft scope lands in — the OpenAPI reading, draft-generation,
  capability-reading, and HTTP-observation modules under src/src.
sources:
- intake/scope.md
area:
- src/src/connector-registry
- src/src/http
- src/src/investigation
- src/src/http-connector
- src/src/errors
- src/src/__tests__/unit
modules:
- name: openapi-operation-reader
  path: src/src/connector-registry/openapi-operation-reader.ts
  role: touched
- name: connector-configuration-draft-generation
  path: src/src/connector-registry/connector-configuration-draft-generation.ts
  role: touched
- name: connector-configuration-draft
  path: src/src/connector-registry/connector-configuration-draft.ts
  role: touched
- name: capabilities-reader-port
  path: src/src/connector-registry/capabilities-reader.port.ts
  role: touched
- name: draft-connector-configuration-from-openapi-http
  path: src/src/http/draft-connector-configuration-from-openapi.routes.ts
  role: touched
- name: draft-connector-configuration-from-openapi-controller
  path: src/src/http/draft-connector-configuration-from-openapi.controller.ts
  role: touched
- name: draft-connector-configuration-from-openapi-dto
  path: src/src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  role: touched
- name: http-declarative-observation-source-adapter
  path: src/src/investigation/http-declarative-observation-source.adapter.ts
  role: depends-on
- name: response-path-extractor
  path: src/src/http-connector/response-path-extractor.ts
  role: depends-on
- name: http-connector-call-configuration
  path: src/src/http-connector/http-connector-call-configuration.ts
  role: depends-on
- name: citation-validation
  path: src/src/investigation/citation-validation.ts
  role: depends-on
- name: evidence-result
  path: src/src/investigation/evidence-result.ts
  role: depends-on
- name: openapi-errors
  path: src/src/errors
  role: adjacent
conventions:
- statement: A distinct domain error gets its own file under src/src/errors/, named <concept>.error.ts.
  seen_at: src/src/errors
- statement: Tests are not co-located with source; they live under src/src/__tests__/unit/<module-dir>/<file>.spec.ts,
    mirroring the source tree.
  seen_at: src/src/__tests__/unit
must_not_duplicate:
- what: '$ref resolution for OpenAPI documents (cycle-safe, #/-pointer only)'
  at: src/src/connector-registry/openapi-operation-reader.ts (resolveRef, pointerTarget)
- what: Extraction of a capability's declared output field names from its output_schema JSON string
  at: src/src/investigation/citation-validation.ts (declaredFieldsOf)
- what: Dot/bracket path resolution against a parsed response body
  at: src/src/http-connector/response-path-extractor.ts (extractResponseFields)
- what: The application/json-only, resolveRef-then-properties pattern for reading a schema's field names,
    already used for request bodies
  at: src/src/connector-registry/openapi-operation-reader.ts (requestBodyFieldNamesOf)
risks:
- risk: Growing ConnectorConfigurationDraft's shape with new disclosure fields changes the JSON the draft
    HTTP route returns.
  consumers:
  - src/src/http/draft-connector-configuration-from-openapi.controller.ts
  - src/src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  - frontend/app/src/hooks/use-draft-connector-configuration-from-openapi.ts
- risk: Adding output_schema to RegisteredCapabilityForPlaceholderCheck changes a port every implementer
    of ICapabilitiesReader must satisfy.
  consumers:
  - src/src/connector-registry/connector-configuration-draft-generation.ts
  - any adapter implementing ICapabilitiesReader
- risk: observationOf's silent-filter behavior is the fact the scope requires stated in the specification
    unchanged; touching this function instead of only documenting the fact would contradict the scope.
  consumers:
  - src/src/investigation/http-declarative-observation-source.adapter.ts
---

## What it is
The backend half of the connector-configuration-draft feature: an OpenAPI-document reader, a pure draft-generation function, the draft's response type, the capability-reading port used for placeholder and output_schema checks, and the HTTP route/controller/DTO that expose draft generation.
Also included, as read-only context for the plan's decision on the runtime observation fact: the HTTP-declarative observation adapter, its response-path extractor, the HTTP connector call configuration type, and the citation-validation module that reads a capability's output_schema.

## Notes
openapi-operation-reader.ts already resolves $ref via resolveRef/pointerTarget and exposes OpenApiOperationReading; extending it to read responses reuses this same reader and resolveRef.
draftedConfigurationText in connector-configuration-draft-generation.ts currently builds method, address, and conditionally query/headers/body, never statusMap/responseMap; the object literal is exactly where the two new keys must always be emitted, never conditionally.
ConnectorConfigurationDraft is a flat readonly type with no nested disclosure material; carrying status_readings, response_fields and reading_notes requires growing this type.
CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS is a closed string-literal union distinct from the reading-note-kind vocabulary the specification now holds; neither is modeled yet in this file.
RegisteredCapabilityForPlaceholderCheck exposes only input_schema today; nothing in the backend draft-generation path needs output_schema, since the drafted responseMap keys the document's own field names and the coverage-against-capability disclosure is a frontend-surface fact read through the existing capability-registry listing, not a new backend read.
observationOf in http-declarative-observation-source.adapter.ts already implements the fact the specification now holds as an-observation-carries-only-the-output-schema-fields-its-response-map-reaches: it filters extractResponseFields(responseMap, body) down to declaredFieldsOf(capability.output_schema) with no refusal or warning on a miss. No code change is owed here.
declaredFieldsOf in citation-validation.ts is the existing helper that reads an output_schema JSON string's top-level properties keys.
Tests mirror the source tree under src/src/__tests__/unit/.
