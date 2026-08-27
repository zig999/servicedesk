---
title: Shared investigation pipeline and the simulate HTTP surface
summary: The stage extraction shared between diagnose and simulate, the no-cache simulation composition, and the two new simulate-case/simulate-hypothesis HTTP operations.
rationale: The caller's own hint groups the extraction, the no-cache factory and both new operations as one epic; which specification nodes this epic claims as newly implemented versus reused-unchanged-and-so-uncovered, and the choice to also claim domain/investigation/evidence, evaluation, usage, cost and durations here (in addition to the instrumentation epic) because the new operations' own responses carry falsifiable shape criteria over them, are this decomposition's own reading rather than something the scope stated.
sources:
  - work/case-simulation-backend/intake/scope.md
covers:
  - contracts/investigation/case-simulation
  - contracts/investigation/diagnosis
  - rules/investigation/a-simulation-writes-no-investigation
  - rules/investigation/a-simulated-hypothesis-absent-from-the-manifest-is-refused
  - scenarios/investigation/a-draft-case-version-is-simulated
  - scenarios/investigation/a-simulation-never-enters-the-cache
  - scenarios/investigation/a-single-hypothesis-is-simulated
  - rules/investigation/the-customer-sees-only-the-text
  - rules/investigation/the-writing-input-is-narrowed
  - rules/investigation/an-answer-arrives-within-the-declared-deadline
  - rules/investigation/one-evaluation-per-required-hypothesis
  - rules/investigation/one-evidence-per-collected-concept
  - rules/investigation/collection-has-its-own-budget-within-the-total
  - rules/investigation/no-stage-aborts-on-its-deadline
  - rules/investigation/collection-runs-in-the-requester-scope
  - rules/investigation/judgment-does-not-infer
  - rules/investigation/a-decided-evaluation-cites-evidence
  - rules/investigation/an-inconclusive-evaluation-declares-its-reason
  - rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  - rules/investigation/a-citation-stays-within-the-hypothesis-collects
  - rules/investigation/a-subject-carries-at-least-one-attribute
  - rules/investigation/a-subject-attribute-is-drawn-from-the-glossary
  - rules/investigation/an-investigation-is-written-once
  - rules/investigation/the-response-follows-the-record
  - rules/investigation/replay-is-pinned
  - constraints/the-deadline-is-an-absolute-propagated-instant
  - constraints/diagnosis-answers-synchronously
  - constraints/the-evidence-cache-admits-only-ok-results
  - domain/investigation/citation
  - domain/investigation/verdict
  - domain/investigation/evidence-result
  - domain/investigation/evaluation-reason
  - domain/investigation/subject
  - domain/investigation/subject-attribute-value
  - domain/investigation/assessment
  - domain/investigation/evidence
  - domain/investigation/evaluation
  - domain/investigation/usage
  - domain/investigation/cost
  - domain/investigation/durations
  - domain/knowledge/case-version
  - domain/knowledge/case-version-state
  - domain/knowledge/hypothesis-revision
  - domain/knowledge/manifest-entry
  - domain/knowledge/resolution
  - domain/knowledge/referral
uncovered:
  - node: contracts/investigation/diagnosis
    why: diagnose's own published contract is unchanged by the stage extraction; this epic adds two new operations and touches none of diagnose's own inputs or outputs.
  - node: rules/investigation/the-customer-sees-only-the-text
    why: Neither simulate operation is customer-facing; this plan adds no customer surface, so the rule's own restriction on what the customer sees never engages.
  - node: rules/investigation/the-writing-input-is-narrowed
    why: simulate-case reuses draftAssessment unchanged; this plan does not alter what consolidation receives.
  - node: rules/investigation/an-answer-arrives-within-the-declared-deadline
    why: This rule is stated for diagnose specifically; the scope does not state simulate is held to the same declared total, and this plan does not decide that silently.
  - node: rules/investigation/one-evaluation-per-required-hypothesis
    why: Enforced by judgeHypotheses, called unchanged by the shared pipeline; no task in this plan rewrites that stage's own totality check.
  - node: rules/investigation/one-evidence-per-collected-concept
    why: Enforced by collectEvidence, called unchanged by the shared pipeline; no task in this plan rewrites that stage.
  - node: rules/investigation/collection-has-its-own-budget-within-the-total
    why: The COLLECTION_STAGE_BUDGET_MS convention is reused unchanged by the shared pipeline, per the inventory's own must_not_duplicate note.
  - node: rules/investigation/no-stage-aborts-on-its-deadline
    why: Reused unchanged from collectEvidence/judgeHypotheses; this plan writes no new abort-on-deadline logic.
  - node: rules/investigation/collection-runs-in-the-requester-scope
    why: Reused unchanged; the shared pipeline still runs collection in the requester's own authorization scope, unaltered by extraction.
  - node: rules/investigation/judgment-does-not-infer
    why: Enforced by the judgment prompt's own fixed instruction, unchanged by widening the port's return shape.
  - node: rules/investigation/a-decided-evaluation-cites-evidence
    why: Enforced by judgeHypotheses/citation-validation.ts, reused unchanged.
  - node: rules/investigation/an-inconclusive-evaluation-declares-its-reason
    why: Enforced by judgeHypotheses, reused unchanged.
  - node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
    why: Enforced by citation-validation.ts, reused unchanged.
  - node: rules/investigation/a-citation-stays-within-the-hypothesis-collects
    why: Enforced by citation-validation.ts, reused unchanged.
  - node: rules/investigation/an-investigation-is-written-once
    why: Simulate never writes an investigation, so this invariant has nothing new to apply to; this plan adds no second writer.
  - node: rules/investigation/replay-is-pinned
    why: buildInvestigation's own pinning logic is unchanged by the stage extraction; this plan does not alter what diagnose pins.
  - node: constraints/the-deadline-is-an-absolute-propagated-instant
    why: The propagation mechanics are exercised by calling the same, unmodified collectEvidence/judgeHypotheses stages; no task here rewrites them.
  - node: constraints/diagnosis-answers-synchronously
    why: diagnose's own synchronous answer is unchanged; this plan adds no job, queue or polling anywhere, including for the two new operations.
  - node: constraints/the-evidence-cache-admits-only-ok-results
    why: No cache implementation exists in this tree and this plan does not build one; the no-cache composition proves the negative without a cache to admit anything into.
---

## What it is

run-diagnosis.ts's own stages 1 through 4, pulled into one function both diagnose and simulate call, returning the complete record.
A composition/factory that assembles a simulation's observation source with no cache layer, by construction.
POST /v1/simulate, returning the complete record for a case version in either state, without writing an investigation.
POST /v1/simulate/hypothesis, narrowed to one named hypothesis's own collects and judgment, with no outcome or assessment resolved.

## Notes

None.
