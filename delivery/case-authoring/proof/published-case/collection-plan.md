---
title: "Proof for a published case's plan of collection"
summary: "Tests over collectionPlan() proving the union-of-concepts, each-once answer and its independence from the case's body text."
implementation: sha256:375f50552173171a5b7513eaa61743362b6a5abd5c2f63f1bf5d7a1110409185
tests:
  - file: src/__tests__/unit/knowledge/collection-plan.spec.ts
    name: "includes a concept collected by exactly one hypothesis of the case"
    proves: "A concept collected by exactly one hypothesis appears in the answer."
    fails_when: "collectionPlan stops including a concept named by the case's only hypothesis"
  - file: src/__tests__/unit/knowledge/collection-plan.spec.ts
    name: "includes a concept collected by two hypotheses exactly once"
    proves: "A concept collected by two hypotheses appears once in the answer."
    fails_when: "a concept named by two hypotheses is either dropped or duplicated in the answer"
  - file: src/__tests__/unit/knowledge/collection-plan.spec.ts
    name: "answers with every concept every hypothesis collects, when the hypotheses' collected sets are disjoint"
    proves: "A case whose hypotheses collect disjoint sets answers with every concept every hypothesis collects."
    fails_when: "any concept named by any of the three disjoint hypotheses is missing from the answer"
  - file: src/__tests__/unit/knowledge/collection-plan.spec.ts
    name: "answers with no concept absent from every hypothesis of the case"
    proves: "No concept absent from every hypothesis of the case appears in the answer."
    fails_when: "a concept no hypothesis of the case names appears in the answer"
  - file: src/__tests__/unit/knowledge/collection-plan.spec.ts
    name: "answers with the same set of concepts for two cases whose structured hypotheses are identical and whose body text differs"
    proves: "Two cases whose structured hypotheses are identical and whose body text differs answer with the same set of concepts."
    fails_when: "collectionPlan reads curatorNotes (or any other free-text field) and the two answers diverge because the notes differ"
  - file: src/__tests__/unit/knowledge/collection-plan.spec.ts
    name: "answers with no entries for a case declaring no hypotheses"
    proves: "the empty-collection edge case of the union-over-hypotheses behavior the objective states"
    fails_when: "collectionPlan throws, or returns a non-empty array, for a case whose hypotheses list is empty"
  - file: src/__tests__/unit/knowledge/collection-plan.spec.ts
    name: "does not repeat a concept named twice within one hypothesis's own collects"
    proves: "the each-concept-once guarantee holds for a duplicate declared inside a single hypothesis, not only across two hypotheses"
    fails_when: "a concept named twice in one hypothesis's own collects list appears twice in the answer"
  - file: src/__tests__/unit/knowledge/collection-plan.spec.ts
    name: "stands its entries in the order concepts are first encountered, across hypotheses in the order the case declares them"
    proves: "the implementation's recorded inference that the answer preserves first-encounter order (declared hypothesis order, then each hypothesis's declared collects order) rather than sorting"
    fails_when: "the answer is alphabetized, reversed, or otherwise reordered away from first-encounter order"
not_applicable:
  - edge_case: "a hypothesis declaring an empty collects list"
    why: "the function's inner loop simply iterates zero times for such a hypothesis; this falls out of the same mechanism the no-hypotheses test already exercises (an empty walk contributes nothing), and no criterion singles it out as a distinct behavior worth its own assertion"
  - edge_case: "two concurrent calls, or a dependency that is slow or unavailable"
    why: "collectionPlan is a pure synchronous function over a value already constructed in memory; it holds no shared state and calls nothing external, so neither concurrency nor a failing dependency is a behavior this code can exhibit"
  - edge_case: "a boundary at each end of a numeric range"
    why: "the function takes no numeric parameter and computes no range; its only input is a case's declared hypotheses list, already covered by the empty-list and multi-hypothesis tests above"
  - edge_case: "an operation attempted against state that forbids it"
    why: "collectionPlan performs no write and checks no precondition against mutable state; it only reads an already-constructed Case value, so there is no forbidding state for it to be run against"
untested:
  - "that the returned array is frozen (Object.freeze). The implementation does this, mirroring required-evaluations.ts, but the implementation record does not list it among its stated inferences the way required-evaluations.md does — so per this proof's own rule of testing only inferences the record states, no test was written for it here, and the behavior stays unproven by this record"
---

## What it is

The tests proving `src/knowledge/collection-plan.ts` against `task/published-case/collection-plan`, exercising the union-of-concepts answer and its independence from the case's body text.

## Notes

None.
