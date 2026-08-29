---
type: value-object
attributes:
  - name: name
    type: string
    required: true
  - name: type
    type: string
  - name: description
    type: string
---

## Description

One field a capability's own output schema declares, read structurally from that schema's own top-level `properties` object: the key names the field, and its own `type` and `description`, where the schema states them, are read as this field's declared semantics.
No other content of that schema is read or validated — an operator's own hint, never enforced.

## Responsibility

Carry one field's name and, where the schema declares them, its type and description, snapshotted onto the evidence item that names it.
