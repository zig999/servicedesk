---
title: "Proof for the check that a case declares at least one hypothesis"
summary: "Tests over caseHasAtLeastOneHypothesis proving it refuses an empty hypotheses list, passes one or several hypotheses through unrefused, freezes both answers, and never aborts the validation run it sits inside."
implementation: sha256:4ee7274768358cf4447ec4488febc342cf5038d8b7357b125963c6e9cdef1b9d
tests:
  - file: src/__tests__/unit/knowledge/case-has-at-least-one-hypothesis.spec.ts
    name: "refuses a case declaring no hypothesis"
    proves: "A case declaring no hypothesis is refused by this check."
    fails_when: "hypotheses.length === 0 answers an empty array instead of a non-empty one — the case is not refused"
  - file: src/__tests__/unit/knowledge/case-has-at-least-one-hypothesis.spec.ts
    name: "answers a refusal naming the rule that refused and its own stated text, with no position named"
    proves: "the implementation record's stated encoding of rule/knowledge/case-has-at-least-one-hypothesis — the refusal's rule field is the node's own path, its text is the node's own statement quoted unchanged, and it names no hypothesis and no offended term"
    fails_when: "the refusal is missing, carries a different rule identifier or reworded text, or names a hypothesis or offended term for the case-level refusal"
  - file: src/__tests__/unit/knowledge/case-has-at-least-one-hypothesis.spec.ts
    name: "does not refuse a case declaring exactly one hypothesis"
    proves: "A case declaring exactly one hypothesis is not refused by this check."
    fails_when: "hypotheses.length === 1 still produces a refusal"
  - file: src/__tests__/unit/knowledge/case-has-at-least-one-hypothesis.spec.ts
    name: "does not refuse a case declaring several hypotheses"
    proves: "A case declaring several hypotheses is not refused by this check."
    fails_when: "a count above one produces a refusal, e.g. an off-by-one or an upper bound the rule does not state"
  - file: src/__tests__/unit/knowledge/case-has-at-least-one-hypothesis.spec.ts
    name: "freezes the array it answers with on the refusing path"
    proves: "the implementation's recorded inference that the returned refusal array is frozen with Object.freeze on both the passing and refusing path"
    fails_when: "the refusing answer is a plain, mutable array"
  - file: src/__tests__/unit/knowledge/case-has-at-least-one-hypothesis.spec.ts
    name: "freezes the array it answers with on the passing path"
    proves: "the same frozen-array inference on the empty-answer path"
    fails_when: "the passing answer is a plain, mutable array"
  - file: src/__tests__/unit/knowledge/case-has-at-least-one-hypothesis.spec.ts
    name: "lets a companion check registered beside it still report its own refusal over the same no-hypothesis case"
    proves: "the binding's UNDERDETERMINED entry, excluded — the check answers with a refusal value rather than aborting the validation it runs in, so a companion check registered after it in validate() still gets to run and its refusal still gets answered"
    fails_when: "caseHasAtLeastOneHypothesis raises or exits on the no-hypothesis case instead of returning; validate() then never reaches the companion, the companion's refusal is absent from the answer, and the test itself fails with the propagated throw or the terminated process rather than an assertion mismatch"
not_applicable:
  - edge_case: "hypotheses absent or not an array"
    why: "DraftCase declares hypotheses as a required readonly array; a value without it does not conform to the type this check is written against, and admitting it would require asserting a shape the base does not state — draft-case.ts admits only the empty list, not the absent field, as the malformed case a check must walk"
  - edge_case: "two hypotheses sharing a declared name"
    why: "this check counts the list's length and inspects none of its entries (the binding's own note); uniqueness is the neighbouring unique-hypothesis-names check's concern, a sibling task this plan holds separately"
  - edge_case: "a malformed individual hypothesis (missing collects, empty confirmsWhen, etc.)"
    why: "the same note — this check never reads an entry's fields, only the list's length, so no malformed entry can change its answer"
  - edge_case: "two calls against one case at once"
    why: "caseHasAtLeastOneHypothesis is a pure function of its argument with no shared mutable state and no write; there is nothing for two calls to race over"
  - edge_case: "a slow or failing dependency"
    why: "the check reads only the DraftCase it is handed, declares no dependency, and calls nothing external"
  - edge_case: "mutating the answered array after receiving it"
    why: "covered by the two freeze tests directly — Object.isFrozen is the whole of what there is to check, and a mutation attempt would only re-demonstrate the same fact under strict mode"
untested:
  - "whether this check, once registered alongside the plan's other sibling publication checks (terms-exist-in-the-glossary, recipient-is-a-role, unique-hypothesis-names, concept-accepts-the-subject-type, concept-declares-a-ttl, hypothesis-collects-a-concept, read-only-capability), still answers correctly inside that full list — the implementation record defers assembling that list to a task this plan holds separately, so nothing here builds or exercises it"
---

## What it is

The tests proving `src/knowledge/case-has-at-least-one-hypothesis.ts` against `task/case-validator/at-least-one-hypothesis`, following the sibling precedent at `validation.spec.ts` and `required-evaluations.spec.ts`.

## Notes

None.
