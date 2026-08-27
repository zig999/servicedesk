---
title: A no-cache composition for simulation
summary: A factory parallel to production-diagnose.factory.ts assembles a simulation's observation source with no cache layer, by construction, so nothing a simulation collects can ever enter a cache.
sources:
  - work/case-simulation-backend/intake/scope.md
objective: A composition/factory parallel to production-diagnose.factory.ts assembles a simulation's observation source with no cache layer, by construction, so nothing a simulation collects can ever enter a cache.
criteria:
  - A simulation composition/factory exists, parallel to production-diagnose.factory.ts, wiring the shared pipeline function and its adapters without any observation-cache layer.
  - The composition is a distinct assembly rather than a conditional inside the production composition — no branch chooses a cached path for simulation.
  - The composition constructs each adapter once per call to the outer factory.
  - Nothing the composition collects is capable of entering a cache, whether or not a cache layer exists elsewhere in the tree.
depends_on:
  - task/case-simulation-pipeline/extract-shared-investigation-pipeline
implements:
  - contracts/investigation/case-simulation
  - rules/investigation/a-simulation-writes-no-investigation
  - scenarios/investigation/a-draft-case-version-is-simulated
  - scenarios/investigation/a-simulation-never-enters-the-cache
---

## What it is

A simulation-shaped sibling of production-diagnose.factory.ts, mirroring createDiagnoseRunner's own generic per-context wiring rather than production-diagnose.factory.ts's Anthropic-fixing shape for its own observation-source composition.

## Notes

None.
