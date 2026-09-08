---
type: value-object
attributes:
  - name: name
    type: string
    required: true
  - name: security_scheme
    type: string
    required: true
---

## Description

One ${credential:<name>} placeholder a connector configuration draft generated for one operation's security scheme, disclosed by the name it generated and the security scheme's own name in the OpenAPI document — never a value the scheme's own credential already resolved to.

## Responsibility

Disclose one generated credential name and the security scheme it was generated for.
