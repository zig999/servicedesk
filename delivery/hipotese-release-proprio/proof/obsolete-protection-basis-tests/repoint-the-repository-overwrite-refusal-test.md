---
title: Repointed overwrite-refusal test proof
summary: The relational case store repository spec's two overwrite tests — the pre-existing sibling asserting
  refusal from the revision's own released state, and the repointed test asserting no refusal from a manifest
  reference alone — together satisfy every stated criterion, and a full suite run against the file passed.
implementation: sha256:1dd49255c85a12778138406053c83d63b7f0602babd7b3eee97ebd0f5237b190
standard:
  at: ../standards/backend-node-service.yaml
  pin: sha256:ed25b4e50ea3e50032136f968eff6a6bb363faec8ced93ef9309466d381cdca3
run: run/hypothesis-revision-own-state-overwrite-only-while-the-revision-is-draft-suite
tests:
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: does not refuse an overwrite attempt against a hypothesis-revision whose own state is draft, even
    though a released case version's manifest still references that revision
  proves: Criterion 1 (the file asserts no refusal keyed on a released case version's manifest reference)
    and criterion 3 (an overwrite against a draft-state revision is not refused by this rule even though
    a released case version's manifest references that revision).
  fails_when: overwriteHypothesisRevision starts refusing this call — whether because it reads a released
    case version's manifest reference instead of the revision's own state column, or for any other reason.
- file: src/__tests__/integration/persistence/relational-case-store.repository.spec.ts
  name: refuses an overwrite attempt against a revision whose own state is released, through the same
    typed ReleasedHypothesisRevisionNotAlterableError mapped to HTTP 409, even though no case version's
    manifest has ever referenced that revision
  proves: Criterion 2 (an overwrite against a released-state revision is refused through a distinguishable
    error) and criterion 4 (this is the file's only test asserting the refusal of an overwrite keyed on
    a revision's own released state).
  fails_when: overwriteHypothesisRevision stops refusing the overwrite once the revision's own state column
    is released, or the rejection raised stops being an instance of ReleasedHypothesisRevisionNotAlterableError,
    or statusForError stops mapping it to 409.
not_applicable:
- edge_case: Absent or empty input to overwriteHypothesisRevision (e.g. missing collects, absent criterion).
  why: No criterion of this task asks anything about input validation on overwrite; the task is scoped
    to which basis (own state vs. manifest reference) triggers the refusal, not to input shape.
- edge_case: Two concurrent overwrite calls against the same revision.
  why: No criterion states a concurrency requirement for overwrite; the file's existing concurrency test
    is untouched by and unrelated to this task's criteria.
- edge_case: A dependency (the database) that fails or answers slowly during the overwrite.
  why: No criterion of this task concerns dependency failure or latency; both tests run as ordinary integration
    tests against the same real database every other test in the file uses.
- edge_case: A duplicate or uniqueness violation during the overwrite.
  why: No criterion of this task makes a uniqueness claim; overwrite targets one existing revision number
    and asserts either refusal or success, never a collision.
- edge_case: A boundary at either end of a numeric range.
  why: None of this task's criteria involve a range, page or limit; they involve exactly two states (draft,
    released) and a manifest-reference/no-reference distinction, both of which the two existing tests
    already exercise at their only possible values.
untested:
- UNDERDETERMINED, from the specification — criterion 2 asks only that the refusal be "distinguishable";
  rules/knowledge/a-released-hypothesis-revision-is-never-altered names both the error identity (ReleasedHypothesisRevisionNotAlterableError)
  and the status (HTTP 409), neither of which any criterion holds the test to. The existing sibling test
  in fact asserts both the specific error identity and the specific status, but nothing in the task's
  own criteria would have required it to, and that gap between the criterion's wording and the rule's
  specificity is left unproven by anything this record can point to.
---

## What it is

The relational case store repository spec's two overwrite tests, together, prove the refusal is keyed on the hypothesis-revision's own state and not on a case version's manifest reference.

## Notes

None.
