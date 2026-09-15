---
type: value-object
attributes:
- name: name
  type: string
  required: true
- name: reason
  type: capability-schema-draft-unresolved-reason
  required: true
---

## Description

One parameter, one request-body field, or one response field an operation named that a capability schema draft could not honestly turn into a properties entry -- the name exactly as the OpenAPI document itself gives it, paired with why.

## Responsibility

Name one thing the draft left unresolved and the one reason it did.
