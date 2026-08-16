---
title: discard operation
summary: Removes a draft version and its own manifest entries, refusing a version that is not in draft state, never removing a hypothesis-revision.
rationale: None — the scope's §3.3 discard row states this task's behavior directly.
sources:
- work/case-lifecycle/intake/scope.md
objective: A curator may discard a draft version, removing it and its own manifest entries, refused where the version is not in draft state.
criteria:
- Discarding a version in draft state removes it and its own manifest entries.
- Discarding a version that is not in draft state is refused.
- Discarding a draft never removes any hypothesis-revision its manifest referenced, even one no other version ever adopts.
depends_on:
- task/case-lifecycle-persistence/relational-case-store-for-lifecycle
- task/case-lifecycle-domain-model/aggregate-types-and-structural-validation
implements:
- rules/knowledge/only-a-draft-case-version-may-be-discarded
- domain/knowledge/case-version
- domain/knowledge/manifest-entry
- domain/knowledge/hypothesis-revision
- contracts/knowledge/case-lifecycle
---

## What it is

The one way an open draft is abandoned.
It never touches a released version.

## Notes

UNDERDETERMINED, from the specification — criterion 1 ("removes it and its own manifest entries") does not exclude an implementation that purges every trace of the discarded version, including its version number, from the case's history. rules/knowledge/a-case-version-number-is-never-reused states that a case's next version number is always greater than every version number the case has ever held, including one later discarded. A test must exclude: discarding a draft version deletes the case_version row and its manifest entries completely, with no residual record of the version number it held; a later draft's numbering derives the next number solely from currently existing case_version rows, and therefore reuses the discarded version's number.
