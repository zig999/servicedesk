---
target: backend
title: Grow ConnectorConfigurationDraft with its disclosure material, and repair its call sites
summary: ConnectorConfigurationDraft now declares status_readings, response_fields and reading_notes with
  their value shapes and closed note-kind vocabulary, and every existing site constructing a draft (or
  asserting its shape) supplies or admits the three new required fields.
task: sha256:fff178ee6b26fc285d760081d83fd0fc518182bd6133d483936e2307b055e0b4
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-draft-disclosure-type-build-3
files:
- path: src/connector-registry/connector-configuration-draft.ts
  effect: Declares ConnectorConfigurationDraftStatusReading (status, ending required -- ending typed by
    the private inline literal union ConnectorConfigurationDraftStatusReadingEnding = 'ok'|'unavailable'|'denied'|'timeout'
    -- and optional declared_as), ConnectorConfigurationDraftResponseField (name, path, status required;
    declared_type, declared_required, envelope optional), the closed CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS
    vocabulary (exactly the nine named kinds) and its ConnectorConfigurationDraftReadingNoteKind type,
    and ConnectorConfigurationDraftReadingNote (kind, subject required; detail optional). Adds status_readings,
    response_fields and reading_notes as required (possibly-empty) readonly array fields on ConnectorConfigurationDraft.
    Carries no import statement, per the module's own purity self-test -- the ending type is copied verbatim
    from evidence-result.ts's own closed set rather than imported.
- path: src/connector-registry/connector-configuration-draft-generation.ts
  effect: 'Minimal placeholder fix: the return statement in generateConnectorConfigurationDraft now also
    supplies status_readings: [], response_fields: [] and reading_notes: [], so its return value satisfies
    the widened ConnectorConfigurationDraft type. No reading or drafting logic added; the operation is
    still read only for configuration, unresolved items, generated credentials and method mismatch, exactly
    as REMAINDER''d to the sibling tasks.'
- path: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  effect: The two ConnectorConfigurationDraft object-literal fixtures and the expectTypeOf exact-shape
    check now also supply/name status_readings, response_fields and reading_notes. The 'exports no runtime
    guard function' test's expected Object.keys array now also includes CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS.
    No test assertion's intent changed -- each still asserts an exact, total shape, now correctly counting
    the module's actual exports/fields.
- path: src/__tests__/unit/http/draft-connector-configuration-from-openapi.routes.spec.ts
  effect: Widened three pre-existing assertions (the no-parameters/no-security 200 body, the method_mismatch
    200 body, and the exact-key-set check) to also expect/include status_readings, response_fields and
    reading_notes as empty arrays -- the three keys the drafted configuration's response now always, legitimately
    carries. No other assertion in the file was touched, and no drafting logic was added.
criteria:
- criterion: ConnectorConfigurationDraft declares status_readings, response_fields and reading_notes,
    each a required list that may be empty.
  met: true
  how: The three fields are declared as required (non-optional) readonly ...[] arrays on ConnectorConfigurationDraft,
    and every existing construction site supplies them as [].
- criterion: A status reading declares status and ending as required and declared_as as optional.
  met: true
  how: ConnectorConfigurationDraftStatusReading declares status and ending as required readonly fields
    and declared_as as an optional readonly field.
- criterion: A status reading's ending is typed by the four endings ok, unavailable, denied and timeout.
  met: true
  how: ending is typed as the inline literal union 'ok'|'unavailable'|'denied'|'timeout', the identical
    closed set evidence-result.ts declares, reproduced without importing that module so the file's zero-import
    self-test still passes.
- criterion: A response field declares name, path and status as required and declared_type, declared_required
    and envelope as optional.
  met: true
  how: ConnectorConfigurationDraftResponseField declares name, path and status as required readonly fields
    and declared_type, declared_required and envelope as optional readonly fields.
- criterion: A reading note declares kind and subject as required and detail as optional.
  met: true
  how: ConnectorConfigurationDraftReadingNote declares kind and subject as required readonly fields and
    detail as an optional readonly field.
- criterion: A reading note's kind is typed by a closed union holding exactly the nine kinds default-response-not-drafted,
    status-range-not-drafted, non-json-success-content-not-read, envelope-read-through, variants-united,
    repeated-field-name-path-not-taken, no-responses-declared, no-success-response-schema and success-schema-declares-no-properties.
  met: true
  how: CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS lists exactly those nine string literals as a
    const tuple, and ConnectorConfigurationDraftReadingNoteKind is its indexed-access union.
