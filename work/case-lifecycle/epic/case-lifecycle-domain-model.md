---
title: The case-version aggregate's own types and structural validation
summary: Hypothesis identity separated from its revisioned content, the manifest entry that pins one revision at one position, and the case-version type carrying state and released_at — plus the structural, at-every-read checks over that shape.
rationale: domain/knowledge/knowledge's own _context.md states the model lives in the schema and its validator rather than in classes; I therefore cut the type declarations (case.ts) and the structural validator (parse-case-document.ts) as one task rather than two, since together they are what that description calls "the model."
sources:
- work/case-lifecycle/intake/scope.md
covers:
- domain/knowledge/case-version
- domain/knowledge/case-version-state
- domain/knowledge/manifest-entry
- domain/knowledge/hypothesis
- domain/knowledge/hypothesis-revision
- rules/knowledge/a-hypothesis-collects-at-least-one-concept
- rules/knowledge/a-hypothesis-declares-a-criterion
- rules/knowledge/a-case-has-at-least-one-hypothesis
- rules/knowledge/validation-runs-at-every-read
- rules/knowledge/one-falsifiable-claim-per-criterion
uncovered:
- node: rules/knowledge/one-falsifiable-claim-per-criterion
  why: Verified by human review of the criterion's own prose, per the rule's own description — not by the validator or by any code this plan writes.
---

## What it is

The plain types that give the identity/revision/manifest split a name in code, and the structural refusal that holds them to the cardinality rules at every read.
The shape a diagnosis consumer already reads is not this epic's to change.

## Notes

None.
