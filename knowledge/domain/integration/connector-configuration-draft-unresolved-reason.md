---
type: enumeration
values:
  - no-capability-registered
  - security-scheme-not-reducible-to-a-credential
  - drafted-key-occupied-by-another-security-scheme
---

## Description

The closed set of reasons a connector configuration draft names a parameter, a request-body field, or a security scheme apart from what it resolved: no capability is currently registered naming the connector the draft is generated for; the operation's security scheme is not one the connector configuration's own ${credential:<name>} mechanism can reduce to a single value; or a security scheme the same operation requires already holds the drafted query or headers key that this parameter, or this other security scheme, would itself have occupied.

## Responsibility

None.
