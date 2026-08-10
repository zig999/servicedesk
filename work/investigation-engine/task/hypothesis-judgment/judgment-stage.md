---
title: Isolated, deadline-bounded judgment of every required hypothesis
summary: Judges every hypothesis the pinned case requires, one isolated parallel call each, retrying once on an invalid citation set when the deadline still allows it and falling back to inconclusive otherwise.
objective: Given a pinned case's required hypotheses and their evidence, the stage produces exactly one Evaluation per required hypothesis, each valid or degraded to a declared inconclusive reason, within a bounded pool of isolated parallel calls.
criteria:
  - Every hypothesis the pinned case requires receives exactly one evaluation, and no hypothesis is silently omitted.
  - Each hypothesis is judged in its own call, isolated from every other hypothesis's prompt, under a configured pool bound.
  - A response whose citations fail structural validation triggers one retry when the remaining deadline admits it, and otherwise the evaluation falls back to inconclusive with reason judgment-failure.
  - A hypothesis that never receives a call slot before the stage's deadline, or whose call has not returned by then, is recorded inconclusive with reason deadline-exceeded, never no-data or judgment-failure.
  - A hypothesis whose evidence result is not ok is recorded inconclusive with reason no-data, citing that evidence.
  - A confirmed or refuted evaluation carries at least one citation; an evaluation with none is never confirmed or refuted.
depends_on:
  - task/hypothesis-judgment/hypothesis-evaluator-port
  - task/hypothesis-judgment/citation-validation
rationale: The orchestration that calls the port under a pool, a retry policy and a deadline is one coherent objective, distinct from the port's own shape and from the pure citation check, changing when the retry or degradation policy changes rather than when the interface or the structural check does.
implements:
  - domain/investigation/hypothesis-evaluator
  - domain/investigation/evaluation
  - domain/investigation/evaluation-reason
  - domain/investigation/citation
  - domain/investigation/verdict
  - rules/investigation/a-citation-stays-within-the-hypothesis-collects
  - rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  - rules/investigation/a-decided-evaluation-cites-evidence
  - rules/investigation/an-inconclusive-evaluation-declares-its-reason
  - rules/investigation/judgment-does-not-infer
  - rules/investigation/no-stage-aborts-on-its-deadline
  - rules/investigation/one-evaluation-per-required-hypothesis
  - scenarios/investigation/a-foreign-citation-is-refused
  - scenarios/investigation/a-queued-judgment-is-deadline-exceeded
  - scenarios/investigation/a-collection-timeout-degrades-to-no-data
  - contracts/integration/capability-registry
  - constraints/hypotheses-are-judged-in-isolated-parallel-calls
  - constraints/judgment-runs-behind-a-port
  - constraints/the-deadline-is-an-absolute-propagated-instant
  - constraints/the-domain-depends-on-no-infrastructure
sources:
  - intake/scope.md
---

## What it is

The stage that turns required hypotheses and their evidence into one evaluation each.
Every degradation path this stage can hit — a foreign citation, a missed pool slot, evidence that never arrived — lands as one of the three declared reasons, never as a gap or an invented inference.

## Notes

UNDERDETERMINED, from the specification — criteria 3 and 6 as written require only structural citation validity and at least one citation on a decided verdict; nothing excludes a verdict whose citation is structurally valid but does not actually ground it, which rules/investigation/judgment-does-not-infer refuses. Passes: an evaluator that, given evidence supporting no particular verdict, still returns a confirmed or refuted verdict with one structurally valid citation — satisfying every stated criterion while being the invented judgment the rule refuses.
REMAINDER, from the specification — the clause "collection records a timeout result" of rules/investigation/no-stage-aborts-on-its-deadline, and the matching step of scenarios/investigation/a-collection-timeout-degrades-to-no-data, govern the collection stage's own behavior on its own timeout, not this task. Belongs to task/evidence-collection/evidence-collection-stage.
REMAINDER, from the specification — the clause "persistence as the single declared exception, whose failure is an error to the requester" of rules/investigation/no-stage-aborts-on-its-deadline governs the persistence stage's deadline behavior. Belongs to task/investigation-lifecycle/investigation-store and task/investigation-lifecycle/diagnose-entry-point.
REMAINDER, from the specification — the step "the investigation proceeds and answers within the total deadline" of scenarios/investigation/a-collection-timeout-degrades-to-no-data describes a guarantee over the whole investigation across every stage. Belongs to task/investigation-lifecycle/diagnose-entry-point.
