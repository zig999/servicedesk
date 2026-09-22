---
target: backend
title: GlossaryService.removeConcept, refused where anything still names the concept
summary: Seven unit tests over GlossaryService.removeConcept prove the no-usage success path with its
  read-back, each of the four reference-kind refusals as a distinct ConceptInUseError, that a refusal
  leaves the concept held, and that the refusal precedes any delete statement.
implementation: sha256:81fcd85eef9cdee45bd8b25c7ad57d912ca7d3e364a98ef10150754176cc8869
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/concept-removal-remove-concept-operation-suite
tests:
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: removes the concept, so a subsequent read finds nothing held at that name, when nothing answers,
    records, cites or collects it (criterion 1)
  proves: Criterion 1 — the no-refusal branch and its stated read-back, at the service layer readConcept
    already implements.
  fails_when: 'removeConcept throws for a name nothing currently names, or a subsequent readConcept still
    resolves { held: true } for that name afterward.'
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: refuses removal with a ConceptInUseError naming the capability reference, distinct from every
    error registerConcept raises, when a registered capability answers the concept (criteria 2, 8)
  proves: Criterion 2 and criterion 8 together — the specific refusal for a capability-answered concept,
    and that the raised error is ConceptInUseError rather than any error registerConcept already raises.
  fails_when: removeConcept resolves without throwing for a capability-answered concept, or throws an
    error that is not ConceptInUseError, or one that is also an instance of ConceptDescriptionRequiredError
    or DuplicateGlossaryNameError, or whose context.reference is not 'capability'.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: refuses removal with a ConceptInUseError naming the evidence reference when a collected evidence
    item names the concept (criterion 3)
  proves: Criterion 3.
  fails_when: removeConcept resolves without throwing, or the refusal's context.reference is not 'evidence'.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: refuses removal with a ConceptInUseError naming the citation reference when an evaluation citation
    names the concept (criterion 4)
  proves: Criterion 4.
  fails_when: removeConcept resolves without throwing, or the refusal's context.reference is not 'citation'.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: refuses removal with a ConceptInUseError naming the hypothesis-revision-collects reference when
    a hypothesis-revision's own collects lists the concept (criterion 5)
  proves: Criterion 5.
  fails_when: removeConcept resolves without throwing, or the refusal's context.reference is not 'hypothesis-revision-collects'.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: leaves the concept held in the glossary after the removal is refused (criterion 6)
  proves: Criterion 6 — a refused removal leaves the concept still held under that name.
  fails_when: a subsequent readConcept no longer finds the concept held after a refused removal.
- file: src/__tests__/unit/glossary/glossary.service.spec.ts
  name: refuses before any delete statement is issued, so a database constraint violation the store would
    raise on delete never reaches the caller in place of the refusal (criterion 7)
  proves: Criterion 7 — the refusal is raised before any delete statement is issued.
  fails_when: the caught error is the store's own thrown error rather than ConceptInUseError, which would
    only happen if store.deleteConcept were reached before the guard's throw.
not_applicable:
- edge_case: Absent or malformed name input to removeConcept
  why: No criterion of this task states a service-layer validation behavior for the name argument; that
    validation is a sibling route task's remit.
- edge_case: An empty collection returned where one is expected
  why: removeConcept returns Promise<void>; no collection is returned by this operation.
- edge_case: A duplicate registration matching one name
  why: No criterion of this task addresses a duplicate-match scenario for removal; concept identity is
    a single name and registerConcept's own uniqueness handling is untouched by this task.
- edge_case: A dependency (the concept usage reader or the store) that fails or answers slowly during
    removeConcept
  why: No criterion or node of this task states a propagation behavior for a failing or slow dependency
    during removeConcept specifically.
- edge_case: Two removeConcept (or a register/remove) calls against one name at once
  why: No criterion or node of this task states a concurrency behavior for removeConcept.
- edge_case: A boundary at each end of a numeric or length range
  why: name is an unconstrained string in this task's scope; no criterion states a range boundary.
untested:
- 'contracts/glossary/glossary-authoring: the node names the whole published API surface across both register-concept
  and remove-concept, including the transport-level "published" fact; this task''s tests exercise only
  the remove-concept service-layer slice.'
- 'domain/glossary/concept: the node describes the whole value object and its Responsibility of publishing
  the name to every collection, evidence item and citation; this task''s guard and delete touch only the
  name attribute for identity.'
- 'rules/glossary/a-registered-concept-is-never-removed: the node''s fact spans the registering half (a
  separate task''s), the HTTP 409 transport response, and the closing clause about the accepts declaration
  and the subject-type vocabulary — the task''s own Notes state that closing clause reaches no criterion
  of this task. This task''s tests exercise only the removal half''s four reference-kind refusals.'
- 'constraints/the-domain-depends-on-no-infrastructure: a system-wide fitness claim decided by a dependency
  audit over the whole domain layer, not by any single service-level unit test.'
- 'constraints/the-system-persists-to-one-relational-database: a system-wide fitness claim decided by
  the project''s own full test step, not by any single service-level unit test.'
- 'Criterion 9''s claim that the glossary reads no capability, case or investigation store directly is
  a structural absence: confirmed by reading glossary.service.ts''s own imports (its only new dependency
  is IConceptUsageReader; no capability, case or investigation store or port is imported), not by exercising
  code. The port-sourcing half of the same criterion is not independently pinned by a dedicated test,
  since a call-count assertion on the injected reader would bind an internal call rather than an observable
  outcome; it is the same evidence the four reference-kind refusal tests and the no-usage test already
  carry.'
- 'UNDERDETERMINED, from the specification — ''no criterion excludes an implementation that raises ConceptInUseError
  but leaves it absent from the route layer''s status map'': the implementation it names sits at the route/transport
  layer, outside what this service-scoped task implements (its files are glossary.service.ts and concept-in-use.error.ts
  only), so no test in this proof can exercise it.'
- 'UNDERDETERMINED, from the specification — ''the rule''s closing clause ... reaches no criterion of
  this task'': the task''s own Notes observe this absence and state the fact is settled at the store task
  this operation consumes; nothing here holds removeConcept itself to preserving it end to end, so no
  test is invented for it.'
- Implementation-record inferences (the defaulted third constructor parameter's NO_CONCEPT_NAMED default,
  the error context field names concept/reference, the concept-in-use.error.ts file and class naming)
  are shape or behavioral choices the specification does not state; every test in this file injects an
  explicit reader stub rather than relying on the default, so none of these inferences is pinned by a
  test.
---

## What it is
The tests proving remove-concept-operation: the no-usage success path and its read-back, all four reference-kind refusals, the held-after-refusal invariant, and refusal-before-delete ordering.

## Notes
None.
