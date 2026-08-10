---
title: Resolve the outcome and narrow the writing input
summary: Resolves the case's outcome over the completed evaluations and assembles exactly the input the writing step may see.
objective: Given the pinned case and its completed evaluations, the outcome, referral and determining hypothesis come from the case's own resolve-outcome, and the writing input contains only what the resolved outcome admits.
criteria:
  - The resolved outcome, referral and determining hypothesis equal exactly what the case's own resolve-outcome answers for the given evaluations, computed nowhere else.
  - When a hypothesis confirmed, the narrowed input carries that hypothesis's own evidence and no other hypothesis's evidence.
  - When no hypothesis confirmed, the narrowed input carries every evaluation's verdict and reason, and no case body.
  - The narrowed input never contains the case's hypotheses' criteria or its when_to_use text.
depends_on:
  - task/evidence-collection/evidence-collection-stage
  - task/hypothesis-judgment/hypothesis-evaluator-port
rationale: Resolving the outcome and narrowing what drafting may see is one objective distinct from producing the text itself; this step reuses the existing case-resolution.resolveOutcome rather than recomputing the outcome, per the must_not_duplicate the inventory names.
implements:
  - domain/investigation/assessment
  - domain/investigation/investigation
  - domain/investigation/evidence
  - domain/investigation/evaluation
  - domain/knowledge/hypothesis
  - rules/investigation/the-outcome-comes-from-the-case
  - rules/investigation/the-writing-input-is-narrowed
  - scenarios/knowledge/no-confirmation-falls-back
  - scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

The step that decides what drafting is allowed to see.
It reuses the case's own resolve-outcome rather than deciding the outcome itself.

## Notes

UNDERDETERMINED, from the specification — constraints/the-domain-depends-on-no-infrastructure governs this task, but none of the four stated criteria states the purity requirement its sibling tasks (case-resolution, draft-assessment-text) each carry explicitly. Passes: an implementation whose resolving/narrowing module reaches a database driver or an HTTP client directly instead of receiving the pinned case, evaluations, evidence and assessment as already-loaded domain values — while still returning the outcome exactly as resolve-outcome answers and narrowing the input exactly as criteria 2-4 require.
