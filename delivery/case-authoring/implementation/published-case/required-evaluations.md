---
title: "Which hypotheses require an evaluation"
summary: "requiredEvaluations() in src/knowledge/required-evaluations.ts enumerates a published case's declared hypothesis names, in the case's declared order, without reading any evaluation."
task: sha256:3b48cbd8e8c497f977b010a0d401887839bc87036c06007cadee74891f7763ab
standard:
  at: standards/backend-node-service.yaml
  pin: sha256:b6d3f7b82ef007e9532f61ae39b5c85de7917bcfe9b3dd5dbebe5a759d6e2937
files:
  - path: src/knowledge/required-evaluations.ts
    effect: "declares requiredEvaluations(publishedCase: Case): readonly HypothesisName[], which maps publishedCase.hypotheses to their names with Array.prototype.map, freezes the resulting array, and reads nothing else — no sorting, deduplication, caching or evaluation input"
criteria:
  - criterion: "Every hypothesis the case declares appears in the answer."
    met: true
    how: "publishedCase.hypotheses.map(...) visits every element of the case's own hypotheses array, so a name for every declared hypothesis is present in the returned array"
  - criterion: "No name absent from the case's declared hypotheses appears in the answer."
    met: true
    how: "the only source the function reads is hypothesis.name off the case's own declared hypotheses; no other value, constant or lookup contributes a name, so nothing outside that set can appear"
  - criterion: "A case declaring one hypothesis answers with exactly one entry."
    met: true
    how: "map over a one-element array yields a one-element array; the function performs no filtering or expansion that could change that count"
  - criterion: "Each entry of the answer carries the hypothesis name that identifies it within its case."
    met: true
    how: "each entry is hypothesis.name, the HypothesisName that definition/knowledge/hypothesis states is that hypothesis's identity"
  - criterion: "The entries of the answer stand in the order the case declares its hypotheses."
    met: true
    how: "Array.prototype.map preserves the source array's order, and publishedCase.hypotheses is already the case's declared order, itself order-preserved by createCase() in src/knowledge/case.ts"
  - criterion: "A case whose declared hypotheses are reordered answers with its entries reordered the same way."
    met: true
    how: "the function is pure and reads publishedCase.hypotheses fresh on every call with no sort, cache or memoisation, so two published Case values whose declared hypothesis orders differ produce answers whose entries differ in that same way — demonstrated across two published cases, as the task's UNDERDETERMINED note requires, rather than by reordering one case in place"
nodes:
  - node: definition/knowledge/case
    encoded_at:
      - src/knowledge/required-evaluations.ts
    how: "the function reads only the case's own hypotheses field, already declared and order-preserved by src/knowledge/case.ts; no other attribute of the case is read"
  - node: definition/knowledge/hypothesis
    encoded_at:
      - src/knowledge/required-evaluations.ts
    how: "the answer is built from the hypothesis's identity — its name field — reusing the HypothesisName and Hypothesis types src/knowledge/hypothesis.ts already exports, without redeclaring either"
  - node: definition/investigation/evaluation
    how: "governs the work without a fact of its own reaching this code: the node's statement that an inconclusive verdict counts while silence does not is why the answer is the total list rather than a subset, but the module reads no Evaluation value and encodes no part of its shape — that shape stays where it already lives, in src/investigation/evaluation.ts"
  - node: rule/knowledge/hypotheses-are-ordered-by-precedence
    encoded_at:
      - src/knowledge/required-evaluations.ts
    how: "the declared order is treated as load-bearing — the map performs no sort, so the answer's order is exactly the case's declared order; whether that order is the precedence the specialists affirm is human review per the rule's own body and the task's waiver of the examples gap"
  - node: rule/investigation/one-evaluation-per-hypothesis
    encoded_at:
      - src/knowledge/required-evaluations.ts
    how: "this task fixes only the enumeration side of the rule's totality — the function returns exactly the case's declared hypothesis names, once each, in declared order; the record-level enforcement, refusing an investigation whose evaluations do not match this enumeration one to one, is not demonstrated here per the task's REMAINDER note and belongs to the building and validating of an investigation record, which this plan does not hold"
inferences:
  - inferred: "the function lives in src/knowledge/required-evaluations.ts, named for the task, as a standalone module rather than as an added export of src/knowledge/case.ts"
    from: "the inventory's convention that src/knowledge/ already holds pure-function modules keyed to one behaviour rather than to one value type — src/knowledge/validation.ts encodes a rule as a standalone function beside the value types in the same directory — and the task's own slug names exactly this behaviour"
  - inferred: "the parameter is named publishedCase rather than case, since case is a reserved word in TypeScript"
    from: "the tree's existing precedent of naming a same-shaped parameter draftCase in src/knowledge/validation.ts's validate()"
  - inferred: "the returned array is frozen with Object.freeze before being returned"
    from: "the tree's convention of freezing every collection a computed answer carries — Object.freeze(answered) in src/knowledge/validation.ts's validate(), and the frozen hypotheses array createCase() builds in src/knowledge/case.ts"
preserved:
  - "src/knowledge/case.ts, src/knowledge/hypothesis.ts and src/investigation/evaluation.ts are untouched, so createCase(), createEvaluation() and every field they already read back keep working unchanged"
  - "HypothesisName and Hypothesis stay exported from src/knowledge/hypothesis.ts with their existing meaning, since this module imports both by name rather than redeclaring them"
---

## What it is

requiredEvaluations() in src/knowledge/required-evaluations.ts, reading a published case alone and answering with the names of every hypothesis it declares, in the order it declares them, never touching an evaluation.

## Notes

The function is pure and order-preserving with no sort or cache, so criterion 6 is demonstrated by two published cases with differently ordered hypotheses rather than by mutating one case's order in place, matching the task's own UNDERDETERMINED note.
The one-evaluation-per-hypothesis clause this module does not reach — the record-level enforcement over an actual investigation — is left to the investigation epic, per the task's own REMAINDER note.
No divergences from the standard or from any inventory convention were needed.
