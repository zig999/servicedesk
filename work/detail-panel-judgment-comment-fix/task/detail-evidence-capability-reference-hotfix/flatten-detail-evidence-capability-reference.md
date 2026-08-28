---
title: Read the Detail evidence's capability reference as the two flat fields the
  wire actually sends
summary: 'Fixes toDetailEvidence (case-simulation-cockpit-adapters.ts) and the Evidence
  tab''s capability line (case-simulation-detail-evidence-tab.tsx) to read capability_name/capability_version
  as flat fields, matching both simulate endpoints'' real wire shape, instead of a
  nested capability: { name, version } object that neither endpoint ever sends.'
rationale: 'Cut as a corrective increment: running the delivered simulation cockpit
  against a real case (POST /v1/simulate/hypothesis) crashed the Detail panel with
  "Cannot read properties of undefined (reading ''name'')" -- an already-delivered
  task read one evidence item''s capability reference as a nested object no simulate
  response has ever sent. This answers to no criterion any prior task held; it is
  a wrong behavior in already-delivered code, found by running the system.'
sources:
- intake/detail-evidence-capability-shape-scope.md
objective: Opening the Detail panel for any hypothesis evaluation, produced by either
  simulate endpoint (POST /v1/simulate or POST /v1/simulate/hypothesis), never crashes,
  and its Evidence tab's capability/connector line renders the real capability name,
  version and connector for each evidence item.
criteria:
- Opening the Detail panel for an evaluation produced by POST /v1/simulate/hypothesis
  does not throw or show "Something went wrong" for a well-formed response.
- Opening the Detail panel for an evaluation produced by POST /v1/simulate does not
  throw or show "Something went wrong" for a well-formed response.
- The Evidence tab's capability/connector line reads capability_name and capability_version
  as flat fields of the evidence item, never as a nested capability object.
- SimulateEvidenceItem (frontend/app/src/hooks/use-simulate-case.ts) declares capability_name
  and capability_version as flat string fields, matching src/src/http/dto/simulate-case.dto.ts's
  own evidenceSchema, instead of a nested capability object.
implements:
- domain/investigation/evidence
- domain/integration/capability
---

## What it is

The corrective task fixing the Detail panel's crash on a real simulation run: its Evidence tab
read one evidence item's capability reference as a nested `capability: { name, version }` object,
a shape neither `POST /v1/simulate` nor `POST /v1/simulate/hypothesis` ever sends -- both send it
as two flat fields, `capability_name` and `capability_version`.

## Notes

None.
