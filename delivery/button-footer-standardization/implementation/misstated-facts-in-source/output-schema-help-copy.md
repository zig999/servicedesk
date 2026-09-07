---
title: Output-schema entry guidance rewritten to the specification's five claims
summary: The Portuguese help paragraph beside the capability form's output-schema field now states exactly what the system reads from an entered schema, sourced only from the nodes that hold those claims, with no worked example.
task: sha256:863e73fa64beeaa0e58f611c08861567f6e6264b30d9cdc4e4d3e77fdd74be8c
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/misstated-facts-in-source-output-schema-help-copy-build
files:
- path: src/routes/capability-form-fields.tsx
  effect: The paragraph beside the output-schema JsonTextareaField now states, in five sentences and no worked example, that the entered content is JSON, that the read field names are the keys of the schema's own top-level properties object, that each such key's own type and description where the schema states them are read as that field's declared semantics, that nothing else in the schema is read or validated, and that a description entered there states meaning and names no decision. Every other part of the file — the form's other fields, the action footer, isSaveDisabled, the JsonTextareaField wiring — is unchanged.
criteria:
- criterion: Text stating what the system reads out of an entered output schema renders wherever the capability output-schema entry stands.
  met: true
  how: The capability output-schema entry is rendered by exactly one component, CapabilityFormFields — confirmed by search across src/routes, where no other file renders an output-schema field or that field's id — and both the create screen and the detail screen mount it, so the single rewritten paragraph reaches the entry everywhere it stands.
- criterion: That text states that what is entered is JSON.
  met: true
  how: The paragraph's first sentence states it directly, naming JSON.
- criterion: That text states that the field names read from the entered schema are the keys of its own top-level `properties` object.
  met: true
  how: The second sentence states that the field names read from the schema are the keys of its own top-level properties object.
- criterion: That text states that such a key's own declared `type` and `description`, where the entered schema states them, are read as that field's declared semantics.
  met: true
  how: The third sentence states that the type and description declared by each such key, where the schema declares them, are read as that field's declared semantics — carrying the where-stated qualification the node carries.
- criterion: That text states that nothing else in the entered schema is read or validated.
  met: true
  how: 'The fourth sentence states the bound directly, as a standalone sentence: no other content of the schema is read or validated.'
- criterion: That text states that a `description` entered there states what its value means and names no decision.
  met: true
  how: The fifth sentence states that a description here declares what its value means and names no decision.
- criterion: That text carries no worked example, whether composed for the surface or reproduced from anywhere else.
  met: true
  how: The prior paragraph's two quoted examples were removed outright; the new paragraph states each of the five claims abstractly and instantiates none of them.
- criterion: That text states no further claim about what an entered output schema is read for.
  met: true
  how: The paragraph is exactly five sentences, each mapping to one of the five stated claims; no sixth sentence or clause was added, and no claim beyond those five appears anywhere in the file.
- criterion: That text promises no check beyond the ones `rules/integration/a-capability-declares-its-contract` and `rules/integration/a-capability-declares-well-formed-schemas` state a submitted registration is checked for.
  met: true
  how: The text describes only what is read, never what is checked or refused — it names no validation, no refusal and no check of any kind, so it promises nothing beyond what those two nodes state a submission is checked for.
- criterion: The surface refuses no entry and checks no entered content on any of the grounds that text states.
  met: true
  how: No validation logic was added or changed; isSaveDisabled still depends only on the output schema's JSON well-formedness, from use-capability-form.ts which this delivery did not touch, and the other existing conditions. Nothing in the component refuses an entry for lacking a top-level properties object, for a key missing type or description, or for a description naming a decision.
nodes:
- node: rules/integration/an-output-schema-entry-states-what-the-system-reads-from-it
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: The rewritten paragraph states, at the capability output-schema entry, exactly the five claims the rule's statement enumerates, draws each from the nodes that already hold it rather than asserting a new fact, carries no worked example, states no sixth claim, and leaves the surface refusing nothing and checking nothing on any of these grounds — which is what the rule's own closing clause requires.
- node: domain/investigation/field-semantics
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: 'Criteria 3, 4 and 5 restate this node''s own content at the entry: one field per key of the schema''s top-level properties, that key''s own type and description as its declared semantics where stated, and nothing else read or validated. The node''s Responsibility, carrying a field snapshotted onto an evidence item, is not reached — this delivery states those facts to the operator at authoring time and carries no schema content into any data structure.'
- node: rules/glossary/a-description-states-meaning-never-policy
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: Criterion 6 encodes only the field half of this rule's statement, at the output-schema entry. The concept half, over domain/glossary/concept, is reached by no criterion here and is not claimed as covered, as the task's own remainder note records.
inferences:
- inferred: The paragraph stays in Portuguese, matching the register of the copy it replaces.
  from: The pre-existing paragraph at this exact spot was Portuguese, and other route files under src/routes carry instructional and validation prose in Portuguese while control labels stay English — the specification states no language for UI copy, and the node itself puts wording with the interface.
- inferred: The paragraph keeps its existing position, tag and styling — a paragraph element with the muted small-text classes, inside the div beside the output-schema field.
  from: The node's own Description puts which control carries the statement, its wording and where it sits with the interface, and the inventory records this as the only prose paragraph in the file outside labels and error text, styled exactly that way beside that field.
preserved:
- The output-schema JsonTextareaField's own markup, id, label and JSON-validity wiring, feeding isSaveDisabled — untouched by this delivery.
- The paragraph's existing position, wrapping div, tag and utility classes beside the output-schema field.
- Every other field, the action footer and the trailingActions slot in the same component — none of this task's criteria reach them.
deferred:
- what: src/routes/capability-form-fields-output-schema-guidance.spec.ts still asserts the old Portuguese wording, including the two worked-example strings this task requires removed.
  why: Writing or rewriting tests is the test author's judgment, not this delivery's; that spec fails against the rewritten paragraph until it is authored against the new text, which is expected and outside what an implementation changes.
---

## What it is
One paragraph beside the output-schema entry of the capability form, replaced.
It reproduced two specification nodes' substance together with the node's own worked example; it now states the five claims the specification holds and instantiates none of them.

## Notes
The paths this record carries were corrected from the anchor the implementer returned: it spelled them from the repository, and every path here is relative to the target source root, which is the anchor the registry's scopes and the task's own claims are stated against.
Two inferences, both about form the specification expressly leaves to the interface: the paragraph stays Portuguese, matching the copy it replaces and the register of instructional prose elsewhere in this tree, and it keeps its position, tag and styling.
Neither changes what the operator can learn or do, which is the line this project draws between form and fact.
One deferral, and it predicts a red: the spec that asserts this paragraph's old wording — including the two worked-example strings this task requires gone — will fail until it is authored against the new text, and authoring it is the proof's judgment rather than this record's.
The build run covered every step the registry declares except the suite, and all seven passed.
