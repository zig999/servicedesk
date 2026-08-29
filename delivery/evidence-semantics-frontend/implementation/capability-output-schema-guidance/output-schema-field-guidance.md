---
title: Per-field semantics guidance beside the capability form's output_schema editor
summary: A short guidance paragraph, rendered beside the shared JsonTextareaField in the one CapabilityFormFields component both the dialog and the routed detail screen compose, states what the platform reads from output_schema and what a description may say — a hint, never enforced.
task: sha256:e8b0087fd5aac8ac7fd525713e3dc47447be2ee587e6f96c2b8c4041c5544eeb
standard:
  at: ../../standards/frontend-typescript.yaml
  pin: sha256:4ab98ed7da8178e0fb1e79970b51b0fd9ff0712bb86cf0a02ebde8d52cd4cc09
run: run/capability-output-schema-guidance-output-schema-field-guidance-build
files:
- path: src/routes/capability-form-fields.tsx
  effect: A guidance paragraph now renders beside the output_schema JsonTextareaField, stating that the platform reads each property's own type and description as declared semantics, that no other schema content is read or validated, and that a description states meaning rather than a decision; JsonTextareaField itself is untouched.
criteria:
- criterion: The capability form dialog shows guidance at the output_schema editor naming per-field type and description as what the platform reads.
  met: true
  how: capability-form-dialog.tsx composes CapabilityFormFields, the one component this task edits; the guidance paragraph renders in every composition of it, including the dialog.
- criterion: The routed capability detail screen shows the same guidance at its output_schema editor.
  met: true
  how: capability-detail-ready-view.tsx also composes CapabilityFormFields, the same shared component; the guidance renders there identically, with no second copy.
- criterion: The guidance states that no other content of the JSON Schema is read or validated.
  met: true
  how: 'The paragraph''s own text states this verbatim: "no other content of this schema is read or validated."'
- criterion: The guidance states that a description says what a value means and never a decision.
  met: true
  how: The paragraph contrasts a meaning example ("2 = suspended for delinquency") with a decision example ("when 2, confirm the hypothesis"), mirroring rules/glossary/a-description-states-meaning-never-policy's own two worked examples.
- criterion: JsonTextareaField's props and rendering are unchanged for its other consumers.
  met: true
  how: json-textarea-field.tsx was not opened for edit; the guidance is a sibling <p> element in capability-form-fields.tsx's own markup, outside JsonTextareaField's own render tree, so its three other consumers (connector-configuration's field, the test-connector panel's sample input, and the input_schema field on this same form) are unaffected.
- criterion: A valid output_schema whose properties declare no description still saves — the guidance enforces nothing.
  met: true
  how: No validation logic was added anywhere; the guidance is static text with no bearing on outputSchema.isValid or the form's own submit gating, both of which this task left untouched.
nodes:
- node: domain/integration/capability
  how: The guidance is rendered at the editor for this element's own output_schema attribute; no fact of the element itself is encoded here beyond what the form already carried.
- node: domain/investigation/field-semantics
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: 'The guidance paragraph states, in the operator''s own words, exactly the structural reading this node declares: each property''s own type and description, read as that field''s declared semantics, with no other schema content read or validated.'
- node: rules/glossary/a-description-states-meaning-never-policy
  encoded_at:
  - src/routes/capability-form-fields.tsx
  how: The guidance's own contrasting examples (meaning versus decision) are this rule's own two worked examples, carried into the operator-facing copy so the constraint is visible at the point of authoring rather than only in the specification.
preserved:
- JsonTextareaField's props, its beautify/minify/inline-error behavior, and every one of its four consumers (input_schema and output_schema on this form, connector-configuration's field, the test-connector panel's sample input) — none opened or modified.
- The form's own Save-gating logic (isSubmitting, inputSchema.isValid, outputSchema.isValid, isDirty) — unchanged; the guidance adds no new gate.
- Every other field's markup, the name/version disabling convention, and the two schema editors' own tall prop — unchanged.
---

## What it is
The one scope surface on the capability form: a hint, not a validation, matching the specification's statement that per-field semantics are an operator's own hint, never enforced.

## Notes
REMAINDER, from the specification — rules/glossary/a-description-states-meaning-never-policy's concept's-description clause reaches no criterion of this task, whose guidance sits only at the capability form's output_schema editor; that clause belongs to the glossary concept's own description authoring surface, this plan's glossary-concept-description epic, not here.
Criterion 5 (JsonTextareaField's props and rendering unchanged for its other consumers) is a sound regression bound at a shared code seam; nothing in the specification speaks to it either way.
