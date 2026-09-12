---
target: backend
title: Response schema for the draft answer -- proof
summary: One new schema-level spec file decides the response schema's exact attribute set, each collection's
  member-field presence terms exactly as the three governing domain nodes declare them, and the reading-note-kind
  enum's closure; two pre-existing route tests decide the runtime facts about capability disclosure and
  controller pass-through.
implementation: sha256:7558331469ca1a3d4dead265742482b610c1e59e0847bcd7379f3fdfc479680a
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-draft-answer-shape-suite
tests:
- file: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
  name: declares exactly the eight attributes ConnectorConfigurationDraft declares, method_mismatch optional
    and every other attribute required
  proves: The route's response schema declares a property for status_readings, response_fields and reading_notes.
    The route's response schema declares one property per attribute of the draft type and no property
    the type does not declare.
  fails_when: the schema's top-level shape gains or drops one of the eight attribute names, or method_mismatch
    stops being the only one whose omission still validates.
  demonstrates: domain/integration/connector-configuration-draft
- file: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
  name: declares exactly status, ending and declared_as as status_readings' own attributes, status and
    ending required and declared_as optional
  proves: domain/integration/connector-configuration-draft-status-reading's own presence terms (status
    and ending required, declared_as optional).
  fails_when: status or ending stop being required, or an object omitting declared_as is refused.
  demonstrates: domain/integration/connector-configuration-draft-status-reading
- file: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
  name: declares exactly name, path, status, declared_type, declared_required and envelope as response_fields'
    own attributes, name/path/status required and the rest optional
  proves: domain/integration/connector-configuration-draft-response-field's own presence terms (name/path/status
    required, declared_type/declared_required/envelope optional).
  fails_when: name, path or status stop being required, or an object omitting declared_type, declared_required
    or envelope is refused.
  demonstrates: domain/integration/connector-configuration-draft-response-field
- file: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
  name: declares exactly kind, subject and detail as reading_notes' own attributes, kind and subject required
    and detail optional
  proves: domain/integration/connector-configuration-draft-reading-note's own presence terms (kind and
    subject required, detail optional).
  fails_when: kind or subject stop being required, or an object omitting detail is refused.
  demonstrates: domain/integration/connector-configuration-draft-reading-note
- file: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
  name: parses reading_notes.kind as valid only when it is one of the declared nine values
  proves: domain/integration/connector-configuration-draft-reading-note-kind's closed nine-value set.
  fails_when: kind accepts a string outside the nine declared values, or rejects one of the nine.
  demonstrates: domain/integration/connector-configuration-draft-reading-note-kind
- file: src/__tests__/unit/http/dto/draft-connector-configuration-from-openapi.dto.spec.ts
  name: declares exactly ConnectorConfigurationDraft's own eight attribute names as DraftConnectorConfigurationFromOpenApiResponseDto's
    keys, no field the draft type does not declare
  proves: The DTO's declared response type carries no field the draft type does not declare.
  fails_when: DraftConnectorConfigurationFromOpenApiResponseDto's key union gains a field ConnectorConfigurationDraft
    does not declare, or loses one of the eight it does.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: answers 200 with exactly connector, configuration, unresolved and generated_credentials -- and
    no method_mismatch key at all -- for an operation with no parameters, no security scheme and no configuration
    currently registered for the connector
  proves: The answer's set of fields is the same whether no capability, one or several are registered
    against the connector (the zero-capability baseline). The controller passes the generated draft's
    status readings, response fields and reading notes through unchanged.
  fails_when: the route's response stops matching exactly what generateConnectorConfigurationDraft computes
    for this fixture.
- file: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  name: carries no capability name, version or count anywhere in the response, even though two capabilities
    are registered against the drafted connector
  proves: The answer names, versions and counts no capability registered against the connector. The answer's
    set of fields is the same whether no capability, one or several are registered against the connector
    (the several-capability half).
  fails_when: a capability name, version or count field appears anywhere in the response, or the key set
    differs from the zero-capability case.
not_applicable:
- edge_case: supplying a non-array value for one of the five array-typed attributes
  why: no criterion or implemented node states behavior for a type mismatch on a 'many' attribute beyond
    its cardinality being an array; testing z.array's own rejection would test the library rather than
    an obligation of this task.
- edge_case: two requests against the route at once
  why: nothing in this task's criteria or implemented nodes states concurrent behavior; the schema and
    pass-through are both stateless per request.
- edge_case: a duplicate entry within one collection
  why: no criterion or node this task implements constrains uniqueness within status_readings, response_fields
    or reading_notes.
- edge_case: a slow, failing or malformed OpenAPI document fetch, and an invalid or absent request body
  why: governed by draftConnectorConfigurationFromOpenApiRequestSchema and the document-fetch error paths,
    delivered and tested by an earlier task and unchanged here.
untested:
- rules/integration/a-connector-configuration-draft-response-carries-no-capability's invariant is universal
  over every OpenAPI document and every capability count; the existing route tests decide it only for
  the fixed documents and the two capability counts they exercise, not for the whole domain of possible
  drafts, so the fact is honored rather than encoded and not claimed as demonstrated by any test above.
- The implementation's own recorded inference that the response schema's string fields carry no .min(1)
  constraint is an inference about behavior no specification node states; no test pins whether an empty
  string validates for any of these fields.
---

## What it is
Proof of the response schema's exact attribute set and each collection's presence terms.

## Notes
The test-author's original draft flagged a contested finding -- the implementation's first round over-required every member field of status_readings/response_fields/reading_notes, against what the three governing domain nodes actually declare. The implementation was corrected before this proof was finalized, so every test above proves the corrected schema and no contested entry remains.
