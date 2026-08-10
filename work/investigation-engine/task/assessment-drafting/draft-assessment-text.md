---
title: Draft the assessment's text from the narrowed input
summary: Produces the one field drafting is responsible for — the assessment's text — from the narrowed input alone.
objective: Given the narrowed writing input and the resolved outcome, drafting produces the assessment's text, completing an Assessment whose outcome, referral and determining hypothesis are exactly the resolved ones.
criteria:
  - The assessment's outcome, referral and determining hypothesis equal exactly the resolved values it was given, unchanged by drafting.
  - The assessment's determining hypothesis is present exactly when a hypothesis confirmed, and absent exactly when the fallback answered.
  - Drafting receives only the narrowed input a prior step assembled, never the case's own hypotheses or criteria.
  - Drafting imports no framework, driver or provider client, remaining a pure function of its narrowed input.
depends_on:
  - task/assessment-drafting/resolve-and-narrow-input
rationale: No domain-model node in the impact set names a dedicated writing port, unlike hypothesis-evaluator; this task treats drafting as a narrow, input-constrained text-production step rather than inventing an ungoverned port, leaving a production-quality generator an open implementation choice within that constraint.
implements:
  - domain/investigation/assessment
  - rules/investigation/the-outcome-comes-from-the-case
  - rules/investigation/the-writing-input-is-narrowed
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

The step that produces the text and nothing else the assessment carries.
Its input is already narrowed before it runs, so nothing here can contradict the resolved outcome.

## Notes

REMAINDER, from the specification — scenarios/knowledge/no-confirmation-falls-back's given/when exercise the case's own resolve-outcome over its hypotheses and evaluations, and this task's drafting never receives the case's hypotheses or evaluations and never resolves anything; its objective takes the resolved outcome as an already-given input. Belongs to task/assessment-drafting/resolve-and-narrow-input, which reuses the case's resolve-outcome.
REMAINDER, from the specification — scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome likewise exercises the case resolving the outcome over declared hypotheses and evaluations, including the precedence choice this task's criteria never compute. Belongs to task/assessment-drafting/resolve-and-narrow-input.
REMAINDER, from the specification — rules/investigation/the-writing-input-is-narrowed states what the narrowed input must contain in each case (a confirmed hypothesis's own evidence, or every verdict with its reason when none confirmed); this task's criteria only bound what drafting's input must exclude, because assembling that input is a prior step's work, not drafting's own. Belongs to task/assessment-drafting/resolve-and-narrow-input, which assembles the narrowed writing input before drafting ever sees it.
