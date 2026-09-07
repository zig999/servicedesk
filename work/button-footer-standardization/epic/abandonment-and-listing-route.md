---
title: Abandonment and the listing route as separate controls
summary: The four capability and connector-configuration registration surfaces — two authoring, two presenting one registration — carrying an act that returns the operator to the surface it was reached from, and a route to the listing, as two controls rather than one.
rationale: The decomposition grouped the four surfaces of Correction 1 under one new epic rather than growing the delivered registry-authoring epic, because that epic's covers is the candidate set of every task already under it and widening the claim would reopen tasks that already hold delivery records; the claim here is exactly the six surface rules these corrections answer plus the discard rule the abandonment must stay distinguishable from.
sources:
- intake/scope-review-corrections.md
covers:
- rules/integration/an-abandoned-capability-registration-entry-registers-nothing
- rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
- rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
- rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
- rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
- rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
- rules/integration/an-abandonment-with-no-surface-to-return-to-lands-on-the-registrys-listing
- rules/integration/a-single-registration-surface-offers-a-return-to-its-origin-on-every-reading
- rules/integration/a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under
uncovered:
- node: rules/integration/a-presented-connector-configuration-states-a-connector-name-nothing-is-registered-under
  why: Planning decided this rule while writing the criteria for the connector-configuration detail
    surface, because the return-to-origin act is owed on the reading whose read answered that nothing
    is registered under the named connector and no node stated what that reading tells the operator.
    Delivering it is a fourth presentation of that surface, with its own state and its own statement,
    where the surface holds three today and answers that refusal as the failed window — a change to
    what a person using the system can learn, and one the scope this plan was cut from does not ask
    for. The human settled that it stays outside this scope, so both detail tasks were narrowed to
    reach only the outstanding, failed and shown readings, and no task of this plan implements it.
    The reading it governs is left exactly as delivered; nothing here regresses, and closing it is a
    new initiative's, which the plan's own decision log records the fact and the reasoning for.
---

## What it is
The two obligations one control carries today on the capability creation surface, the capability detail surface, the connector-configuration creation surface and the connector-configuration detail surface, separated into an abandonment and a route to the listing.
The abandonment lands the operator on the surface the authoring was reached from, in the shape the two knowledge-surface hooks already use.
The route to the listing stands on its own and is present on every reading, including the readings whose backing read is outstanding or has failed.

## Notes
The two rules holding over each of these surfaces read together without conflict, and each says so of the other in its own description: the abandonment rule declares the listing route's obligation untouched and observes that whoever wanted the listing takes the route owed them anyway, and the route rule declares that no property of the control carrying it is evaluated and that a control among the surface's own actions satisfies it.
Four surfaces are cut as four tasks because each holds its own readings, its own hook and its own proofs, and each is demonstrable without the other three.
The two detail tasks reach the readings whose read is outstanding, has failed, or has answered the registration, and not the reading whose read answered that nothing is registered there: that fourth reading is a presentation this plan's one `uncovered` entry states the reason for.