- criterion: The draft type gains no attribute beyond those three collections.
  met: true
  how: ConnectorConfigurationDraft's field list is unchanged apart from status_readings, response_fields
    and reading_notes.
nodes:
- node: domain/integration/connector-configuration-draft
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  how: The type gains exactly the three collections the node's growth requires and no other attribute;
    every existing construction and assertion site was updated to admit them.
- node: domain/integration/connector-configuration-draft-status-reading
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  how: ConnectorConfigurationDraftStatusReading declares status and ending required, declared_as optional,
    with ending typed by the same four-value closed set domain/investigation/evidence-result declares,
    reproduced inline so this module needs no import to reach it.
- node: domain/integration/connector-configuration-draft-response-field
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  how: ConnectorConfigurationDraftResponseField declares name, path and status required and declared_type,
    declared_required and envelope optional, matching the node's attribute list exactly.
- node: domain/integration/connector-configuration-draft-reading-note
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  how: ConnectorConfigurationDraftReadingNote declares kind and subject required and detail optional,
    with kind typed by the reading-note-kind vocabulary.
- node: domain/integration/connector-configuration-draft-reading-note-kind
  encoded_at:
  - src/connector-registry/connector-configuration-draft.ts
  how: CONNECTOR_CONFIGURATION_DRAFT_READING_NOTE_KINDS enumerates exactly the nine kinds the node lists,
    and ConnectorConfigurationDraftReadingNoteKind is derived from that array as the closed union type.
inferences:
- inferred: The status reading's ending field is typed by the inline literal union 'ok'|'unavailable'|'denied'|'timeout'
    rather than by importing EvidenceResult, with the four values copied verbatim.
  from: domain/investigation/evidence-result's declared closed set together with this module's own architectural
    requirement that it carry no import statement at all.
- inferred: The pre-existing routes spec's three response-shape assertions now expect status_readings,
    response_fields and reading_notes as empty arrays alongside their previously-asserted keys, with no
    other assertion in that file touched.
  from: generateConnectorConfigurationDraft's return object always emitting these three keys as empty
    arrays; admitting them is mechanical and adds no drafting logic.
divergences:
- cites: MNT-03
  file: src/connector-registry/connector-configuration-draft.ts
  departure: The ending field's four-string literal union duplicates, as a type only, the same four literals
    EVIDENCE_RESULTS declares in evidence-result.ts, instead of reusing that array or its derived EvidenceResult
    type through an import.
  why: The module's own purity self-test refuses any import in this file, including a type-only one; MNT-03
    targets duplicated logic, and no runtime logic is duplicated here -- only a closed set of literal
    type values that TypeScript's structural typing still lets any real EvidenceResult value satisfy with
    no cast.
preserved:
- generateConnectorConfigurationDraft's placeholder resolution, credential generation, method-mismatch
  reconciliation and configuration-text drafting behavior -- untouched by this round's edits.
- The module's zero-import and runtime-export-only self-tests, now passing against both closed vocabularies
  the module exports.
- Every other assertion in draft-connector-configuration-from-openapi.routes.spec.ts (validation errors,
  method mismatch, generated credentials, unresolved items, and every OpenAPI document/operation error
  case), left exactly as it was.
deferred:
- what: The real population of status_readings, response_fields and reading_notes in generateConnectorConfigurationDraft
    -- reading the operation's declared responses into a status map, a response-field map and reading
    notes.
  why: REMAINDER'd by this task's own notes to the sibling tasks drafted-status-map, drafted-response-map
    and draft-reading-notes, none of which has been delivered yet; adding that logic here would widen
    this declaration-only task.
---

## What it is
Grows ConnectorConfigurationDraft with status_readings, response_fields and reading_notes, their three value-object shapes and the closed nine-kind reading-note vocabulary, keeping the module import-free; repairs every existing construction and assertion site (the generator's placeholder return, two spec fixtures, and three pre-existing HTTP route body assertions) to admit the three new always-present, still-empty fields.

## Notes
Three build rounds: round 1 (typecheck red -- existing call sites missing the three new required fields), round 2 (test-unit red -- the module's own zero-import/runtime-export self-tests, plus a pre-existing route spec's exact-key-set assertions), round 3 green.
The ending type is a private inline literal union rather than an import of EvidenceResult, to keep this module at zero imports -- disclosed as a divergence from MNT-03 (no runtime logic duplicated, only literal type values).
The real drafting logic for all three collections stays empty-array placeholders here, populated for real by drafted-status-map, drafted-response-map and draft-reading-notes.
