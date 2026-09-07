---
title: Connector-configuration creation surface abandonment and listing route
summary: The connector-configuration creation surface's single Cancel link separated into an abandonment that lands the operator on the surface the authoring was reached from and its own route to the connector-configurations listing.
rationale: Written as the sibling of the capability creation surface's task because the two registries' rules are stated as one pair over both, and cut as its own task because the surface holds its own hook, its own phases and its own proofs and is demonstrable without the other three.
sources:
- intake/scope-review-corrections.md
objective: The connector-configuration creation surface carries the abandonment and the route to the connector-configurations listing as two separate controls, the abandonment landing the operator on the surface the authoring surface was reached from.
criteria:
- Taking the abandonment control lands the operator on the surface the authoring surface was reached from, whichever surface that is, the connector-configurations listing included.
- Taking the abandonment control, where the authoring surface was reached from no surface, lands the operator on the connector-configurations listing.
- Taking the abandonment control issues no register-connector call and leaves every registered connector configuration exactly as it stood.
- A control whose destination is the connector-configurations listing renders on the surface.
- Taking the control whose destination is the connector-configurations listing issues no register-connector call.
- No control returning the surface's fields to the content of a read registration renders on the surface.
- No proof of the connector-configuration creation surface asserts that the abandonment lands the operator at the connector-configurations listing where a reaching surface exists.
implements:
- rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
- rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
- rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
---

## What it is
The one Cancel link on this surface replaced by two acts with two destinations.
The abandonment lands the operator on the surface the authoring surface was reached from, and on the connector-configurations listing where no such surface exists.
The route to the connector-configurations listing stands on its own.

## Notes
ADVISORY, from the specification — the objective's "two separate controls" is form the specification permits rather than a fact it states.
`rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing` leaves which control carries the route, whether it stands apart from the controls that register or is carried by one of them, its wording and where it sits to the interface, and `rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading` states only that where the two destinations are not the same place the two acts are two acts, not told apart by any property of a control.
What the nodes owe and criteria 1, 2, 4 and 5 hold are two acts with two destinations; the separation into two rendered controls is the interface's, and a reviewer should not read it as a specification fact.

REMAINDER, from the specification — `rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading` reads closest to criterion 1 but does not own the fact this task implements: its statement and expression are stated over a surface presenting a single registration that read-connector-configuration or read-capability-by-identity answers, and the creation surface issues neither read and presents no registration.
The decision log's entry locating that file records it as deciding the readings that hold no entry to abandon, and its own expression closes that where the operator holds an entry not yet submitted the act is the one the two abandonment rules already state, with the destination they already fix, and not a second act beside it.
The reached-from destination for this task's abandonment is therefore `rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering`'s, and the node belongs to this epic's tasks over the two detail surfaces, which must carry the return-to-origin act on the readings whose read is outstanding, failed, answered nothing registered, or answered the registration.

REMAINDER, from the specification — `rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing` states its route over a surface presenting or authoring one capability and closes that surfaces over any other subject are untouched, and `rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` states the outstanding and failed windows of read-capability-by-identity and the reattempt control in the failed window alone.
Neither is implemented here; both belong to this epic's tasks over the capability authoring and capability-keyed surfaces.

REMAINDER, from the specification — `rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read` states the three windows of a screen presenting the configuration registered under a connector name through read-connector-configuration, including the offered re-issue of a failed read.
The creation surface issues no read-connector-configuration, so no clause of it reaches a criterion of this task; it belongs to this epic's task over the connector-configuration detail surface.

REMAINDER, from the specification — `rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing` is implemented here only in its authoring branch.
Its clauses reaching a surface presenting one registered connector configuration, and the readings conditioned on the read of that configuration, reach no criterion of this task and belong to this epic's task over the connector-configuration detail surface.

REMAINDER, from the specification — `rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing` is implemented here only in its connector-configuration branch, at criterion 2, and its capability branch belongs to this epic's task over the capability creation surface.

REMAINDER, from the specification — `rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` is implemented here only in its exclusion clause, which criterion 6 answers for this surface.
Its positive clauses — the act returning every field to the content the read answered, its further explicit act, its registering nothing, and its leaving the operator on the surface — belong to this epic's tasks over the two detail surfaces, where a read registration is in hand.

REMAINDER, from the specification — `rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering` is stated over any operator authoring a connector configuration, which its Description extends to authoring that replaces a configuration already registered under a connector name, stating that the difference makes none.
This task's criteria reach only the creation surface, so a surface authoring to replace a registered configuration is left unanswered here and belongs to the work over the connector-configuration edit surface.
