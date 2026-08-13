---
title: Precedence is read from the declared position
summary: Resolve-outcome and collection-plan, reading which hypothesis dominates which from each hypothesis's declared position rather than from the order it arrived in.
rationale: The scope states precedence is read from position; it is cut apart from the shape that introduces the field because resolution logic changes when the domain's ordering rule changes and the type changes when its attributes do. Requires-evaluation-of is left out of the objective and the criteria because the specification states what it is for and not which hypotheses it answers with, and this scope changes only where precedence is read from.
sources:
  - intake/scope.md
depends_on:
  - task/case-and-investigation-model/case-aggregate-shape
objective: Resolve-outcome and collection-plan read hypothesis precedence from each hypothesis's declared position and from nothing else.
criteria:
  - Resolve-outcome and collection-plan consult each hypothesis's declared position, and the order in which the hypotheses arrive changes neither answer.
  - Of two confirmed hypotheses, the one standing earlier in the precedence the positions declare is the one whose resolution resolve-outcome answers with.
  - Given a case declaring regional-incident, order-in-progress, financial-block and onu-offline in that precedence, with regional-incident and onu-offline confirmed and the other two refuted, resolve-outcome answers with regional-incident's outcome and referral and names regional-incident as the determining hypothesis.
  - In that same resolution onu-offline keeps its confirmed verdict and is marked in no way.
  - When every hypothesis was refuted or inconclusive, resolve-outcome answers with the fallback's outcome and referral.
  - In that same resolution no determining hypothesis is named.
  - The collection plan is the deduplicated union of every hypothesis's collected concepts.
implements:
  - domain/knowledge/case
  - domain/knowledge/hypothesis
  - rules/knowledge/hypotheses-are-ordered-by-precedence
  - scenarios/knowledge/the-first-confirmed-hypothesis-determines-the-outcome
  - scenarios/knowledge/no-confirmation-falls-back
---

## What it is

The resolution logic of a case, reading the precedence the experts affirmed.
Nothing about how a case is stored or read back can change what that order is, because the order is each hypothesis's own declared fact.

## Notes

Requires-evaluation-of is left exactly as the tree holds it: which hypotheses it answers with is a fact no node of the specification states, so no criterion here states one, and nothing this task changes depends on it.
The inventory names src/src/case/case-resolution.ts as the one place the operations read precedence, and lists run-diagnosis, judgment-stage and the investigation factory among the consumers that observe the change.
