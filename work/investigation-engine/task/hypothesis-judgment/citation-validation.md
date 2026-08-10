---
title: Structural validation of an evaluator's citations
summary: A pure check that every citation an evaluator's response names belongs to the judged hypothesis's collects and points at a field the citing evidence's capability actually declares.
objective: Given one hypothesis, its evidence and a proposed set of citations, the check accepts only citations whose concept is in the hypothesis's own collects and whose field exists in that concept's capability's output schema, and refuses otherwise.
criteria:
  - A citation naming a concept outside the judged hypothesis's collects is refused.
  - A citation naming a field absent from the output schema of the capability that produced the cited evidence is refused.
  - A citation naming a concept in the hypothesis's collects and a field present in that capability's output schema is accepted.
depends_on:
  - task/hypothesis-judgment/hypothesis-evaluator-port
rationale: Machine-checkable citation validity is its own falsifiable, fixture-testable behavior, reusable by any adapter; folding it into the orchestration task would mix a pure structural check with the stage's retry-and-deadline policy, which changes for a different reason.
implements:
  - domain/investigation/citation
  - rules/investigation/a-citation-stays-within-the-hypothesis-collects
  - rules/investigation/a-cited-field-exists-in-the-capability-output-schema
sources:
  - intake/scope.md
---

## What it is

The check that makes a citation's validity machine-checkable rather than a promise.
It reads the judged hypothesis's own collects and the cited capability's output schema, never anything else.

## Notes

UNDERDETERMINED, from the specification — constraints/the-domain-depends-on-no-infrastructure binds this domain-layer check, but no criterion states an import-freedom condition. Passes: a check that correctly accepts or refuses every citation per criteria 1-3 while importing a framework, driver or provider client directly to resolve the hypothesis's collects or the capability's output schema — which the constraint refuses.
REMAINDER, from the specification — rules/investigation/a-decided-evaluation-cites-evidence's "every confirmed or refuted evaluation carries at least one citation" reaches no criterion here, which checks one proposed citation at a time and never assembles an evaluation. Belongs to task/hypothesis-judgment/judgment-stage.
REMAINDER, from the specification — rules/investigation/an-inconclusive-evaluation-declares-its-reason reaches no criterion here, which never produces an Evaluation, a verdict or a reason. Belongs to task/hypothesis-judgment/judgment-stage.
REMAINDER, from the specification — rules/investigation/judgment-does-not-infer binds the judgment call's own reasoning, not the structural well-formedness of a citation already proposed. Belongs to task/hypothesis-judgment/hypothesis-evaluator-port and its future production adapter.
REMAINDER, from the specification — rules/investigation/no-stage-aborts-on-its-deadline reaches no criterion here at all. Its judgment clause belongs to task/hypothesis-judgment/judgment-stage, its collection clause to task/evidence-collection/evidence-collection-stage, its persistence clause to task/investigation-lifecycle/investigation-store and task/investigation-lifecycle/diagnose-entry-point.
REMAINDER, from the specification — rules/investigation/one-evaluation-per-required-hypothesis reaches no criterion here, which never assembles an investigation's evaluations. Belongs to task/investigation-lifecycle/investigation-factory.
ADVISORY, from the specification — domain/investigation/hypothesis-evaluator, evaluation, evaluation-reason, verdict, contracts/integration/capability-registry and the pool/deadline constraints neighbor this task without governing it: none of the three criteria construct an Evaluation, decide a verdict, invoke the port, or run under a pool or deadline.
ADVISORY, from the specification — scenarios/investigation/a-foreign-citation-is-refused's refusal then-clause matches criterion 1, but its retry-or-fallback clauses are orchestration this pure check does not perform.
ADVISORY, from the specification — domain/knowledge/hypothesis and domain/integration/capability, named in the constraining rules' own `constrains`, sit outside this task's candidates; this check takes a hypothesis's collects and a capability's output schema as already-available plain data and models neither.
Decision, beyond the covers — stand: neither node is rebuilt by this plan — domain/knowledge/hypothesis is already delivered by case-authoring-mvp and domain/integration/capability by the capability-registry epic of that same plan; this check only reads their already-available data, so naming them here is a citation of already-standing facts, not a claim this epic's covers needs to grow to answer.
