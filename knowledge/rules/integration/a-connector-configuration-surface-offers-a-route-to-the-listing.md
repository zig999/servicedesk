---
type: invariant
statement: >-
  A surface presenting one registered connector configuration, or authoring one, offers
  the operator a route to the listing of registered connector configurations, and taking
  that route registers nothing and alters no registered configuration.
expression: >-
  For a surface s presenting or authoring a single connector configuration: s carries a
  route to the listing answered by list-connector-configurations of
  contracts/integration/connector-configuration-registry, on every reading of s — one
  whose read of the configuration has answered, one whose read has not yet answered, one
  whose read was refused, and one authoring a configuration nothing has registered yet —
  and whatever surface the operator reached s from. Following that route from s issues no
  register-connector call and leaves every registered connector configuration exactly as
  it stood.
constrains:
  - domain/integration/connector-configuration
---

## Description

`contracts/integration/connector-configuration-registry` publishes both the listing of every configuration currently registered and the read of the one registered under a name, so the listing is where an operator surveys what exists and a single-configuration surface is one step off it. Nothing said whether that step is offered back. Left unsaid, an operator standing at one configuration — having opened it, having begun authoring a new one, or having loaded its address directly — would keep a way to the listing only where the interface happened to leave one, and otherwise would have to construct an address to reach the read the registry publishes for exactly that purpose.

`rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest` already decided this shape once, in the other direction: where one operator surface is one step from the only place a neighbouring reading is answered, the step is offered rather than left to whatever address a reader could construct. Whether the route is owed unconditionally, whatever the surface's own reading, is `a-connector-configuration-listing-routes-presence-turns-on-nothing-further`'s own.

Taking it registers nothing. `register-connector` is the one operation that creates a configuration or replaces whatever answered to its name, and `domain/integration/connector-configuration` is replaced whole on every edit; a route away that wrote what the surface was holding would make leaving indistinguishable from registering, on a value object where the write is total. What becomes of content an authoring surface was holding when the operator leaves it is no part of this: the route says where the operator lands, never what happens to content never registered.

Which control carries the route, whether it stands apart from the controls that register or is carried by one of them, its wording, and where it sits — above the surface's heading, beneath it, or anywhere else — are form and belong to the interface, not here, the same reading `a-listed-case-version-offers-a-route-to-its-own-manifest` and `a-draft-versions-content-is-presented-only-from-its-own-record` already take over their own controls. This adds no attribute to `domain/integration/connector-configuration`, publishes no operation, discloses nothing further about a configuration, and refuses no call.
