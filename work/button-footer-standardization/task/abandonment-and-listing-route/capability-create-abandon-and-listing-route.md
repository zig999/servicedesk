---
title: Capability creation surface abandonment and listing route
summary: The capability creation surface's single Cancel link separated into an abandonment that lands the operator on the surface the authoring was reached from and an unconditional route to the capabilities listing.
rationale: The scope stated the Cancel destination as one correction; the specification holds two obligations over that one control — an abandonment whose destination is the surface the authoring was reached from, and a route to the capabilities listing owed on every reading — so the task is written as two acts with two destinations rather than as one relabelled control.
sources:
- intake/scope-review-corrections.md
objective: The capability creation surface carries the abandonment and the route to the capabilities listing as two separate controls, the abandonment landing the operator on the surface the authoring entry was reached from.
criteria:
- Taking the abandonment control lands the operator on the surface the authoring entry was reached from, whichever surface that is, the capabilities listing included.
- Taking the abandonment control, where the authoring surface was reached from no surface, lands the operator on the capabilities listing.
- Taking the abandonment control issues no register-capability call and leaves every registered capability exactly as it stood.
- A control whose destination is the capabilities listing renders while the read of the concepts the surface offers is outstanding.
- A control whose destination is the capabilities listing renders once that read of the concepts has failed.
- A control whose destination is the capabilities listing renders once the surface is ready to author.
- Taking the control whose destination is the capabilities listing issues no register-capability call.
- No control returning the surface's fields to the content of a read registration renders on the surface.
- No proof of the capability creation surface asserts that the abandonment lands the operator at the capabilities listing where a reaching surface exists.
implements:
- rules/integration/an-abandoned-capability-registration-entry-registers-nothing
- rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
- rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
---

## What it is
The one Cancel link this surface renders three times, once per phase, replaced by two acts with two destinations.
The abandonment lands the operator on the surface the authoring entry was reached from, and on the capabilities listing where no such surface exists.
The route to the capabilities listing stands on its own in all three phases.

## Notes
UNDERDETERMINED, from the specification — criteria 4, 5 and 6 enumerate three readings of the capability creation surface on which the listing route renders, while `rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing` owes that route on every reading of a surface authoring one capability, its presence conditioned on nothing else.
A reading of the creation surface outside those three — a submission in flight being the obvious one, which no candidate places — is owed the route by the node and demanded by no criterion.
An implementation that renders the control while the concepts read is outstanding, once it has failed and once the surface is ready to author, and drops it on every other reading, satisfies criteria 4, 5 and 6 as written while the surface has a reading carrying no route to the listing.

ADVISORY, from the specification — the criteria fix the readings on which the listing route renders and fix none for the abandonment control: criteria 1, 2 and 3 speak only of taking it.
`rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading` is the node that makes the return-to-origin act unconditional across a surface's readings, and its own expression reaches only a surface presenting the capability read-capability-by-identity answers or the configuration read-connector-configuration answers, not a creation surface.
No candidate states whether the creation surface offers the abandonment while its own read is outstanding or has failed; an implementation rendering it on every reading satisfies the task, and one rendering it only once ready to author does too.

ADVISORY, from the specification — criterion 7 asks that taking the listing control issues no register-capability call, and when this task was bound the node it rests on, `rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing`, carried that content nowhere but its `## Description`, while the sibling `rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing` carried it in its own `statement`.
One binder read the Description as governing and flagged the asymmetry as the caller's to weigh; a second, binding the capability detail surface, read that the sentence stated the node's own reach rather than the operator's act, and that the node's log entry carried no such clause at all.
Planning sent the fact to a judge blind to both tasks, which decided that taking the route registers nothing and wrote it into that node's `statement` and `expression`, disclosed in the decision log at that node's location.
Criterion 7 therefore rests on a fact the specification states, and the asymmetry between the two registries' route rules is closed rather than weighed.

REMAINDER, from the specification — `rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering`, `rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing` and `rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read` are stated wholly over surfaces presenting or authoring a connector configuration under a connector name, and no clause of any of the three reaches a criterion of this task.
They belong to this epic's tasks over the connector configuration authoring and detail surfaces.

REMAINDER, from the specification — `rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` states what a surface presenting the capability registered at a name and version tells the operator while read-capability-by-identity is outstanding and where it failed, and stands the reattempt control in the failed window alone.
The reads named in criteria 4 and 5 are of the concepts the creation surface offers, not of a capability at an identity, so it belongs to this epic's task over the capability surface addressed by a capability's own name and version.

REMAINDER, from the specification — `rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading` states the return-to-origin act over a surface presenting the one capability read-capability-by-identity answers or the one configuration read-connector-configuration answers, across the readings whose read is outstanding, failed, answered nothing registered, or answered a registration.
No clause of it reaches a criterion of this task; it belongs to this epic's tasks over the two detail surfaces.

REMAINDER, from the specification — of `rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface`, only the final clause reaches this task, at criterion 8: a surface holding no read registration is offered no such act.
Its first clauses — the act returning every field to the content of the registration the surface last read, its registering nothing, its leaving the operator on the surface, and its further explicit act — belong to this epic's tasks over the two detail surfaces, where a registration was read.

REMAINDER, from the specification — of `rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing`, the capability half reaches criterion 2, and the clause landing an operator who leaves a connector configuration authoring surface reached from no surface on the listing list-connector-configurations answers belongs to this epic's task over the connector configuration authoring surface.

REMAINDER, from the specification — of `rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing`, the authoring half reaches criteria 4 through 7, and the same statement also owes the route on every reading of a surface presenting one registered capability, including a read that answered no capability at that identity.
That half belongs to this epic's task over the capability surface addressed by a capability's own name and version.
