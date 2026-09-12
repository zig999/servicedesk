---
target: backend
title: Draft disclosure type shapes proven at compile time
summary: Adds compile-time type assertions for the three new value-object shapes and the closed nine-kind
  reading-note vocabulary that the existing, mechanically widened tests do not already establish.
implementation: sha256:d3cc75ffba079e63bfdfe6f5f242ce2aba09ac388e78948207cbe4d020591236
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/connector-configuration-draft-maps-draft-disclosure-type-suite
tests:
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: declares no capability field on the draft, so a generator resolves any number of capability references
    -- including none -- without the type ever exposing the count
  proves: ConnectorConfigurationDraft declares status_readings, response_fields and reading_notes as required,
    possibly-empty lists, and gains no attribute beyond the three collections (criteria 1 and 7).
  fails_when: Any field on ConnectorConfigurationDraft -- including any of the three new collections --
    is removed, renamed, retyped, has its required/optional-ness changed, or an attribute beyond the declared
    set is added.
  demonstrates: domain/integration/connector-configuration-draft
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: declares a status reading as exactly a status, an ending typed by the same evidence-result the
    draft mapped it to, and an optional declared_as
  proves: A status reading declares status and ending as required and declared_as as optional, and its
    ending is typed by the four endings ok, unavailable, denied and timeout (criteria 2 and 3).
  fails_when: status stops being a required string, ending stops being required or stops being exactly
    the four-value closed set, or declared_as stops being an optional string.
  demonstrates: domain/integration/connector-configuration-draft-status-reading
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: declares a response field as exactly a name, a path and a status, with declared_type, declared_required
    and envelope optional
  proves: A response field declares name, path and status as required and declared_type, declared_required
    and envelope as optional (criterion 4).
  fails_when: name, path or status stops being a required string, declared_type or envelope stop being
    optional strings, declared_required stops being an optional boolean, or an extra or missing field
    appears.
  demonstrates: domain/integration/connector-configuration-draft-response-field
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: declares a reading note as exactly a kind typed by the reading-note-kind vocabulary and a subject,
    with detail optional
  proves: A reading note declares kind and subject as required and detail as optional (criterion 5).
  fails_when: kind stops being required or stops being typed by ConnectorConfigurationDraftReadingNoteKind,
    subject stops being a required string, or detail stops being an optional string.
  demonstrates: domain/integration/connector-configuration-draft-reading-note
- file: src/__tests__/unit/connector-registry/connector-configuration-draft.spec.ts
  name: types a reading note's kind by exactly the nine kinds the specification enumerates, and no other
    value
  proves: A reading note's kind is typed by a closed union holding exactly the nine named kinds (criterion
    6).
  fails_when: ConnectorConfigurationDraftReadingNoteKind admits a value outside the nine named kinds,
    drops one of them, or widens to a bare string.
  demonstrates: domain/integration/connector-configuration-draft-reading-note-kind
not_applicable:
- edge_case: Duplicate reading-note kinds or repeated entries within one draft's reading_notes list
  why: No criterion or node this task implements states a uniqueness constraint over reading_notes; the
    one-note-per-pairing rule is REMAINDER'd to a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits,
    which this declaration-only task does not implement.
- edge_case: A runtime value assigned to status_readings, response_fields, reading_notes or any of their
    fields that a caller supplies outside TypeScript's own compile-time check
  why: This module exports no runtime guard function for any of its vocabularies or shapes, and no criterion
    of this declaration-only task asks for one; the constraint these criteria state is a compile-time
    type, not a runtime validation.
- edge_case: A numeric or length boundary on any of the new fields
  why: Every field the five nodes and seven criteria declare is a string, a boolean or a closed string-literal
    union; none states a numeric range or a length boundary.
- edge_case: A dependency that is slow, unavailable or answers in an unexpected shape
  why: These are pure value-object type declarations with no I/O and no dependency; the module itself
    carries no import statement, so no dependency exists to fail or degrade.
---

## What it is
Four new compile-time type assertions (plus reuse of the pre-existing, mechanically widened draft-shape test) proving all seven criteria of the draft's grown disclosure material against its five specification nodes.

## Notes
None.
