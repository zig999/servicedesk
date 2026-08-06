---
title: "The check that a hypothesis collects at least one concept"
summary: "The publication check that refuses a case under edit once for every hypothesis whose declared collects list is empty, and refuses nothing where every hypothesis collects at least one concept."
task: sha256:ebab008e8f29bec962a67e19f1bdecdfb44d52ab8a03d77c697b0cbb18ff861e
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/knowledge/hypothesis-collects-at-least-one-concept.ts
    effect: "declares hypothesisCollectsAtLeastOneConcept(draftCase), a function structurally matching PublicationCheck that walks draftCase.hypotheses in declared order and answers a frozen array holding one refusal — naming the offending hypothesis, no offended term, the rule's own path and its own stated text — for every hypothesis whose collects list holds fewer than one entry, and a frozen empty array when every hypothesis collects at least one concept, including when the hypotheses list itself is empty"
criteria:
  - criterion: "A case holding one hypothesis that collects no concept is refused by this check."
    met: true
    how: "a hypothesis whose collects.length is 0 fails the guard collects.length >= MINIMUM_COLLECTS_COUNT (1), so the loop pushes one refusal naming that hypothesis and the rule's own text; a non-empty answered array is the case refused by this check"
  - criterion: "A case whose every hypothesis collects at least one concept is not refused by this check."
    met: true
    how: "every hypothesis in the loop satisfies the guard, so nothing is pushed to refusals and the function answers Object.freeze([]) — a check that answers nothing refuses nothing"
  - criterion: "A case whose only failing hypothesis is not the one it lists earliest is still refused by this check."
    met: true
    how: "the loop visits every hypothesis of draftCase.hypotheses in the order the case declares them and evaluates the guard independently per hypothesis, so a failing hypothesis at any position — second, third, or later — is pushed to refusals exactly as the first would be; nothing in the implementation returns early or inspects only the first entry"
nodes:
  - node: rule/knowledge/hypothesis-collects-at-least-one-concept
    encoded_at:
      - src/knowledge/hypothesis-collects-at-least-one-concept.ts
    how: "the loop's guard MINIMUM_COLLECTS_COUNT = 1 against each hypothesis's own collects.length is the rule's own expression count(hypothesis.collects) >= 1; the produced refusal's rule field carries the node's own path as its identifier and its text is the node's own statement attribute, 'A hypothesis MUST collect at least one concept.', quoted rather than reworded. The check inspects only each hypothesis's collects length, never resolving a concept, consistent with the rule's own reading that a hypothesis collecting nothing could never cite anything"
  - node: definition/knowledge/hypothesis
    how: "no file under this node's path was modified; the check reads collects (readonly ConceptName[]) exactly as hypothesis.ts declares it, without enforcing the node's own min_items: 1 at the type level, consistent with hypothesis.ts's own doc comment that this minimum is a check's concern outside the module. The node's Rules section states the same requirement this task encodes ('A hypothesis collects at least one concept, because a hypothesis that collects nothing can cite nothing.'); its other attributes — name, confirmsWhen, resolution — and its other Rules clauses (one falsifiable claim per criterion, unique hypothesis names) are the neighbouring checks' concern, not reached here"
  - node: definition/knowledge/draft-case
    how: "no file under this node's path was modified. The check reads draftCase.hypotheses over exactly the empty-admitting shape draft-case.ts declares, iterating it without throwing when it holds zero entries — honoring the node's own reasoning that the shape a check reads has to admit the case a check refuses. The node's other clauses — the case's own identity, its two fallback resolutions, the version and hash publication adds — are untouched and not reached by this check"
  - node: aggregate/knowledge/cases
    how: "the check reads the whole draft case's hypotheses list, never a fragment of it, consistent with the aggregate's statement that the contract checks run over the whole; publication itself, and the clause that a case is published whole or not at all, belongs to the publication act, which the task's own binding note records as this node's REMAINDER and this delivery does not reach"
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    how: "the loop inspects every hypothesis of the case in declared order and neither stops nor returns early once it finds an offending one, so a case whose only failing hypothesis sits anywhere but first is still refused for it. This is also, by the rule's own Rules section, the check it names as having to be safe over a malformed case: walking a case with no hypothesis at all without failing and refusing nothing is exactly what the empty-list loop does — honored here even though the task's own Notes flag that no criterion of this task reaches that clause on its own. The rule's statement clauses about the run itself — running every check regardless of an earlier one's decision, and answering with every refusal those checks produced — belong to validate() in src/knowledge/validation.ts, already delivered under a different task, and are not reached here"
inferences:
  - inferred: "the check walks a case whose hypotheses list is empty without throwing, and answers no refusal for that case, rather than raising or aborting the run"
    from: "rule/knowledge/a-validation-answers-with-every-refusal's own Rules section, which names this exact check as the example of a check that must be safe over a malformed case and simply refuse nothing; the task's Notes flag this as UNDERDETERMINED because no criterion of this task forces either reading on its own, but the base states the safe behavior explicitly rather than leaving it open, and the two sibling checks already delivered follow the same reading"
  - inferred: "a refusal for a hypothesis that collects nothing names the offending hypothesis but no offended term (offendedTerm left undefined)"
    from: "no bound node states what this check's refusal carries, per the task's own Notes; the shape follows the convention the two already-delivered sibling checks establish — case-has-at-least-one-hypothesis.ts names no position at all when the failure is the case's own count of zero, while concept-accepts-the-declared-subject-type.ts and every-collected-concept-declares-a-ttl.ts name both the hypothesis and the concept when the failure is positioned at a concept a hypothesis collects. This failure is positioned at a hypothesis but has no concept to name, so it takes the hypothesis half of that pattern and none of the concept half"
  - inferred: "built as a plain exported function of the draft case rather than as a factory over a glossary"
    from: "the rule's own expression, count(hypothesis.collects) >= 1, needs no glossary lookup, unlike concept-accepts-the-declared-subject-type.ts and every-collected-concept-declares-a-ttl.ts, which are built as factories precisely because they must resolve a collected concept's own glossary record; case-has-at-least-one-hypothesis.ts, which likewise needs no glossary, is the plain-function precedent this follows"
  - inferred: "the file and exported function are named for the rule node's own slug, hypothesisCollectsAtLeastOneConcept in camelCase"
    from: "the convention every check module already in the tree evidences — case-has-at-least-one-hypothesis.ts / caseHasAtLeastOneHypothesis, concept-accepts-the-declared-subject-type.ts, every-collected-concept-declares-a-ttl.ts — each named for the rule it encodes"
deferred:
  - what: "the repository still holds no package manifest, compiler configuration or lock, so src/knowledge/hypothesis-collects-at-least-one-concept.ts has never been type-checked, the same as every other file in the tree"
    why: "establishing the toolchain is no criterion of this task and reaches every file under src/, not only this one; the inventory and the sibling implementation records already note the same absence"
  - what: "assembling the full list of publication checks a real validation run registers, and wiring this check into that list"
    why: "validate() in src/knowledge/validation.ts takes the checks list as a parameter supplied by its caller, and the task's own Notes record the run's assembly and the every-refusal rule's own run-level clauses as the validation-run task's REMAINDER, not this one's; the sibling checks of this epic and whatever assembles them each remain their own task"
---

## What it is

The structural check standing behind the base's statement that a hypothesis collecting nothing could never cite anything — a refusal decided per hypothesis, over every hypothesis of the case.

## Notes

The third criterion fixes that the check reads every hypothesis rather than the one it reaches soonest.
The standard was read in full and no rule reaching this file was departed from, though its typecheck rule remains unrunnable while the tree has no toolchain.
