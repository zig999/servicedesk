---
title: Case-version aggregate types and structural validation for the draft/released split
summary: case.ts now declares hypothesis identity, hypothesis-revision content and manifest entries as
  distinct types with a state/released_at/manifest-bearing case-version type, and parse-case-document.ts
  validates the new manifest structurally, while case-resolution.ts is repointed onto the manifest and
  every out-of-scope consumer's flat hypotheses/criterion/collects/resolution shape is preserved unchanged.
task: sha256:0416f6e52e2a8a02f2c2a71343fb9cb3741c8b548a5d18f73896f4e6d9504411
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6885a32e5f44e39ab1cf8b5b90f6cae111d0a3f6c5e00711e48cab702e490f72
run: run/case-lifecycle-epic-final-build
files:
- path: src/case/case.ts
  effect: 'Adds HypothesisIdentity ({ name }), HypothesisRevision ({ hypothesis, revision, criterion,
    collects, resolution }), ManifestEntry ({ position, hypothesis_revision }), CASE_VERSION_STATES/CaseVersionState
    (''draft''|''released''). Keeps Hypothesis under its existing name and flat shape ({ name, criterion,
    collects, resolution }, position dropped) as the documented projection judgment-stage.ts/run-diagnosis.ts/validate-case-coherence.ts
    still consume. Case gained state, released_at? and manifest: readonly ManifestEntry[], keeping hypotheses:
    readonly Hypothesis[] as a derived, never-independent field.'
- path: src/case/parse-case-document.ts
  effect: Rewrote the structural validator against the new document shape (manifest of flattened manifest-entry+hypothesis-revision
    records, plus state and optional released_at). Added stateProblems/isCaseVersionState, optionalStringProblems
    (released_at), manifestProblems (refuses an absent/empty manifest with NO_HYPOTHESIS_PROBLEM regardless
    of draft/released), manifestEntryProblems (position, hypothesis_name, revision, criterion, collects,
    resolution), sharedHypothesisProblems/sharedPositionProblems (adapted to manifest entries). heldCase
    now builds the nested ManifestEntry/HypothesisRevision/HypothesisIdentity graph and derives the flat
    hypotheses array from it.
- path: src/case/case-resolution.ts
  effect: Repointed byPrecedence, collectionPlan, requiresEvaluationOf and resolveOutcome from theCase.hypotheses
    onto theCase.manifest, reading each entry's adopted hypothesis_revision for collects/resolution and
    hypothesis_revision.hypothesis.name for identity. Control flow (sort by position, first-confirmed
    search, name mapping) is unchanged; only the field-access path changed.
criteria:
- criterion: A hypothesis's stable identity (its name) and its revisioned content (revision, criterion,
    collects, resolution) are declared as two distinct types, never one flat record.
  met: true
  how: 'case.ts declares HypothesisIdentity ({ name }) and HypothesisRevision ({ hypothesis: HypothesisIdentity,
    revision, criterion, collects, resolution }) as two separate exported types; HypothesisRevision references
    HypothesisIdentity by nesting it rather than merging its fields.'
- criterion: A manifest entry's type declares a position and a reference to exactly one hypothesis-revision,
    never that revision's own content inline.
  met: true
  how: 'case.ts''s ManifestEntry = { position: number; hypothesis_revision: HypothesisRevision } — the
    revision''s own criterion/collects/resolution live only inside the nested hypothesis_revision object,
    never flattened onto ManifestEntry itself.'
- criterion: The case-version type declares state, released_at present only where state is released, and
    its manifest as many manifest entries.
  met: true
  how: 'Case now declares state: CaseVersionState, released_at?: string (documented as present only once
    released), and manifest: readonly ManifestEntry[]. released_at''s presence is modeled as a plain optional
    field rather than a state-keyed discriminated union — see inferences.'
- criterion: Reading a case version whose manifest holds no entry is refused, naming that the case declares
    no hypothesis, whether the version is draft or released.
  met: true
  how: parse-case-document.ts's manifestProblems refuses an absent manifest field or an empty manifest
    array with the exact message 'the case declares no hypothesis' (NO_HYPOTHESIS_PROBLEM), with no branch
    on the document's own state.
