---
title: Note every reading condition the operation exhibits
summary: The draft's reading notes, one per condition of the closed vocabulary the chosen operation's
  responses exhibit.
rationale: Cut as one task because the completeness of the vocabulary and the absence of a note for an
  unexhibited condition are one falsifiable outcome, which spreading the notes across the readings that
  detect them would leave untestable anywhere.
sources:
- intake/scope.md
objective: A generated draft carries one reading note for every condition of the note-kind vocabulary
  the chosen operation's responses exhibit, at the thing it was met at, and none for a condition they
  do not exhibit.
criteria:
- A responses object declaring a default key yields one note of kind default-response-not-drafted whose
  subject is that key.
- A responses object declaring a range key yields one note of kind status-range-not-drafted per such key,
  whose subject is that key.
- A success response whose content declares no application/json media type yields one note of kind non-json-success-content-not-read
  naming that response.
- A success schema read through a single object envelope yields one note of kind envelope-read-through
  whose subject is the envelope property's name.
- A success schema whose oneOf or anyOf variants were united yields one note of kind variants-united naming
  that response.
- A field name read under differing paths from more than one success schema yields one note of kind repeated-field-name-path-not-taken
  whose subject is that field name and whose detail carries the path not drafted.
- An operation declaring no responses object yields one note of kind no-responses-declared.
- An operation whose responses declare no application/json success schema yields one note of kind no-success-response-schema.
- A success schema declaring no properties object at the level it is read at yields one note of kind success-schema-declares-no-properties.
- An operation exhibiting none of these conditions carries an empty reading-notes list.
- No note is carried for a condition the operation does not exhibit.
depends_on:
- task/connector-configuration-draft-maps/openapi-responses-reading
- task/connector-configuration-draft-maps/success-response-schema-fields
- task/connector-configuration-draft-maps/success-response-envelope-read-through
- task/connector-configuration-draft-maps/drafted-response-map
- task/connector-configuration-draft-maps/draft-disclosure-type
implements:
- domain/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft-reading-note
- domain/integration/connector-configuration-draft-reading-note-kind
- rules/integration/a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits
- rules/integration/a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses
- rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
- rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
---


## What it is
What keeps a map shorter than the document from being read as a document shorter than it is.

## Notes
The path not taken for a repeated field name is decided while the responseMap is drafted, which is why this builds on that task.
UNDERDETERMINED, from the specification — Criteria 3 and 5 say only "naming that response" for non-json-success-content-not-read and variants-united, while the rule now fixes the subject of those two kinds (and success-schema-declares-no-properties) as the response's own key, exactly as the responses object declares it, and the reading-note element states no note's subject is ever a media type. A note carrying the response's description, or its media type, as subject satisfies the criteria as written. Recommended wording: "...yields one note of kind ... whose subject is that response's key, exactly as the responses object declares it."
UNDERDETERMINED, from the specification — Criterion 9 (success-schema-declares-no-properties) names no subject at all, though the rule now fixes it as the response's own key. Recommended wording: "...yields one note of kind success-schema-declares-no-properties whose subject is that response's key, exactly as the responses object declares it."
UNDERDETERMINED, from the specification — Criteria 7 and 8 (no-responses-declared, no-success-response-schema) name no subject, though domain/integration/connector-configuration-draft-reading-note now fixes the subject of a whole-operation-level condition as that operation's method upper-cased followed by its path. A note carrying the connector name, the operationId, or a lower-cased method satisfies the criteria as written. Recommended wording: "...yields one note of kind ... whose subject is that operation, its method upper-cased followed by the path the document declares it under."
UNDERDETERMINED, from the specification — Criterion 6 says the note's detail "carries the path not drafted" (singular), while the rule now requires the detail to name every path not drafted, each beside its success status, in ascending order, where three or more differing paths were read. A note carrying only one of several passed-over paths satisfies the criterion as written. Recommended wording: "...whose detail names every path not drafted for it, each beside the success status it was read from, in ascending order of that status."
UNDERDETERMINED, from the specification — No criterion holds the draft to emitting exactly one note where a condition recurs at the same subject across two success response schemas (e.g., two schemas read through an envelope property of the same name) — the rule's own one-note-per-kind-and-subject-pairing cardinality is untested. A draft emitting one note per occurrence, rather than one per pairing, satisfies every criterion as written. Add a criterion asserting the single-note pairing.
REMAINDER, from the specification — a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses and a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas and a-success-response-schemas-single-object-property-is-read-through-as-its-envelope are candidates whose map-assembly and envelope-reading clauses reach no criterion of this task, which only names the reading conditions those readings exhibit.
REMAINDER, from the specification — an-observation-carries-only-the-output-schema-fields-its-response-map-reaches and a-connector-configuration-draft-response-carries-no-capability reach no criterion of this task.
