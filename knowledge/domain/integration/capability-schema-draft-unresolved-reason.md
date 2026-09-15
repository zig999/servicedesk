---
type: enumeration
values:
- schema-not-reducible-to-a-type
- name-claimed-by-another-parameter
---

## Description

The closed set of reasons a capability schema draft names a parameter, a request-body field, or a response field apart from what it resolved: its own schema does not reduce to one JSON Schema type, a oneOf or an anyOf naming more than one type among them; or the property name it would occupy is already claimed by another parameter or field of the same operation that a-capability-schema-drafts-parameter-or-field-name-claimed-twice-favors-declared-order reads first.

## Responsibility

None.
