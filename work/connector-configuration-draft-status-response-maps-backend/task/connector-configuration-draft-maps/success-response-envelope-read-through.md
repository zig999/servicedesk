---
title: Read through a success schema's single object envelope
summary: The one-level descent that reads the fields inside a success schema's single object property
  and prefixes their paths with that property's name.
rationale: Cut from the plain field reading because it is its own decision about how deep a schema is
  read, falsifiable on its own against a single-property schema, and it changes the paths the earlier
  reading produced.
sources:
- intake/scope.md
objective: A success response schema whose top-level properties object holds exactly one property that
  is an object explicitly declaring a properties keyword, whether empty or not, is read one level down,
  yielding that inner object's properties at the outer property's name, a dot and each field's own name.
criteria:
- A success schema whose single top-level property is an object explicitly declaring a properties keyword,
  whether empty or not, yields that inner object's properties and not the outer property itself.
- Each field yielded through an envelope holds the path made of the outer property's name, a dot and the
  field's own name.
- Each field yielded through an envelope carries the outer property's name as its envelope.
- A success schema with two or more top-level properties yields those top-level properties at their own
  names and carries no envelope.
- A success schema whose single top-level property's own schema is not an object explicitly declaring a
  properties keyword yields that property itself as one field at its own name, carrying no envelope.
- An object property declared inside the envelope is not descended into, and its own subproperties yield
  no field.
- A single top-level property that is an object declaring an empty properties keyword is read through as
  an envelope and yields no field, and a success schema whose top-level properties keyword is absent or
  empty yields no field.
depends_on:
- task/connector-configuration-draft-maps/success-response-schema-fields
implements:
- rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope
- domain/integration/connector-configuration-draft-response-field
---


## What it is
The narrowest reading that reaches the fields a document wrapped in one envelope, without hardcoding the envelope's name.

## Notes
The envelope name is carried out of the reading because the draft discloses by which name it descended.
An earlier binding of this task found a BLOCKING contradiction between the envelope rule's own "otherwise" clause and the reading-note kind's account of success-schema-declares-no-properties, over a success response schema whose single top-level property is an object with no properties keyword at all. Resolved by an /analyse cross-check, commit 729e5e46: the envelope precondition is now the keyword's mere presence, empty or not, and success-schema-declares-no-properties is reserved for the level actually read declaring the keyword absent or empty. Criteria 1, 5 and 7 above are reworded to this resolved reading, and a re-bind after the fix confirms every clause of the rule's statement now reaches a criterion with no contradiction remaining.
ADVISORY, from the specification — domain/integration/connector-configuration-draft-response-field declares status required, and declared_type and declared_required where the schema declares them; no criterion of this task states what a yielded field carries for those three, because the status and the schema-declared account are assigned by the responseMap rule's reading across responses (success-response-schema-fields and drafted-response-map), not by this one-level descent. Not a specification gap — a seam the caller should confirm drafted-response-map closes, since a field this task yields is not yet a complete connector-configuration-draft-response-field on its own.
REMAINDER, from the specification — The envelope rule's own Description states the envelope was read through, and by what name, is named to the operator as a reading note; a-connector-configuration-draft-notes-every-reading-condition-the-operation-exhibits carries the emission of that note (and of success-schema-declares-no-properties). No criterion of this task names a note; belongs to the task naming the draft's reading_notes.
REMAINDER, from the specification — a-connector-configuration-draft-states-a-response-map-from-the-operations-success-response-schemas names this rule as the reader of one schema's fields and owns the responseMap assembly across a chosen operation's success responses — keying by name, the lowest-status rule, the status/type/required carried from that same schema, application/json and $ref/allOf/oneOf/anyOf reading, the empty responseMap default. None of that is a criterion here; belongs to success-response-schema-fields and drafted-response-map within this same epic.
