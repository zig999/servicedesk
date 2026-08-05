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
  - rule/investigation/one-evaluation-per-hypothesis
base: sha256:3d7bf173f490f874dc387c6acbeaad9dd61bc643027fe81035bded739b3586af
waived:
  - gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
    why: "The gap is the absent specialist-affirmed example order; this task reproduces whatever order the case declares and never decides or checks which cause dominates which, which the node itself states no validator can check, so no criterion turns on the missing example."
---

## What it is

The second of the three behaviours the scope named, stating what a complete investigation of this case owes a verdict on.
The answer as the total list over the case's declared hypotheses, because the base holds that silence is not a verdict.
The answer in the case's declared order, because the order it is read in is the order that decides which confirmed hypothesis wins.

## Notes

The two order criteria were absent from the first statement of this task, and the base makes the order load-bearing on this path rather than incidental, so a set-shaped answer would satisfy the other criteria and still lose what the order carries.
Nothing here reads an evaluation; the answer is computed from the case alone.
From the binding — the clause requiring an investigation to carry exactly one evaluation per declared hypothesis is left to whatever builds the investigation, and must reach a criterion there.
