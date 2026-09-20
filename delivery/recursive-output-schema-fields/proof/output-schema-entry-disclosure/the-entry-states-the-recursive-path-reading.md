---
target: frontend
title: Recursive-path disclosure guidance, proven against its twelve criteria
summary: Twelve tests, one per this task's numbered criteria, pin the rewritten paragraph's six claim
  sentences, its bounded scope, its absence of a worked example and of forbidden vocabulary, its identical
  rendering across both screens, and the surface's continued refusal to reject two nested-schema shapes
  on any of those grounds.
implementation: sha256:9012f488a36c56646a9eeae1dc04f1a3990f515039746dc74520633cc255d3eb
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
run: run/output-schema-entry-disclosure-the-entry-states-the-recursive-path-reading-suite
tests:
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: states that the read field names are the paths through the schema's own top-level properties object
    and every properties object and items schema reachable beneath it
  proves: The paragraph states that the field names read from the entered schema are the paths through
    its own top-level properties object and every properties object and items schema reachable beneath
    it.
  fails_when: The guidance drops the top-level-properties-and-every-nested-properties-and-items reading,
    or reverts to naming only the schema own top-level keys.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: states that each object's own key is joined onto its parent's own path with a dot, and an array's
    own items is joined onto its parent's own path with brackets
  proves: The paragraph states how such a path is built -- each object's own key joined onto its parent's
    path with a dot, and an array's own items joined with brackets.
  fails_when: The guidance no longer states the dot-for-an-object-key and brackets-for-an-array's-items
    concatenation grammar.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: states that the entered content is JSON
  proves: The paragraph states that what is entered there is JSON.
  fails_when: The guidance's first sentence stops naming JSON as what is entered.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: states that the type and description declared at the node each path reaches, where the schema
    states them, are read as that field's declared semantics
  proves: The paragraph states that the type and description declared at the node each path reaches, where
    the schema states them, are read as that field's declared semantics.
  fails_when: The guidance stops naming type and description at the reached node as the source of a field's
    declared semantics, or drops the where-stated qualification.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: states that no other content of the entered schema is read or validated
  proves: The paragraph states that no other content of the entered schema is read or validated.
  fails_when: The guidance drops or waters down the sentence bounding what else is read or validated.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: states that a description entered there states what its value means and names no decision
  proves: The paragraph states that a description entered there states what its value means and names
    no decision.
  fails_when: The guidance no longer states this exact claim about a description's meaning versus a decision.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: carries no sentence that fails to match one of the six known claim statements
  proves: The paragraph makes no claim about what an entered output schema is read for beyond those already
    held by the three bound nodes.
  fails_when: A sentence stating a further claim -- one none of the six known claim statements covers
    -- is added anywhere in the guidance.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: carries no digit, which every worked example over this schema has so far instantiated as a concrete
    code
  proves: The paragraph carries no worked example of its own -- no concrete field name, path, or schema
    snippet illustrating the path grammar.
  fails_when: A worked example instantiated with a numeric code is introduced into the guidance.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: carries no brace, which a worked JSON snippet would need to show a concrete shape
  proves: The same criterion against the other shape a worked example takes here.
  fails_when: A worked example shown as an inline JSON snippet, using braces, is introduced into the guidance.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: names no refusal, check or read-only-nature vocabulary anywhere in the guidance
  proves: The paragraph contains none of the ten forbidden Portuguese-or-English terms this criterion
    names.
  fails_when: Any of the ten forbidden terms appears anywhere in the guidance.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: renders identical guidance text beside the Output schema entry on both screens
  proves: The paragraph renders with the same text beside the Output schema entry on the capability create
    screen and on the capability detail screen.
  fails_when: The guidance text mounted on the detail screen differs from the guidance text mounted on
    the create screen, or is absent from either.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: does not disable Save for an output schema whose properties are declared only beneath a nested
    items schema
  proves: An output schema declaring its properties only beneath a nested items schema is not refused
    by this surface.
  fails_when: Save is disabled for a syntactically valid output schema whose only properties object sits
    beneath a nested items schema.
- file: src/routes/capability-form-fields-output-schema-guidance.spec.ts
  name: does not disable Save for an output schema whose nested node carries neither type nor description
  proves: An output schema whose nested node carries neither type nor description is not refused by this
    surface.
  fails_when: Save is disabled for a syntactically valid output schema whose nested node declares neither
    a type nor a description.
not_applicable:
- edge_case: A registration refused by the backend for a reason the guidance text names.
  why: This task's criteria bound only the client surface's own refusal, never the registry's.
- edge_case: Two simultaneous submissions, or a race over the guidance's own state.
  why: The guidance is static text carrying no state of its own.
- edge_case: An entirely empty output-schema entry.
  why: The guidance's presence and content are unconditional on what is entered.
- edge_case: The concepts read failing, so the form and the guidance inside it never render.
  why: Pre-existing screen gating this task files do not touch.
untested:
- rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it's own fact spans five
  stated claims plus a refusal-and-check-nothing behaviour, observed through two different channels --
  rendered text and the Save button's disabled state. Every piece of the node's fact is established by
  this proof's twelve criterion tests together; none of them, alone or combined into a new one, is written
  to claim the whole node.
- rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim's own fact spans three separately-reasoned
  obligations, each already covered by its own test for its own reason; no single test decides the node's
  whole fact without conflating those distinct reasons.
- rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema's own fact includes
  clauses this task's own Notes mark REMAINDER and hand to the collection-time walk task instead; that
  node's whole fact is already decided by a test elsewhere in this delivery (proof/recursive-output-schema-field-paths/field-semantics-reads-nested-paths.md),
  and this proof writes no second, partial claim on it.
- The task's own UNDERDETERMINED entry names a surface shape refused, if at all, on grounds this task's
  own covered nodes never state and this task does not implement (a-capability-declares-its-contract,
  a-capability-declares-well-formed-schemas); no test against those other nodes' own ground is owed by
  this proof.
---

## What it is

Twelve tests rewriting the stale pinning spec whole to match the recursive-path disclosure paragraph, one test per this task's numbered criterion, reusing the existing findGuidanceParagraph helper.

## Notes

The spec file was rewritten whole rather than patched, since every one of its describe blocks pinned wording this task's implementation changed.
