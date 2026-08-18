---
title: Fix draft-assessment-text.ts's stale case citation
summary: Corrects one doc-comment citation in already-delivered code that still attributes consolidation_register to the case identity instead of the case version.
objective: draft-assessment-text.ts's doc comment for consolidationRegister cites domain/knowledge/case-version instead of domain/knowledge/case, with no change to any file's runtime behavior.
criteria:
  - "src/investigation/draft-assessment-text.ts's doc comment (currently: \"consolidationRegister reaches this function as an explicit field of its options, read from the pinned case's own consolidation_register (domain/knowledge/case) by whoever calls draftAssessment\") cites domain/knowledge/case-version instead of domain/knowledge/case for consolidation_register."
  - "No runtime behavior in src/investigation/draft-assessment-text.ts changes: the existing test suite passes unchanged."
implements:
  - domain/knowledge/case
  - domain/knowledge/case-version
sources:
  - intake/second-finding.md
---

## What it is

A corrective increment, second task of the same initiative: /reconcile's re-pass over the
first corrective delivery surfaced this fifth stale citation, in a file the first task did not
name.

## Notes

None.
