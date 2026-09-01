---
title: Inconclusive evaluations' citations are held to the same collects containment check
summary: Fixes judgment-stage.ts to run the hypothesis-collects containment check over an
  inconclusive evaluation's own citations too, instead of returning it unchecked whenever the
  verdict is not confirmed or refuted.
objective: Every evaluation judgment-stage.ts records — confirmed, refuted or inconclusive — has
  every citation it carries checked against the judged hypothesis-revision's own collects before
  the evaluation is returned; an inconclusive verdict's citations are never exempted from the check
  a confirmed or refuted verdict's citations already receive.
criteria:
- Where an evaluator's own outcome answers with verdict inconclusive and one or more citations,
  each citation is checked against the judged hypothesis-revision's own collects
  (rules/investigation/a-citation-stays-within-the-hypothesis-collects) before the evaluation is
  recorded — the check is never skipped merely because the verdict is not confirmed or refuted.
- Where an inconclusive outcome's citations fail that check, the outcome is answered the same way
  a confirmed or refuted outcome that fails the check already is (the existing retry, and
  judgment-failure where the retry also fails or the deadline admits none) — never recorded with
  an out-of-collects citation as if it had passed.
- This fix changes nothing about which citations an inconclusive evaluation carries or their shape
  — including a no-data reason's own field-absent citations, whose collects-containment holds by
  construction (drawn from evidence already collected for the same hypothesis-revision) rather
  than by the checked-response remedy this task adds — it only adds the same containment check
  confirmed and refuted citations already receive to an outcome an evaluator actually returned.
implements:
- rules/investigation/a-citation-stays-within-the-hypothesis-collects
- scenarios/investigation/a-foreign-citation-is-refused
sources:
- intake/scope.md
---

## What it is

The corrective fix holding an inconclusive evaluation's own citations to the same
hypothesis-collects containment check judgment-stage.ts already runs for a confirmed or refuted
evaluation, instead of returning them unchecked — scoped to an outcome an evaluator actually
returned, since a no-data evaluation's citations are synthesized and hold the containment by
construction (rules/investigation/a-citation-stays-within-the-hypothesis-collects, amended).

## Notes

Decided while this task was bound: rules/investigation/a-citation-stays-within-the-hypothesis-collects
now states explicitly that its containment holds over a no-data evaluation by construction (drawn
from the same revision's own collected evidence), not by a checked response, and that the
refuse-and-retry remedy applies only to an outcome an evaluator returned — closing the question
this task's own scoping to "an evaluator's own outcome" depended on.
ADVISORY, from the binder — scenarios/investigation/a-foreign-citation-is-refused places the check
and its remedy at the adapter's response-validation step ("when: the adapter validates the
response"); the added check belongs on that same path, where the existing retry can still run —
not after the adapter has already returned.
ADVISORY, from the binder — rules/investigation/an-inconclusive-evaluation-declares-its-reason is a
neighbour, not a governing node here: it obliges a reason to be declared and a no-data reason to
cite non-ok evidence, neither of which this task changes.
Decision, beyond the covers — stand: rules/investigation/an-inconclusive-evaluation-declares-its-reason
is not claimed in implements; this task changes neither whether a reason is declared nor which
evidence a no-data reason cites.
ADVISORY, from the binder — domain/knowledge/hypothesis-revision (the collects' own shape) sits
outside this epic's covers; rules/investigation/a-citation-stays-within-the-hypothesis-collects
names the collects, so nothing is silent, but their shape is governed elsewhere.
Decision, beyond the covers — stand: domain/knowledge/hypothesis-revision is not claimed in
implements; this task changes no attribute of a hypothesis-revision, only how its already-declared
collects are checked against.
