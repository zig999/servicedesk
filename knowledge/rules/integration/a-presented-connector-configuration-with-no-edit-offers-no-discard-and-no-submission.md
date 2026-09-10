---
type: invariant
statement: >-
  A screen presenting the connector configuration read-connector-configuration answered, on
  which the operator has changed no field away from what that read answered, offers neither
  the act that returns the screen's fields to the content of that answer nor an act
  submitting a registration through register-connector.
expression: >-
  For a connector name n and a screen s presenting the connector configuration registered
  under n that read-connector-configuration of
  contracts/integration/connector-configuration-registry answered, where every field of s
  holds exactly what that answer carried: s offers no act of the kind
  a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface states, and s
  offers no act submitting a registration through register-connector, so while s stands in
  that condition no register-connector call leaves it and no restoration of its fields is
  available to the operator. Nothing here turns on how s was reached, on whether that read's
  answer was in hand before s was first presented or arrived after it, or on which control
  an interface would have carried either act.
constrains:
  - domain/integration/connector-configuration
---

## Description

`read-connector-configuration` of `contracts/integration/connector-configuration-registry` answers the configuration standing under a connector name, and the screen presenting that answer is the same screen the operator edits and submits from. Two neighbouring rules already state the discard over such a screen from both ends: `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` offers it where the operator has changed one or more of the screen's fields away from what the read answered, and `a-surface-holding-no-read-registration-offers-no-discard` withholds it where the screen holds no read registration at all — one authoring at a connector name nothing is registered under, one whose read has not answered, one whose read failed. A screen standing on a read that answered, with no field changed away from that answer, is neither of those cases, and neither of those rules reaches it; nor does any node state when the submitting act is offered on it. This states both.

Neither act has anything to act on there. The discard has nothing to return: the fields already hold exactly what the read answered, so performing it is indistinguishable from not performing it, and offering it would put the further explicit act that rule requires — the protection owed because a discard destroys content held nowhere else — in front of a screen holding no edit to destroy. The submission has nothing to submit: `register-connector` is create-or-replace and `domain/integration/connector-configuration` is replaced whole on every edit, so a submission carrying exactly what the read answered writes the registration over itself, and `a-submitted-registration-states-its-outcome-to-the-operator` would then state a registration made and name what now stands registered where nothing about what stands registered moved — the very indistinguishability of a write made from a write never sent that its own reasoning refuses.

What either act is once the operator has changed a field away from that answer is untouched here: the discard stays `a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface`'s own, with its further explicit act, what a submission then states stays `a-submitted-registration-states-its-outcome-to-the-operator`'s and `a-registration-outcome-is-never-stated-before-the-registry-answers`'s own, and where a successful one lands stays `a-successful-connector-registration-lands-on-the-configurations-own-surface`'s own. The acts this screen owes on every reading are equally untouched: `a-connector-configuration-surface-offers-a-route-to-the-listing` still owes the route to the listing, `a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading` still owes the return to origin, `a-connector-configuration-authoring-surface-offers-a-configuration-helper` still offers the helper, and an applied draft still changes only the local edit (`applying-a-drafted-configuration-changes-only-the-local-edit`) — which is itself a field changed away from what the read answered. Which control carries either act, its wording, its placement, and whether an act not offered is absent from the screen or carried by a control the operator cannot take are form and belong to the interface, exactly as this specification's other surface rules leave them.

An invariant over the one element whose registration the screen presents, holding immediately: the condition is decided on the screen itself, by comparing the fields it holds against the answer it is already presenting, and it adds no attribute to `domain/integration/connector-configuration`, publishes no operation and refuses no call.
