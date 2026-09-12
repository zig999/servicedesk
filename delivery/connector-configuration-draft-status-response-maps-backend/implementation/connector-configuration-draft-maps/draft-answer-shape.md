---
target: backend
title: Response schema for the connector-configuration draft answer
summary: Adds a zod response schema and inferred DTO type to the draft-connector-configuration-from-openapi
  DTO file, declaring every attribute of ConnectorConfigurationDraft -- status_readings, response_fields
  and reading_notes among them -- each collection's own member fields on the exact presence terms
  domain/integration/connector-configuration-draft-status-reading, -response-field and -reading-note
  declare, with no field the draft type does not declare and no capability name, version or count anywhere.
task: sha256:766d300c9ea752ffcaa52fe70c9a634e2380d5a7e1a89fd5b26d16edb8ba2df0
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-draft-answer-shape-build-2
files:
- path: src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  effect: Now also exports draftConnectorConfigurationFromOpenApiResponseSchema (zod) and its inferred
    type DraftConnectorConfigurationFromOpenApiResponseDto, declaring connector, configuration, unresolved,
    generated_credentials, method_mismatch (optional), status_readings, response_fields and reading_notes
    -- one property per attribute ConnectorConfigurationDraft declares and no other -- with unresolved/generated_credentials
    member fields as the domain type already declares them, method_mismatch's own fields required, and
    each of status_readings/response_fields/reading_notes' own member fields required or optional exactly
    as domain/integration/connector-configuration-draft-status-reading, -response-field and -reading-note
    each declare them (status_readings has status and ending required with declared_as optional;
    response_fields has name, path and status required with declared_type, declared_required and envelope
    optional; reading_notes has kind and subject required with detail optional); reading_notes' kind is the
    closed nine-value enum imported from
    CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS, unresolved's reason from CONNECTOR_CONFIGURATION_DRAFT_UNRESOLVED_REASONS,
    and status_readings' ending from the existing EVIDENCE_RESULTS constant, none of the three vocabularies
    re-declared as new literals.
criteria:
- criterion: The route's response schema declares a property for status_readings, response_fields and
    reading_notes.
  met: true
  how: draftConnectorConfigurationFromOpenApiResponseSchema declares all three as required array properties,
    each item schema mirroring the corresponding domain type's own member fields.
- criterion: The route's response schema declares one property per attribute of the draft type and no
    property the type does not declare.
  met: true
  how: The schema's top-level z.object keys are exactly connector, configuration, unresolved, generated_credentials,
    method_mismatch, status_readings, response_fields, reading_notes -- the same set ConnectorConfigurationDraft
    declares, no more and no fewer; no capability-naming field is present.
- criterion: The response schema declares each collection's member fields on the presence terms the draft
    type declares for them.
  met: true
  how: unresolved and generated_credentials member fields are declared exactly as the domain type declares
    them; per the task's own UNDERDETERMINED note, the criterion's own wording misattributes these presence
    terms to domain/integration/connector-configuration-draft, which does not declare them -- the actually
    governing nodes (connector-configuration-draft-status-reading, -response-field, -reading-note) each
    declare their own member fields' presence, and the schema now matches each of those three exactly
    (status/ending/name/path/status/kind/subject required, declared_as/declared_type/declared_required/envelope/detail
    optional); reading_notes' kind additionally uses the closed nine-value enum rather than a free-form
    string.
- criterion: The answer names, versions and counts no capability registered against the connector.
  met: true
  how: No field named capability/capabilities, no version and no count appears anywhere in the schema;
    generateConnectorConfigurationDraft reads the capabilities reader only to resolve subject placeholders
    and unresolved items, never to disclose a capability's name, version or count.
- criterion: The answer's set of fields is the same whether no capability, one or several are registered
    against the connector.
  met: true
  how: status_readings, response_fields and reading_notes are unconditionally emitted keys of the returned
    object literal, never behind a capability-count conditional; the capabilities reader affects only
    resolved content, never which top-level keys are present.
