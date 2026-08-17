---
title: Capability registry HTTP surface
summary: The one new listing extension to ICapabilityQuery and the two HTTP routes that resolve or list a registered capability.
rationale: Groups the two capability-registry operations the scope's table (§0) names together with the capability aggregate and the concept it answers, since read-capability's own response surfaces a concept — the same node glossary-query-http already claims, an overlap the contract allows.
covers:
  - contracts/integration/capability-registry
  - domain/integration/capability
  - domain/glossary/concept
  - domain/integration/capability-registry
  - rules/integration/one-capability-answers-one-concept
uncovered:
  - node: domain/glossary/concept
    why: Every binder over this epic's own three tasks (list-capabilities-query-extension, read-capability-route, list-capabilities-route) found concept a neighbor rather than a governing fact — none of their criteria test a concept's own attributes or rules, only a capability's. glossary-query-http's own tasks (list-concepts-query-extension, read-concept-route, list-concepts-route) already implement this node directly; this epic's claim on it was the declared overlap its own rationale names, not a second implementation.
sources:
  - intake/scope.md
---

## What it is

One new read-only ICapabilityQuery operation: listCapabilities.
Two HTTP routes: read-capability (already a domain operation), list-capabilities.

## Notes

None.
