---
type: invariant
statement: The surface presenting the listing of every case offers the curator a route to author a new case on every reading of that listing, its presence turning on nothing about the read backing the listing — including a read that has not yet answered, a read that failed, and a read that answered no case at all.
constrains:
  - domain/knowledge/case
---

## Description

contracts/knowledge/case-query publishes list-cases as the listing a curator browses every case by, and contracts/knowledge/case-lifecycle publishes create-draft as the act that originates a case's first draft — but no node said the curator standing at that listing is offered any way to reach that act, so the offer's existence, and the readings of the listing it survives, fell to whatever an interface happened to render.
The listing's own read answers which cases exist and nothing about whether a new one may be authored, so making the route turn on that read's state would withhold an act for a reason unrelated to it. The readings a condition would drop the route from are precisely the ones where the curator has nothing else on the surface to act on: a read still outstanding, a read that failed, and — most of all — a read that came back holding no case, where authoring one is the only thing left to do.
Which control carries the route, its wording and where it sits are form, belonging to the interface, as rules/knowledge/a-listed-case-version-offers-a-route-to-its-own-manifest, rules/knowledge/a-presented-case-version-states-its-own-declared-attributes and every other presentation rule of this specification leave them. This rule states that the route is offered and on which readings; it states nothing about what taking it writes, nor about what the authoring surface it reaches presents.
