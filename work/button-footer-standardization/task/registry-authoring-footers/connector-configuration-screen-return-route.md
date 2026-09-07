---
title: Connector configuration screen return route
summary: The standalone Back to connector configurations link removed from every connector-configuration screen, the route to the listing carried by the shared ButtonFooter instead, on every phase.
rationale: I cut the link removal away from the footer migration because a control appearing and a control disappearing are two outcomes falsified separately, and I made it depend on the migration because the route the scope removes is replaced by the footer the migration introduces.
sources:
- intake/scope.md
objective: Every phase of every connector-configuration screen offers the operator a route to the connector-configurations listing without any standalone Back to connector configurations link.
criteria:
- No connector-configuration screen renders a link whose accessible name is Back to connector configurations, in any of its phases.
- connector-configuration-create-screen offers the operator a route to the connector-configurations listing on every reading.
- connector-configuration-detail-screen offers the operator a route to the connector-configurations listing in its loading phase, its load-error phase and its ready phase alike.
- connector-configuration-detail-screen's loading phase states that the configuration is still being read and states no value of connector or configuration.
- connector-configuration-detail-screen's load-error phase states that the configuration could not be read, states no value of connector or configuration, and carries an action that re-issues that same read.
- connector-configuration-detail-screen's loading phase carries no action re-issuing the read, and no read is issued again except by the operator taking that action.
- connector-configuration-detail-screen's ready phase presents the connector name and the configuration exactly as the read answered them.
- No spec under frontend/app/src/routes queries a Back to connector configurations link.
implements:
- rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
- rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
depends_on:
- task/registry-authoring-footers/connector-configuration-form-action-footer
---

## What it is
The removal of the duplicated return route from the two connector-configuration screens that carry it, and the footer that carries the route in its place on every phase.
The loading and load-error phases gain a footer they never had, because the route is owed on those readings too.

## Notes
UNDERDETERMINED, from the specification — no criterion holds the control carrying the listing route to writing nothing, which a-connector-configuration-surface-offers-a-route-to-the-listing states and which a-successful-connector-registration-lands-on-the-configurations-own-surface separately bears on by refusing the listing as a successful submission's destination.
The implementation that passes carries the route as a control that submits register-connector and then lands the operator on the listing.
UNDERDETERMINED, from the specification — no criterion reaches the clause that the route does not turn on how the operator reached the surface; both route criteria are satisfiable by a reading that varies with arrival rather than with phase.
The implementation that passes renders the route only when navigation state records an arrival from the listing, and none on a screen loaded directly at its address.
UNDERDETERMINED, from the specification — no criterion states which controls the shared footer carries in the detail screen's loading and load-error phases or on the create screen, while a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface withholds the discard from all three.
The implementation that passes renders the discard control uniformly in all three phases and on the create screen.
UNDERDETERMINED, from the specification — no criterion distinguishes the route the footer must carry from the abandonment the footer already carries, whose destination a-connector-configuration-authoring-may-be-abandoned-without-registering states is the surface the authoring was reached from.
The implementation that passes carries a single control serving as both, landing every operator on the listing including the one who arrived from elsewhere.
