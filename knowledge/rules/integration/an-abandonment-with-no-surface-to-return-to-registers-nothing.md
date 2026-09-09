---
type: policy
statement: >-
  The leaving an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing states
  registers nothing and leaves every registration exactly as it stood, and the operator is left
  neither on the surface they left nor on a read keyed on the identity being authored or
  presented.
constrains:
  - domain/integration/capability
  - domain/integration/connector-configuration
consistency: eventual
---

## Description

It registers nothing, because `register-capability` and `register-connector` are the only writes either registry publishes and both are total — `domain/integration/connector-configuration` is replaced whole on every edit, and a capability registration replaces whatever stood at its identity with its own whole declared contract — so an act away that wrote what the surface was holding would make leaving indistinguishable from registering, the clause `a-connector-configuration-surface-offers-a-route-to-the-listing` already carries for its own route. What becomes of content an authoring surface was holding unwritten when the operator leaves is no part of this, exactly as both route rules leave it.
