---
title: Render the Output schema field's guidance paragraph
summary: The capability create and detail screens' Output schema field currently shows
  no guidance paragraph at all.
sources:
- work/capability-output-schema-guidance-corrective/intake/wrong-behavior.md
objective: The Output schema field's authoring surface, on both the capability create
  screen and the capability detail screen, presents a guidance paragraph stating the
  claims capability-form-fields-output-schema-guidance.spec.ts already checks for,
  and no others.
criteria:
- The guidance states that the read field names are the paths through the schema's
  own top-level properties object and every properties object and items schema reachable
  beneath it.
- The guidance states that each object's own key is joined onto its parent's own path
  with a dot.
- The guidance states that an array's own items is joined onto its parent's own path
  with brackets.
- The guidance states that the entered content is JSON.
- The guidance states that the type and description declared at the node each path
  reaches, where the schema states them, are read as that field's declared semantics.
- The guidance states that no other content of the entered schema is read or validated.
- The guidance states that a description entered there states what its value means
  and names no decision.
- The guidance carries no sentence that fails to match one of the seven preceding
  claims.
- The guidance renders identical text beside the Output schema field on the capability
  create screen and on the capability detail screen.
implements:
- rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
- rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
- rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
- rules/glossary/a-description-states-meaning-never-policy
- domain/investigation/field-semantics
- domain/integration/capability
---

## What it is
A guidance paragraph rendered beside the Output schema field on both the capability create screen and the capability detail screen, stating the claims rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it makes and no others.

## Notes
UNDERDETERMINED, from the specification — rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it says the surface "refuses no entry and checks no entered content against any of the five". rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim says it "refuses nothing on any of these grounds". No criterion covers either clause. A reading that would still pass every criterion: The Output schema field shows the required guidance paragraph word for word, and also validates the entered schema on the client, marking it invalid or disabling submission on conditions the guidance names. Every criterion still passes.
UNDERDETERMINED, from the specification — Both output-schema rules say the surface "carries no worked example of its own". The boundary criterion only rules out sentences matching none of the seven claims; a worked example placed inside a sentence that does match a claim gets through. A reading that would still pass every criterion: A guidance sentence stating the bracket join ends with an example of its own, such as "as in installations[].state". It still matches the bracket-join claim, so the boundary criterion passes, yet it carries a worked example the specification refuses.
UNDERDETERMINED, from the specification — rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema gives the array join as the literal `[]`, applying only where items is itself one schema, and says a root key names a field with no leading dot. The criteria ask only for "brackets" and "a dot", so text stating a different path shape still passes. A reading that would still pass every criterion: The guidance says an array's items is joined with brackets holding an element index, that every items is walked including one declared as a list of schemas, and that every path (root keys included) starts with a dot — satisfying the criteria as written while giving paths the path rule never builds.
REMAINDER, from the specification — The clauses of rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema describing how elements are built (every node reached carries type/description, not only leaves; patternProperties and additionalProperties are not walked) are not reached by this task; the guidance only repeats the path-building claim. It belongs to: The collection-time reading that builds domain/investigation/field-semantics elements from a registered capability's output schema — backend work, not this authoring surface.
REMAINDER, from the specification — The concept-description clause of rules/glossary/a-description-states-meaning-never-policy is not reached by this task; the Output schema field's guidance speaks only of a field's description entered in the schema, not a concept's own. It belongs to: The concept authoring surface, which declares a concept's own description.
ADVISORY, from the specification — The objective names the test file as what decides which claims the guidance states; a test file is not a specification node. The claims owed are those of rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it, bounded by rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim; the seven criteria restate those claims.
ADVISORY, from the specification — The identical-text-on-both-screens criterion goes beyond what the nodes state: the entry rule requires the same claims "wherever that entry stands" but leaves wording and presentation to the interface. Identical wording is an interface choice, not a decided fact.
ADVISORY, from the specification — This is a specification gap, not a fault of this task: the boundary rule says every claim the entry rule makes is held by field-semantics, the path rule, or the description rule, but none of those three states the output schema is entered as JSON — that fact is held by a sibling capability rule outside this task's claim. The JSON criterion is still owed since the entry rule's own statement demands it; worth a future /analyse pass to tighten the boundary rule's own cross-reference.
