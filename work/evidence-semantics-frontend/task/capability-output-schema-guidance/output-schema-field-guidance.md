---
title: Per-field semantics guidance at the output_schema editor
summary: Guidance owned by the capability form, rendered beside the output_schema JsonTextareaField in both the dialog and the routed detail screen, naming per-field type and description as operator hints.
rationale: One task for both compositions because the guidance is one element the two compositions share, and splitting it would recreate the seam the inventory's risk names; it lives with the capability form because JsonTextareaField has three other consumers this scope does not touch.
sources:
- intake/scope.md
- intake/material.md
objective: Both compositions of the capability form guide the operator to declare per-field type and description inside the output_schema JSON.
criteria:
- The capability form dialog shows guidance at the output_schema editor naming per-field type and description as what the platform reads.
- The routed capability detail screen shows the same guidance at its output_schema editor.
- The guidance states that no other content of the JSON Schema is read or validated.
- The guidance states that a description says what a value means and never a decision.
- JsonTextareaField's props and rendering are unchanged for its other consumers.
- A valid output_schema whose properties declare no description still saves — the guidance enforces nothing.
implements:
- domain/integration/capability
- domain/investigation/field-semantics
- rules/glossary/a-description-states-meaning-never-policy
---

## What it is
The one scope surface on the capability form: a hint, not a validation, matching the specification's statement that per-field semantics are an operator's own hint, never enforced.

## Notes
REMAINDER, from the specification — rules/glossary/a-description-states-meaning-never-policy's concept's-description clause reaches no criterion of this task, whose guidance sits only at the capability form's output_schema editor; that clause belongs to the glossary concept's own description authoring surface, this plan's glossary-concept-description epic, not here.
Criterion 5 (JsonTextareaField's props and rendering unchanged for its other consumers) is a sound regression bound at a shared code seam; nothing in the specification speaks to it either way.
