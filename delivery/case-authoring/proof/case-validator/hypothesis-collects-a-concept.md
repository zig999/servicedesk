---
title: "Proof for a hypothesis collects at least one concept"
summary: "Tests proving hypothesisCollectsAtLeastOneConcept refuses a case with an empty-collects hypothesis, passes a case whose hypotheses all collect at least one concept, and reaches a failing hypothesis wherever it sits, including the malformed no-hypothesis case the binding flagged as UNDERDETERMINED."
implementation: sha256:3b3fb4a0f6d2cf1ce2b2e81881296db3cd03ef1a750becb74076f91695d65e3a
tests:
  - file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts
    name: "refuses a case holding one hypothesis that collects no concept"
    proves: "A case holding one hypothesis that collects no concept is refused by this check."
    fails_when: "the check answers an empty array (or otherwise refuses nothing) for a case whose only hypothesis declares an empty collects list"
  - file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts
    name: "answers a refusal naming the rule and the offending hypothesis, with no offended term and the rule's own stated text"
    proves: "the implementation's own recorded inference that a refusal for a hypothesis collecting nothing names the offending hypothesis but carries no offendedTerm key, using the rule node's own identifier and stated text"
    fails_when: "the refusal omits the rule identifier, omits or misnames the offending hypothesis, sets an offendedTerm, or carries text other than the rule's own stated requirement"
  - file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts
    name: "does not refuse a case whose only hypothesis collects exactly one concept"
    proves: "A case whose every hypothesis collects at least one concept is not refused by this check. (boundary: exactly the minimum count)"
    fails_when: "the check answers a non-empty array for a hypothesis whose collects list holds exactly one entry"
  - file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts
    name: "does not refuse a hypothesis that collects several concepts, proving the guard reads \"at least one\" rather than \"exactly one\""
    proves: "A case whose every hypothesis collects at least one concept is not refused by this check. (the guard has no upper bound)"
    fails_when: "the check answers a refusal for a hypothesis whose collects list holds more than one entry"
  - file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts
    name: "does not refuse a case whose every hypothesis collects at least one concept"
    proves: "A case whose every hypothesis collects at least one concept is not refused by this check."
    fails_when: "the check answers any refusal for a case whose three hypotheses each declare a non-empty collects list"
  - file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts
    name: "refuses the failing hypothesis when it is not the one declared first"
    proves: "A case whose only failing hypothesis is not the one it lists earliest is still refused by this check."
    fails_when: "the check inspects only the first hypothesis it reaches and answers no refusal for a case whose failing hypothesis sits last"
  - file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts
    name: "produces one refusal per failing hypothesis, in declared order, when more than one hypothesis collects nothing"
    proves: "A case whose only failing hypothesis is not the one it lists earliest is still refused by this check. (strengthened: several failures, declared order preserved)"
    fails_when: "the check stops after the first failing hypothesis, answering only one refusal, or answers the two refusals in an order other than the case's own declared order"
  - file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts
    name: "freezes the array it answers with on the refusing path"
    proves: "the answered array is frozen when it holds a refusal, consistent with the sibling checks' own convention and with validate()'s own reliance on a stable answer"
    fails_when: "Object.isFrozen returns false for the array answered over a refusing case"
  - file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts
    name: "freezes the array it answers with on the passing path"
    proves: "the answered array is frozen when it holds no refusal"
    fails_when: "Object.isFrozen returns false for the empty array answered over a passing case"
  - file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts
    name: "walks a case declaring no hypotheses without throwing, answering no refusal"
    proves: "the Notes' UNDERDETERMINED entry — the implementation the base refuses is a check that raises or aborts over a case whose hypothesis list is empty; this test fails over exactly that implementation, since a throw or an abort is exactly what would make the test fail"
    fails_when: "the check throws, aborts, or otherwise fails to answer an empty array for a case whose hypotheses list is empty"
  - file: src/__tests__/unit/knowledge/hypothesis-collects-at-least-one-concept.spec.ts
    name: "lets a companion check registered beside it still report its own refusal over the same case declaring no hypotheses"
    proves: "the same UNDERDETERMINED entry, exercised through validate() rather than through this check alone: a check that threw or exited over the no-hypothesis case would prevent the run from ever reaching a check registered after it"
    fails_when: "the companion's own refusal is missing from validate()'s answer because this check threw, exited, or otherwise stopped the run before the companion ran"
not_applicable:
  - edge_case: "two hypotheses collecting the same concept, or one hypothesis collecting the same concept twice (a duplicate within or across collects lists)"
    why: "no bound node claims collected concepts must be unique, and the rule's own expression this check encodes is count(hypothesis.collects) >= 1 — a length guard indifferent to duplicates; uniqueness, if it exists at all, is a different check's concern and no criterion here reaches it"
  - edge_case: "a draftCase argument that is absent, null, or otherwise not a DraftCase"
    why: "draftCase is a required, non-optional parameter at the type level, and no bound node addresses this check being invoked with no case at all — that is a caller contract nothing here states an answer for"
  - edge_case: "a dependency that is unavailable, slow, or answers in an unexpected shape"
    why: "this check reads only the argument handed to it and consults no dependency of its own — no glossary, no store, no network call — so nothing here can be unavailable or slow"
  - edge_case: "two validations of one case running at once"
    why: "the check is a pure, synchronous function of its argument with no shared mutable state; nothing about running it twice concurrently changes what either call answers"
untested:
  - "that the module is built as a plain exported function rather than a factory, and that the function and file are named for the rule node's own slug — both recorded as inferences in the implementation. Neither is an independently observable behavior distinct from what every test above already exercises: every test calls hypothesisCollectsAtLeastOneConcept(draft) directly, with one argument and no factory step, and does so by importing that exact name from that exact path — a different shape or name would have failed every test here at compile time rather than at a runtime assertion, so no separate assertion was written for either without becoming a check on internal shape rather than on behavior."
---

## What it is

The tests proving `src/knowledge/hypothesis-collects-at-least-one-concept.ts` against `task/case-validator/hypothesis-collects-a-concept`, read alongside the validation contract and the project's existing test conventions.

## Notes

None.
