---
type: value-object
attributes:
  - name: name
    type: string
    required: true
  - name: reason
    type: connector-configuration-draft-unresolved-reason
    required: true
---

## Description

One parameter or request-body field, or one security scheme, an operation named that a connector configuration draft could not honestly turn into a placeholder — the name exactly as the OpenAPI document itself gives it, paired with why.

## Responsibility

Name one thing the draft left unresolved and the one reason it did.
