---
type: policy
statement: >-
  A surface presenting exactly one registered concept, capability, or connector
  configuration, addressed by its own identity, offers a control to remove it; taking
  that control asks whether the removal is to be performed and issues no removal on
  that asking alone; the removal named by remove-concept, remove-capability, or
  remove-connector is issued only where the operator, having asked for it, states in a
  further, explicit act that the removal is to be performed; and where the operator
  does not so state, the concept, capability, or connector configuration stands exactly
  as it stood, registered under the same identity.
constrains:
  - domain/glossary/concept
  - domain/integration/capability
  - domain/integration/connector-configuration
consistency: eventual
---

## Description

A concept, a capability, and a connector configuration are each removed by an
operation `contracts/glossary/glossary-authoring`, `contracts/integration/capability-registry`,
or `contracts/integration/connector-configuration-registry` already publishes —
`remove-concept`, `remove-capability`, `remove-connector` — and each is refused under
conditions its own registry already states: `rules/glossary/a-registered-concept-is-never-removed`,
`rules/integration/a-registered-capability-cited-by-evidence-is-never-removed`, and
`rules/integration/removing-a-connector-configuration-is-unconditional`. None of the
three states that a surface offers a way to reach the operation at all; left unstated,
whether an operator could remove anything they registered fell to whatever a surface
happened to render.

The further explicit act is owed for the reason `releasing-or-discarding-a-draft-case-version-takes-a-further-explicit-act`
already owes one over release and discard: each of these three removals destroys a
registration held nowhere else, and no operation any of the three contracts publishes
answers it back. It is a plainer act than that rule's own discard, which additionally
requires the case's own slug reproduced — the destruction there reaches a whole draft
version and every entry of its manifest, while a concept, a capability, or a connector
configuration removed here is a single registration, and this rule asks only that the
operator state the further act, never that they reproduce the identity being removed.

This states that the control and the further act exist and what the further act gates;
it does not state which control carries either, its wording, or where it sits — that is
form, the same reading `a-single-capability-surface-offers-a-route-to-the-capabilities-listing`
already takes over its own control. Nor does it move any condition the three removal
rules above already decide, add an attribute to any of the three elements it constrains,
or say where the operator is taken once a removal is issued —
`a-successful-removal-lands-on-the-removed-entitys-own-listing` is that rule's own, and
what the operator is told about the outcome is
`a-submitted-removal-states-its-outcome-to-the-operator`'s own.

Consistency is eventual because the rule spans three elements across two contexts,
glossary and integration; nothing here demands an immediate fact across that boundary,
and each removal it gates still holds immediately inside its own aggregate under the
rule that governs it.
