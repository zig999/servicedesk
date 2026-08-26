---
title: Stale citations are corrected across nine locations
summary: Nine comments and constants that restated a superseded reading of the specification now reflect, or cite, it as it currently stands.
objective: No comment or constant in the touched files restates a reading of the specification that the two same-day analysis increments superseded; each now reflects, or cites, the node as it currently stands.
criteria:
  - The header comment in status-map.ts no longer claims that no specification node fixes a status as a decided fact; it states that some domain errors' statuses are now specification-stated while others remain the project's own decision.
  - The comment above readCapabilityByIdentity in capability-registry.service.ts no longer states that the operation is outside the published capability-registry contract.
  - The comments in read-capability-by-identity.controller.ts no longer claim the operation is unpublished or that its refusal's transport status is undecided by the specification.
  - The comment in read-connector-configuration.controller.ts no longer claims the transport status of an unregistered-name read is undecided by the specification.
  - The header comment in connector-configuration-registry.service.ts no longer states that an absent connector configuration is never an error.
  - Each of the three pageCountOf comments, in capability-registry.service.ts, connector-configuration-registry.service.ts and glossary.service.ts, no longer claims that no source states what a non-positive limit answers.
  - The comment above DEFAULT_STATUS_ENDING in http-declarative-observation-source.adapter.ts no longer claims that no specification node states a default classification for an unclassified status.
  - None of the four citations of the discarded task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome path remain in glossary-store.port.ts, glossary.service.ts or relational-glossary-store.repository.ts; each cites rules/glossary/the-non-conclusion-outcomes-precede-the-first-case instead.
  - The comment accompanying CAPABILITY_NATURES and REQUIRED_REGISTRATION_ATTRIBUTES in capability.ts no longer attributes the concept field to the wrong domain-service.
rationale: I bundled all nine locations into one task with one criterion per location, since they share one cause (comments and constants that did not follow same-day specification changes) and none carries independent business risk; splitting them into nine tasks would multiply near-identical work with no falsifiable difference between them.
implements:
  - contracts/integration/capability-registry
  - constraints/the-capability-identity-read-refuses-an-unregistered-identity
  - rules/integration/a-connector-configuration-read-by-an-unregistered-name-is-refused
  - constraints/listings-are-paged
  - rules/integration/an-unclassified-status-ends-unavailable
  - rules/glossary/the-non-conclusion-outcomes-precede-the-first-case
  - domain/integration/capability
sources:
  - intake/scope.md
---

## What it is

Nine files' comments or constants are edited to match the specification nodes they discuss, as those nodes currently read.

## Notes

REMAINDER, from the specification — rules/glossary/the-non-conclusion-outcomes-precede-the-first-case's
statement carries two further clauses beyond the one this task's criterion 8 reaches (that ensuring
adds only what is missing and rewrites nothing already held, and that an outcome a released case
version or released hypothesis revision names is never removed): this task's criterion only
requires the stale citation to be replaced by this node's identity, not that the ensure/never-remove
behavior be (re)implemented or verified here. It belongs to the already-delivered corrective task
that implemented the glossary's ensure-two-non-conclusion-outcomes behavior (formerly cited as
task/ensure-non-conclusion-outcomes-hotfix/tolerate-permanent-outcome), not this citation-correction
task.
