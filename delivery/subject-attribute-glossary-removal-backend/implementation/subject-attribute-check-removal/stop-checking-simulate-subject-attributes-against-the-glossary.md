---
target: backend
title: Remove the glossary attribute check from simulate-case and simulate-hypothesis
summary: The two simulate controllers stop calling refuseAttributesNotInGlossary and stop declaring a
  glossary dependency; every call site that supplied one — the server factory and every spec that constructed
  the dependency object — is updated to match, and status-map.ts now maps SubjectCarriesNoAttributeError
  to 422.
task: sha256:57f179520a346749bfadbf01310c6d37602674cc122c124835822172c9346aaa
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/subject-attribute-check-removal-stop-checking-simulate-build-2
files:
- path: src/http/simulate-case.controller.ts
  effect: Removed the refuseAttributesNotInGlossary call, the glossary field from SimulateCaseControllerDependencies,
    and the IGlossaryQuery/refuseAttributesNotInGlossary imports. handleSimulateCaseRequest still invokes
    buildSubject(body.subject.type, body.subject.attributes) as a bare statement — for its own throw of
    SubjectCarriesNoAttributeError on an empty attribute set — without binding its result, since nothing
    downstream reads it anymore.
- path: src/http/simulate-hypothesis.controller.ts
  effect: Same removal — the glossary field, the refuseAttributesNotInGlossary call and its imports are
    gone; buildSubject is still called as a bare statement for its own refusal, unbound, since its result
    is otherwise unused.
- path: src/factories/diagnose-server.factory.ts
  effect: simulateCase and simulateHypothesis are now constructed as { caseQuery, runSimulate } and {
    caseQuery, runSimulateHypothesis } with no glossary field; the now-unused createGlossaryQuery import
    is removed.
- path: src/errors/status-map.ts
  effect: Added SubjectCarriesNoAttributeError to STATUS_BY_ERROR_CLASS mapped to 422, alongside its import.
- path: src/__tests__/unit/http/simulate-case.controller.spec.ts
  effect: buildDependencies no longer builds or returns a glossary/readVocabularyTerm mock; the expectTypeOf
    assertion and the "calling neither..." assertion drop glossary; the two tests asserting the glossary
    refusal (SubjectAttributeNotInGlossaryError and the attribute-naming test) are removed since they
    tested the check this task removes. The no-attribute-at-all SubjectCarriesNoAttributeError test is
    unchanged.
- path: src/__tests__/unit/http/simulate-hypothesis.controller.spec.ts
  effect: Same shape of change as the case controller spec.
- path: src/__tests__/unit/http/simulate-case.routes.spec.ts
  effect: buildTestApp no longer constructs an IGlossaryQuery stub or passes glossary into SimulateCaseControllerDependencies;
    the now-unused import is removed.
- path: src/__tests__/unit/http/simulate-hypothesis.routes.spec.ts
  effect: Same change for the hypothesis route spec.
- path: src/__tests__/unit/http/build-app.spec.ts
  effect: stubSimulateCase and stubSimulateHypothesis no longer take or set a glossaryQuery; stubGlossaryQuery
    and glossaryQuery remain, now serving only the unrelated readVocabularyTerm/listVocabularyTerms/readConcept/listConcepts
    fields via stubQueryDependentFields.
- path: src/__tests__/unit/http/route-rate-limiting-cross-route-independence.spec.ts
  effect: Removed the now-unused freshGlossaryQuery helper and its IGlossaryQuery/TermResolution import;
    freshSimulateCaseDependencies and freshSimulateHypothesisDependencies no longer carry a glossary field.
- path: src/__tests__/integration/http/diagnose-e2e.spec.ts
  effect: buildSimulateCase/buildSimulateHypothesis dropped their connection parameter and the glossary
    field they built from it; the now-unused createGlossaryQuery import is removed.
- path: src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts
  effect: Same change — buildSimulateCase/buildSimulateHypothesis drop the delayingConnection parameter
    and the glossary field; the now-unused createGlossaryQuery import is removed.
criteria:
- criterion: A simulate-case request whose subject carries an attribute name no glossary vocabulary holds
    is not refused for that reason.
  met: true
  how: handleSimulateCaseRequest no longer calls refuseAttributesNotInGlossary, and runInvestigationPipeline
    (what dependencies.runSimulate ultimately resolves to for production) never calls buildInvestigation/refuseAttributesNotInGlossary
    either — it calls buildSubject, collectEvidence, judgeHypotheses, resolveAndNarrow and draftAssessment.
    No remaining path from this controller reaches that check.
- criterion: A simulate-hypothesis request whose subject carries an attribute name no glossary vocabulary
    holds is not refused for that reason.
  met: true
  how: Same removal in handleSimulateHypothesisRequest; simulate-hypothesis-pipeline.ts holds no call
    to buildInvestigation or refuseAttributesNotInGlossary either.
