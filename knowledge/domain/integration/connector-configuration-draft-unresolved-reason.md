---
type: enumeration
values:
  - no-capability-registered
  - no-matching-input-schema-property
  - security-scheme-not-reducible-to-a-credential
---

## Description

The closed set of reasons a connector configuration draft names a parameter, a request-body field, or a security scheme apart from what it resolved: no capability is currently registered naming the connector the draft is generated for; one is registered but its input schema names no property matching that exact name; or the operation's security scheme is not one the connector configuration's own ${credential:<name>} mechanism can reduce to a single value.

## Responsibility

None.
