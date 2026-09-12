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
  is an object declaring properties is read one level down, yielding that inner object's properties at
  the outer property's name, a dot and each field's own name.
criteria:
- A success schema whose single top-level property is an object with properties yields that inner object's
  properties and not the outer property itself.
- Each field yielded through an envelope holds the path made of the outer property's name, a dot and the
  field's own name.
- Each field yielded through an envelope carries the outer property's name as its envelope.
- A success schema with two or more top-level properties yields those top-level properties at their own
  names and carries no envelope.
- A success schema whose single top-level property is not an object declaring properties yields that property
  itself at its own name.
- An object property declared inside the envelope is not descended into, and its own subproperties yield
  no field.
- A single top-level property that is an object declaring no properties object yields no field.
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
BLOCKING, from the specification — Criteria 5 and 7 cannot both hold for a success response schema whose single top-level property is an object declaring no properties object. rules/integration/a-success-response-schemas-single-object-property-is-read-through-as-its-envelope conditions the envelope descent on the single property's own schema being "an object declaring a properties object"; failing that, its "otherwise" clause reads that one property as the schema's own top-level properties, at its own name — the outcome criterion 5 states. But domain/integration/connector-configuration-draft-reading-note-kind defines success-schema-declares-no-properties as a success response schema that "declares no properties object at either the top level or inside a single-property envelope", which names this exact schema shape as yielding nothing — the outcome criterion 7 states. Both nodes speak to the same schema shape and disagree; a person must settle which node owns the outcome — through the scope, or through the analysis that extends the specification — before this task can be written without asking the executor to satisfy a contradiction. This is standing, unresolved by the decided-fact edits made during this planning invocation, since neither of the two nodes in conflict was touched.
UNDERDETERMINED, from the specification — No criterion covers a success response schema declaring no properties object at the top level at all (not the single-property-envelope case) — the rule's own closing clause ("a schema declaring no properties object at the level it is read at yielding no field") is untested for the top-level case.
UNDERDETERMINED, from the specification — No criterion requires a yielded field to carry the success status it was read from, or the declared type and required listing the schema declares for it, though domain/integration/connector-configuration-draft-response-field declares all three. A reader dropping them from every yielded field satisfies every criterion as written.
UNDERDETERMINED, from the specification — No criterion states that a field read at a single top-level property that is not an object declaring properties (the non-envelope case) carries no envelope — only the two-or-more-properties case and the through-an-envelope case are covered.
ADVISORY, from the specification — The envelope-read-through reading note (and the success-schema-declares-no-properties note) that this descent's outcome decides belongs to the task naming the draft's reading_notes; confirm that task is handed the envelope name and the no-properties schemas this reading identifies.
