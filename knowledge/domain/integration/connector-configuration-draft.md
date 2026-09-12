---
type: value-object
attributes:
  - name: connector
    type: string
    required: true
  - name: configuration
    type: string
    required: true
  - name: unresolved
    type: connector-configuration-draft-unresolved-item
    required: true
    many: true
  - name: generated_credentials
    type: connector-configuration-draft-generated-credential
    required: true
    many: true
  - name: method_mismatch
    type: connector-configuration-draft-method-mismatch
relationships:
  - target: capability
    type: reference
    cardinality: "0..*"
---

## Description

A candidate connector configuration, generated from one operation of an OpenAPI document for one connector name, offered for an operator to review and apply — never registered by its own generation.
Its configuration holds the same method/address/query/headers/body shape an-http-connector-configuration-declares-its-call already governs, built with a ${subject:<name>} placeholder wherever a parameter or request-body field's name is one at least one of the named capabilities is currently registered against, whatever any of those capabilities' own input schemas declare, and a ${credential:<name>} placeholder wherever an operation's security scheme reduces to one credential value; it never states a responseMap or a statusMap, which no OpenAPI construct can supply.
The capability reference is every capability, if any, currently registered naming the connector the draft is generated for — empty where none is, since resolving a subject placeholder has nothing to check a name against without one, and all of them where more than one is, since the draft reads none of them in preference to the others.

## Responsibility

Hold, for review, everything one operation of an OpenAPI document could honestly resolve toward one connector's configuration, and disclose by name and by reason everything it could not.
