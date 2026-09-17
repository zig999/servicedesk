---
target: backend
title: Backend removal of the glossary attribute check from simulate-case and simulate-hypothesis
summary: Proves both controllers no longer refuse a simulate call for an attribute name absent from the
  glossary, that their dependency types now declare exactly caseQuery plus their own runner, that the
  factory and every spec construct those dependencies without a glossary, and that a subject carrying
  no attribute at all still ends in a genuine HTTP 422 reporting SubjectCarriesNoAttributeError.
implementation: sha256:9d2b54027e76bc5e24dfc85bbb61c5b68ee61bb3de0254a6ca8be6e333dc4445
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/subject-attribute-check-removal-stop-checking-simulate-suite-3
tests:
- file: src/__tests__/unit/http/simulate-case.controller.spec.ts
  name: answers exactly what runSimulate resolved, calling neither a store nor any other dependency beyond
    caseQuery.readCase
  proves: Criterion — a simulate-case request whose subject carries an attribute name no glossary vocabulary
    holds is not refused for that reason.
  fails_when: the controller ever short-circuits before runSimulate — e.g. if a glossary check were reintroduced
    and rejected an attribute name it does not recognize.
- file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  name: answers exactly what runSimulateHypothesis resolved, calling neither a store nor any other dependency
    beyond caseQuery.readCase
  proves: Criterion — a simulate-hypothesis request whose subject carries an attribute name no glossary
    vocabulary holds is not refused for that reason.
  fails_when: the controller ever short-circuits before runSimulateHypothesis for that attribute name.
- file: src/__tests__/unit/http/simulate-case.controller.spec.ts
  name: SimulateCaseControllerDependencies declares exactly caseQuery and runSimulate — no store, event
    bus or other write-capable dependency the controller could call
  proves: Criteria — SimulateCaseControllerDependencies declares exactly caseQuery and runSimulate; and
    neither controller gains a case-input-requirements coverage refusal in place of the removed check
    (case side).
  fails_when: the type gains, loses or renames a field — in particular a glossary field or a caseInputRequirementsQuery
    field.
- file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  name: SimulateHypothesisControllerDependencies declares exactly caseQuery and runSimulateHypothesis
    — no store, event bus or other write-capable dependency the controller could call
  proves: Criteria — SimulateHypothesisControllerDependencies declares exactly caseQuery and runSimulateHypothesis;
    and neither controller gains a case-input-requirements coverage refusal in place of the removed check
    (hypothesis side).
  fails_when: the type gains, loses or renames a field — in particular a glossary field or a caseInputRequirementsQuery
    field.
- file: src/__tests__/integration/factories/simulate-case-server.factory.spec.ts
  name: reaches simulate-case's own controller through createDiagnoseHttpServer's real composition and
    answers 200 with the complete record for a released-state pinned case version
  proves: Criterion — diagnose-server.factory.ts constructs the simulate-case dependency object with no
    glossary field.
  fails_when: createDiagnoseHttpServer's construction of SimulateCaseControllerDependencies stops compiling
    or stops wiring correctly.
- file: src/__tests__/integration/factories/simulate-hypothesis-server.factory.spec.ts
  name: reaches simulate-hypothesis's own controller through createDiagnoseHttpServer's real composition
    and answers 200 with exactly evidence, one evaluation and durations
  proves: Criterion — diagnose-server.factory.ts constructs the simulate-hypothesis dependency object
    with no glossary field.
  fails_when: createDiagnoseHttpServer's construction of SimulateHypothesisControllerDependencies stops
    compiling or wiring correctly.
- file: src/__tests__/unit/http/simulate-case.controller.spec.ts
  name: refuses a request whose subject carries no attribute-value at all, throwing exactly a SubjectCarriesNoAttributeError,
    before runSimulate is ever called
  proves: Half of the criterion — a simulate-case request with no attribute at all is still refused, reporting
    SubjectCarriesNoAttributeError (the throw half).
  fails_when: the controller stops throwing SubjectCarriesNoAttributeError for an empty attributes array,
    or calls runSimulate anyway.
- file: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  name: refuses a request whose subject carries no attribute-value at all, throwing exactly a SubjectCarriesNoAttributeError,
    before runSimulateHypothesis is ever called
  proves: Half of the criterion — a simulate-hypothesis request with no attribute at all is still refused,
    reporting SubjectCarriesNoAttributeError (throw half).
  fails_when: the controller stops throwing SubjectCarriesNoAttributeError for an empty attributes array,
    or calls runSimulateHypothesis anyway.
