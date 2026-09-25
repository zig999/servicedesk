---
type: policy
statement: >-
  An operator-facing surface from which a removal of a concept, a capability, or a
  connector configuration was issued states to that operator the outcome the publishing
  api answered; where the removal succeeded, that the identity named is no longer
  registered; where the removal was refused, that nothing was removed and which refusal
  answered it, the condition the api's answer named stated apart from every other
  condition that route can name and apart from a refusal whose condition the surface
  does not recognise; and the surface states neither outcome of a removal the api has
  not yet answered.
constrains:
  - domain/glossary/concept
  - domain/integration/capability
  - domain/integration/connector-configuration
consistency: eventual
---

## Description

`a-submitted-registration-states-its-outcome-to-the-operator` already holds this shape
for a submission that registers a capability or a connector configuration; this is its
counterpart for a removal, extended to reach a concept's own registration as well, since
`contracts/glossary/glossary-authoring` publishes `remove-concept` under the same
never-removed-unless-refused shape the other two registries publish theirs under.

The two outcomes a removal can answer are the ones
`a-removal-surface-offers-a-control-behind-a-further-explicit-act` gates behind a
further explicit act: a removal that goes through, and a removal one of
`rules/glossary/a-registered-concept-is-never-removed`,
`rules/integration/a-registered-capability-cited-by-evidence-is-never-removed`, or
`rules/integration/removing-a-connector-configuration-is-unconditional` refuses. Leaving
either unstated would leave the operator unable to tell whether the further act they
just took did anything, and this specification has already refused that shape for
registration; a removal issued by the same operator through the same kind of surface
gets no lesser answer.

This states what the surface discloses and nothing further: it does not decide where the
operator is taken once a removal succeeds — `a-successful-removal-lands-on-the-removed-entitys-own-listing`
is that rule's own — and it does not move any condition the three removal rules above
decide, add an attribute to any of the three elements it constrains, or restate what a
registration's own submission states, which stands exactly as
`a-submitted-registration-states-its-outcome-to-the-operator` already left it.

Consistency is eventual for the same reason it is eventual there: the rule spans three
elements across two contexts, and nothing here demands an immediate fact across that
boundary.
