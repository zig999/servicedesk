---
title: Draft the responseMap and disclose each field
summary: The generator's always-present responseMap keyed by each success response field's own name, with
  the response fields that disclose what the document declares about each.
rationale: Cut apart from the statusMap because the two maps derive from different parts of the responses
  object and would change for different reasons; the entry and its disclosure stay together for the same
  reason they do on the status side.
sources:
- intake/scope.md
objective: The drafted configuration text holds a responseMap whose entries are exactly the fields read
  from the chosen operation's success response schemas, each keyed by the field's own name and valued
  by its path, and the draft carries one response field per entry.
criteria:
- The drafted configuration object holds a responseMap key for every operation, including one from which
  no success field is read, where it holds an empty object.
- Each field read from a success response schema is drafted as one entry keyed by that field's own name.
- Each drafted entry holds the path the reading gave that field as its value.
- A field name read under differing paths from more than one success response schema is drafted with the
  path read from the lowest success status.
- A field name read under the same path from more than one success response schema is drafted as one entry.
- No drafted key is renamed to any name a capability's output schema declares.
- The draft carries exactly one response field per drafted responseMap entry, holding that entry's name
  and path and the success status it was read from.
- A response field carries the declared type and the declared required listing where the schema declares
  them, and carries neither where it does not.
- A response field carries the envelope name where the field was read through one, and carries none where
  it was not.
depends_on:
- task/connector-configuration-draft-maps/success-response-schema-fields
- task/connector-configuration-draft-maps/success-response-envelope-read-through
- task/connector-configuration-draft-maps/draft-disclosure-type
implements:
- domain/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft-response-field
- rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
- rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
- rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
---


## What it is
The responseMap half of what draftedConfigurationText emits, with its disclosure.

## Notes
The draft is deliberately wider than any configuration an operator would keep; curation is the operator's own act after applying.
UNDERDETERMINED, from the specification — No criterion requires the disclosed status to be the lowest success status where the same field name is read at the same path from more than one success response schema (the paths-agree case, as opposed to the differing-paths case criterion 4 already covers) — the specification (now decided) requires the lowest status, and the same lowest-status schema's declared type and required listing, in that case too.
UNDERDETERMINED, from the specification — No criterion addresses the success-response-schema definition itself — application/json only, $refs read through, allOf merged, oneOf/anyOf united. A reader taking a different media type, or only the first oneOf variant, satisfies every criterion as written.
REMAINDER, from the specification — a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses reaches no criterion of this task, which drafts the responseMap only.
REMAINDER, from the specification — a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits — the notes this task's own reading produces conditions for (envelope-read-through, variants-united, repeated-field-name-path-not-taken, non-json-success-content-not-read, no-success-response-schema, success-schema-declares-no-properties) — reaches no criterion of this task; belongs to the task naming the draft's reading_notes.
REMAINDER, from the specification — an-observation-carries-only-the-output-schema-fields-its-response-map-reaches governs runtime observation and reaches no criterion of this drafting task.
REMAINDER, from the specification — a-connector-configuration-draft-response-carries-no-capability governs the answer's shape and reaches no criterion of this task.
REMAINDER, from the specification — a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs is implemented here only for its response-$ref clause; its parameter clauses belong to the task drafting the call's address, query, headers and body.
