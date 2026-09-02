---
title: simulate-hypothesis response derives verdict from the shared vocabulary and states the evidence
  snapshot
summary: Derives evaluationSchema's three verdict branch discriminators from src/investigation/verdict.ts's
  exported VERDICTS instead of inline literals, and widens evidenceSchema to require fields and concept_description.
objective: SimulateHypothesisResponseDto's verdict literals are sourced from the shared VERDICTS vocabulary,
  and every field domain/investigation/evidence requires is present, required, and typed correctly.
criteria:
- evaluationSchema's three verdict branches derive their z.literal discriminator from the imported VERDICTS
  array (the same pattern EVALUATION_REASONS and EVIDENCE_RESULTS already use in this file), not from
  a literal typed independently in this file.
- A value of each of the three VERDICTS entries still validates against the corresponding branch after
  the change.
- evidenceSchema requires fields, typed as an array of the field-semantics shape.
- evidenceSchema requires concept_description, typed as a string.
- A SimulateHypothesisResponseDto value that a validated production simulate-hypothesis call actually
  produces validates against the widened schema with no field stripped or rejected.
implements:
- domain/investigation/verdict
- domain/investigation/evidence
sources:
- intake/scope.md
---

## What it is

Derives simulate-hypothesis.dto.ts's verdict literals from the shared VERDICTS vocabulary and
widens its evidenceSchema to state the evidence item's own snapshotted semantics that
domain/investigation/evidence already requires.

## Notes

UNDERDETERMINED, from the specification — criteria 3 and 4 require fields and concept_description present on evidenceSchema but do not hold it to admitting the honest-empty readings domain/investigation/evidence's own Description states (no fields at all for an unresolved capability; an empty concept_description for a concept that declared none), so a schema requiring non-empty values would satisfy every criterion while contradicting the node. A test must exclude a schema that rejects the empty-array/empty-string readings.
UNDERDETERMINED, from the specification — criterion 3's "array of the field-semantics shape" names no shape any candidate states; domain/investigation/field-semantics holds which of name, type and description are required, and a schema departing from that shape (e.g. requiring type and description where the node leaves them optional) still reads as satisfying the criterion as written. A test must hold the shape to what domain/investigation/field-semantics actually declares.
Decision, beyond the covers — stand: domain/investigation/field-semantics is not claimed in implements — this task types a field using that node's already-existing shared TypeScript shape and decides nothing new about it.
ADVISORY, from the binder — criterion 5 is falsifiable only against a captured production simulate-hypothesis payload; no candidate describes that call or its response shape, so the delivery must obtain and the record must point at the payload used.
