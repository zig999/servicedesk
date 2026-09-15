---
type: invariant
statement: Where one parameter or request-body field of the chosen operation both declares a schema that does not reduce to one JSON Schema type and would occupy an input_schema property name an earlier part in the order a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order reads already holds, the draft's unresolved list carries two items naming it -- one with reason schema-not-reducible-to-a-type and one with reason name-claimed-by-another-parameter -- and never one item alone under either reason.
constrains:
- domain/integration/capability-schema-draft
---

## Description

a-capability-schema-drafts-input-schema-is-read-from-the-chosen-operations-parameters-and-fields and a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order each fix, over their own trigger and without condition, the unresolved item that trigger produces; a part meeting both triggers at once named only once would leave whichever of the two rules went unstated false at exactly the point the two meet.
domain/integration/capability-schema-draft-unresolved-item pairs one name with one reason and never with several, so the two reasons cannot ride on a single item.
The reviewing operator must act on each separately: settling the collision by hand -- choosing whether the entry the earlier part produced stands for this one too -- leaves its type still unreadable from the document, and reading its type by hand leaves a second part of the operation answering to that same name.
