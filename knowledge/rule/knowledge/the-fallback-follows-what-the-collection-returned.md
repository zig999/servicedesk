---
title: The fallback follows what the collection returned
summary: When nothing confirms, the case answers with the no-data fallback where any evidence fell short, and with the exhausted fallback where every evidence answered.
ddd: invariant
statement: Where no hypothesis of a case confirms, the case MUST answer with its no-data fallback if any evidence of the investigation carries a result other than ok, and with its hypotheses-exhausted fallback if every evidence carries ok.
sources:
  - intake/decisoes-seis-perguntas-2026-08-05.md
constrains:
  - definition/knowledge/case
  - definition/investigation/evidence
consistency: immediate
examples:
  - Given no hypothesis confirmed and one evidence carrying a timeout, when the case resolves, then it answers with its no-data fallback.
  - Given no hypothesis confirmed and every evidence carrying ok, when the case resolves, then it answers with its hypotheses-exhausted fallback.
  - Given no hypothesis confirmed and one evidence carrying a refusal of access, when the case resolves, then it answers with its no-data fallback, because a refusal is a result other than ok.
---

## What it is

An investigation that confirms nothing still has to say which kind of nothing it reached, and this is where the two kinds are told apart.
Both answers are resolutions the case itself declared, so nothing produces an outcome the case does not hold — the selection chooses between two declarations rather than composing a third.
It is the difference between a broken integration and a case missing a hypothesis, which are opposite actions for whoever reads the projection.

## Rules

Both fallbacks are declared by the case, and the selection reads only the results the collection returned.
