---
title: Accept an empty simulate subject at the wire so its 422 refusal is reachable
summary: simulate-case.dto.ts and simulate-hypothesis.dto.ts stop refusing an empty attributes array at the schema level, so buildSubject's own SubjectCarriesNoAttributeError (422) is what a caller actually receives.
rationale: One task across both DTOs and both controller specs because they share one bug — the same z.array(...).min(1) clause, on the same field, causing the same pre-emption of the same domain refusal — and fixing one without the other would leave the sibling operation still contradicting the decided rule.
sources:
- intake/scope.md
objective: A simulate-case or simulate-hypothesis request whose subject carries no attribute at all is refused with HTTP 422 reporting SubjectCarriesNoAttributeError, not HTTP 400.
criteria:
- simulate-case.dto.ts's attributes field accepts an empty array at the schema level (no .min(1) or equivalent).
- simulate-hypothesis.dto.ts's attributes field accepts an empty array at the schema level (no .min(1) or equivalent).
- A POST to /v1/simulate whose subject carries an empty attributes array answers HTTP 422 reporting SubjectCarriesNoAttributeError, never HTTP 400, and never calls runSimulate.
- A POST to /v1/simulate/hypothesis whose subject carries an empty attributes array answers HTTP 422 reporting SubjectCarriesNoAttributeError, never HTTP 400, and never calls runSimulateHypothesis.
- Every other shape rule the two DTOs already enforce (a missing subject, a missing type, an attribute entry missing its own name or value) is unchanged.
- diagnose.dto.ts and test-connector.dto.ts are not touched.
implements:
- rules/investigation/a-subject-carries-at-least-one-attribute
---

## What it is
Removes the `.min(1)` (or equivalent) constraint from the `attributes` array in both simulate DTOs, so an empty array is a well-formed request the domain gets to see — and `buildSubject`, called by both controllers already, is what refuses it, with the status and error class the specification already decided.
The two `build-app.spec.ts` tests locking in 400 for this exact request are rewritten to assert 422 and the named error class instead.

## Notes
`buildSubject` (src/investigation/subject.ts) already throws `SubjectCarriesNoAttributeError` for a zero-length attributes array, and `status-map.ts` already maps that class to 422 — this task changes no domain or error-mapping code, only the wire-level schema that was pre-empting both.
diagnose.controller.ts never calls buildSubject and test-connector.dto.ts carries the same `.min(1)` clause; neither is this task's to touch — extending the fix to either is a separate decision with its own risk (an empty subject silently passing a case with no required inputs, for diagnose) that this correction does not make.
