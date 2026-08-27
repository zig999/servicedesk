---
title: CaseSummary's JSDoc cites the specification's own current statement, not a stale inference claim
summary: cases-list-screen.tsx's CaseSummary type comment no longer says the zero-version case "is an edge no governing node addresses" or "this task's own inference" — it cites domain/knowledge/case-summary and rules/knowledge/a-case-summary-is-derived-from-its-existing-versions's own current, decided statement of that case.
objective: A reader of cases-list-screen.tsx's CaseSummary comment learns that the zero-version handling (currentState and lastUpdated absent, version_count zero) is what the specification decides today, not an uncited edge case or an unattributed inference — so a later change made on the comment's own word would be recognized as a departure from the specification rather than tidying an inference.
criteria:
  - The comment no longer states or implies that the zero-version case is "an edge no governing node addresses."
  - The comment no longer attributes the zero-version handling to "this task's own inference."
  - The comment cites domain/knowledge/case-summary's own conditional-presence statement for current_state and last_updated.
  - The comment cites rules/knowledge/a-case-summary-is-derived-from-its-existing-versions's own statement of the zero-version case (version_count zero, neither current_state nor last_updated).
  - No behavior changes — the CaseSummary type, fetchCaseSummary, and every other line of the file are unchanged; only the comment's own text changes.
implements:
  - domain/knowledge/case-summary
  - rules/knowledge/a-case-summary-is-derived-from-its-existing-versions
rationale: A corrective increment answering to no criterion any task holds — the divergence was found by siegard-reconcile/post-case-summary-optional-analyse-drift.md's judgment over cases-list-screen.tsx, reconciling delivered code against the specification rather than any task's own criteria. The comment was accurate when written; an /analyse since (decision-log.md, committed as c9b7594) amended both nodes it names to state the zero-version case directly, making the comment's "no governing node addresses" and "this task's own inference" claims stale.
sources:
  - intake/2026-08-27-cases-list-screen-stale-comment.md
---

## What it is

A corrective increment: one comment's own stale claim about what the specification does and does not decide, corrected to cite what it now decides, after an /analyse it could not have known about.

## Notes

None.
