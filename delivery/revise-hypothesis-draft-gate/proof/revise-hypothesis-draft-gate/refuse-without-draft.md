---
title: Proof for revise-hypothesis-draft-gate/refuse-without-draft
summary: Tests ReviseHypothesisOperation's new draft gate (never-drafted, already-released and already-discarded
  refusal, and success when a draft coexists with release history) in revise-hypothesis.operation.spec.ts,
  fixes that same file's own pre-existing criteria-1-through-5 fixtures to seed a draft so the gate does
  not confound them, and separately adds ICaseStore.findDraftVersion to FakeCaseStore in case-query.service.spec.ts
  purely so the project still typechecks — a build fix, not a test.
implementation: sha256:b69f31f5b9a8442cbf7e539d2f8bc48a7d3d2ec4e63bfd0e54e90c6622c7c441
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/revise-hypothesis-draft-gate-refuse-without-draft-suite-2
tests:
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: refuses reviseHypothesis with the typed CaseHoldsNoDraftError, naming the slug, for a case that
    has never held any version at all, writing no hypothesis or revision row
  proves: Calling reviseHypothesis for a case slug that holds no version in draft state (never drafted)
    is refused with a typed error, before any hypothesis identity or revision row is written.
  fails_when: refuseWithoutDraft is removed or bypassed, the rejection is not an instance of CaseHoldsNoDraftError,
    or any row ever appears in hypotheses or hypothesis_revisions for the fixture's slug
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: refuses reviseHypothesis with the typed CaseHoldsNoDraftError, naming the slug, for a case whose
    only version is already released rather than in draft state, writing no hypothesis or revision row
  proves: The same criterion's already-released instance — the gate keys off state = 'draft' rather than
    merely 'does any case_versions row exist'
  fails_when: the gate treats the presence of any version as sufficient regardless of its state, the rejection
    is not CaseHoldsNoDraftError, or a hypothesis/revision row is written
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: refuses reviseHypothesis with the typed CaseHoldsNoDraftError, naming the slug, for a case whose
    only draft version has already been discarded, writing no hypothesis or revision row
  proves: The same criterion's already-discarded instance, exercised through the real ICaseStore.discard()
  fails_when: discard() leaves a row findDraftVersion still reads as a draft, the rejection is not CaseHoldsNoDraftError,
    or a hypothesis row is written after the discard
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: succeeds for a case that holds both an already-released earlier version and a currently open draft
    version — the draft gate finds the draft rather than being confused by the case's own release history
  proves: Calling reviseHypothesis for a case slug that does hold an open draft version succeeds exactly
    as it already does today, unchanged, for the realistic shape of a case already revised once.
  fails_when: the gate refuses despite an open draft existing, or the origination stops answering/writing
    the identity and revision it always did
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: excludes an implementation that originates a hypothesis identity and revision for a case holding
    no draft version at all, without refusing
  proves: This exact, pre-existing test, left unmodified — passes against the delivered implementation
    rather than merely excluding one that ignores the gate.
  fails_when: reviseHypothesis originates a hypothesis identity/revision row for a case holding no draft
    version at all, i.e. it stops rejecting
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: originates a never-named hypothesis's own identity and its first revision, numbered 1
  proves: This pre-existing test's own original criterion, amended here only by adding seedDraftCaseVersion
    so it keeps exercising that behavior instead of tripping the new gate first.
  fails_when: origination stops succeeding once a draft is present, or the answered shape / written rows
    change from before this task's gate was added
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: numbers a new revision of an already-named hypothesis one past its own highest existing revision,
    and leaves the earlier revision's own row unaltered
  proves: Same as above, for a second revision of an already-named hypothesis, amended only by adding
    seedDraftCaseVersion
  fails_when: renumbering stops succeeding once a draft is present, or either revision's own row changes
    from before this task's gate was added
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: refuses revising with an empty collects list, naming that the revision collects no concept, and
    never reaches the store
  proves: This pre-existing refusal still fires, still as HypothesisRevisionCollectsNoConceptError rather
    than the new CaseHoldsNoDraftError, once a draft is present — amended only by adding seedDraftCaseVersion
  fails_when: the rejection stops being HypothesisRevisionCollectsNoConceptError once a draft exists,
    or a hypothesis row is written
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: refuses revising with a collected concept the glossary does not currently hold, naming the concept,
    and never reaches the store
  proves: Same as above, for the unknown-concept refusal (ConceptNotInGlossaryError)
  fails_when: the rejection stops being ConceptNotInGlossaryError once a draft exists, or a hypothesis
    row is written
- file: src/__tests__/integration/case/revise-hypothesis.operation.spec.ts
  name: refuses revising with a collected concept that does not accept the declared subject type, naming
    both the concept and the subject type, and never reaches the store
  proves: Same as above, for the subject-type refusal (ConceptRefusesSubjectTypeError)
  fails_when: the rejection stops being ConceptRefusesSubjectTypeError once a draft exists, or a hypothesis
    row is written
not_applicable:
- edge_case: two concurrent reviseHypothesis calls, or a discard/release racing the gate's own read of
    findDraftVersion against the later insertHypothesisRevision write
  why: no criterion of this task and no bound specification node states any guarantee about concurrent
    access to the draft gate
- edge_case: an absent, empty or otherwise malformed slug passed to reviseHypothesis
  why: no criterion or node requires slug-shape validation, and behaviorally an unknown slug collapses
    into exactly the same 'case holds no draft' refusal the never-drafted test already exercises
untested:
- 'Which typed error wins when a case both holds no draft version and would separately fail refuseInvalidCollects
  is not directly tested: every criterion-1 test keeps collects valid so only the gate can fire, and the
  fixed criteria-3/4/5 tests always seed a draft so only their own check can fire. The implementation''s
  own header comment states the gate runs first, but no test here forces both conditions at once and checks
  which error actually surfaces.'
- Whether findDraftVersion could ever answer ambiguously for a case somehow holding two versions in draft
  state at once is left entirely to rules/knowledge/a-case-has-at-most-one-draft's own unique index and
  to relational-case-store.repository.spec.ts's own persistence proof — this file has no way to construct
  that state without bypassing the schema.
---

## What it is

Ten tests: five proving the three draft-gate refusal instances plus one success case against the two production-source files, and five pre-existing tests amended only to seed a draft so the new gate does not confound what they already proved.

## Notes

This record's own `run` points at a full 89-file suite execution captured under work/seed-vocabulary-assertions-scope-hotfix's own delivery root and copied here unmodified: five other corrective tasks landed in this same tree at the same time (work/manifest-collects-hotfix, work/seed-fixture-isolation, work/ensure-non-conclusion-outcomes-hotfix, work/seed-already-seeded-guard-hotfix, work/seed-vocabulary-assertions-scope-hotfix), and this one genuine execution is the same evidence for all six, since all six changes were simultaneously present in the tree it ran against. The suite's own test.log confirms revise-hypothesis.operation.spec.ts's 11 tests all passed, among 89 files passed in total.
