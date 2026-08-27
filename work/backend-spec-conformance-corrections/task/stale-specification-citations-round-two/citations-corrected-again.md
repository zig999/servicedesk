---
title: Stale citations corrected across six locations, round two
summary: Six comments and docstrings that restated a superseded reading of the specification now reflect, or cite, it as it currently stands.
objective: No comment or docstring in the six touched files restates a reading of the specification that the two same-day analysis increments (b6012c3, 5427816) superseded; each now reflects, or cites, the node as it currently stands.
criteria:
  - The header comment in status-map.ts no longer describes ConnectorConfigurationNotWellFormedError's 422 status as this project's own engineering decision; it states, consistently with the map entry a few lines below it, that this status is a fact rules/integration/a-connector-configuration-holds-a-well-formed-object decides.
  - The observeConcept() docstring in fake-observation-source.adapter.ts no longer types the four evidence-result endings as unattributed prose; it cites domain/investigation/evidence-result by identity.
  - The readConcepts() docstring in glossary-store.port.ts no longer states the ttl-absent claim without attribution; it cites rules/knowledge/a-collected-concept-declares-a-ttl by identity.
  - The refuseContractDepartures docstring in capability-registry.service.ts describes both the non-integer and the non-positive timeout boundaries, and no longer cites the schema as z.number().int() alone.
  - The wellFormedConfiguration docstring in connector-configuration-registry.service.ts no longer states that the specification does not decide whether an absent configuration is malformed or incomplete; it states the decided classification.
  - The header comment in test-connector.controller.ts no longer describes the credential masking as this controller's own inference with no specification node stating it; it cites rules/integration/a-diagnostic-response-masks-a-resolved-credential by identity.
rationale: I bundled all six locations into one task with one criterion per location, the same shape the first round of citation corrections used, since they share one cause (comments that did not follow analysis increments landing after they were written) and none carries independent business risk.
implements:
  - rules/integration/a-connector-configuration-holds-a-well-formed-object
  - domain/investigation/evidence-result
  - rules/knowledge/a-collected-concept-declares-a-ttl
  - rules/integration/a-capability-declares-its-contract
  - rules/integration/a-diagnostic-response-masks-a-resolved-credential
sources:
  - intake/2026-08-26-stale-citations-round-two.md
---

## What it is

Six files' comments or docstrings are edited to match the specification nodes they discuss, as those nodes currently read. No behavior changes.

## Notes

None.
