---
title: Registry authoring footers
summary: The capability and connector-configuration authoring screens moving their action rows into the shared ButtonFooter and dropping the standalone Back link above their headings.
rationale: I grouped these two families into one epic because both already expose the same trailingActions slot the footer must be reached through rather than duplicated, both carry the standalone Back link the scope removes, and both are the operator-facing surface of the integration registries.
sources:
- intake/scope.md
covers:
- contracts/integration/capability-registry
- contracts/integration/connector-configuration-registry
- contracts/knowledge/capability-check
- constraints/the-capability-identity-read-refuses-an-unregistered-identity
- constraints/the-concept-read-refuses-an-unanswered-concept
- constraints/listings-are-paged
- rules/integration/an-abandoned-capability-registration-entry-registers-nothing
- rules/integration/a-connector-configuration-authoring-may-be-abandoned-without-registering
- rules/integration/a-single-capability-surface-offers-a-route-to-the-capabilities-listing
- rules/integration/a-connector-configuration-surface-offers-a-route-to-the-listing
- rules/integration/a-capability-keyed-surface-states-a-read-in-flight-and-a-read-that-failed
- rules/integration/a-presented-connector-configuration-states-an-outstanding-or-failed-read
- rules/integration/a-successful-capability-registration-lands-on-the-capabilitys-own-surface
- rules/integration/a-successful-connector-registration-lands-on-the-configurations-own-surface
- rules/integration/a-submitted-registration-states-its-outcome-to-the-operator
- rules/integration/a-loaded-registration-edit-may-be-discarded-without-leaving-the-surface
uncovered:
- node: contracts/knowledge/capability-check
  why: The contract check is the knowledge context's own read of the registry and appears on no screen this plan edits.
- node: constraints/the-capability-identity-read-refuses-an-unregistered-identity
  why: The named refusal is the registry route's own answer, and the detail screen's load-error phase, the only place this plan touches that read, states no refusal condition today and this plan adds none.
- node: constraints/the-concept-read-refuses-an-unanswered-concept
  why: The concept-keyed read is made by no screen this plan edits, since these forms read the concept vocabulary as options rather than resolving a capability for a concept.
- node: constraints/listings-are-paged
  why: The capabilities and connector-configurations listings are where these screens return to, and no task here changes how a page is requested or answered.
- node: contracts/integration/connector-configuration-registry
  why: No task here decides what the registry publishes or answers. The binder over the connector configuration form reported that its criteria reach only what the surface does around calls the implemented rules already name, and the listing destination reaches that task through a-connector-configuration-surface-offers-a-route-to-the-listing rather than through the contract itself. The sibling contract is implemented by the capability form task because that task's criteria reach register-capability's own create-or-replace directly; nothing symmetrical reaches register-connector here.
---

## What it is
The four capability screens and the four connector-configuration screens whose Save rows become the shared ButtonFooter and gain the standard Cancel.
It also holds the removal of the standalone Back link those screens carry above their headings.

## Notes
Both families already thread a `trailingActions?: ReactNode` prop through their form-fields component, and the surveyor records that a second, parallel way of appending buttons must not be added beside it.
Both detail ready views pass a Dialog-triggered Discard button and a conditional saved-status line through that slot.
The capability and connector-configuration detail screens render their Back link once per phase, in loading, load-error and ready alike.
Four existing spec files query the Back links by role and accessible name.
