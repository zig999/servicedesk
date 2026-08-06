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
  - definition/knowledge/case
  - definition/knowledge/hypothesis
  - definition/investigation/evaluation
  - rule/knowledge/hypotheses-are-ordered-by-precedence
  - rule/investigation/one-evaluation-per-hypothesis
base: sha256:992232efc4c5444049969a8ae991757bdc82865a72e1ba1deb144660cfb7251f
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
