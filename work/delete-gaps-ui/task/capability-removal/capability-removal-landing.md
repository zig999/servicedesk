---
title: Land on the capabilities listing after a successful removal
summary: 'Where the operator is taken once a capability removal succeeds: the capabilities
  listing, never the removed identity''s surface.'
rationale: Cut apart from the gate and the disclosure because the landing rule changes
  independently of both.
sources:
- work/delete-gaps-ui/intake/scope.md
objective: After a successful capability removal, the operator is on the capabilities
  listing and never on the removed capability's surface.
criteria:
- After a removal answered with HTTP 204, the operator is at /capabilities.
- After a removal answered with HTTP 204, the operator is at /capabilities even when
  navigation history holds an earlier entry.
- After a removal answered with HTTP 204, the capabilities listing shows no row for
  the removed name and version.
- After a removal answered with HTTP 204, the refusal of a read of the removed name
  and version is never shown.
depends_on:
- task/capability-removal/capability-removal-control
implements:
- rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing
- constraints/a-successful-capability-removal-answers-with-no-content
- constraints/the-capability-identity-read-refuses-an-unregistered-identity
---



## What it is
A navigation to /capabilities on a successful removal from the capability's surface.

## Notes
UNDERDETERMINED, from the specification — No criterion ties the landing to a removal that succeeded; every criterion starts from "a removal answered with HTTP 204" and none says what happens on any other answer or before any answer arrives, while rules/integration/a-submitted-removal-states-its-outcome-to-the-operator requires the issuing surface to state a refusal there and to state neither outcome before the api answers. A reading that would still pass every criterion: A surface that navigates to /capabilities as soon as the removal is issued, or on any answer at all including a refusal, satisfying all four criteria while leaving the issuing surface before any refusal is stated.
ADVISORY, from the specification — Taken literally, "the refusal of a read of the removed name and version is never shown" would reach the operator's own later navigation back to that address (Back, or opening it directly); read as bounded to the transition that follows the HTTP 204 answer, the criterion is backed by the rule's own clause limiting only where the system takes the operator.
ADVISORY, from the specification — The path /capabilities in criteria 1 and 2 appears in no candidate; the rule names the destination only as "the listing of registered capabilities", taken to be that listing's existing address rather than a specification fact.
REMAINDER, from the specification — The concept and connector-configuration clauses of rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing reach no criterion here. It belongs to: The sibling tasks, under their own epics, that land a successful concept removal and a successful connector-configuration removal on their own listings.
REMAINDER, from the specification — The route-side clauses of constraints/a-successful-capability-removal-answers-with-no-content (HTTP 204 with no body, the same answer whether a capability stood at that identity or none did) reach no criterion here; this task only reacts to that answer. It belongs to: The task that implements the HTTP answer of the registry's remove-capability route.
REMAINDER, from the specification — The route-side clause of constraints/the-capability-identity-read-refuses-an-unregistered-identity (HTTP 404 CapabilityIdentityNotFoundError) reaches no criterion here; this task only consumes it as the refusal criterion 4 says must not be shown. It belongs to: The task that implements the HTTP refusal of the registry's read-capability-by-identity route.
