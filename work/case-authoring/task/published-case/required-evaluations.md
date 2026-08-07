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
  - node: definition/knowledge/case
    digest: sha256:af4dd5b0b02ad4bb87ea9c39ee864a88115d87f2ede68504fa81e858d24ae48c
  - node: definition/knowledge/hypothesis
    digest: sha256:9bf1a22e47265a35f85bc3332bfcd216434359f95eb169e0c8e4ef33ce823b34
  - node: definition/investigation/evaluation
    digest: sha256:1a83f3e12140dd16aff50c46eb1186d6dcdb9711378d045d971bd6f12d5c91de
  - node: rule/knowledge/hypotheses-are-ordered-by-precedence
    digest: sha256:c5c1b66cff9265e8aa17c2be46f42bd4377e73801e215d95379cae6d60458fcb
  - node: rule/investigation/one-evaluation-per-hypothesis
    digest: sha256:5c6cbf502b861b306a3ead92129e8d260e06b13dea90a924c54b5a92a6a2d825
waived:
  - gap: definition/knowledge/case#attributes.version.derivation
    why: "The answer enumerates the hypotheses of the published case already in hand; nothing in the objective or the criteria derives, compares, or exposes a version, so how the version is set does not bear here."
  - gap: rule/knowledge/hypotheses-are-ordered-by-precedence#examples
    why: "This task reproduces whatever order the case declares and never judges whether that order is the correct precedence; which concrete orderings the specialists would affirm does not bear on faithful reproduction, and the node itself says no validator can check that fact."
---

## What it is
The second of the three behaviours the scope named, stating what a complete investigation of this case owes a verdict on.
The answer as the total list over the case's declared hypotheses, because the base holds that silence is not a verdict.
The answer in the case's declared order, because the order it is read in is the order that decides which confirmed hypothesis wins.

## Notes

The two order criteria were absent from the first statement of this task, and the base makes the order load-bearing on this path rather than incidental, so a set-shaped answer would satisfy the other criteria and still lose what the order carries.
Nothing here reads an evaluation; the answer is computed from the case alone.
REMAINDER, from the binding — the precedence rule's clause that the order must be the precedence the specialists affirm reaches no criterion, since every criterion holds the answer to the declared order and none holds the declared order to the specialists; the node states no validator can check it, and it belongs to the authoring and publishing of a case, where the human review the base names takes place.
REMAINDER, from the binding — the one-evaluation-per-hypothesis clause is only half-reached here, since this task fixes the enumeration that totality ranges over while the enforcement over an investigation record, refusing one whose evaluations do not match the declared hypotheses one to one, is not demonstrated by any criterion and the rule also constrains the investigation, outside the candidates; it belongs to the building and validating of an investigation record, which this plan does not hold.
UNDERDETERMINED, from the binding — criterion 6 as written admits an implementation that reorders the hypotheses of an already-published case in place and re-answers, while the base identifies a case by slug, version and content hash and makes any change to the file a different published case; what passes is an implementation mutating a published case's order in place and treating the reordered file as the same case, so the criterion is demonstrated across two published cases whose declared orders differ, never by mutating one.
The pin was restated deliberately rather than re-bound: the base moved by the five decision nodes, the capability's new output_schema attribute and the corrected citation prose, and none of this task's bound nodes changed its declared gaps or anything a criterion here reads — the lines added to their Rules sections point at rules bound elsewhere in this plan. The validator's totality check over every bound node's open gaps holds that judgment, and it refuses this task if the reading is wrong.
