---
type: invariant
statement: >-
  The confirmation an-unsaved-edit-is-not-overwritten-by-applying-a-draft-without-confirmation
  asks for states, where the field's unsubmitted content and the draft's configuration are both
  well-formed JSON object text, each top-level key, and each key of the statusMap, responseMap,
  query and headers objects, that applying the draft would add, remove or change in value, and
  states, where the field's content is not well-formed JSON object text, that what would change
  cannot be itemized.
constrains:
  - domain/integration/connector-configuration
---

## Description

Applying a draft replaces the field whole, and the draft is deliberately more than an operator keeps: it lists every field the document declares under the document's own names, while the edit it replaces may hold the two keys the operator chose and renamed by hand.
A confirmation that says only that the edit will be replaced asks the operator to remember what they would lose; one that names the keys shows them.
This is where a draft is compared with what the operator already holds, and the draft itself is compared with nothing — it stays the same function of the operation whatever is registered or typed.
