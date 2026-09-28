---
target: backend
title: overwriteRevision refuses without a draft — proof
summary: Two integration tests against the real Postgres instance prove overwriteHypothesisRevision now
  refuses with CaseHoldsNoDraftError (message and details exact) and leaves stored content unchanged when
  the case holds no draft, and that this refusal preempts ReleasedHypothesisRevisionNotAlterableError
  even when the targeted revision is itself released; a pre-existing test in the same file, whose premise
  the new guard invalidated, was rewritten whole to isolate the manifest-reference condition it always
  meant to test from the case-holds-a-draft condition this task's guard now enforces; the pre-existing
  overwrite-while-drafted behavior (criterion 3) is otherwise unchanged by this task and already carries
  evidence in the same file, so no further new test was written for it.
implementation: sha256:66770d144ab25f4a619634b36375c3fedf0016998c5f38103cb3b37c0f9262bf
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:6dc3f326700eb86729e65441753fce536074c26be978d4948db4c483dd73f32d
run: run/overwrite-revision-draft-guard-overwrite-revision-refuses-without-a-draft-suite-3
tests:
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses overwriteHypothesisRevision through CaseHoldsNoDraftError whose message names the slug
    and whose details carry that slug and nothing else, leaving the revision's stored criterion, collects
    and resolution unchanged, when the case currently holds no draft version
  proves: Criteria 1 and 2 of the task — overwrite refused with CaseHoldsNoDraftError (message names the
    slug, details carry exactly { slug }) for a case holding no draft, and the refused overwrite leaves
    the revision's stored criterion, collects and resolution unchanged.
  fails_when: The rejection is not a CaseHoldsNoDraftError, or its message omits the slug, or its context
    carries anything other than exactly { slug }, or the revision read back afterward no longer matches
    its original criterion, collects and resolution.
  demonstrates: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses an overwrite attempt against a revision whose own state is released through CaseHoldsNoDraftError,
    never through ReleasedHypothesisRevisionNotAlterableError alone or alongside it, when the case currently
    holds no draft version
  proves: Criterion 4 — overwriting a revision that is itself released, for a case holding no draft, is
    refused with CaseHoldsNoDraftError and never with ReleasedHypothesisRevisionNotAlterableError, alone
    or alongside it.
  fails_when: The rejection is not a CaseHoldsNoDraftError, or is (also) a ReleasedHypothesisRevisionNotAlterableError,
    or its context does not carry the slug — which is what would happen if the draft guard stopped running
    before the UPDATE that would otherwise hit the released-revision trigger.
  demonstrates: rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: does not refuse an overwrite attempt against a hypothesis-revision whose own state is draft, even
    though a released case version's manifest still references that revision, so long as the case currently
    holds a draft version of its own — isolating the manifest reference from the case-holds-a-draft precondition
  proves: Criterion 3, on the boundary a prior task's now-invalid test used to occupy — that a released
    version's manifest still pointing at a draft-state revision is not, by itself, what the draft-guard
    reads; the guard clears (and the overwrite succeeds, replacing the criterion in place) once the case
    holds a draft of its own, regardless of what an older released version's manifest still references.
  fails_when: The overwrite is refused (e.g. with CaseHoldsNoDraftError) even though the case currently
    holds a draft version, or the read-back criterion does not equal the replacement value — either would
    mean the guard is keying off the manifest reference rather than off whether the case holds a draft.
untested:
- 'rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft''s clause that the concept-acceptance
  check the new revision undergoes uses the draft version''s declared subject type, and its clause that
  the refusal is carried as an HTTP 409 response: both belong to the revise-hypothesis route and service
  layer per this task''s own REMAINDER notes and are not implemented by the file this task touches, so
  no test against this file decides either clause.'
- 'rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased''s clause that revising a released
  highest revision creates the hypothesis''s next revision, and its clause that a hypothesis holding no
  revision yet always creates revision 1: both are decisions of the revise routing that picks insert over
  overwrite, per this task''s own REMAINDER notes, not of overwriteRevision itself, so no test against
  this file decides either clause.'
- domain/knowledge/hypothesis-revision's whole aggregate state discipline — release moving state exactly
  once and immutability once released — spans release(), insertRevision(), overwriteRevision() and the
  manifest read; most of that surface is untouched by this task, so no single test against this task's
  own file decides the node's fact whole. The slice this task changes is exercised by the three tests
  above and by the pre-existing overwrite/release tests already in this file.

---

## What it is

The proof of `overwriteRevision`'s new draft-holding guard: two new integration tests, plus one
pre-existing test in the same file rewritten whole after this delivery's guard falsified its
premise.

## Notes

The first suite attempt
(run/overwrite-revision-draft-guard-overwrite-revision-refuses-without-a-draft-suite) failed at
lint: the first new test's arrow function exceeded MNT-01's 30-line limit. The test-author,
re-entered, extracted a shared fixture helper (`aCaseHoldingNoDraftWithARevision`), matching the
file's own existing `aCaseHolding...` helper convention; no assertion changed.

The second suite attempt (run/overwrite-revision-draft-guard-overwrite-revision-refuses-without-a-draft-suite-2) failed at the `test` step on a genuine conflict: the
pre-existing test "does not refuse an overwrite attempt against a hypothesis-revision whose own
state is draft, even though a released case version's manifest still references that revision"
(owned by the already-closed initiative hipotese-release-proprio,
task/hypothesis-revision-own-state/overwrite-only-while-the-revision-is-draft — a task whose own
`files` names this same `src/persistence/relational-case-store.repository.ts`) asserted that an
overwrite against a draft-state revision succeeds even when the case holds no draft at all,
because only a released version's manifest still points at it. The failure-diagnostician classed
this cause: test, and confirmed the file this delivery rewrote is one the owning task's own files
also names — per `/implement-task`'s own protocol this is the corrective-increment shape, and the
test is this delivery's to answer, not a proof-only re-delivery over the (closed) owning
initiative. The test-author, re-entered, rewrote it whole: the case is given a fresh draft after
the release, isolating the manifest-reference condition the test always meant to test from the
case-holds-a-draft condition this task's guard now enforces. No assertion of the original test's
intent was weakened; the scenario that made it valid changed.

The third suite attempt (run/overwrite-revision-draft-guard-overwrite-revision-refuses-without-a-draft-suite-3,
pinned above) passed clean across every step.
