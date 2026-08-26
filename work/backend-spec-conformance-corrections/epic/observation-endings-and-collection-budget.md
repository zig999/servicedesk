---
title: Observation endings and collection budget
summary: The observation port and its production adapter and stage caller conform to the unavailable-ending and budget-clamp rules two same-day analyses added.
rationale: The scope states behavior 1 as two rule violations (four raise-sites that should end unavailable, and a missing budget clamp) sharing one adapter file, but the inventory's own risk notes that widening ObservationOutcome/observeConcept is a port change every caller must follow. I kept the two rule violations as two separate objectives (their falsifiable outcomes are independent — a wrong ending detail and a wrong timeout bound are different failures) and, within each, split the port/adapter change from evidence-collection-stage.ts's own consumption of it, since the stage is a caller of the widened port rather than part of delivering it. I also decided the DuplicateConceptAnswerError case is caught and reclassified at the adapter's own resolveCapability boundary rather than by changing ICapabilityQuery.readCapability itself, because the governing rules speak only to observation, not to the shared read method judgment-stage.ts, validate-case-coherence.ts and read-capability.controller.ts also call directly — so none of those three files needs to change, and this epic does not cover contracts/knowledge/capability-check or the nodes governing the contract-check's own read.
covers:
  - rules/integration/an-unresolvable-observation-ends-unavailable
  - rules/integration/an-http-connector-configuration-declares-its-call
  - rules/investigation/collection-has-its-own-budget-within-the-total
  - domain/investigation/evidence-result
  - domain/investigation/evidence
  - contracts/investigation/observation-source
  - contracts/integration/concept-observation
  - domain/investigation/investigation
  - scenarios/investigation/a-slow-capability-yields-to-the-collection-budget
  - rules/integration/one-capability-answers-one-concept
  - contracts/knowledge/capability-check
  - rules/knowledge/the-contract-check-reads-the-current-registration
  - rules/investigation/a-cited-field-exists-in-the-capability-output-schema
  - rules/knowledge/every-collected-concept-has-a-read-only-capability
uncovered:
  - node: contracts/knowledge/capability-check
    why: This epic keeps the unresolvable-observation fix at the adapter boundary rather than changing ICapabilityQuery.readCapability itself, so the contract check's own consumption of read-capability is untouched.
  - node: rules/knowledge/the-contract-check-reads-the-current-registration
    why: Same reason as capability-check — nothing here changes what or when the contract check reads.
  - node: rules/investigation/a-cited-field-exists-in-the-capability-output-schema
    why: The adapter's citation-field validation (declaredFieldsOf) is reused unchanged by this plan; only the observation's own ending classification and timeout bound are corrected.
  - node: rules/knowledge/every-collected-concept-has-a-read-only-capability
    why: Hypothesis-revision validation of concept-capability coverage is untouched; this plan only corrects the observation adapter's own endings and budget.
  - node: domain/investigation/investigation
    why: Every binder bound to this epic's four tasks read this node and excluded it — the aggregate's own attributes and operations are untouched; only the observation's ending and the call's timeout bound are corrected.
  - node: rules/integration/one-capability-answers-one-concept
    why: The decision log locates the observation's own duplicate-answer ending in rules/integration/an-unresolvable-observation-ends-unavailable, not in this policy, which continues to govern only the published concept read's own HTTP 500 refusal — untouched by this plan.
sources:
  - intake/scope.md
---

## What it is

The observation port carries an unavailable ending naming its cause instead of the adapter throwing for four presently-unresolvable conditions.
The observation port accepts a remaining-budget bound so a capability's own timeout never outlasts the collection stage's seven-second budget.
The collection stage records the observation's result detail on the evidence it writes and propagates its own remaining time into each call.

## Notes

None.
