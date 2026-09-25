---
type: invariant
statement: >-
  A surface presenting one case version a reader named — by that case's own slug together
  with that version's own number — offers the curator a route to that same version's own
  editing surface on every reading of that surface, its presence turning on nothing
  further: not on that version's state, and not on whether the read of that version read
  back as a case at that reading, including a reading where that read has not yet
  answered, a reading where it failed, and a reading where it was refused because some
  validator rule does not hold for that version.
expression: >-
  For a case c, a version v of c, and a surface presenting v to a reader who named c's slug
  together with v's own version number: that surface carries a route to v's own editing
  surface. The route's presence turns on nothing further — not on which of draft or
  released v's state holds, not on whether every validator rule of
  validation-runs-at-every-read holds for v at that reading, and not on what that surface's
  own read of v answered: it stands alike while no answer for v has arrived, where that
  read failed, and where that read was refused because v does not currently read back as a
  case.
constrains:
  - domain/knowledge/case-version
---

## Description

`a-presented-case-version-offers-a-route-to-its-own-manifest-on-every-reading` already carries a curator from this same surface to v's manifest on every reading, whatever that reading answered; this states the same route to v's other correcting surface, the one on which the version's own declared attributes are composed rather than its manifest.

The route is no attribute of v: it carries the case's slug and the version's number, which the reader themself supplied, and discloses nothing the read answered. Offering it is therefore untouched by `a-version-keyed-surface-states-a-named-version-that-does-not-read-back-as-a-case`, which forbids presenting any attribute of a version that does not validate as the content standing at that identity — a route is not that content, on the same ground its manifest-route sibling already gives.

What the editing surface itself then presents, and what it accepts there, is not this rule's: `an-editing-surface-presents-a-drafts-own-declared-attributes-even-when-that-draft-does-not-read-back-as-a-case` decides it. This states only that the route to reach it stands on every reading of the version, refused readings included — a version whose manifest holds no entry, or whose declared attributes themselves carry the failing value, is a version a curator can reach no correction of at all if the one door to it is the very validity the correction exists to repair.

Which control carries the route, its wording and where it sits are form and belong to the interface, not here.
