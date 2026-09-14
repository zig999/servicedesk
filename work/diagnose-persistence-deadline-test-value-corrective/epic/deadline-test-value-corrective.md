---
title: The persistence-deadline test's injected total deadline matches the declared total
summary: The one corrective task deriving the test's injected total deadline from the specification's
  own declared total (20 seconds) instead of a locally chosen figure (30 seconds).
rationale: A corrective increment cuts no epic through survey/decomposition — this is the structural container
  the validator still requires, holding exactly the one task's own claim, seeded from trace.py --encodes
  over src/__tests__/integration/http/diagnose-persistence-deadline-e2e.spec.ts, grown to include rules/investigation/an-answer-arrives-within-the-declared-deadline,
  the node the review's own finding named and which trace.py had not yet bound this file to.
sources:
- work/diagnose-persistence-deadline-test-value-corrective/intake/corrective-deadline-test-value.md
covers:
- rules/investigation/an-answer-arrives-within-the-declared-deadline
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
uncovered:
- node: domain/knowledge/hypothesis-revision
  why: Neighbors this file's own fixture setup; neither the hypothesis-revision aggregate nor its attributes
    are touched by aligning a deadline constant.
- node: rules/knowledge/a-hypothesis-revision-moves-through-its-declared-lifecycle
  why: Governs a different fact (release/draft lifecycle and its own HTTP 409 refusal) untouched by this
    correction.
---
## What it is
The one corrective task aligning TOTAL_DEADLINE_BUDGET_MS with the specification's declared total.

## Notes
None.
