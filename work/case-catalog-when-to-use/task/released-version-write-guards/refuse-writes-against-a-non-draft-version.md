---
title: The store refuses a write against a version that is not draft
summary: placeHypothesis, removeManifestEntry, release, discard and insertRevision each refuse when the
  version they act on is not in the state the operation requires, the same way updateDraftVersion already
  does.
sources:
- intake/released-version-write-guards.md
objective: Every write in relational-case-store.repository.ts that a released or discarded case version
  must not accept is refused before it happens, with the same typed error the specification names.
criteria:
- place-hypothesis called against a version that is not in draft state is refused with CaseVersionNotDraftError,
  and no manifest entry is inserted.
- remove-hypothesis (removeManifestEntry) called against a version that is not in draft state is refused
  with CaseVersionNotDraftError, and no manifest entry is deleted.
- release called against a version that is not in draft state is refused with CaseVersionNotDraftAtReleaseError,
  and neither its state nor its released_at is changed.
- discard called against a version that is not in draft state is refused with the stated error, and neither
  the version row nor its manifest entries are deleted.
- insertHypothesisRevision called against a case that currently holds no draft version is refused with
  CaseHoldsNoDraftError, and no hypothesis revision is inserted.
- place-hypothesis, remove-hypothesis, release and discard each still succeed, exactly as before this
  task, when called against a version that is in draft state.
- insertHypothesisRevision still succeeds, exactly as before this task, when called against a case that
  currently holds a draft version.
implements:
- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/only-a-draft-case-version-may-be-discarded
---

## What it is

Five write paths in relational-case-store.repository.ts (placeHypothesis, removeManifestEntry, release, discard, insertRevision) gain the same read-state-then-refuse-or-write guard updateDraftVersion already uses, so a released case version cannot be silently altered or removed and a case holding no draft cannot receive a hypothesis revision.

## Notes

UNDERDETERMINED, from the specification -- the clause of rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft's statement reading "the concept-acceptance check the new revision undergoes uses that draft version's declared subject type" reaches no criterion of this task. Criterion 5 answers only the refusal when no draft exists, and criterion 7 preserves the success path "exactly as before this task", which holds whatever subject type the existing code reads -- so nothing in the criteria excludes a revision accepted against the wrong version's declared subject type, or against no subject-type check at all.
Passes: insertHypothesisRevision refuses with CaseHoldsNoDraftError when the case holds no draft and otherwise inserts the revision unchanged, performing its concept-acceptance check against some version other than the case's draft (or performing none at all): every criterion as written passes, and the rule refuses it.
REMAINDER, from the specification -- each of the three candidate statements names an HTTP 409 response as part of the refusal -- rules/knowledge/a-case-version-moves-through-its-declared-lifecycle for CaseVersionNotDraftError and CaseVersionNotDraftAtReleaseError, and rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft for CaseHoldsNoDraftError. No criterion of this task reaches the status: the objective bounds the work to the refusal raised inside relational-case-store.repository.ts, so the response-status half of each clause is answered nowhere here. Belongs to the task that holds the HTTP layer's error-to-status mapping for the knowledge context.
ADVISORY, from the specification -- criterion 4 says discard is "refused with the stated error", and rules/knowledge/only-a-draft-case-version-may-be-discarded states no error name at all -- its statement carries only the invariant. The error is stated by rules/knowledge/a-case-version-moves-through-its-declared-lifecycle instead, whose statement covers "a lifecycle operation other than release" with CaseVersionNotDraftError; the decision log's entry locating that statement records the choice explicitly. The same statement is the only backing for criteria 1 and 2 as well: reading placeHypothesis and removeManifestEntry as "lifecycle operation[s] other than release" rests on that rule's description rather than its statement's own wording.
