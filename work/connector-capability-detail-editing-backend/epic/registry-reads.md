---
title: Registry read surfaces answer the domain model's own shapes
summary: The capability and connector-configuration read paths under src/http, src/capability-registry and src/connector-registry, corrected and extended to match what the domain model and published contracts already declare.
rationale: The scope presents three items separately, but the inventory found they share one territory — the same src/http, capability-registry, connector-registry and persistence neighborhood, wired through one build-app.ts and one status-map.ts — so I cut one epic rather than three, leaving the split to the tasks underneath it.
covers:
  - domain/integration/connector-configuration
  - contracts/integration/connector-configuration-registry
  - domain/integration/capability
  - contracts/integration/capability-registry
  - rules/integration/a-capability-declares-well-formed-schemas
  - constraints/no-route-enforces-authentication
uncovered:
  - node: rules/integration/a-capability-declares-well-formed-schemas
    why: The inventory traced the malformed "perfil-mobile-tecnico-reader" record to docs/cases/_registry/register.mjs, an out-of-band script outside the declared backend target (src), run at some point against a dist/ build that predated the guard now on disk; refuseMalformedSchemas already covers both schema attributes on every register-capability call today, the seed fixtures do not hold the malformed record, and no coding defect was found in src/ itself. There is nothing under this epic's target for a task to change, and correcting the persisted row or the external script is a data/operational action outside src/, not a source change this plan can produce.
sources:
  - intake/scope.md
---

## What it is

One territory: the capability and connector-configuration read paths, corrected where their wire shape has drifted from the domain model and extended where the domain model already supports a lookup the API does not yet publish.
It covers the connector-configuration value object and its published registry contract, and the capability aggregate root and its published registry contract.
It leaves the malformed capability record untouched, because the inventory found nothing in the declared backend target to change for it.

## Notes

None.
