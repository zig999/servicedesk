---
title: Grow the draft type with its disclosure material
summary: The ConnectorConfigurationDraft type's three new collections and the closed reading-note kind
  vocabulary they need.
rationale: Cut as its own task because it is the interface the drafting tasks produce into and the HTTP
  answer consumes, and a task changing an interface with its consumers is two tasks.
sources:
- intake/scope.md
objective: The connector-configuration-draft type declares status_readings, response_fields and reading_notes
  together with the value shapes and the note-kind vocabulary they hold.
criteria:
- ConnectorConfigurationDraft declares status_readings, response_fields and reading_notes, each a required
  list that may be empty.
- A status reading declares status and ending as required and declared_as as optional.
- A status reading's ending is typed by the four endings ok, unavailable, denied and timeout.
- A response field declares name, path and status as required and declared_type, declared_required and
  envelope as optional.
- A reading note declares kind and subject as required and detail as optional.
- A reading note's kind is typed by a closed union holding exactly the nine kinds default-response-not-drafted,
  status-range-not-drafted, non-json-success-content-not-read, envelope-read-through, variants-united,
  repeated-field-name-path-not-taken, no-responses-declared, no-success-response-schema and success-schema-declares-no-properties.
- The draft type gains no attribute beyond those three collections.
implements:
- domain/integration/connector-configuration-draft
- domain/integration/connector-configuration-draft-status-reading
- domain/integration/connector-configuration-draft-response-field
- domain/integration/connector-configuration-draft-reading-note
- domain/integration/connector-configuration-draft-reading-note-kind
---


## What it is
The shape the generator fills and the route answers with.

## Notes
The inventory records that neither this vocabulary nor the note shapes is modeled in the module today.
ADVISORY, from the specification — The criterion typing a status reading's ending by the four endings (ok, unavailable, denied, timeout) should be implemented by reusing the existing domain/investigation/evidence-result element (which declares exactly those four values and is what domain/integration/connector-configuration-draft-status-reading types its ending attribute as), not by minting a fresh enumeration — evidence-result sits outside this task's own candidate list, so the caller may want the epic's covers grown to name it explicitly.
Decision, beyond the covers — stand: domain/integration/connector-configuration-draft-status-reading already declares ending typed by domain/investigation/evidence-result, an unrelated, unchanged element this epic does not touch; growing the claim to cover it would be scope creep for a reference this task only reads, never redefines.
REMAINDER, from the specification — a-connector-configuration-draft-states-a-status-map-from-the-operations-declared-responses — the numeric-status-key bound, the ok/denied/unavailable endings, the empty-statusMap default — reaches no criterion of this declaration-only task.
REMAINDER, from the specification — a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas — the success-response-schema definition, the lowest-status/lowest-schema disclosure rule, the empty-responseMap default — reaches no criterion of this task.
REMAINDER, from the specification — a-success-response-schemas-single-object-property-is-read-through-as-its-envelope — the envelope descent itself — reaches no criterion of this task, which only declares the envelope attribute's existence.
REMAINDER, from the specification — a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits — the one-note-per-pairing rule, the response-key subject rule, the repeated-path detail rule — reaches no criterion of this task, which only declares the note shape and kind vocabulary.
REMAINDER, from the specification — a-connector-configuration-drafts-parameters-are-read-through-its-path-item-and-its-refs reaches no criterion of this task.
REMAINDER, from the specification — an-observation-carries-only-the-output-schema-fields-its-response-map-reaches governs runtime observation, not this declaration task.
REMAINDER, from the specification — a-connector-configuration-draft-response-carries-no-capability is the seam this task opens (declaring three new attributes widens the answer it constrains) but reaches no criterion of this task directly; belongs to the task shaping the draft-connector-configuration-from-openapi answer.
