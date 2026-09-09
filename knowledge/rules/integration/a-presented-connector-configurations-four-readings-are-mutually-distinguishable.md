---
type: invariant
statement: >-
  The reading a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under
  states and the three a-presented-connector-configuration-states-an-outstanding-or-failed-read
  states are four presentations the operator tells apart, and none of them is presented as
  another.
constrains:
  - domain/integration/connector-configuration
---

## Description

`read-connector-configuration` of `contracts/integration/connector-configuration-registry` reaches the presenting screen in four situations: a read that has not returned, a read that failed, a read refused because nothing is registered under the connector name, and a read that returned. The neighbouring rules state what the screen states in each; this states that the four never read alike to the operator, the same distinguishability `a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading` already holds these same four readings apart by name and by act owed.
