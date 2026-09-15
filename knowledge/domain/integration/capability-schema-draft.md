---
type: value-object
attributes:
- name: input_schema
  type: string
  required: true
- name: output_schema
  type: string
  required: true
- name: unresolved
  type: capability-schema-draft-unresolved-item
  required: true
  many: true
---

## Description

A candidate input schema and output schema for one capability, generated from one operation of a fetched OpenAPI document -- a read, never a registration.
Its input_schema and its output_schema each declare a top-level properties object and, where any of their own names is declared required, a top-level required array, the same shape a-capability-input-schema-holds-a-well-formed-object already fixes for a registered capability's own input schema.
Every name the chosen operation declares that the draft could not honestly turn into a properties entry is named in unresolved instead, by its own name and by why.

## Responsibility

Hold, for review, everything one operation of an OpenAPI document could honestly resolve toward one capability's input schema and output schema, and disclose by name and by reason everything it could not.
