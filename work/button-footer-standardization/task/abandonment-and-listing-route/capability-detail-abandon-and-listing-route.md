---
title: Capability detail surface return to origin and listing route
summary: The capability detail surface's single Cancel link separated into an act that lands the operator on the surface the detail surface was reached from and an unconditional route to the capabilities listing, both present on every reading of the surface and neither turning on how the surface was reached, with the outstanding, failed and shown readings each told apart from the other two.
rationale: Cut as its own task because this surface holds its own readings, its own hook and its own proofs and is demonstrable without the other three; its criteria reach the readings whose read is outstanding, has failed, has answered that nothing is registered at that identity, or has answered the registration, and they reach the two controls owed on the third of those without reaching what that reading states, which the epic declares uncovered on the sibling registry and which the decision log records as noticed and not decided on this one.
sources:
- intake/scope-review-corrections.md
objective: The capability detail surface carries the return-to-origin act and the route to the capabilities listing as two separate acts, both present on every reading of the surface.
criteria:
- Taking the return-to-origin control, on a surface reached from a surface that exists, lands the operator on that surface, demonstrated over an origin that is not the capabilities listing.
- Taking the return-to-origin control, where the detail surface was reached from no surface and no field has been edited, lands the operator on the capabilities listing, demonstrated in each of the four readings of the surface.
- Taking the return-to-origin control, where the detail surface was reached from no surface and a field has been edited away from what the read answered, lands the operator on the capabilities listing.
- A return-to-origin control renders while the read of the named capability's identity is outstanding.
- A return-to-origin control renders once that read has failed.
- A return-to-origin control renders once the capability has been read and is shown.
- A return-to-origin control renders where that read answered that no capability is registered at that name and version.
- The presence of the return-to-origin control and the presence of the capabilities-listing control turn on nothing about which surface the detail surface was reached from, demonstrated over two origins that differ and over the capabilities listing itself.
- Taking the return-to-origin control issues no register-capability call and leaves every registered capability exactly as it stood, in membership and in every registration's own declared contract, in each of the four readings and on both destinations the act may land on.
- A control whose destination is the capabilities listing renders in each of those same four readings.
- Taking the control whose destination is the capabilities listing issues no register-capability call.
- The outstanding-read reading states that the capability at that name and version is still being read.
- Neither the outstanding-read reading nor the failed-read reading presents the nature, the input schema, the output schema, the timeout, the connector or the concept of any capability as the content standing at that name and version.
- The reading standing on a read that failed other than by the registry's refusal of an identity no capability is registered at states that the capability at that name and version could not be read.
- That same reading carries a control whose one effect is to issue that same read again, and no other reading of the surface carries that control.
- The surface issues the read of that name and version again only where the operator takes that control, and on no initiative of its own.
- The outstanding-read reading, the reading standing on a read that failed other than by that refusal, and the reading that shows the capability are each distinguishable from the other two to the operator, and none of the three is rendered as either of the others.
- No control returning the surface's fields to the content of a read registration renders in the outstanding-read reading, in the reading standing on a read that failed other than by that refusal, or in the reading where that read answered that no capability is registered at that name and version.
depends_on:
- task/misstated-facts-in-source/nature-refusal-fixture-status
implements:
- rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
- rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
- rules/integration/an-abandoned-capability-registration-entry-registers-nothing
- rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
- rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
---

## What it is
The one Cancel link this surface renders in its loading phase, its load-error phase and its ready view, replaced by two acts with two destinations.
The return-to-origin act lands the operator on the surface the detail surface was reached from, and on the capabilities listing where no such surface exists — whether or not a field has been edited.
The route to the capabilities listing stands on its own and renders in every reading, and neither control's presence turns on how the surface was reached.

## Notes
ADVISORY, from the specification — criterion 15's second half reaches the fourth reading of the surface, the one where the read answered that no capability is registered at that name and version, and the two fields of `rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` do not say the same thing about it.
Its `statement` offers the reattempt in the failed window alone, which excludes that reading; its `expression` says only that the control stands in the failed presentation and in neither of the other two, the other two being the outstanding read and the registration read and shown, so the reading the node expressly excepts from its failed window is named by neither side of that exclusivity.
The implementation is to be held to the `statement` — the reattempt rendering in the failed reading and in no other — and a reviewer reading the `expression` alone will find criterion 15 unbacked over the fourth reading.
Nothing else in this task reaches that reading's controls beyond criteria 7, 10 and 18.

ADVISORY, from the specification — no candidate states what this surface presents to the operator in the reading where read-capability-by-identity answered that no capability is registered at that name and version, and the decision log records that silence twice as noticed and not decided, against `rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing` and against `rules/integration/a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under`.
Criteria 7, 10 and 18 require that reading to be rendered, so an implementation must put something there, and one rendering it exactly as the failed-read reading satisfies every criterion as written: criteria 13, 14 and 17 are bounded to the reading standing on a read that failed other than by that refusal, and criterion 15 is satisfied so long as the reattempt control is withheld there.
It is advisory rather than underdetermined because no candidate refuses that rendering over this surface — the node that refuses it over the sibling registry is about the connector screen and is the node the epic declares uncovered.
The task is implementable as cut; the risk it names is an implementer inventing that reading's wording, which would be a fact no node holds.

REMAINDER, from the specification — every clause of `rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing`, of `rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read` and of `rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering` reaches no criterion of this task: all three are stated over a surface presenting or authoring a connector configuration under a connector name, and every criterion here is written over the capability detail surface keyed on a name and version.
They belong to this epic's task over the connector configuration detail surface.

REMAINDER, from the specification — the connector-configuration half of three implemented candidates reaches no criterion of this task.
`rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading` states its act over a surface presenting the one connector configuration registered under a connector name and fixes the listing list-connector-configurations answers as the destination where no reached-from surface exists there; `rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing` states the same landing over a connector-keyed surface holding an edit composed and not submitted; and `rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` states its act and its exclusions over the connector configuration read by read-connector-configuration.
All three halves belong to this epic's task over the connector configuration detail surface.

REMAINDER, from the specification — the whole positive clause of `rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` reaches no criterion of this task: that a surface whose read answered and whose fields the operator has changed offers an act setting every field to the content that read answered, registering nothing and leaving the operator on that same surface; that the act takes effect only where the operator states in a further, explicit act that it is to be performed; and that where the operator does not so state, no field changes.
Criterion 18 answers only that node's negative clause, over the outstanding-read, failed-read and nothing-registered readings, and the positive half belongs to the work over the discard-in-place act on this surface.

REMAINDER, from the specification — the capability authoring-surface clauses of three implemented candidates reach no criterion of this task.
`rules/integration/an-abandoned-capability-registration-entry-registers-nothing` states its whole subject over an operator composing a capability registration entry on a surface authoring one, of which the readings this task covers are only the branch where the detail surface itself holds an edit composed and not submitted; `rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing` states its route over a surface that authors one for registration and states that the route's presence turns not on whether the capability being authored is registered yet; and `rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing` states its landing over an authoring surface from which a registration is composed for submission, the detail surface being only one such surface.
No criterion here is stated over the surface on which a capability registration is composed for a name and version, and those clauses belong to this epic's task over the capability registration authoring surface.
