---
type: value-object
attributes:
  - name: status
    type: string
    required: true
  - name: ending
    type: domain/investigation/evidence-result
    required: true
  - name: declared_as
    type: string
---

## Description

One numeric HTTP status code the chosen operation's responses object declares, paired with the evidence-result ending the connector configuration draft mapped it to in the drafted statusMap and with the description the OpenAPI document declares that response under, where it declares one.
It is disclosed so that the operator reviewing the draft reads the document's own account of the status beside the ending the draft chose for it, before deciding whether that ending stands.

## Responsibility

Disclose one declared status, the ending drafted for it and what the document says that status means.
