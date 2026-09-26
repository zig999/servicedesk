---
title: overwriteRevision refuses without a draft
summary: The case store's overwriteHypothesisRevision refuses to write once the case holds no draft version, matching insertHypothesisRevision's own guard.
objective: Overwriting a hypothesis-revision through the case store is refused with CaseHoldsNoDraftError once the case that revision belongs to holds no draft version, leaving the revision's stored content unchanged.
criteria:
- Overwriting a hypothesis-revision through the case store, for a case that currently holds no draft version, is refused with CaseHoldsNoDraftError whose message names the case slug and whose details carry that slug and nothing else.
- A refused overwrite (per the criterion above) leaves the hypothesis-revision's stored criterion, collects and resolution unchanged.
- Overwriting a hypothesis-revision through the case store, for a case that currently holds a draft version, replaces that revision's stored criterion, collects and resolution with the newly submitted values, in place, without changing the revision number.
- Overwriting a hypothesis-revision that is in released state, for a case that currently holds no draft version, is refused with CaseHoldsNoDraftError and never with ReleasedHypothesisRevisionNotAlterableError, whether alone or alongside it.
implements:
- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft
- rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
- domain/knowledge/hypothesis-revision
sources:
- intake/scope.md
---

## What it is

The corrective fix to `overwriteHypothesisRevision` in
`src/persistence/relational-case-store.repository.ts`: it gains the same
`requireCaseHoldsDraft` guard `insertRevision` already applies, refusing the write with
`CaseHoldsNoDraftError` before touching the stored revision.

## Notes

REMAINDER, from the specification -- rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft's
clause that "the concept-acceptance check the new revision undergoes uses that draft version's
declared subject type", and its clause that the refusal is carried as an HTTP 409 response, reach
no criterion of this task; both belong to the revise-hypothesis route and service layer, not the
case store's overwrite guard.
REMAINDER, from the specification -- two clauses of rules/knowledge/a-hypothesis-revision-is-overwritten-while-unreleased
reach no criterion here: that revising when the highest revision is released creates the next
revision, and that a hypothesis holding no revision yet always creates revision 1; both belong to
the revise routing that picks insert over overwrite, not this overwrite guard.
Two facts were decided into the specification while this task was bound, both disclosed in the
specification's own decision log against rules/knowledge/a-hypothesis-is-revised-only-against-its-cases-draft:
what CaseHoldsNoDraftError's message and details carry, and which refusal answers an attempt that
reaches a released revision when the case holds no draft.
