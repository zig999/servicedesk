---
title: Connector configuration removal from the configuration's own surface
summary: A removal on the connector configuration detail screen, gated behind a further
  explicit act, with the outcome the api answered disclosed and a successful removal
  landing on the connectors listing.
rationale: The scope names three surfaces and no grouping; each surface is its own
  epic because a surface, its removal route and its registry's removal rule change
  together and apart from the other two, and no task here recognises a refusal code
  because remove-connector raises no domain error of its own.
sources:
- work/delete-gaps-ui/intake/scope.md
covers:
- domain/integration/connector-configuration
- rules/integration/a-removal-surface-offers-a-control-behind-a-further-explicit-act
- rules/integration/a-submitted-removal-states-its-outcome-to-the-operator
- rules/integration/a-successful-removal-lands-on-the-removed-entitys-own-listing
- rules/integration/removing-a-connector-configuration-is-unconditional
- constraints/a-successful-connector-configuration-removal-answers-with-no-content
- rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
- constraints/a-domain-error-unmapped-by-status-is-refused-generically
- constraints/a-malformed-request-is-refused-with-a-validation-error
- constraints/listings-are-paged
uncovered:
- node: constraints/listings-are-paged
  why: The connectors listing is read exactly as it already is, and this plan changes
    no offset or limit that listing requests, so the page the operator lands on stays
    the listing's existing answer.
- node: rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  why: This epic's tasks only avoid showing that refusal after a successful removal, a clause
    the landing rule already carries by citing this read rule; no task here implements the read
    rule's own refusal, which governs read-connector-configuration and the surface's handling of
    a name nothing is registered under, neither of which this plan changes.
---

## What it is
The connector configuration detail screen at /connectors/:connector gains a removal, reaching the existing DELETE /v1/connectors/:connector.
The removal is gated behind a further explicit act, its answered outcome is disclosed, and a successful removal takes the operator to /connectors.

## Notes
None.
