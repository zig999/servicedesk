---
title: A case version releases only over released revisions
summary: The gate a case version's own release now runs, reading each manifest entry's referenced revision's
  own state.
rationale: The planning cut this apart from the revision's own state and its own release because it is
  the one place a case version reads that state, it changes a different operation, and its refusal is
  the existing release-refusal aggregation rather than anything the other epics deliver.
sources:
- work/hipotese-release-proprio/intake/scope.md
covers:
- rules/knowledge/a-released-case-version-manifests-only-released-hypothesis-revisions
- rules/knowledge/a-release-refusal-with-no-named-violation-says-so
- scenarios/knowledge/a-release-is-refused-for-manifested-draft-hypothesis-revisions
- scenarios/knowledge/placing-a-manifest-entry-is-never-refused-for-a-drafts-revision-state
- domain/knowledge/case-version
- domain/knowledge/manifest-entry
---

## What it is

The other half of the inversion: a case version's own release now reads each manifest entry's referenced hypothesis-revision's own state, where the revision used to read the case version.
It holds the refusal a release meets while any entry still references a draft revision, and the guarantee that placing such an entry is not refused by that rule.

## Notes

None.
