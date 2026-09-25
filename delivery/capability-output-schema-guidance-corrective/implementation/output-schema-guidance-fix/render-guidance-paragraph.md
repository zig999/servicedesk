---
target: frontend
title: Render the Output schema field's guidance paragraph on capability-form-fields
summary: CapabilityFormFields now renders a six-sentence Portuguese guidance paragraph
  beside the Output schema field, restating the five claims an-output-schema-entry-states-what-the-system-reads-from-it
  makes plus the JSON-entry claim, and nothing else — identical on the capability
  create and detail screens because both mount the same shared component.
task: sha256:4583d1e327a9202a3f7b539eba986977d11a950d46b1c8eee382b247c47b0f02
files:
- path: src/routes/capability-form-fields.tsx
  effect: Added a module-level OUTPUT_SCHEMA_GUIDANCE string constant carrying six
    sentences (JSON claim, path claim, dot/bracket concatenation claim, declared-semantics
    claim, nothing-else-read claim, description-states-meaning claim) rendered as
    a <p className="text-sm text-muted-foreground"> immediately beneath the Output
    schema JsonCodeEditorField. No other markup, prop, or logic changed.
criteria:
- criterion: The guidance states that the read field names are the paths through the
    schema's own top-level properties object and every properties object and items
    schema reachable beneath it.
  met: true
  how: The second sentence states this verbatim, matching the spec test's own CLAIM_PATTERNS[1].
- criterion: The guidance states that each object's own key is joined onto its parent's
    own path with a dot.
  met: true
  how: The third sentence's first clause carries this claim.
- criterion: The guidance states that an array's own items is joined onto its parent's
    own path with brackets.
  met: true
  how: The third sentence's second clause carries this claim.
- criterion: The guidance states that the entered content is JSON.
  met: true
  how: The first sentence, "O que é inserido aqui é JSON.", matches the spec test's
    literal check and is what findGuidanceParagraph locates.
- criterion: The guidance states that the type and description declared at the node
    each path reaches, where the schema states them, are read as that field's declared
    semantics.
  met: true
  how: The fourth sentence matches CLAIM_PATTERNS[3] verbatim.
- criterion: The guidance states that no other content of the entered schema is read
    or validated.
  met: true
  how: The fifth sentence matches CLAIM_PATTERNS[4] verbatim.
- criterion: The guidance states that a description entered there states what its
    value means and names no decision.
  met: true
  how: The sixth sentence matches CLAIM_PATTERNS[5] verbatim.
- criterion: The guidance carries no sentence that fails to match one of the seven
    preceding claims.
  met: true
  how: OUTPUT_SCHEMA_GUIDANCE is exactly six period-terminated sentences, each matching
    one of the spec test's six CLAIM_PATTERNS entries; no digit, brace, or forbidden-vocabulary
    token appears.
- criterion: The guidance renders identical text beside the Output schema field on
    the capability create screen and on the capability detail screen.
  met: true
  how: Both screens mount the same shared CapabilityFormFields component, with no
    create/detail branching around the new paragraph.
nodes:
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: The rule's five claims are exactly the five substantive sentences the guidance
    states; the rule's own no-checking clause is honored by adding no new validation
    against any of the five claims.
- node: rules/integration/an-output-schema-entrys-statement-carries-no-sixth-claim
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: The guidance's six sentences each trace to one of the three bounding nodes
    and add no further fact; it carries no worked example and refuses nothing.
- node: rules/investigation/a-field-semantics-name-is-its-path-through-the-output-schema
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: The path-building clauses this task reaches (the walk, the dot-join, the bracket-join)
    are restated in the guidance's second and third sentences. The clauses not reached
    are named under deferred.
- node: rules/glossary/a-description-states-meaning-never-policy
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: The guidance's sixth sentence restates the field-description half of this rule;
    the concept-description half is out of reach, per the task's own REMAINDER note.
- node: domain/investigation/field-semantics
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: This task adds no new fact to the element; the guidance restates, at the authoring
    surface, the same name/type/description reading this node already declares.
- node: domain/integration/capability
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: This task adds no new fact to the capability aggregate; the guidance sits beside
    the output_schema attribute's own authoring control.
inferences:
- inferred: The guidance paragraph is placed inside the Output schema field's own
    wrapping div, directly beneath JsonCodeEditorField.
  from: The file's own convention of pairing a field's supplementary text inside that
    same field's wrapping div.
- inferred: The visual style text-sm text-muted-foreground for the guidance paragraph.
  from: The same class pairing already used for supplementary, non-error explanatory
    text in sibling route files.
- inferred: The guidance text is declared as a local, module-level constant in capability-form-fields.tsx
    rather than a shared messages module.
  from: The existing local convention in capability-schema-helper-fields.tsx for a
    string used by exactly one component.
- inferred: The exact Portuguese wording, sentence boundaries and vocabulary of the
    six sentences.
  from: The pre-existing failing spec capability-form-fields-output-schema-guidance.spec.ts,
    the only place in the tree stating the surface-form wording, which the specification
    leaves to the interface.
preserved:
- Save button's disabled state, still driven only by isSubmitting, inputSchema.isValid,
  outputSchema.isValid and isDirty === false.
- The Input schema field's own JsonCodeEditorField, rendering and apply-from-draft
  flow.
- The capability schema helper's apply-to-input/output-schema flow and its confirmation
  dialogs.
deferred:
- what: The path-building clauses describing that every node the walk reaches carries
    a field-semantics element (not only leaves), and that patternProperties/additionalProperties
    are not walked.
  why: Belongs to the collection-time reading that builds field-semantics elements
    from a registered capability's output schema — backend work.
- what: The concept-description clause of the description-states-meaning rule.
  why: Belongs to the concept authoring surface, which declares a concept's own description.
run: run/output-schema-guidance-fix-render-guidance-paragraph-build
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:5fe8eeb9502e55e29178a2722e46e792f1d0aa41f50ef3ea4a7024db6e72d0ed
---

## What it is
A guidance paragraph on capability-form-fields.tsx, shared by the capability create and detail screens, stating the Output schema entry's own claims.

## Notes
None.
