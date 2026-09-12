---
title: Answer the draft with its disclosure material
summary: The HTTP route, controller and DTO carrying the draft's three new collections and nothing besides
  its declared attributes.
rationale: Cut from the type task because it is the type's consumer across the HTTP seam, and from the
  generation tasks because the answer's shape is falsifiable without any particular map having been drafted.
sources:
- intake/scope.md
objective: The draft-connector-configuration-from-openapi answer holds one field per attribute the draft
  type declares, the three new collections among them, and no other field.
criteria:
- The route's response schema declares a property for status_readings, response_fields and reading_notes.
- The route's response schema declares one property per attribute of the draft type and no property the
  type does not declare.
- The response schema declares each collection's member fields on the presence terms the draft type declares
  for them.
- The answer names, versions and counts no capability registered against the connector.
- The answer's set of fields is the same whether no capability, one or several are registered against
  the connector.
- The controller passes the generated draft's status readings, response fields and reading notes through
  unchanged.
- The DTO's declared response type carries no field the draft type does not declare.
depends_on:
- task/connector-configuration-draft-maps/draft-disclosure-type
implements:
- domain/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft-status-reading
- domain/integration/connector-configuration-draft-response-field
- domain/integration/connector-configuration-draft-reading-note
- domain/integration/connector-configuration-draft-reading-note-kind
- rules/integration/a-connector-configuration-draft-response-carries-no-capability
---


## What it is
The published surface of the grown draft, over the route, the controller and the DTO the inventory names as its consumers.

## Notes
The frontend hook that reads this answer is the other target's and is not touched here.
UNDERDETERMINED, from the specification — The criterion "the presence terms the draft type declares for them" attributes member-field presence terms to the wrong node — domain/integration/connector-configuration-draft declares presence only for the three collections themselves, not for status_readings/response_fields/reading_note's own member fields, which domain/integration/connector-configuration-draft-status-reading, -response-field and -reading-note each declare. A schema declaring every member field required (declared_as, declared_type, declared_required, envelope, detail among them) satisfies the criterion as written.
UNDERDETERMINED, from the specification — No criterion holds the draft's own top-level attribute presence terms (e.g. method_mismatch optional, the rest required) to what domain/integration/connector-configuration-draft declares — a schema declaring method_mismatch required satisfies every criterion as written.
UNDERDETERMINED, from the specification — No criterion holds reading_notes' kind property to the closed nine-value enumeration domain/integration/connector-configuration-draft-reading-note-kind declares — a schema declaring kind as a free-form string satisfies every criterion as written.
ADVISORY, from the specification — domain/integration/connector-configuration-draft-status-reading declares its ending attribute typed by domain/investigation/evidence-result, which sits outside this task's own candidate list; the caller may want the epic's covers grown to name it explicitly for this task.
Decision, beyond the covers — stand: domain/integration/connector-configuration-draft-status-reading already declares ending typed by domain/investigation/evidence-result, an unrelated, unchanged element this epic does not touch; growing the claim to cover it would be scope creep for a reference this task only reads, never redefines.
REMAINDER, from the specification — a-connector-configuration-draft-response-carries-no-capability's clause on an unresolved item's no-capability-registered reason reaches no criterion of this task; belongs to the task generating subject placeholders and unresolved items.
REMAINDER, from the specification — a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses, a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas, a-success-response-schemas-single-object-property-is-read-through-as-its-envelope and a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits each reach no criterion of this task, which governs the route/controller/DTO shape only, not how the maps or notes are generated.
REMAINDER, from the specification — an-observation-carries-only-the-output-schema-fields-its-response-map-reaches governs runtime observation and reaches no criterion of this task.
REMAINDER, from the specification — a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs reaches no criterion of this task.
