---
title: "Hypothesis names are unique within a case"
summary: "The publication check that refuses a case under edit once for every hypothesis whose declared name repeats one an earlier hypothesis of the same case already declared, comparing names exactly and never across cases."
task: sha256:33ceb444c1b12e9b08ff7b74eb7f8d957cb4cacd5bfa5c14476bafdd8cb62ce5
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/knowledge/hypothesis-name-is-unique-in-its-case.ts
    effect: "exports hypothesisNameIsUniqueInItsCase(draftCase), a function structurally matching PublicationCheck that walks draftCase.hypotheses in declared order, tracks names seen so far in a Set compared by plain string equality, and answers a frozen array holding one refusal — naming the colliding hypothesis, no offended term, the rule's own path and its own stated text — for every hypothesis whose name repeats an earlier one; answers a frozen empty array when every name is distinct, when the hypotheses list is empty, or when the list is absent outright"
criteria:
  - criterion: "Hypotheses declared for one case, two of which carry the same name, are refused by this check."
    met: true
    how: "when the second hypothesis's name is already in namesSeen, the guard pushes a refusal naming that hypothesis and the rule's own text; the answered array is then non-empty, which is the case refused by this check"
  - criterion: "Hypotheses declared for one case, all carrying distinct names, are not refused by this check."
    met: true
    how: "namesSeen.has() is false for every hypothesis when all names are distinct, so nothing is pushed and the function answers Object.freeze([]) — a check that answers nothing refuses nothing"
  - criterion: "Hypotheses declared separately for two cases, one in each carrying the same name, are each not refused by this check."
    met: true
    how: "namesSeen is a Set created fresh inside the function body on every call, closing over no state between invocations, so a name seen while walking one DraftCase has no effect on a separate call over a second DraftCase, even one sharing the same name"
nodes:
  - node: aggregate/knowledge/cases
    how: "the check is a function of one whole DraftCase and never reads or remembers anything from a second case, honoring the aggregate's statement that the contract checks run over the whole of one case; it never reaches the aggregate's publishing clause, which belongs to the publication act outside this task"
  - node: definition/knowledge/hypothesis
    how: "the check reads only Hypothesis.name, exactly as hypothesis.ts declares it, and its comparison is the module's own stated invariant, quoted in hypothesis.ts's doc comment, that two hypotheses of the same case never share a name; no other attribute (collects, confirmsWhen, resolution) is touched"
  - node: definition/knowledge/draft-case
    how: "the check reads draftCase.hypotheses over exactly the shape draft-case.ts declares — required but deliberately empty-admitting at runtime — and additionally tolerates the list being absent outright, which the type itself does not declare possible but which the every-refusal rule's safety requirement extends to; no file under this node's path was modified"
  - node: rule/knowledge/hypothesis-name-is-unique-in-its-case
    encoded_at:
      - src/knowledge/hypothesis-name-is-unique-in-its-case.ts
    how: "the produced refusal's rule field carries the node's own path as its identifier and its text is the node's own statement, quoted rather than reworded; the comparison is plain string equality with no folding, trimming or normalisation, which is the node's own exact character-for-character expression, and its worked example — onu-offline versus ONU-Offline not refused — holds because the two strings are not equal under that comparison"
  - node: rule/knowledge/a-validation-answers-with-every-refusal
    how: "the loop inspects every hypothesis of the case in declared order and never stops at the first colliding pair, so a duplicate anywhere but the first two positions is still refused for it; the check is safe over an empty or absent hypotheses list, walking neither by throwing. The rule's run-level clauses — running every check regardless of an earlier one's decision, and answering with every refusal those checks produced — belong to validate() in src/knowledge/validation.ts, already delivered under a different task, and are not reached here, consistent with this task's own Notes marking that as the binding's REMAINDER"
inferences:
  - inferred: "a refusal is produced for the second and every later hypothesis carrying a name already seen, and none for the first hypothesis to carry that name"
    from: "no bound node states how many refusals one duplicated name produces or which of the colliding hypotheses a refusal names — the task's own Notes admit any refusal construct for criterion 1; this design follows the sibling check hypothesis-collects-at-least-one-concept.ts's precedent of evaluating and flagging every offending position independently rather than collapsing a case's worth of duplicates into one refusal"
  - inferred: "the refusal names the colliding hypothesis but leaves offendedTerm undefined"
    from: "the convention the sibling checks case-has-at-least-one-hypothesis.ts and hypothesis-collects-at-least-one-concept.ts establish: a refusal names a term only where the failure is positioned at a term the hypothesis names beyond itself; here the failure is the name itself, already carried in the hypothesis field, so there is no further term to name"
  - inferred: "the function additionally tolerates draftCase.hypotheses being absent (not just empty), via nullish coalescing to an empty array"
    from: "the every-refusal rule's blanket requirement that a check be safe over a malformed case, and this task's binding note naming an absent hypotheses list explicitly as part of that malformed shape — the sibling checks already delivered guard only the empty-list case, since DraftCase declares the field required, but this task's Notes call out the absent case by name where those tasks' did not"
  - inferred: "built as a plain exported function of the draft case, not a factory over a glossary"
    from: "the rule's own expression needs no glossary lookup, the same reasoning case-has-at-least-one-hypothesis.ts and hypothesis-collects-at-least-one-concept.ts already followed for the same reason, and this check follows their precedent rather than the factory shape the glossary-consuming checks use"
  - inferred: "the file and exported function are named for the rule node's own slug, hypothesisNameIsUniqueInItsCase in camelCase"
    from: "the convention every check module already in the tree evidences — each named for the rule it encodes"
deferred:
  - what: "assembling the full list of publication checks a real validation run registers, and wiring this check into that list"
    why: "validate() in src/knowledge/validation.ts takes the checks list as a parameter supplied by its caller; assembling and registering the checks is the validation-run task's own concern, not this task's, which delivers one check on its own"
  - what: "the repository still holds no package manifest, compiler configuration or lock, so src/knowledge/hypothesis-name-is-unique-in-its-case.ts has never been type-checked, the same as every other file in the tree"
    why: "establishing the toolchain is no criterion of this task and reaches every file under src/, not only this one; the inventory and every sibling implementation record already note the same absence"
---

## What it is

The structural check that keeps a hypothesis name usable as the index an evaluation is filed under — a refusal decided over the hypotheses offered for one case, before any published case exists, and a uniqueness decided within one case, never across cases.

## Notes

The check reads hypotheses and the names they carry, and a hypothesis bearing any name is a valid hypothesis on its own, so nothing has to hold an invalid published case for this check to have something to refuse.
The third criterion is what makes the scope of the uniqueness falsifiable, since a check that refused across cases would pass the other two.
The standard was read in full and no rule reaching this file was departed from, though its typecheck rule remains unrunnable while the tree has no toolchain.
