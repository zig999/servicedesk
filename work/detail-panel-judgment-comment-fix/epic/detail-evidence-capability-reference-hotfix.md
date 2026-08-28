---
title: Detail evidence capability-reference shape hotfix
summary: The one corrective task that fixes case-simulation-cockpit-adapters.ts's
  own Detail evidence reading its capability reference as a nested object no simulate
  response ever sends.
rationale: A corrective increment cuts no epic through survey/decomposition -- this
  is the structural container the validator still requires, holding exactly the one
  task's own claim.
covers:
- domain/investigation/evidence
- domain/integration/capability
sources:
- intake/detail-evidence-capability-shape-scope.md
---

## What it is

A single-task epic for the corrective increment fixing the Detail panel's crash: its Evidence
tab read one evidence item's capability reference as a nested `capability: { name, version }`
object, a shape neither `POST /v1/simulate` nor `POST /v1/simulate/hypothesis` ever sends -- both
send it as two flat fields, `capability_name` and `capability_version`.

## Notes

None.