- criterion: Reading a case version where any adopted hypothesis-revision collects no concept is refused,
    naming it.
  met: true
  how: manifestEntryProblems calls collectsProblems on each manifest entry's own collects; an absent,
    non-array or empty collects produces 'manifest entry N collects no concept', naming the offending
    entry by its 1-based locator.
- criterion: Reading a case version where any adopted hypothesis-revision declares an empty criterion
    is refused, naming it.
  met: true
  how: manifestEntryProblems calls stringProblems on each manifest entry's own criterion; an absent criterion
    produces 'manifest entry N's criterion is undeclared' and an empty one produces 'manifest entry N's
    criterion is empty', naming the offending entry.
- criterion: The hypotheses/criterion/collects/resolution shape run-diagnosis.ts and diagnose.controller.ts
    already consume is unchanged by this task.
  met: true
  how: Case.hypotheses keeps its exact prior field name and Hypothesis keeps { name, criterion, collects,
    resolution } (only the unused position field was dropped, verified unread by every production consumer).
    run-diagnosis.ts and diagnose.controller.ts were not touched and remain structurally valid against
    this shape. The same protection was extended to judgment-stage.ts, an out-of-epic consumer of the
    identical shape found while reading every case.js import; validate-case-coherence.ts needed zero changes
    for the same reason.
nodes:
- node: domain/knowledge/case-version
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  how: Case declares every attribute the node lists, including state, released_at and manifest; parse-case-document.ts's
    manifestProblems/stateProblems/optionalStringProblems structurally validate those additions at every
    read, draft or released alike.
- node: domain/knowledge/case-version-state
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  how: CASE_VERSION_STATES/CaseVersionState in case.ts declare the closed draft/released vocabulary; parse-case-document.ts's
    stateProblems/isCaseVersionState enforce it as required and closed at every read.
- node: domain/knowledge/manifest-entry
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/case/case-resolution.ts
  how: ManifestEntry in case.ts declares the position-plus-one-hypothesis-revision-reference shape; parse-case-document.ts's
    manifestEntryProblems/sharedPositionProblems validate it structurally; case-resolution.ts's byPrecedence/collectionPlan/requiresEvaluationOf/resolveOutcome
    read manifest entries as the aggregate's own canonical ordering and content source.
- node: domain/knowledge/hypothesis
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  - src/case/case-resolution.ts
  how: HypothesisIdentity in case.ts declares the name-only identity; parse-case-document.ts's manifestEntryProblems/sharedHypothesisProblems
    validate a manifest entry's declared hypothesis_name and its uniqueness within one manifest; case-resolution.ts
    reads entry.hypothesis_revision.hypothesis.name as that identity.
- node: domain/knowledge/hypothesis-revision
  encoded_at:
  - src/case/case.ts
  - src/case/parse-case-document.ts
  how: HypothesisRevision in case.ts declares revision/criterion/collects/resolution referencing its own
    hypothesis; parse-case-document.ts's manifestEntryProblems validates each of those fields and heldHypothesisRevision
    assembles the held value.
- node: rules/knowledge/a-hypothesis-collects-at-least-one-concept
  encoded_at:
  - src/case/parse-case-document.ts
  how: parse-case-document.ts's collectsProblems refuses a manifest entry's adopted hypothesis-revision
    whose collects is absent, non-array or empty.
- node: rules/knowledge/a-hypothesis-declares-a-criterion
  encoded_at:
  - src/case/parse-case-document.ts
  how: parse-case-document.ts's manifestEntryProblems runs stringProblems over each manifest entry's own
    criterion, refusing an absent or empty one.
- node: rules/knowledge/a-case-has-at-least-one-hypothesis
  encoded_at:
  - src/case/parse-case-document.ts
  how: parse-case-document.ts's manifestProblems refuses an absent or empty manifest with NO_HYPOTHESIS_PROBLEM.
- node: rules/knowledge/validation-runs-at-every-read
  encoded_at:
  - src/case/parse-case-document.ts
  how: 'Answered only for the clause this task''s own criteria reach, per the task''s own REMAINDER note:
    parse-case-document.ts''s manifest/collects/criterion checks run identically for a draft or a released
    document, with no separate not-ready field. The replay-without-revalidation clause is untouched by
    this delivery — existing, unchanged behavior in case-query.service.ts''s replayCase, a file this task
    does not touch.'
