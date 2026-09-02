---
title: simulate-case response states the assessment call-record and the evidence snapshot
summary: Widens SimulateCaseResponseDto's assessmentSchema and evidenceSchema to require the fields domain/investigation/assessment
  and domain/investigation/evidence already declare, so a caller typed against the response can read them.
objective: Every field domain/investigation/assessment and domain/investigation/evidence require is present,
  required, and typed correctly on SimulateCaseResponseDto.
criteria:
- assessmentSchema requires register, typed as the consolidation-register enum.
- assessmentSchema requires usage, typed as the usage shape (input_tokens, output_tokens).
- assessmentSchema requires elapsed_ms, typed as an integer.
- assessmentSchema requires prompt, typed as a string.
- evidenceSchema requires fields, typed as an array of the field-semantics shape.
- evidenceSchema requires concept_description, typed as a string.
- A SimulateCaseResponseDto value that a validated production simulate-case call actually produces validates
  against the widened schema with no field stripped or rejected.
implements:
- domain/investigation/assessment
- domain/investigation/evidence
sources:
- intake/scope.md
---

## What it is

Widens simulate-case.dto.ts's response schema to state the assessment call-record fields and the
evidence item's own snapshotted semantics that domain/investigation/assessment and
domain/investigation/evidence already require.

## Notes

UNDERDETERMINED, from the specification — criteria 5 and 6 require fields and concept_description
present on evidenceSchema but do not hold it to admitting the honest-empty readings
domain/investigation/evidence's own Description states (no fields at all for an unresolved
capability; an empty concept_description for a concept that declared none), so a schema requiring
non-empty values would satisfy every criterion, including criterion 7, while contradicting the
node. A test must exclude a schema that rejects the empty-array/empty-string readings.
ADVISORY, from the binder — register's, usage's and fields' own shapes (the enum's values, usage's
input_tokens/output_tokens, field-semantics' members) live in domain/knowledge/consolidation-register, domain/investigation/usage and domain/investigation/field-semantics, none of which is a candidate of this task.
Decision, beyond the covers — stand: domain/knowledge/consolidation-register is not claimed in implements — this task types a field using that node's already-existing shared TypeScript shape and decides nothing new about it.
Decision, beyond the covers — stand: domain/investigation/usage is not claimed in implements — this task types a field using that node's already-existing shared TypeScript shape and decides nothing new about it.
Decision, beyond the covers — stand: domain/investigation/field-semantics is not claimed in implements — this task types a field using that node's already-existing shared TypeScript shape and decides nothing new about it.
ADVISORY, from the binder — the claim that SimulateCaseResponseDto states the assessment and the
evidence snapshot at all is contracts/investigation/case-simulation's, which is not a candidate of
this task.
Decision, beyond the covers — stand: contracts/investigation/case-simulation is not claimed in
implements — this task widens two of the response's already-declared elements and does not decide
the response's own shape.
ADVISORY, from the binder — the objective claims every field both nodes require, but the criteria
enumerate only the omitted ones; assessment's outcome/referral/text and evidence's other required
attributes are covered only by criterion 7's broad no-field-stripped check against a production
value, not by a criterion naming each one.
