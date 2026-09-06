---
type: invariant
statement: >-
  A surface presenting one registered connector configuration, or authoring one, offers
  the operator a route to the listing of registered connector configurations, and taking
  that route registers nothing and alters no registered configuration. The route's
  presence turns on nothing further — not on whether the surface reads a configuration or
  authors one, not on the read of that configuration having answered, and not on how the
  operator reached the surface.
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

`rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest` already decided this shape once, in the other direction: where one operator surface is one step from the only place a neighbouring reading is answered, the step is offered rather than left to whatever address a reader could construct. The route is owed here for the same reason, and owed unconditionally for the same reason it is unconditional there — a route present on only some readings is one the operator cannot rely on, and the conditions that would narrow it (a read still outstanding, a read refused, a configuration not yet authored) are exactly the readings the operator has least reason to stay on. How the surface was reached does not narrow it either: a route that returns only whoever arrived from the listing leaves the operator who arrived any other way exactly where this rule refuses to leave them.

Taking it registers nothing. `register-connector` is the one operation that creates a configuration or replaces whatever answered to its name, and `domain/integration/connector-configuration` is replaced whole on every edit; a route away that wrote what the surface was holding would make leaving indistinguishable from registering, on a value object where the write is total. What becomes of content an authoring surface was holding when the operator leaves it is no part of this: the route says where the operator lands, never what happens to content never registered.

Which control carries the route, whether it stands apart from the controls that register or is carried by one of them, its wording, and where it sits — above the surface's heading, beneath it, or anywhere else — are form and belong to the interface, not here, the same reading `a-listed-case-version-offers-a-route-to-its-own-manifest` and `a-draft-versions-content-is-presented-only-from-its-own-record` already take over their own controls. This adds no attribute to `domain/integration/connector-configuration`, publishes no operation, discloses nothing further about a configuration, and refuses no call.
