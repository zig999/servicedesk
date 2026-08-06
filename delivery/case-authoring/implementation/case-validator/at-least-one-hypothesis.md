---
title: "The check that a case declares at least one hypothesis"
summary: "The publication check that refuses a case under edit whose declared hypotheses list is empty, and refuses nothing where it holds one or more."
task: sha256:03fe8281d7f5ad4b485bfe6af697179aaa96f2b65c9736e0202744d0a4e550f6
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/knowledge/case-has-at-least-one-hypothesis.ts
    effect: "declares caseHasAtLeastOneHypothesis(draftCase), a function structurally matching PublicationCheck that reads only draftCase.hypotheses.length and answers a frozen empty array when it is at least one, or a frozen one-element array carrying a case-level refusal (no hypothesis, no offended term) naming the rule's own path and its own stated text when it is zero"
criteria:
  - criterion: "A case declaring no hypothesis is refused by this check."
    met: true
    how: "with hypotheses.length === 0, the guard length >= MINIMUM_HYPOTHESIS_COUNT (1) fails, so the function answers one refusal — { rule: 'rule/knowledge/case-has-at-least-one-hypothesis', text: 'A case MUST declare at least one hypothesis.' } — and a non-empty answer is the case refused"
  - criterion: "A case declaring exactly one hypothesis is not refused by this check."
    met: true
    how: "with hypotheses.length === 1 the guard holds, so the function answers a frozen empty array — a check that answers nothing refuses nothing"
  - criterion: "A case declaring several hypotheses is not refused by this check."
    met: true
    how: "the guard is length >= 1, true for any count above one as well, so the function answers empty regardless of how many hypotheses the case declares"
nodes:
  - node: rule/knowledge/case-has-at-least-one-hypothesis
    encoded_at:
      - src/knowledge/case-has-at-least-one-hypothesis.ts
    how: "the guard MINIMUM_HYPOTHESIS_COUNT = 1 against draftCase.hypotheses.length is the rule's own expression count(case.hypotheses) >= 1; the produced refusal's rule field carries the node's own path as its identifier and its text is the node's own statement attribute, 'A case MUST declare at least one hypothesis.', quoted rather than reworded. The check inspects none of the hypotheses' own structure, only the list's length, consistent with the binding's note that the hypothesis definition governs the neighbouring per-hypothesis checks and not this one."
  - node: definition/knowledge/case
    how: "this task does not modify src/knowledge/case.ts; the node's min_items: 1 on hypotheses is what this check enforces before a case is ever published, at the case-under-edit stage its own rule constrains — the node's version-derivation gap is the task's waived entry and is untouched here, since counting hypotheses and refusing an empty list reads neither the version nor how publication sets it. The node's other clauses (the two written-out fallbacks, the whole-file content hash, curator notes never reaching a prompt) are the binding's REMAINDER, delivered by the case-structure task."
  - node: definition/knowledge/draft-case
    how: "no file under this node's path was modified. The check reads draftCase.hypotheses.length over exactly the empty-admitting shape draft-case.ts declares, without throwing, honoring the node's rule that a case under edit is what a publication check refuses. The node's REMAINDER — that a case under edit becomes published only through publication, which adds the version and hash — belongs to a publication task this plan does not hold, and is not reached here."
inferences:
  - inferred: "the refusal's rule field is the literal string 'rule/knowledge/case-has-at-least-one-hypothesis', the node's own path"
    from: "the base's path-is-identity convention (CLAUDE.md) together with definition/knowledge/refusal's own doc comment, which names the rule field as 'the rule that refused, named by its identifier because the rule is the domain's language and outlives whatever check implements it'; no node states a separate identifier scheme for a rule, so the identity every node in this repository already carries by its path is what is used"
  - inferred: "the curator-facing text is the rule node's own statement attribute, quoted unchanged rather than paraphrased"
    from: "rule/knowledge/case-has-at-least-one-hypothesis's statement field, 'A case MUST declare at least one hypothesis.'; no node prescribes distinct curator-facing prose, and quoting the rule's own stated requirement avoids inventing text the base does not hold"
  - inferred: "the check answers by returning a refusal rather than raising or exiting on the no-hypothesis case, even though a version that aborted the run would satisfy the three stated criteria on their own"
    from: "the binding's UNDERDETERMINED note, which names exactly that shortcut and the neighbouring a-validation-answers-with-every-refusal rule it would defeat, together with PublicationCheck's own declared contract at src/knowledge/validation.ts — a function that answers with the refusals it produced, never one that throws or exits"
  - inferred: "the check is a plain named function export rather than a const explicitly typed as PublicationCheck"
    from: "the tree's existing precedent at validate() and requiredEvaluations(), both exported as function declarations whose conformance to a consuming signature is structural rather than an explicit type-alias annotation"
  - inferred: "the returned refusal array is frozen with Object.freeze on both the passing and refusing path"
    from: "the copy/freeze habit evidenced at the nearest sibling shape, src/knowledge/required-evaluations.ts — a function reading the whole case and returning a computed list, frozen before it is handed back — even though validate() also freezes its own final answer downstream"
preserved:
  - "PublicationCheck's type and validate() at src/knowledge/validation.ts are untouched; caseHasAtLeastOneHypothesis's signature, (draftCase: DraftCase) => readonly Refusal[], matches it structurally so it can be registered into validate()'s checks list without any change there"
  - "DraftCase at src/knowledge/draft-case.ts and Refusal at src/knowledge/refusal.ts are untouched and read exactly as declared"
  - "every existing spec under src/__tests__/unit/ exercises only modules this delivery did not touch, and continues to hold unchanged"
deferred:
  - what: "the repository still holds no package manifest, compiler configuration or lock, so src/knowledge/case-has-at-least-one-hypothesis.ts has never been type-checked, the same as every other file already in the tree"
    why: "establishing the toolchain is no criterion of this task and reaches every file in src/, not only this one; the inventory already records the absence"
  - what: "assembling the full list of publication checks a real validation run registers, and wiring this check into that list"
    why: "validate() takes the checks list as a parameter supplied by its caller, per the task's own binding note treating each check as a parameter of the run rather than something a check task registers; the sibling checks of this epic — terms-exist-in-the-glossary, recipient-is-a-role, unique-hypothesis-names, concept-accepts-the-subject-type, concept-declares-a-ttl, hypothesis-collects-a-concept, read-only-capability — and whatever assembles them are each their own task"
---

## What it is

The publication check standing behind the base's statement that a case with no hypothesis investigates nothing — a refusal decided from the case's own declarations, reading nothing outside the case.

## Notes

The two passing criteria assert only that this check does not refuse, since another check may still refuse the same case for its own reason.
The standard was read in full and no rule reaching this file was departed from, though its typecheck rule remains unrunnable while the tree has no toolchain.
