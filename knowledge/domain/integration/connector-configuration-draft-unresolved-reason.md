---
type: enumeration
values:
  - no-capability-registered
  - no-matching-input-schema-property
  - security-scheme-not-reducible-to-a-credential
  - drafted-key-occupied-by-another-security-scheme
---

## Description

The closed set of reasons a connector configuration draft names a parameter, a request-body field, or a security scheme apart from what it resolved: no capability is currently registered naming the connector the draft is generated for; at least one is registered but at least one of those registered capabilities' input schemas names no property matching that exact name; the operation's security scheme is not one the connector configuration's own ${credential:<name>} mechanism can reduce to a single value; or another security scheme the same operation requires already holds the whole value of the drafted key this one would have occupied.

## Responsibility

None.
