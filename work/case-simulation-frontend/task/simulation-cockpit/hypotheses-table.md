---
title: Hypotheses table
summary: Renders the precedence-ordered StatusTable of every manifested hypothesis, its actions, and the last-run summary line and timing bar.
sources:
  - work/case-simulation-frontend/intake/scope.md
objective: The Hypotheses region shows, for the version's manifest, one StatusTable row per hypothesis in precedence order — always all of them — with position, name, concepts-collected count, the last run's verdict (with its reason when inconclusive) and token cost, a simulate-this-hypothesis action and an edit-this-hypothesis action, and beneath the table the determining/outcome/referral summary line.
criteria:
  - Every hypothesis the version's manifest declares renders as exactly one row, in the manifest's own precedence order, whether or not that hypothesis has run this session.
  - Each row shows the number of concepts that hypothesis's own revision collects, per domain/knowledge/hypothesis-revision.
  - A row whose last run resolved inconclusive always shows its reason alongside the verdict; a row that has not run this session shows no verdict.
  - A row's edit action links to /cases/$slug/versions/$version/manifest/hypotheses/$hypothesisName?back=simulate for that hypothesis.
  - The summary line beneath the table shows the determining hypothesis, the resolved outcome and the referral from the last full-case run, and is absent when no full-case run has completed this session.
  - A row's simulate action is exposed as a callback the region itself does not implement the dispatch of.
reference:
  - layout/simulation-screen.md
implements:
  - contracts/investigation/case-simulation
  - domain/knowledge/case-version
  - domain/knowledge/manifest-entry
  - domain/knowledge/hypothesis-revision
  - domain/investigation/evaluation
  - domain/investigation/verdict
  - domain/investigation/evaluation-reason
  - domain/investigation/usage
  - domain/investigation/assessment
  - domain/knowledge/resolution
  - domain/knowledge/referral
  - domain/investigation/durations
  - rules/investigation/a-simulation-writes-no-investigation
  - rules/investigation/the-customer-sees-only-the-text
  - scenarios/investigation/a-draft-case-version-is-simulated
  - scenarios/investigation/a-single-hypothesis-is-simulated
---

## What it is

The center-right column of the layout, described in the scope's "Hypotheses" section.

## Notes

Criterion "the stage-timing bar shows the last run's durations against the 7s/5s/4s budgets" dropped on composition: `domain/investigation/durations` states no budget figures of its own — the 7/5/4-second numbers live only in `rules/investigation/an-answer-arrives-within-the-declared-deadline` and `rules/investigation/collection-has-its-own-budget-within-the-total`, both scoped to `diagnose` and outside this task's candidates and this epic's covers. The bar shows the last run's measured durations without a budget comparison the specification does not extend to simulation.
Row labeling by hypothesis name dropped as a stated criterion, kept as an implementation note: the "name" attribute lives on `domain/knowledge/hypothesis`, outside this task's candidates; a row that has produced an evaluation this session can source the name from `domain/investigation/evaluation`'s own `hypothesis` field, already in this task's candidates.
Decision, beyond the covers — stand: `rules/investigation/an-answer-arrives-within-the-declared-deadline` is named only to explain a dropped criterion, never as a fact this task implements.
Decision, beyond the covers — stand: `rules/investigation/collection-has-its-own-budget-within-the-total` is named only to explain the same dropped criterion, never as a fact this task implements.
Decision, beyond the covers — stand: `domain/knowledge/hypothesis` is named only to explain an implementation detail (where a row's own name comes from), never as a fact this task implements.
