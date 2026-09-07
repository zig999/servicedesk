---
type: invariant
statement: >-
  An operator authoring a connector configuration may leave the authoring surface without
  registering anything: no connector configuration is created, every configuration already
  registered is left exactly as it stood, and the operator is returned to the surface the
  authoring surface was reached from.
constrains:
  - domain/integration/connector-configuration
---

## Description

Register-connector is the only write the registry publishes (contracts/integration/connector-configuration-registry), so configuration an operator has authored but not registered has never entered the registry at all: leaving the surface without registering creates nothing, replaces nothing and removes nothing, and the connector name being authored under keeps answering exactly what it answered before — or keeps answering nothing, where nothing was ever registered under it.
That unregistered text already has no standing anywhere else in this specification: `a-connector-configuration-is-tested-through-a-registered-capability` holds that a diagnostic exercises the configuration currently registered under the connector name, never configuration text an operator holds unsaved in an authoring surface. Abandoning is the ordinary end of that same unsaved text — an operator who opened the surface to reconsider, or to start an edit and think better of it, leaves at no cost to the registry.
The leaving lands the operator back on the surface the authoring was reached from, so getting out costs no more than getting in did, and no operator is ever left on a surface whose only other exit is a registration they have decided against.
Whether the authoring was entered to configure a connector name nothing has registered yet or to replace one already registered makes no difference: both are `register-connector`'s own create-or-replace, and neither has written anything until it is registered.
Which control carries the return, its wording and where it sits are form and belong to the interface, not here.
