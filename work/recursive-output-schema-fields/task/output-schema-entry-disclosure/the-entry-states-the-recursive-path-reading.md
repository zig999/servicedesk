---
title: State the recursive path reading at the Output schema entry
summary: The disclosure paragraph beside the Output schema entry names the full path through every nested
  properties object and items schema, in place of the top-level-only keys it names today.
rationale: The scope names one paragraph and the spec that pins its wording sentence-by-sentence and states
  no cut between them, so one task -- the copy and its pinning assertions change for the same reason,
  and the pinned sentences are how this task's criteria are shown met.
sources:
- intake/frontend-scope.md
objective: The disclosure paragraph rendered beside the Output schema entry states that the field names
  read from an entered schema are the full paths through its own top-level properties object and every
  properties object and items schema reachable beneath it.
criteria:
- The paragraph states that the field names read from the entered schema are the paths through its own
  top-level properties object and every properties object and items schema reachable beneath it.
- The paragraph states how such a path is built -- each object's own key joined onto its parent's path
  with a dot, and an array's own items joined with brackets.
- The paragraph states that what is entered there is JSON.
- The paragraph states that the type and description declared at the node each path reaches, where the
  schema states them, are read as that field's declared semantics.
- The paragraph states that no other content of the entered schema is read or validated.
- The paragraph states that a description entered there states what its value means and names no decision.
- The paragraph makes no claim about what an entered output schema is read for beyond those already held
  by domain/investigation/field-semantics, rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
  and rules/glossary/a-description-states-meaning-never-policy.
- The paragraph carries no worked example of its own -- no concrete field name, path, or schema snippet
  illustrating the path grammar.
- The paragraph contains none of the following, in Portuguese or English -- recusa, rejeição, erro, inválido,
  obrigatório, verificação, checagem, somente leitura, read-only, natureza -- the vocabulary the surface
  own existing disclosure test already forbids.
- The paragraph renders with the same text beside the Output schema entry on the capability create screen
  and on the capability detail screen.
- An output schema declaring its properties only beneath a nested items schema is not refused by this
  surface.
- An output schema whose nested node carries neither type nor description is not refused by this surface.
implements:
- rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
- rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
- rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
---

## What it is

The one paragraph an operator reads while typing an output schema, rewritten from the top-level-only reading the specification no longer holds to the recursive path reading it now holds.
The existing spec file pins that paragraph's wording sentence by sentence and is delivered with the copy, because it asserts the same sentences this task's criteria name.

## Notes

The spec file's findGuidanceParagraph helper already locates the paragraph and is reused rather than written again.
The paragraph's five-sentence shape and its Portuguese register are form the previous implementation chose and disclosed, not facts the covered rules hold; a rewrite may keep or change the sentence count as long as no sixth claim appears.
The two screens share one component, so the identical-rendering criterion is satisfied by not diverging them rather than by a second edit.
UNDERDETERMINED, from the specification -- rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it and an-output-schema-entrys-statement-carries-no-sixth-claim state that the surface refuses no entry and checks no entered content on any of these grounds, but criteria 11 and 12 exercise only two shapes (properties declared only beneath a nested items schema; a nested node carrying neither type nor description). A surface that is otherwise correct but refuses an entered schema whose items is declared as more than one schema, or that declares patternProperties or additionalProperties, or whose text does not parse as JSON, would pass every criterion here and still be refused by the specification -- what a registration is refused for stays a-capability-declares-its-contract's and a-capability-declares-well-formed-schemas' own.
Decision, beyond the covers — stand: domain/investigation/field-semantics is named above only as one of the three nodes criterion 7 bounds the paragraph's claims against, exactly as the epic's own covered rules already name it in their statement text; this task does not implement it and the epic's claim is not grown for a mention that names a bound, not an obligation.
REMAINDER, from the specification -- clauses of a-field-semantics-name-is-its-path-through-the-output-schema reaching no criterion here (root keys named alone with no leading dot; every node named, not only leaves; a multi-schema items walked no further; patternProperties/additionalProperties not walked) belong to the task implementing the collection-time walk into domain/investigation/field-semantics, not this surface-disclosure task.
ADVISORY, from the specification -- criterion 9's forbidden-vocabulary list is drawn from the surface's own existing disclosure test, not from any candidate node; rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it states expressly that wording is form and belongs to the interface, so this list will not be held by a later reading of the specification nodes alone.
