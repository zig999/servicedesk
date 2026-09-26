---
type: policy
statement: >-
  An operator whose issued removal of a concept, a capability, or a connector
  configuration succeeds is taken to the listing of registered concepts, capabilities,
  or connector configurations, respectively, and never to the surface addressed by the
  identity just removed.
constrains:
  - domain/glossary/concept
  - domain/integration/capability
  - domain/integration/connector-configuration
consistency: eventual
---

## Description

The surface addressed by an identity a removal just succeeded on is no longer a surface
anything answers: `rules/glossary/a-glossary-read-by-an-unheld-name-is-refused`,
`constraints/the-capability-identity-read-refuses-an-unregistered-identity`, and
`rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused`
each already refuse a read by an identity nothing currently holds, which is exactly what
a removal that just succeeded leaves behind. Landing the operator there would show a
refusal for the very act that just succeeded, and this specification has already refused
that shape for the opposite act — `a-successful-capability-registration-lands-on-the-capabilitys-own-surface`
and `a-successful-connector-registration-lands-on-the-configurations-own-surface` each
land a registration on the identity's own surface for the mirrored reason: the identity
still resolves there. A removal leaves the identity resolving nowhere, so the destination
a registration takes is the one destination a removal cannot.

The listing each registry's own `list-concepts`, `list-capabilities`, or
`list-connector-configurations` answers is where every remaining registration under that
kind still resolves, and each surface a removal is issued from already owes a route to
that same listing — `a-single-capability-surface-offers-a-route-to-the-capabilities-listing`
and `a-connector-configuration-surface-offers-a-route-to-the-listing` state it for two of
the three, and the concept's own listing is the surface `remove-concept` is issued from
in the first place, so no further route is owed there. This states only the destination
a successful removal takes; which page of a paged listing the operator lands on is
`constraints/listings-are-paged`'s own answer, and what the operator is told about the
outcome itself is `a-submitted-removal-states-its-outcome-to-the-operator`'s own. It adds
no attribute to any of the three elements it constrains and moves no condition any
removal rule already decides.

Consistency is eventual for the reason it is eventual in the two rules this one
completes: it spans three elements across two contexts, and nothing here demands an
immediate fact across that boundary.