- criterion: The controller passes the generated draft's status readings, response fields and reading
    notes through unchanged.
  met: true
  how: handleDraftConnectorConfigurationFromOpenApiRequest already returns generateConnectorConfigurationDraft's
    result directly, with no field-by-field reconstruction; left untouched.
- criterion: The DTO's declared response type carries no field the draft type does not declare.
  met: true
  how: DraftConnectorConfigurationFromOpenApiResponseDto is inferred from a schema whose top-level keys
    are exactly ConnectorConfigurationDraft's own attribute names, with no additional key.
nodes:
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  how: The response schema's top-level shape mirrors this element's attribute list and presence terms
    exactly (method_mismatch optional, every other attribute required).
- node: domain/integration/connector-configuration-draft-status-reading
  encoded_at:
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  how: draftStatusReadingResponseSchema declares status and ending required and declared_as optional,
    exactly this element's own presence terms, with ending drawn from the same closed evidence-result
    vocabulary via the existing EVIDENCE_RESULTS constant.
- node: domain/integration/connector-configuration-draft-response-field
  encoded_at:
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  how: draftResponseFieldResponseSchema declares name, path and status required and declared_type,
    declared_required and envelope optional, exactly this element's own presence terms.
- node: domain/integration/connector-configuration-draft-reading-note
  encoded_at:
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  how: draftReadingNoteResponseSchema declares kind and subject required and detail optional, exactly
    this element's own presence terms.
- node: domain/integration/connector-configuration-draft-reading-note-kind
  encoded_at:
  - src/http/dto/draft-connector-configuration-from-openapi.dto.ts
  how: kind is declared with z.enum(CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS), the existing exported
    constant already carrying this element's closed nine-value set.
- node: rules/integration/a-connector-configuration-draft-response-carries-no-capability
  how: Honored rather than encoded -- the response schema declares no field naming, versioning or counting
    a capability; nothing in this task's own file changes the generation path that already keeps that
    out.
inferences:
- inferred: The response schema's string fields carry no .min(1) (or other length) constraint, unlike
    the sibling request schema in the same file.
  from: No specification node states a non-emptiness constraint for any of these fields; existing sibling
    response schemas that use .min(1) do so for fields this task does not touch.
- inferred: The response schema and its inferred type are declared in the DTO file only, and are not wired
    into Fastify's route configuration or used as the controller's declared return-type annotation.
  from: Every existing routes.ts file in src/http declares no `schema` option on app.get/app.post; the
    codebase's convention is a zod object exported from the DTO file for documentation and test comparison,
    never a value Fastify validates at runtime.
preserved:
- The controller's existing pass-through of the whole generated draft object, unchanged.
- The route's existing request validation (draftConnectorConfigurationFromOpenApiRequestSchema, unchanged)
  and its 400/422 refusal paths.
- generateConnectorConfigurationDraft's unconditional emission of status_readings, response_fields and
  reading_notes regardless of how many capabilities are registered, and its conditional emission of method_mismatch
  and of the member fields -- none of this generation logic was touched.
deferred:
- what: a-connector-configuration-draft-response-carries-no-capability's clause on an unresolved item's
    no-capability-registered reason is not reached by any criterion of this task.
  why: Per the task's own REMAINDER note, that clause belongs to the task generating subject placeholders
    and unresolved items, already delivered under an earlier task in this epic; this task governs only
    the route/controller/DTO shape.
---

## What it is
The published surface of the grown draft, over the route, the controller and the DTO the inventory names as its consumers.

## Notes
Build round 1 was green, but this task's proof (test-author) read the three governing domain nodes directly
and found round 1's schema over-required every member field of status_readings/response_fields/reading_notes,
contradicting each node's own declared presence terms (declared_as/declared_type/declared_required/envelope/detail
are each optional per their nodes, not required). Corrected in round 2 to match each node exactly; round 2 build
green, and the proof's own tests (written to the nodes) now pass against the corrected schema.
