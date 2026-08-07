---
title: "Proof for fallback selection between a case's two declared resolutions"
summary: "Fifteen tests over selectFallback proving the seven stated criteria — the ok/timeout/unavailable/denial/mixed branches, the read-back-unchanged fallback identity, and the no-hypothesis-confirmed exclusion — plus the recorded inference and the two vacuous-collection edge cases."
implementation: sha256:d58ed7aa6cb0989bbc9e5d5f330f4dd4246ab95cd5866cbb13629fad7e609b03
tests:
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "resolves to the hypotheses-exhausted fallback the case declares when no hypothesis confirms and every evidence carries ok"
    proves: "A case in which no hypothesis confirms and whose every evidence carries ok resolves to the hypotheses-exhausted fallback it declares."
    fails_when: "selectFallback stops returning the case's hypothesesExhaustedFallback for this input, or returns anything else (noDataFallback, undefined, a composed value)"
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "resolves to the no-data fallback the case declares when no hypothesis confirms and its evidence carries a timeout"
    proves: "A case in which no hypothesis confirms and one of whose evidences carries a timeout resolves to the no-data fallback it declares."
    fails_when: "a lone timeout evidence fails to route to publishedCase.noDataFallback"
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "resolves to the no-data fallback the case declares when no hypothesis confirms and its evidence carries an unavailability"
    proves: "A case in which no hypothesis confirms and one of whose evidences carries an unavailability resolves to the no-data fallback it declares."
    fails_when: "a lone unavailable evidence fails to route to publishedCase.noDataFallback"
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "resolves to the no-data fallback the case declares when no hypothesis confirms and its evidence carries a denial"
    proves: "A case in which no hypothesis confirms and one of whose evidences carries a denial resolves to the no-data fallback it declares."
    fails_when: "a lone denied evidence fails to route to publishedCase.noDataFallback"
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "resolves to the no-data fallback the case declares when only one of several evidences carries a result other than ok"
    proves: "A case in which no hypothesis confirms and one of whose evidences carries a result other than ok while every other carries ok resolves to the no-data fallback it declares — the mix (3 ok, 1 denied) is the case that distinguishes a correct any-non-ok check from an incorrect every-non-ok one, per the task's Notes on criterion 5"
    fails_when: "an implementation demanding unanimous non-ok evidence answers hypothesesExhaustedFallback instead, because only one of the four evidences failed"
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "returns the hypotheses-exhausted fallback object itself rather than a resolution composed anew, when every evidence carries ok"
    proves: "The resolution this selection yields is one of the two fallbacks the case declares (criterion 6, ok branch) — checked by reference identity so a value composed with the same fields still fails"
    fails_when: "selectFallback returns a resolution object that is deepEqual to but not reference-equal to publishedCase.hypothesesExhaustedFallback"
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "returns the no-data fallback object itself rather than a resolution composed anew, when an evidence carries a result other than ok"
    proves: "The resolution this selection yields is one of the two fallbacks the case declares (criterion 6, no-data branch), by reference identity"
    fails_when: "selectFallback returns a resolution object that is deepEqual to but not reference-equal to publishedCase.noDataFallback"
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "yields no fallback when the one evaluated hypothesis confirms"
    proves: "A case in which one hypothesis confirms yields no fallback from this selection."
    fails_when: "selectFallback returns a resolution (either fallback) instead of undefined when the single evaluation confirmed"
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "yields no fallback when a later evaluation among several confirms, even though every evidence carries ok"
    proves: "criterion 7, generalized to a confirmed verdict that is not the first evaluation in the list, so a check over the whole list rather than only its head is what is proven"
    fails_when: "an implementation that inspects only the first evaluation (or otherwise misses a later confirmation) returns hypothesesExhaustedFallback instead of undefined"
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "yields no fallback when an evaluation confirms, even though an evidence carries a result other than ok"
    proves: "criterion 7 together with the ordering the implementation record claims — that the confirmed check is evaluated before the evidence check"
    fails_when: "an implementation that checks evidence before evaluations returns noDataFallback instead of undefined"
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "yields no fallback when more than one evaluation confirms"
    proves: "criterion 7 extended — \"any\" confirmed evaluation, not exactly one, is what suppresses the fallback"
    fails_when: "an implementation that only checks for exactly one confirmation (e.g. via a count) mishandles two confirmed evaluations"
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "answers with undefined rather than throwing, when some hypothesis confirmed"
    proves: "the implementation record's inference that selectFallback signals no-fallback as an absent value rather than by throwing or a sentinel wrapper"
    fails_when: "selectFallback throws, or returns a non-undefined sentinel, when some hypothesis confirmed"
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "resolves to the hypotheses-exhausted fallback when no hypothesis confirms and there is no evidence at all"
    proves: "the empty-evidence edge case — Array.prototype.every's vacuous truth over zero evidence is read as \"every evidence carries ok\" rather than as an unanswerable or refused case"
    fails_when: "selectFallback throws, refuses, or answers noDataFallback for an empty evidence list"
  - file: src/__tests__/unit/knowledge/fallback-selection.spec.ts
    name: "resolves to the no-data fallback when there are no evaluations at all and an evidence carries a result other than ok"
    proves: "the empty-evaluations edge case — \"no hypothesis confirms\" reads true vacuously over zero evaluations rather than as an unanswerable case"
    fails_when: "selectFallback throws, refuses, or answers hypothesesExhaustedFallback (or undefined) for an empty evaluations list carrying a non-ok evidence"
not_applicable:
  - edge_case: "two hypotheses' evaluations sharing a name, or two evidences of one concept"
    why: "rule/investigation/one-evaluation-per-hypothesis and rule/investigation/one-evidence-per-collected-concept are recording obligations the task's own Notes (REMAINDER) declare consumed as guarantees here, owned by the judgment and collection stations outside this plan; testing this selection's behavior over an input the base declares impossible would state a domain fact this task does not hold"
  - edge_case: "a boundary at each end of a stated numeric range"
    why: "nothing this task's criteria state is a range — the inputs are a fixed closed result/verdict vocabulary and open-length collections, neither of which has an end to sit at"
  - edge_case: "an operation attempted against state that forbids it"
    why: "selectFallback is a pure function over already-resolved values with no state machine or forbidden transition to model"
  - edge_case: "a dependency that fails, is unavailable, or answers slowly"
    why: "selectFallback calls no dependency — it reads only the in-memory case, evaluations and evidence it was handed, synchronously"
  - edge_case: "two operations against one subject at once"
    why: "selectFallback is pure and stateless, sharing no mutable state across calls for two invocations to race over"
untested:
  - "that Evidence's declared shape carries only concept and result, omitting capability, observed_at, ttl, source, observation, inputs and retention — a compile-time type decision the implementation record states as an inference; TypeScript's structural typing erases at runtime, so no test built from a plain object literal can distinguish 'the type declares only these two fields' from 'the type declares more but this test only populated two', and nothing here asserts it"
  - "that selectFallback is placed under src/knowledge/ rather than src/investigation/ (the implementation record's second inference) — a module-location choice with no runtime-observable consequence a test could fail over"
---

## What it is

The tests proving `src/knowledge/fallback-selection.ts` against `task/published-case/fallback-selection`, exercising every stated criterion including the mixed-evidence case that distinguishes any-non-ok from every-non-ok.

## Notes

None.
