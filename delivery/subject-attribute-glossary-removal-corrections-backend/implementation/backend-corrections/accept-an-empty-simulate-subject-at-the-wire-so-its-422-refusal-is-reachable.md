---
target: backend
title: Accept an empty simulate subject at the wire so its 422 refusal is reachable
summary: simulate-case.dto.ts and simulate-hypothesis.dto.ts no longer require attributes.min(1), so buildSubject's
  own SubjectCarriesNoAttributeError (422) is what a caller actually receives for an empty subject.
task: sha256:6ae08b10fdd7e6327dcee17755bbaffe4da49fe0c9c062aabc72d2b6864ac37f
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/backend-corrections-suite-2
files:
- path: src/http/dto/simulate-case.dto.ts
  effect: 'attributes: z.array(subjectAttributeValueSchema) no longer carries .min(1); an empty array
    now parses successfully.'
- path: src/http/dto/simulate-hypothesis.dto.ts
  effect: Same change to the identical subjectSchema's attributes field.
- path: src/__tests__/unit/http/build-app.spec.ts
  effect: The simulate-case empty-attributes test now asserts HTTP 422 and SubjectCarriesNoAttributeError
    instead of 400; the diagnose empty-attributes test is unchanged (diagnose never calls buildSubject).
- path: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  effect: 'New: asserts the schema accepts an empty attributes array, and still rejects every other malformed
    shape (missing subject, missing type, an attribute entry missing its own name or value).'
- path: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  effect: Same new coverage for the identical simulate-hypothesis schema.
criteria:
- criterion: simulate-case.dto.ts's attributes field accepts an empty array at the schema level (no .min(1)
    or equivalent).
  met: true
  how: The .min(1) call was removed; z.array(subjectAttributeValueSchema) alone accepts a zero-length
    array. Proven by simulate-case.dto.spec.ts.
- criterion: simulate-hypothesis.dto.ts's attributes field accepts an empty array at the schema level
    (no .min(1) or equivalent).
  met: true
  how: Same removal in the identical schema. Proven by simulate-hypothesis.dto.spec.ts.
- criterion: A POST to /v1/simulate whose subject carries an empty attributes array answers HTTP 422 reporting
    SubjectCarriesNoAttributeError, never HTTP 400, and never calls runSimulate.
  met: true
  how: With the wire no longer refusing the empty array, buildSubject (already called by the controller
    before runSimulate) throws SubjectCarriesNoAttributeError, mapped to 422 by status-map.ts. Proven
    end-to-end by build-app.spec.ts and at the throw site by simulate-case.controller.spec.ts.
- criterion: A POST to /v1/simulate/hypothesis whose subject carries an empty attributes array answers
    HTTP 422 reporting SubjectCarriesNoAttributeError, never HTTP 400, and never calls runSimulateHypothesis.
  met: true
  how: Same mechanism. Proven at the throw site by simulate-hypothesis.controller.spec.ts and at the schema
    level by simulate-hypothesis.dto.spec.ts; no single test yet exercises the full wire-to-422 path for
    this route (see the proof's own untested note).
- criterion: Every other shape rule the two DTOs already enforce (a missing subject, a missing type, an
    attribute entry missing its own name or value) is unchanged.
  met: true
  how: Only the .min(1) token was removed from each file; every other zod constraint is untouched. Proven
    by the table-driven rejection tests in both new dto.spec.ts files.
- criterion: diagnose.dto.ts and test-connector.dto.ts are not touched.
  met: true
  how: Neither file appears in this delivery's file list; both still carry their own .min(1) unchanged.
nodes:
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  encoded_at:
  - src/http/dto/simulate-case.dto.ts
  - src/http/dto/simulate-hypothesis.dto.ts
  how: The rule's decided refusal (422, SubjectCarriesNoAttributeError) was already encoded in buildSubject
    and status-map.ts; this task removes the wire-level schema constraint that was pre-empting it with
    a generic 400 before either domain check ran, for the two routes that call buildSubject.
preserved:
- buildSubject's own SubjectCarriesNoAttributeError throw for a zero-length attributes array — untouched.
- status-map.ts's mapping of SubjectCarriesNoAttributeError to 422 — untouched.
- Both controllers' call order (buildSubject before runSimulate/runSimulateHypothesis) — untouched.
- Every other DTO shape constraint in both files — untouched.
- diagnose.dto.ts and test-connector.dto.ts — untouched.
deferred:
- what: diagnose.controller.ts's own path, which never calls buildSubject and still refuses an empty subject
    at 400 via diagnose.dto.ts's own .min(1).
  why: A separate decision with its own risk (an empty subject could silently pass a case with no required
    inputs); out of this correction's scope per its own Notes.
- what: test-connector.dto.ts, which carries the same .min(1) clause.
  why: Named out of scope by the task's own criteria; not reached by this correction.
---

## What it is

The `.min(1)` constraint on the simulate subject's `attributes` array is removed from both DTOs, so the already-decided 422 refusal is what a caller receives for an empty subject on these two routes.

## Notes

None.
