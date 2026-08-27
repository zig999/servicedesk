---
title: Evidence carries its own collection elapsed_ms
summary: evidence-collection-stage.ts records how long each concept's own collection attempt took, on every Evidence item it assembles.
sources:
  - work/case-simulation-backend/intake/scope.md
objective: evidence-collection-stage.ts records how long each concept's own collection attempt took, in milliseconds, on every Evidence item it assembles.
criteria:
  - Every Evidence item evidenceOf constructs carries an elapsed_ms integer, whatever the result (ok, unavailable, denied, timeout).
  - elapsed_ms reflects the wall-clock time of that one concept's own collection attempt.
  - No Evidence item is constructed without elapsed_ms once this task lands.
implements:
  - domain/investigation/evidence
---

## What it is

evidenceOf/EvidenceEnding gains a per-concept elapsed_ms on every branch it can return.

## Notes

None.