- criterion: SimulateCaseControllerDependencies declares exactly caseQuery and runSimulate.
  met: true
  how: The type in simulate-case.controller.ts now declares only those two fields.
- criterion: SimulateHypothesisControllerDependencies declares exactly caseQuery and runSimulateHypothesis.
  met: true
  how: The type in simulate-hypothesis.controller.ts now declares only those two fields.
- criterion: Neither controller imports refuseAttributesNotInGlossary or IGlossaryQuery.
  met: true
  how: Both imports are removed from both controller files; grepped clean afterward.
- criterion: Neither controller gains a case-input-requirements coverage refusal in place of the removed
    check.
  met: true
  how: Neither controller file imports ICaseInputRequirementsQuery, refuseSubjectMissingRequiredCaseInputs
    or SubjectDoesNotCoverCaseInputsError; nothing was added beyond removing the glossary call.
- criterion: diagnose-server.factory.ts constructs both controller dependency objects with no glossary
    field.
  met: true
  how: simulateCase is now { caseQuery, runSimulate } and simulateHypothesis is { caseQuery, runSimulateHypothesis
    }; the createGlossaryQuery calls that built the removed field, and the now-unused import, are gone.
- criterion: A simulate-case request whose subject carries no attribute at all is still refused with an
    HTTP 422 response reporting SubjectCarriesNoAttributeError.
  met: true
  how: buildSubject (untouched, pre-existing) still throws SubjectCarriesNoAttributeError for an empty
    attributes array — the controller still calls it as a bare statement precisely for this throw — and
    status-map.ts now maps that class to 422, so handleUnexpectedError answers 422 wherever this error
    reaches it.
- criterion: A simulate-hypothesis request whose subject carries no attribute at all is still refused
    with an HTTP 422 response reporting SubjectCarriesNoAttributeError.
  met: true
  how: Same mechanism — handleSimulateHypothesisRequest calls the same buildSubject, and the same status-map.ts
    entry answers it.
- criterion: status-map.ts maps SubjectCarriesNoAttributeError to HTTP 422.
  met: true
  how: Added [SubjectCarriesNoAttributeError, 422] to STATUS_BY_ERROR_CLASS, alongside its import, following
    the file's own one-map convention (COR-04).
