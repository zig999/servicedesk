---
title: Fix post-case-lifecycle stale citations
summary: Corrects four doc-comment citations in already-delivered code that still attribute facts to the case/hypothesis identities after the case-lifecycle initiative moved those facts to case-version/hypothesis-revision.
objective: Every doc comment in src/case/validate-case-coherence.ts, src/investigation/judgment-stage.ts, src/investigation/citation-validation.ts, and src/investigation/resolve-and-narrow-input.ts that currently attributes a fact to domain/knowledge/case or domain/knowledge/hypothesis, where that fact now belongs to domain/knowledge/case-version or domain/knowledge/hypothesis-revision instead, cites the correct node — with no change to any file's runtime behavior.
criteria:
  - "src/case/validate-case-coherence.ts's namedVocabularyTerms() doc comment cites domain/knowledge/case-version for subject and fallback, and domain/knowledge/hypothesis-revision for the hypotheses' own resolutions, instead of domain/knowledge/case and domain/knowledge/hypothesis."
  - "src/case/validate-case-coherence.ts's conceptViolations() doc comment cites domain/knowledge/case-version for the case's collection plan, instead of domain/knowledge/case."
  - "src/investigation/judgment-stage.ts's caseContext construction and hypothesisNamed() attribute title and when_to_use to the case version, never to the case identity, in their comments/naming."
  - "src/investigation/citation-validation.ts's HypothesisCitationContext doc comment and src/investigation/resolve-and-narrow-input.ts's NarrowedInput doc comment both cite domain/knowledge/hypothesis-revision for collects and/or criterion, instead of domain/knowledge/hypothesis."
  - "No runtime behavior in any of the four files changes: the existing test suite passes unchanged."
implements:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - domain/knowledge/case-version
  - domain/knowledge/hypothesis-revision
sources:
  - intake/scope.md
---

## What it is

A corrective increment: one wrong behavior (a domain fact stated in a comment that the
specification no longer holds there), answering to no criterion any prior task holds, surfaced by
/reconcile over already-delivered code.

## Notes

None.