- file: src/__tests__/unit/errors/status-map.spec.ts
  name: refuses a subject built with no attribute-value at all with an HTTP 422 response reporting SubjectCarriesNoAttributeError,
    end to end from the refusal buildSubject actually raises
  proves: Criterion — status-map.ts maps SubjectCarriesNoAttributeError to HTTP 422 — together with the
    mapping half of the two no-attribute-at-all criteria.
  fails_when: buildSubject stops throwing SubjectCarriesNoAttributeError for an empty attributes array,
    or status-map.ts stops mapping that class to 422.
  demonstrates: rules/investigation/a-subject-carries-at-least-one-attribute
not_applicable:
- edge_case: Duplicate attribute names within one subject
  why: No criterion of this task, and no node it implements, addresses attribute-name uniqueness; the
    glossary check this task removes never enforced uniqueness either, and buildSubject (untouched) still
    does not.
- edge_case: Two simulate calls against the same subject/case running concurrently
  why: Not a behavior this task's criteria change; rate-limiting and cross-route-independence is pre-existing
    and already covered elsewhere, unaltered by this task's criteria.
- edge_case: A dependency that is slow, unavailable, or answers unexpectedly
  why: This task removes a dependency (the glossary) rather than adding one; no new external call is introduced
    for either controller.
- edge_case: Payload size and authentication boundaries
  why: Unrelated to the glossary-attribute check this task removes; unchanged, pre-existing behavior covered
    elsewhere.
untested:
- 'Criterion — "Neither controller imports refuseAttributesNotInGlossary or IGlossaryQuery": no behavioral
  test decides an import statement''s absence directly; jointly entailed by the type-exactness and non-refusal
  tests above, and guarded going forward by lint (MNT-02) rather than a spec test.'
- 'Criterion — "No spec in src/ constructs a simulate-case or simulate-hypothesis controller dependency
  object carrying a glossary, and none stubs a vocabulary-term read for either controller": confirmed
  by direct reading of every file a whole-tree grep for both dependency type names turns up; no regression
  test guards this totality going forward, since a future spec building such an object through an untyped
  intermediate would not be caught by the type system or by any test in this proof.'
- 'Criterion — "src''s test suite passes": evidenced by the recorded run (run/subject-attribute-check-removal-stop-checking-simulate-suite-3)
  this record cites, not by a single behavior any one spec test asserts.'
- 'Node domain/investigation/subject-attribute-value: its operative claim — an attribute name is free
  text with no dependency on any registry — is a totality over an unbounded set of possible names; no
  finite test decides it whole. The narrower consequence for this task (an arbitrary attribute name is
  not refused via either simulate path) is evidenced above as a representative instance only.'
- 'Node contracts/investigation/glossary-source: declares read-concept as the investigation''s only consumed
  operation from the glossary, a claim spanning most of the investigation module that this task does not
  touch; no criterion here exercises read-concept itself.'
- 'Node rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses: its first
  clause is evidenced by the tests above; its second clause (the concept reaches collection and degrades
  to unavailable) is explicitly out of this task''s scope per its own UNDERDETERMINED note, so no single
  test decides the node''s stated fact whole.'
- The task's own UNDERDETERMINED entry — the second clause above — passes at the collection stage inside
  the shared investigation pipeline, outside this task's own controllers and outside every file this delivery
  touched; per that entry's own account, no test is written or invented for it here.
---

## What it is

Fifteen assertions across nine existing spec files, and one new one (in status-map.spec.ts, chaining buildSubject's real throw into statusForError), proving every criterion of task/subject-attribute-check-removal/stop-checking-simulate-subject-attributes-against-the-glossary against the implementation record.

## Notes

Two earlier suite runs (run/subject-attribute-check-removal-stop-checking-simulate-suite, run/subject-attribute-check-removal-stop-checking-simulate-suite-2) each failed on a different, unrelated pair/triple of pre-existing integration specs (case-version-lifecycle-schema.spec.ts, schema-migrations.spec.ts, protect-released-hypothesis-revision-collects-schema.spec.ts, refuse-altering-a-released-revision-schema.spec.ts, revision-alteration-refused-only-when-released-schema.spec.ts — none in this task's own file set) timing out in a beforeAll/afterAll Postgres client.connect(). Two independent failure-diagnostician runs classed both causes `setup` — connection contention against the lab Postgres test database under full-suite concurrency, never a code or test defect of this delivery. A third run passed clean; its own run directory is what this record's `run` field cites.