- criterion: No spec in src/ constructs a simulate-case or simulate-hypothesis controller dependency object
    carrying a glossary, and none stubs a vocabulary-term read for either controller.
  met: true
  how: Every spec found constructing SimulateCaseControllerDependencies or SimulateHypothesisControllerDependencies
    — the two controller specs, the two routes specs, build-app.spec.ts, route-rate-limiting-cross-route-independence.spec.ts,
    and the two diagnose e2e integration specs (found by grepping for the two type names across src/,
    not only the files the task's own narrative names) — no longer supplies a glossary field or a readVocabularyTerm
    stub for either controller's own dependency object.
- criterion: src's test suite passes.
  met: true
  how: run/subject-attribute-check-removal-stop-checking-simulate-build-2 passed install, typecheck, lint,
    secret-scan and test-unit; the lint failure from the first attempt (subject assigned but never read)
    was fixed by calling buildSubject as a bare, unbound statement in both controllers.
nodes:
- node: domain/investigation/subject-attribute-value
  encoded_at:
  - src/investigation/subject.ts
  how: The value object's shape (attribute, value) is unchanged; this task only removes a consumer of
    the glossary that used to check the attribute name against a governed vocabulary. The node itself
    already states the name is free text rather than a governed term, which is what this removal now makes
    true for simulate as well as for the rest of the investigation domain.
- node: contracts/investigation/glossary-source
  encoded_at:
  - src/http/simulate-case.controller.ts
  - src/http/simulate-hypothesis.controller.ts
  how: The node declares read-concept as the investigation's only consumed operation from the glossary.
    Removing refuseAttributesNotInGlossary from both simulate controllers is what makes a vocabulary-term
    read no longer a consumed operation from either of them; nothing in the edited files still reads a
    vocabulary term.
- node: rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses
  encoded_at:
  - src/http/simulate-case.controller.ts
  - src/http/simulate-hypothesis.controller.ts
  how: 'The rule''s first clause — a simulate call is never refused for a subject omitting an attribute
    a case-input-requirement names required — already held before this task, since neither controller
    ever carried a case-input-requirements check; this task''s own criterion barring the controllers from
    gaining one keeps it that way. The rule''s second clause (the concept reaching collection and degrading
    to unavailable) is the task''s own UNDERDETERMINED note: it passes at the collection stage inside
    the shared pipeline, which this task''s controllers do not reach and do not change.'
- node: rules/investigation/a-subject-carries-at-least-one-attribute
  encoded_at:
  - src/investigation/subject.ts
  - src/errors/status-map.ts
  how: buildSubject (untouched by this task) still throws SubjectCarriesNoAttributeError for an empty
    attributes array; status-map.ts now maps that class to 422, so the invariant's "refused with an HTTP
    422 response reporting a SubjectCarriesNoAttributeError" clause is satisfied for both simulate controllers.
    The rule's reach beyond simulate — diagnose's own enforcement and the connector-test call's own assembly
    — is untouched, per the task's own REMAINDER note.
inferences:
- inferred: status-map.ts needed a new entry for SubjectCarriesNoAttributeError rather than this being
    pre-existing behavior to merely preserve.
  from: Reading status-map.ts directly — no SubjectCarriesNoAttributeError entry existed there before
    this change, confirmed against the task's own explicit criterion naming this file and this mapping.
- inferred: The general criterion "No spec in src/ constructs a simulate-case or simulate-hypothesis controller
    dependency object carrying a glossary" reaches every spec in the tree that does so, not only the ones
    the task's own narrative names by category.
  from: Grepping the whole src/ tree for SimulateCaseControllerDependencies and SimulateHypothesisControllerDependencies
    turned up two integration e2e specs (diagnose-e2e.spec.ts, diagnose-persistence-deadline-e2e.spec.ts)
    constructing the dependency object with a glossary field that the task's narrative does not name individually
    but that the general criterion's own wording covers.
- inferred: The pipeline-level glossary dependency (InvestigationPipelineOptions.glossary, SimulateHypothesisPipelineOptions.glossary,
    and BuildInvestigationOptions.glossary / refuseAttributesNotInGlossary in investigation-factory.ts)
    is out of this task's scope and must be left untouched.
  from: The task's own rationale ("the seam itself in the sibling task") and the inventory's risk note
    distinguishing the narrower BuildInvestigationOptions.glossary from the broader pipeline-level fields
    threaded through the same factories.
- inferred: buildSubject should be called as a bare, unbound statement rather than reassigned to a differently-named
    or underscore-prefixed binding, to keep calling it for its own refusal side effect without an unused
    variable.
  from: The build's own lint failure (subject assigned but never used) and this file's existing style,
    which already calls other functions without wrapping every call in a binding when the return value
    is not needed downstream.
preserved:
- buildSubject's own SubjectCarriesNoAttributeError refusal for a subject carrying no attribute at all
  (src/investigation/subject.ts), unchanged by this task and still invoked from both controllers.
- The DTO-level attributes.min(1) validation in simulate-case.dto.ts and simulate-hypothesis.dto.ts, which
  still refuses an empty-attributes request with HTTP 400 at the wire before either controller runs.
- The pipeline-level glossary dependency (InvestigationPipelineOptions.glossary, SimulateHypothesisPipelineOptions.glossary)
  and its construction in simulate.factory.ts / production-simulate-hypothesis.factory.ts, untouched.
- The case-input-requirements coverage mechanism (subject-covers-case-input-requirements.ts, diagnose.controller.ts's
  own use of it, SubjectDoesNotCoverCaseInputsError mapped to 422), untouched and not extended to simulate.
- The rate-limiting behavior of both simulate routes and its cross-route independence, unchanged by removing
  the glossary field from the dependency objects those tests construct.
deferred:
- what: investigation-factory.ts's own refuseAttributesNotInGlossary definition, its BuildInvestigationOptions.glossary
    field, and investigation-factory.spec.ts's assertions about them.
  why: This is the seam the task's own rationale assigns to the sibling task; this task only changes refuseAttributesNotInGlossary's
    two remaining consumers.
- what: glossary/terms.ts's TERM_VOCABULARIES entry for subject-attribute, the relational glossary store's
    table map, seed.ts's fixture read and insertMissingTerms call, validate-case-coherence.ts's dead VOCABULARY_ROLES
    entry, the subject_attributes migration, and their own specs.
  why: Named by the inventory as the sibling task's own area (the seam and its storage), not reached by
    this task's objective of removing the two controllers' own consumption of it.
---

## What it is

The two simulate entry points stop asking the glossary whether a subject's attribute names are held, and stop being handed a glossary to ask with; buildSubject's own empty-subject refusal is now mapped to a proper HTTP 422 instead of falling through to a generic 500.

## Notes

UNDERDETERMINED, from the specification — rules/investigation/a-simulated-subject-missing-a-requirement-degrades-not-refuses's second clause (the concept that requirement answers reaches collection and degrades to unavailable) reaches no criterion of this task; passes at the collection stage inside the shared investigation pipeline, not this task's own controllers.
