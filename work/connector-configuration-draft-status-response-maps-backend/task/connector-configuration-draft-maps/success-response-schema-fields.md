---
title: Read the fields a success response schema declares
summary: The reader's extraction of the top-level fields of each success response's application/json schema,
  with the type and required listing the schema declares for each.
rationale: Cut apart from the responses reading because it answers a different question of the document
  — what a success body carries, not which statuses exist — and it is demonstrable on its own against
  one schema.
sources:
- intake/scope.md
objective: The reader exposes, for each success status the operation declares, the top-level fields of
  that response's application/json schema, each with its path, the type the schema declares for it and
  whether the schema lists it as required.
criteria:
- A success response whose application/json schema declares three top-level properties yields those three
  field names, each at the path that is its own name.
- Each yielded field carries the type its own schema declares, and carries none where the schema declares
  none.
- Each yielded field carries whether the schema's required list names it.
- Each yielded field carries the success status it was read from.
- A success response whose content declares media types but no application/json yields no field.
- A success response declaring no content yields no field.
- A success response schema reached through a $ref is read through the module's existing resolveRef rather
  than through a second resolver.
- A success response schema whose root declares allOf yields the properties of every part merged into
  one set of fields.
- A success response schema whose root declares oneOf or anyOf yields the properties of every variant
  united into one set of fields.
- A success response schema declaring no properties object yields no field.
- A response keyed by a status outside 200 through 299 contributes no field.
depends_on:
- task/connector-configuration-draft-maps/openapi-responses-reading
implements:
- domain/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft-response-field
- rules/integration/a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas
- rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
- rules/integration/a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs
---


## What it is
The reading that turns one success response's JSON schema into the field material the responseMap is drafted from.

## Notes
The inventory names requestBodyFieldNamesOf as the existing application/json-only, resolveRef-then-properties pattern this reading follows.
UNDERDETERMINED, from the specification — No criterion presents a success response schema whose top-level properties object holds exactly one property that is itself an object declaring a properties object — the envelope case. As written, a reader that always takes the schema's own top-level properties (never descending through a single-property envelope) satisfies every criterion here; the envelope descent is the sibling task's (success-response-envelope-read-through), and this task's objective wording ("the top-level fields of that response's application/json schema") should be read as bounded by that sibling, not as this task's own claim to the envelope case.
UNDERDETERMINED, from the specification — The criterion "Each yielded field carries whether the schema's required list names it" is satisfied by carrying false for a field of a schema declaring no required list at all. domain/integration/connector-configuration-draft-response-field declares declared_required as optional and carried only "where the schema declares them" — a schema with no required list should leave declared_required absent, not false.
REMAINDER, from the specification — The whole responseMap-assembly half of a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas — one entry per field name, the lowest-status path for a repeated name, the empty responseMap default — reaches no criterion of this task, which only yields fields per schema.
REMAINDER, from the specification — The lowest-status selection across differing paths, and the disclosed response field's own carried status (and, per the decided fact, its declared type and required listing) where the same path is read at the same status from more than one success schema, belong to the task drafting the responseMap and reconciling field names across responses.
REMAINDER, from the specification — a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs is implemented here only for its $ref-through-a-response-declaring-a-schema clause; its parameter-merge and its parameter/request-body/security-scheme $ref clauses belong to the tasks drafting those parts.
REMAINDER, from the specification — a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits requires a note for non-json-success-content-not-read, variants-united and success-schema-declares-no-properties, each subjected at the response's own key — conditions this task's reading produces but names no note for. Belongs to the task naming the draft's reading_notes.
REMAINDER, from the specification — a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses is a candidate but no clause of it reaches a criterion of this task, which reads only which statuses are success statuses (200 through 299).
REMAINDER, from the specification — an-observation-carries-only-the-output-schema-fields-its-response-map-reaches governs what an observation carries at call time and reaches no criterion of this drafting task.
REMAINDER, from the specification — a-connector-configuration-draft-response-carries-no-capability governs the shape of the draft-connector-configuration-from-openapi answer and reaches no criterion of this task.
