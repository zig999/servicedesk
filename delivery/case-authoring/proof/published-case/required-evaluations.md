---
title: "Proof for which hypotheses require an evaluation"
summary: "What proves task/published-case/required-evaluations over requiredEvaluations() in src/knowledge/required-evaluations.ts: totality and no-extras over the declared hypotheses, the single-entry and identity shape of each entry, order preserved and reordered across two distinct published cases per the task's own UNDERDETERMINED note, and the frozen-return inference pinned as a stated choice."
implementation: sha256:879f90d8fb53a61b4f8539b3c06bf6d1f9eb196c40887c6689da7c94c237d75c
tests:
  - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
    name: "answers with a name for every hypothesis the case declares"
    proves: "Every hypothesis the case declares appears in the answer."
    fails_when: "requiredEvaluations() drops, filters or skips any of the case's declared hypotheses from the answer"
  - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
    name: "answers with no name absent from the case's declared hypotheses"
    proves: "No name absent from the case's declared hypotheses appears in the answer."
    fails_when: "the answer carries a name neither declared hypothesis holds — a constant, a placeholder, or an entry injected alongside the mapped ones"
  - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
    name: "answers with exactly one entry for a case declaring one hypothesis"
    proves: "A case declaring one hypothesis answers with exactly one entry."
    fails_when: "the answer holds zero entries, or more than one, for a case declaring a single hypothesis"
  - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
    name: "carries the hypothesis name that identifies it within its case, on each entry"
    proves: "Each entry of the answer carries the hypothesis name that identifies it within its case."
    fails_when: "an entry is anything other than the hypothesis's own name field — a derived label, an index, or the whole hypothesis object"
  - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
    name: "stands the entries in the order the case declares its hypotheses"
    proves: "The entries of the answer stand in the order the case declares its hypotheses."
    fails_when: "the answer is reordered on the way through — the declared order deliberately disagrees with the lexicographic order of the names, so a sorted answer fails and not only a reversed one"
  - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
    name: "reorders its entries the same way across two published cases whose declared orders differ"
    proves: "UNDERDETERMINED, from the binding — criterion 6 as written admits an implementation that reorders the hypotheses of an already-published case in place and re-answers, while the base identifies a case by slug, version and content hash and makes any change to the file a different published case; what passes is an implementation mutating a published case's order in place and treating the reordered file as the same case, so the criterion is demonstrated across two published cases whose declared orders differ, never by mutating one."
    fails_when: "the answer does not follow each case's own declared order — e.g. a fixed order regardless of which case is given — or the criterion is only demonstrable by the excluded implementation the note names: mutating one already-published case's hypotheses order in place and re-answering, rather than reading two independently declared cases"
  - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
    name: "answers with no entries for a case declaring no hypotheses"
    proves: "the empty-collection edge case this behavior raises: totality over zero declared hypotheses is an empty answer, never a thrown error or a non-empty one"
    fails_when: "requiredEvaluations() throws, or answers with any entry, for a case declaring no hypotheses"
  - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
    name: "does not deduplicate two hypotheses that share a declared name"
    proves: "the duplicate-name edge case: createCase() does not refuse two hypotheses sharing a name, and the answer is the total list over the case's declared hypotheses, so a shared name still names two evaluations owed"
    fails_when: "the answer collapses the two same-named entries into one instead of the total list of two"
  - file: "src/__tests__/unit/knowledge/required-evaluations.spec.ts"
    name: "freezes the array it answers with"
    proves: "the implementation's recorded inference that the returned array is frozen with Object.freeze before being returned"
    fails_when: "the returned array is mutable — Object.isFrozen() answers false, meaning a caller's push, sort or index assignment on the answer would silently change it"
not_applicable:
  - edge_case: "an absent or null publishedCase argument"
    why: "the parameter is a required, strictly-typed Case, and this pure module performs no runtime validation of its own — the checks over a whole case run in the act of publishing, outside this module, per case.ts's own docstring; constructing a call that violates the type would assert only what Array.prototype.map does on a non-array, not a behavior this task's criteria or bound nodes state"
  - edge_case: "a dependency that fails or answers slowly"
    why: "the function reads only its own argument — no store, network, clock or evaluation lookup — so nothing exists here that can fail or answer slowly"
  - edge_case: "two operations against one subject at once"
    why: "the function is pure and synchronous with no shared mutable state; two concurrent calls read only their own argument and cannot contend over anything"
  - edge_case: "an operation attempted against state that forbids it"
    why: "there is no state transition or forbidden-state refusal in this task; the function computes an answer from an already-published case and refuses nothing"
untested:
  - "the implementation's recorded inference that the parameter is named publishedCase rather than case, since case is a reserved word: a parameter's name is not observable behavior, so no test can be made to fail over this choice — it is stated in the implementation record rather than proven here"
  - "whether the case's declared order is the precedence the specialists affirm (rule/knowledge/hypotheses-are-ordered-by-precedence#examples): the task waives this gap and its own REMAINDER note assigns it to human review at authoring and publishing, outside anything a test over requiredEvaluations() can exercise"
  - "the record-level enforcement that an investigation's evaluations match this enumeration one to one (rule/investigation/one-evaluation-per-hypothesis): the task's own REMAINDER note assigns this to the investigation epic, which this plan does not hold, and no criterion here reaches it"
---

## What it is

The spec at src/__tests__/unit/knowledge/required-evaluations.spec.ts, holding requiredEvaluations() to the task's six criteria, to its own UNDERDETERMINED note demonstrated across two distinct published cases, to two edge cases the behavior raises, and to the frozen-return inference the implementation recorded.

## Notes

Criterion 6 is proven across two independently constructed published Case values with differently declared orders, never by mutating one case's hypotheses array in place — the shape the task's own note excludes.
No spec existed for this task before this delivery; the file was written fresh.
Nothing here is contested.
