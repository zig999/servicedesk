---
title: "Which hypotheses require an evaluation"
summary: "The hypotheses of a published case that require a verdict, in the order the case declares them, each named by the name that identifies it within its case."
sources:
  - intake/escopo.md
  - intake/escopo-emenda-alcance.md
objective: "A published case answers with every hypothesis it declares as requiring an evaluation, in its declared order, naming each by the name unique within that case."
criteria:
  - "Every hypothesis the case declares appears in the answer."
  - "No name absent from the case's declared hypotheses appears in the answer."
  - "A case declaring one hypothesis answers with exactly one entry."
  - "Each entry of the answer carries the hypothesis name that identifies it within its case."
  - "The entries of the answer stand in the order the case declares its hypotheses."
  - "A case whose declared hypotheses are reordered answers with its entries reordered the same way."
depends_on:
  - task/published-case/case-structure
nodes:
  - aggregate/knowledge/cases
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/investigation/evaluation
  - rule/knowledge/hypotheses-are-ordered-by-precedence
  - rule/knowledge/the-body-does-not-change-what-is-collected
  - rule/investigation/one-evaluation-per-hypothesis
base: sha256:d70b575981a26bad78e7258ae5219fa37ab23226539ea0652b36aab85e92b092
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "This task reads a published case's declared hypotheses and neither sets nor derives its version; no criterion states anything about the case's identity triple."
  - gap: definition/knowledge/case#attributes.content_hash.derivation
    why: "The answer is derived from the structured hypotheses attribute alone; nothing on this path computes, checks or reports the hash, and what the hash covers changes no entry, name or order."
  - gap: definition/knowledge/case#attributes.no_hypothesis_confirmed.selection
    why: "The fallback is a resolution, not a hypothesis, so it is never an entry of this answer and carries no name criterion 2 could admit or exclude; which outcome it holds is settled on the resolving path."
  - gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
    why: "Criteria 5 and 6 hold whatever order the case declares; the absent examples are the per-case precedence only specialists affirm, and this task never decides or checks which cause dominates."
---

## What it is
The second of the three behaviours the scope named, stating what a complete investigation of this case owes a verdict on.
The answer as the total list over the case's declared hypotheses, because the base holds that silence is not a verdict.
The answer in the case's declared order, because the order it is read in is the order that decides which confirmed hypothesis wins.

## Notes

The two order criteria were absent from the first statement of this task, and the base makes the order load-bearing on this path rather than incidental, so a set-shaped answer would satisfy the other criteria and still lose what the order carries.
Nothing here reads an evaluation; the answer is computed from the case alone.
BLOCKING, from the binding — the rule requires exactly one evaluation for every hypothesis a case declares, and only criterion 3 reaches cardinality, and only for a case declaring one hypothesis; nothing forbids a repeated entry for the same declared hypothesis when a case declares several, so the rule's exactly-one clause can be contradicted while all six criteria pass.
From the binding — the prose rule's second clause reaches no criterion here; it is an obligation on the authoring path this epic declares uncovered.
From the binding — the precedence clause about what the specialists affirm reaches no criterion, and the node itself states no validator can check it.
From the binding — two facts the skeleton leans on sit outside the candidates, the meaning of published and the at-least-one-hypothesis refusal; the bound case node carries the minimum in its own shape and states it in its body.
From the binding — a case is identified by its content, so criterion 6's reordered case is a second published case rather than a mutation of one; the criterion is demonstrable, but over two cases.
