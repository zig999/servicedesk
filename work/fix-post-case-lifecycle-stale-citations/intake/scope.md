Corrective increment. One wrong behavior, in the sense that this project's own rule forbids
("Never state a domain fact the specification does not hold — in code, a comment, a test...").

Four doc-comment locations, in already-delivered code, still attribute facts to
domain/knowledge/case and domain/knowledge/hypothesis that the case-lifecycle initiative's own
specification split moved to domain/knowledge/case-version and domain/knowledge/hypothesis-revision
respectively. Surfaced by /reconcile (siegard-reconcile/moved-nodes-post-closure-drift.md); the
specification's current text is correct and settled — only these four comments are stale. This is
a documentation-only correction: no runtime behavior changes, only which specification node each
comment cites.

The four locations, quoted from the reconcile finding evidence:

1. src/case/validate-case-coherence.ts, lines ~108-123, the namedVocabularyTerms() doc comment.
   Current text cites domain/knowledge/case and domain/knowledge/hypothesis for "the declared
   subject... every outcome, action and recipient of every declared resolution — the hypotheses'
   and the fallback's alike." Per domain/knowledge/case.md's and domain/knowledge/hypothesis.md's
   current text, subject/fallback belong to the case version and a hypothesis's own resolution
   belongs to its revision — the comment should cite domain/knowledge/case-version and
   domain/knowledge/hypothesis-revision instead.

2. src/case/validate-case-coherence.ts, lines ~135-145, the conceptViolations() doc comment.
   Current text cites domain/knowledge/case for "the case's own collection plan." Per
   domain/knowledge/case.md's current text, what a version collects (through its manifested
   hypothesis-revisions) belongs to the case version, not the case identity — cite
   domain/knowledge/case-version instead.

3. src/investigation/judgment-stage.ts, lines ~74 and ~357-361 (caseContext construction and
   hypothesisNamed()). The code reads theCase.title and theCase.when_to_use directly off a value
   typed Case, and nearby comments/naming imply these are the case identity's own attributes. Per
   domain/knowledge/case.md's current text, title and when_to_use belong to a case version, never
   the case identity — correct the comment/type naming to attribute this to the case version
   (e.g. rename or re-annotate to make clear `theCase` here is actually version data, or adjust
   the comment citing the fact), without changing any runtime behavior.

4. src/investigation/citation-validation.ts, lines ~43-50 (HypothesisCitationContext doc comment)
   and src/investigation/resolve-and-narrow-input.ts, lines ~17-20 (NarrowedInput doc comment).
   Both cite domain/knowledge/hypothesis for collects and/or criterion. Per
   domain/knowledge/hypothesis.md's current text, a hypothesis's content (criterion, collects,
   resolution) "belongs to its revisions, never to this identity directly" — cite
   domain/knowledge/hypothesis-revision instead.

Criteria should be falsifiable: each doc comment, read after the fix, cites the correct node
(case-version / hypothesis-revision) for the fact it describes, and no runtime behavior in any of
the four files changes (verified by the existing test suite passing unchanged). No
standard-presupposed artifacts are produced by this task (no `produces`).
