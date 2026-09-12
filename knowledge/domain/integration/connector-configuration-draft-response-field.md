---
type: value-object
attributes:
  - name: name
    type: string
    required: true
  - name: path
    type: string
    required: true
  - name: status
    type: string
    required: true
  - name: declared_type
    type: string
  - name: declared_required
    type: boolean
  - name: envelope
    type: string
---

## Description

One field a connector configuration draft read from a success response schema of the chosen operation and drafted as one responseMap entry — the field's own name as the entry's key and the path to it as the entry's value — together with the success status it was read from and, where the schema declares them, the type the schema declares for the field, whether the schema lists the field as required, and the name of the envelope property the reading descended through to reach it.
The type, the required listing and the envelope are the document's own account of the field, carried for the operator's review and read by no observation.

## Responsibility

Disclose one drafted response field with what the document declares about it.
