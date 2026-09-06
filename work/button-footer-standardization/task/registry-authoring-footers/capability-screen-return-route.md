---
title: Capability screen return route
summary: The standalone Back to capabilities link removed from every capability screen, the route to the listing carried by the shared ButtonFooter instead, on every phase.
rationale: I cut the link removal away from the footer migration because a control appearing and a control disappearing are two outcomes falsified separately, and I made it depend on the migration because the route the scope removes is replaced by the footer the migration introduces.
sources:
- intake/scope.md
objective: Every phase of every capability screen offers the operator a route to the capabilities listing without any standalone Back to capabilities link.
criteria:
- No capability screen renders a link whose accessible name is Back to capabilities, in any of its phases.
- capability-create-screen offers the operator a route to the capabilities listing on every reading.
- capability-detail-screen offers the operator a route to the capabilities listing in its loading phase, its load-error phase and its ready phase alike.
- capability-detail-screen's loading phase states that the capability at that name and version is still being read.
- capability-detail-screen's load-error phase states that the capability at that name and version could not be read, and carries a control whose one effect is to issue that same read again.
- capability-detail-screen's loading phase carries no control that issues the read again, and neither phase re-issues that read on the screen's own initiative.
- Neither the loading phase nor the load-error phase presents any attribute of any capability as the content standing at that identity.
- No spec under frontend/app/src/routes queries a Back to capabilities link.
implements:
- rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
- rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
depends_on:
- task/registry-authoring-footers/capability-form-action-footer
---

## What it is
The removal of the duplicated return route from the two capability screens that carry it, and the footer that carries the route in its place on every phase.
The loading and load-error phases gain a footer they never had, because the route is owed on those readings too.

## Notes
UNDERDETERMINED, from the specification — no criterion names the fourth reading a-single-capability-surface-offers-a-route-to-the-capabilities-listing expressly includes, the read that answered no capability at that identity, which a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed holds apart from the failed window as its own answer.
The implementation that passes renders a distinct reading for an unregistered identity carrying no route to the listing, since no criterion names that reading.
UNDERDETERMINED, from the specification — no criterion holds the registry's refusal of an unregistered identity apart from the load-error phase, which a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed excepts from its failed window.
The implementation that passes routes that refusal into the load-error phase, stating the capability could not be read and offering the reattempt for an identity nothing is registered at.
UNDERDETERMINED, from the specification — the route criterion is satisfied by a footer route alone, and no criterion preserves the abandonment's own destination on the create screen, which an-abandoned-capability-registration-entry-registers-nothing states is the surface the authoring was reached from.
The implementation that passes makes the footer's route the only leaving control, so an operator abandoning the entry always lands on the listing rather than where they came from.
UNDERDETERMINED, from the specification — the route is carried in a shared ButtonFooter and no criterion covers the other surfaces that footer is rendered on, while a-connector-configuration-surface-offers-a-route-to-the-listing owes its own listing on every reading of a connector configuration surface.
The implementation that passes points the shared footer's route at the capabilities listing wherever it is rendered, leaving connector configuration surfaces with no route to theirs.
UNDERDETERMINED, from the specification — this task rewrites the three readings a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface withholds the discard from, and its criteria constrain only the reattempt control.
The implementation that passes carries the discard action in the shared footer alongside the route, offering a discard of an edit no read answered.
