---
target: backend
title: Proof for accepting an empty simulate subject at the wire
summary: New schema-level and wire-level tests show both simulate DTOs now admit an empty attributes array
  through to buildSubject's 422 SubjectCarriesNoAttributeError refusal, while every other DTO shape rule
  stays enforced and diagnose/test-connector are left alone.
implementation: sha256:8e6a1821f51ad101ee12679ca9856b78fb45acf04281d1a0ad6526ab7f8f1e22
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/backend-corrections-suite-2
tests:
- file: src/__tests__/unit/http/build-app.spec.ts
  name: answers 422 reporting SubjectCarriesNoAttributeError for a simulate-case request whose subject
    carries no attribute at all, now that the DTO admits the empty array through to the domain refusal
  proves: A POST to /v1/simulate whose subject carries an empty attributes array answers HTTP 422 reporting
    SubjectCarriesNoAttributeError, never HTTP 400, and never calls runSimulate.
  fails_when: the response answers anything other than HTTP 422, or its error.code is anything other than
    'SubjectCarriesNoAttributeError'
- file: src/__tests__/unit/http/simulate-case.controller.spec.ts
  name: refuses a request whose subject carries no attribute-value at all, throwing exactly a SubjectCarriesNoAttributeError,
    before runSimulate is ever called
  proves: the 'never calls runSimulate' half of criterion 3.
  fails_when: handleSimulateCaseRequest calls runSimulate for an empty-attributes subject, or throws anything
    other than SubjectCarriesNoAttributeError
- file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  name: refuses a request whose subject carries no attribute-value at all, throwing exactly a SubjectCarriesNoAttributeError,
    before runSimulateHypothesis is ever called
  proves: the 'never calls runSimulateHypothesis' half of criterion 4.
  fails_when: handleSimulateHypothesisRequest calls runSimulateHypothesis for an empty-attributes subject,
    or throws anything other than SubjectCarriesNoAttributeError
- file: src/__tests__/unit/http/build-app.spec.ts
  name: refuses with 400 a request whose subject carries no attribute at all
  proves: this task leaves diagnose.dto.ts's own shape rule unchanged.
  fails_when: a POST to /v1/diagnose with an empty attributes array stops answering 400
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: accepts a request whose subject carries an empty attributes array, since the schema no longer
    requires at least one entry
  proves: criterion 1.
  fails_when: simulateCaseRequestSchema.safeParse rejects an empty attributes array
- file: src/__tests__/unit/http/dto/simulate-case.dto.spec.ts
  name: still rejects a request with %s, unaffected by the attributes array no longer requiring a minimum
    length
  proves: criterion 5 (simulate-case half).
  fails_when: simulateCaseRequestSchema accepts a request missing its subject, missing the subject's type,
    or carrying an attribute entry missing its own name or value
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: accepts a request whose subject carries an empty attributes array, since the schema no longer
    requires at least one entry
  proves: criterion 2.
  fails_when: simulateHypothesisRequestSchema.safeParse rejects an empty attributes array
- file: src/__tests__/unit/http/dto/simulate-hypothesis.dto.spec.ts
  name: still rejects a request with %s, unaffected by the attributes array no longer requiring a minimum
    length
  proves: criterion 5 (simulate-hypothesis half).
  fails_when: simulateHypothesisRequestSchema accepts a request missing its subject, missing the subject's
    type, or carrying an attribute entry missing its own name or value
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: refuses a subject built with no attribute-value at all with an HTTP 422 response reporting SubjectCarriesNoAttributeError,
    end to end from the refusal buildSubject actually raises
  proves: buildSubject raises SubjectCarriesNoAttributeError for a zero-attribute subject and statusForError
    maps that class to 422.
  fails_when: either mapping breaks
  demonstrates: rules/investigation/a-subject-carries-at-least-one-attribute
not_applicable:
- edge_case: subject.type present but the empty string, rather than absent
  why: criterion 5 names 'a missing type', not an empty-string type; the .min(1) on type itself predates
    this task and was not touched
- edge_case: two simulate-case or simulate-hypothesis requests against the same case sent concurrently
  why: no criterion or node this task implements states concurrent behavior
- edge_case: an attributes array with several entries where only one is malformed
  why: not named by criterion 5's stated set; zod's own per-element validation is unaffected by removing
    only the array-level .min(1)
- edge_case: a non-array value given for attributes
  why: not named by any criterion; z.array()'s own type check is untouched
untested:
- Criterion 4's full wire-level fact (a POST to /v1/simulate/hypothesis with an empty attributes array
  answering 422 end to end through the real route) has no single test exercising it — today it is only
  provable by composing three separate tests (schema acceptance, controller-level throw, status-map mapping);
  no single assertion sends the actual request and checks the composed result.
- Criterion 6's test-connector.dto.ts half is a claim about the diff, not about behavior; direct inspection
  confirms test-connector.dto.ts still declares .min(1) and is absent from this delivery's changed files,
  but no test pins this as a regression guard.
---

## What it is

Eight tests across five files proving every testable criterion of task/backend-corrections/accept-an-empty-simulate-subject-at-the-wire-so-its-422-refusal-is-reachable.

## Notes

None.
