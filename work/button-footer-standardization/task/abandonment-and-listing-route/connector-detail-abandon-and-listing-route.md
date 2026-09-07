---
title: Connector-configuration detail surface return to origin and listing route
summary: The connector-configuration detail surface's single Cancel link separated into an act that lands the operator on the surface the detail surface was reached from and an unconditional route to the connector-configurations listing, both present on every reading of the surface and neither turning on how the surface was reached, with the outstanding, failed and shown readings each told apart from the other two.
rationale: 'Cut as its own task for the same reason its capability sibling is, and written to reach the two controls owed on the reading whose read answered that nothing is registered under the named connector without reaching what that reading states: that statement is the one node this epic declares uncovered, and the criteria that speak of a failed read except that refusal so this task asserts nothing the uncovered node owns.'
sources:
- intake/scope-review-corrections.md
objective: The connector-configuration detail surface carries the return-to-origin act and the route to the connector-configurations listing as two separate acts, both present on every reading of the surface.
criteria:
- Taking the return-to-origin control, on a surface reached from a surface that exists, lands the operator on that surface, demonstrated over an origin that is not the connector-configurations listing.
- Taking the return-to-origin control, where the detail surface was reached from no surface and the configuration has not been edited, lands the operator on the connector-configurations listing, demonstrated in each of the four readings of the surface.
- Taking the return-to-origin control, where the detail surface was reached from no surface and the configuration has been edited away from what the read answered, lands the operator on the connector-configurations listing.
- A return-to-origin control renders while the read of the named connector's configuration is outstanding.
- A return-to-origin control renders once that read has failed.
- A return-to-origin control renders once the configuration has been read and is shown.
- A return-to-origin control renders where that read was refused because nothing is registered under that connector name.
- The presence of the return-to-origin control and the presence of the listing-route control turn on nothing about which surface the detail surface was reached from, demonstrated over two origins that differ and over the connector-configurations listing itself.
- Taking the return-to-origin control issues no register-connector call and leaves every registered connector configuration exactly as it stood, in membership and in every registration's own content, in each of the four readings and on both destinations the act may land on.
- A control whose destination is the connector-configurations listing renders in each of those same four readings.
- Taking the control whose destination is the connector-configurations listing issues no register-connector call.
- The outstanding-read reading states that the configuration is still being read.
- Neither the outstanding-read reading nor the failed-read reading states a connector or configuration value.
- The reading standing on a read that failed other than by the refusal answered because nothing is registered under that connector name states that the configuration could not be read.
- That same reading carries a control that issues the read of the named connector's configuration again.
- The surface issues that read again only where the operator takes that control, and on no initiative of its own.
- The reading that shows the configuration states the connector and the configuration as the read answered them, and states no value that answer did not carry.
- The outstanding-read reading, the reading standing on a read that failed other than by that refusal, and the reading that shows the configuration are each distinguishable from the other two to the operator, and none of the three is rendered as either of the others.
- No control returning the surface's fields to the content of a read registration renders in the outstanding-read reading, in the reading standing on a read that failed other than by that refusal, or in the reading where that read was refused because nothing is registered under that connector name.
implements:
- rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
- rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
- rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
- rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
- rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
---

## What it is
The one Cancel link this surface renders in its loading phase, its load-error phase and its ready view, replaced by two acts with two destinations.
The return-to-origin act lands the operator on the surface the detail surface was reached from, and on the connector-configurations listing where no such surface exists — whether or not the configuration has been edited.
The route to the connector-configurations listing stands on its own and renders in every reading, and neither control's presence turns on how the surface was reached.

## Notes
ADVISORY, from the specification — criterion 10 asks the listing-route control in the reading standing on a read that failed other than by the refusal answered because nothing is registered under that connector name, and `rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing` enumerates its readings as one whose read has answered, one whose read has not yet answered, one whose read was refused, and one authoring a configuration nothing has registered yet — that failed reading among none of them.
What backs criterion 10 there is that node's own universal, on every reading of the surface, with the route's presence turning on nothing further and not on the read of that configuration having answered, and nothing enumerated.
Its sibling `rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing` names a read that failed explicitly, and by the decision log each of the two nodes' own entry decides its own clauses, so the sibling's wording is not backing here.

ADVISORY, from the specification — criterion 19's third reading, the read refused because nothing is registered under that connector name, is not among the three surfaces `rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` enumerates as offered no such act, because `rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read` excepts that refusal from its failed window and makes it a reading of its own.
What backs criterion 19 there is that node's general clause — a surface holding no read registration is offered no such act, having no content to return its fields to — together with its positive predicate, which offers the act only where the read answered a registration the operator's fields were then changed away from.

ADVISORY, from the specification — no criterion reaches what the epic's declared-uncovered node `rules/integration/a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under` states.
Criteria 13, 14 and 18 hold to the exception `rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read` carries, criterion 18 being bounded to three readings exactly as that node's three-presentations clause is; and criteria 7, 10 and 19 ask only for the two controls in that reading and for the absence of the restore control there, which `rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading`, `rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing` and `rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` state.
The one phrase that brushed that node sat in this task's summary and in no criterion — each reading of the backing read told apart from the others — the distinguishability of the fourth reading from the other three being that uncovered node's own clause; the summary was narrowed to the three readings the criteria reach.

REMAINDER, from the specification — every clause of `rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing`, `rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed` and `rules/integration/an-abandoned-capability-registration-entry-registers-nothing` is stated over a capability — a surface keyed on a name and version, read-capability-by-identity, register-capability, list-capabilities — and reaches no criterion of this task.
The same holds for the capability-keyed half of the clauses in `rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading`, `rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing` and `rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface`, each of which states one fact for both registries at once.
All of it belongs to this epic's task over the capability detail surface.

REMAINDER, from the specification — the authoring-surface clauses of three candidates reach no criterion of this task, no criterion being over a surface composing a configuration for register-connector.
`rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing` states its route over a surface authoring one and enumerates one authoring a configuration nothing has registered yet; `rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering` states its whole subject over the authoring surface, of which this task uses only the destination clause — the surface the authoring was reached from — in the branch where the detail surface holds an edit composed and not submitted, the branch `rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading` defers to it, criterion 1 being unconditional over whether the operator has edited; and `rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing` states its landing over an authoring surface as well as over the presenting surface holding an unsubmitted edit.
Those clauses belong to this epic's task over the connector-configuration authoring surface.

REMAINDER, from the specification — only the negative clause of `rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface` reaches a criterion of this task, at criterion 19.
Its positive clauses reach none: that a surface whose read of the connector name answered and whose fields the operator changed away from that answer is offered the act setting every field back to the content that read answered, that performing it carries no register-connector call and leaves every registered configuration as it stood, that it moves the operator to no other surface, and that it takes effect only where the operator states in a further explicit act that it is to be performed.
They belong to the work over the restore-to-read-content act on this surface.
