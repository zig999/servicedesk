---
title: Capability removal from the capability's own surface
summary: A removal on the capability detail screen, gated behind a further explicit
  act, with the outcome the api answered disclosed and a successful removal landing
  on the capabilities listing.
rationale: The scope names three surfaces and no grouping; each surface is its own
  epic because a surface, its removal route and the refusal its registry names change
  together and apart from the other two.
sources:
- work/delete-gaps-ui/intake/scope.md
covers:
- domain/integration/capability
- rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act
- rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
- rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing
- rules/integration/a-registered-capability-cited-by-evidence-is-never-removed
- constraints/a-successful-capability-removal-answers-with-no-content
- constraints/the-capability-identity-read-refuses-an-unregistered-identity
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
- constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
- constraints/listings-are-paged
uncovered:
- node: constraints/a-domain-refusal-names-each-domain-noun-by-one-fixed-portuguese-word
  why: It fixes the words in the message text the api's response carries, which this
    plan does not change because the scope leaves the backend unchanged.
- node: constraints/a-domain-refusals-message-is-written-in-brazilian-portuguese
  why: It binds the language of the message text the api's response carries and nothing
    about how a screen renders it, and the scope leaves the backend unchanged.
- node: constraints/listings-are-paged
  why: The capabilities listing is read exactly as it already is, and this plan changes
    no offset or limit that listing requests, so the page the operator lands on stays
    the listing's existing answer.
---

## What it is
The capability detail screen at /capabilities/:name/:version gains a removal, reaching the existing DELETE /v1/capabilities/:name/:version.
The removal is gated behind a further explicit act, its answered outcome is disclosed, and a successful removal takes the operator to /capabilities.

## Notes
None.