inferences:
- inferred: Named the identity type HypothesisIdentity rather than Hypothesis, and kept Case/Hypothesis
    under their existing names/shapes (minus the now-unused position field) instead of introducing a separately-named
    CaseVersion type.
  from: the task's own instruction that run-diagnosis.ts/diagnose.controller.ts's consumed shape stay
    unchanged without editing them, plus grepping every case.js import beforehand and finding judgment-stage.ts
    (an out-of-epic module) also depends on the literal name Hypothesis and its criterion/collects fields;
    renaming either would have forced edits to files outside this task's own touched set.
- inferred: Dropped the position field from the legacy flat Hypothesis type.
  from: Grepped every .position accessor in production code before removing it; only case-resolution.ts's
    own byPrecedence read it, and that function now sorts theCase.manifest by ManifestEntry.position instead.
- inferred: Modeled released_at as a plain optional field on Case, independent of state, rather than a
    state-keyed discriminated union, and added no dedicated structural refusal pairing the two.
  from: case-store.port.ts's own AssembledCaseVersion (the sibling persistence task, same domain fact)
    uses the identical plain-optional-field convention with a doc comment rather than a discriminated
    union; the state/released_at pairing invariant is not among this task's own seven criteria, so enforcing
    it as a runtime refusal was left undecided rather than invented.
- inferred: The raw JSON document flattens a manifest entry's adopted hypothesis-revision content directly
    onto the entry, while the parsed/held Case nests it as hypothesis_revision.hypothesis.name.
  from: Reused case-store.port.ts's own HypothesisRevisionContent flattening convention for the wire/document
    shape, while still declaring and using a genuine, distinct HypothesisIdentity type in the held domain
    value to satisfy criterion 1 structurally rather than only declaratively.
- inferred: Declared CaseVersionState via a CASE_VERSION_STATES const array plus a derived literal-union
    type, rather than a bare union.
  from: Reused consolidation-register.ts's own CONSOLIDATION_REGISTERS-plus-derived-type convention, since
    parse-case-document.ts needs an iterable value set for its own one-of-N structural check the same
    way isConsolidationRegister already does.
preserved:
- run-diagnosis.ts's and diagnose.controller.ts's own consumption of Case (options.case, evidenceByHypothesisOf
  keyed by hypothesis.name/collects) — untouched, and still structurally valid against Case/Hypothesis.
- judgment-stage.ts's own consumption of Case/Hypothesis (theCase.hypotheses.find, hypothesis.criterion,
  hypothesis.collects) — untouched, and still structurally valid.
- validate-case-coherence.ts's own consumption of theCase.hypotheses[].resolution and of collectionPlan(theCase)/theCase.subject/theCase.fallback/theCase.slug
  — untouched; needed no edits at all.
- resolve-and-narrow-input.ts's, investigation-factory.ts's and evidence-collection-stage.ts's own consumption
  of Case and of case-resolution.ts's exported functions (collectionPlan, requiresEvaluationOf, resolveOutcome)
  — signatures unchanged, untouched.
- The existing hypothesis-name-uniqueness and hypothesis-position-uniqueness structural checks — kept,
  renamed to sharedHypothesisProblems/sharedPositionProblems and adapted to read a manifest entry's own
  hypothesis_name/position.
deferred:
- what: case-query.service.ts and author-case-version.service.ts still import the old ICaseStore-shaped
    StoredCaseVersion/readVersion/writeVersion and were already red for that reason.
  why: Explicitly out of this task's own scope; wiring them onto the new Case/ManifestEntry shape is task/case-lifecycle-operations/wire-and-retire-author-case-version's
    own objective, a later task in this same delivery that has since landed.
- what: Existing test files exercising the pre-split flat-hypothesis shape needed rewriting against the
    new manifest/state/released_at shape.
  why: Writing or rewriting tests is the test-author pass's own judgment, never this implementer's — completed
    in this same delivery's own proof-preparation pass.
---

## What it is

The two files that together state what a case-version aggregate is and refuse one that is not structurally whole.
It needs no database to be demonstrated — a fixture built in memory is enough.

## Notes

This task's own build run reflects the whole epic's final green state (install, typecheck, lint, secret-scan), captured once every sibling task in this continuous delivery had also landed. No proof record is composed yet, per the human's own explicit instruction: implementation records close first, the suite is settled separately.
