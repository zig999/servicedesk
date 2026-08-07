---
title: A hypothesis name is unique in its case
summary: Two hypotheses of the same case never share a name, because evaluations are indexed by it.
ddd: invariant
aggregate: cases
statement: Two hypotheses of the same case MUST NOT carry names equal character for character.
expression: no two hypotheses of one case have names that compare equal under exact character comparison
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-seis-perguntas-2026-08-05.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/hypothesis
examples:
  - Given two hypotheses both named onu-offline in one case, when it is published, then publication is refused.
  - Given one hypothesis named onu-offline and another named ONU-Offline in one case, when it is published, then publication is not refused by this rule, because the comparison is exact.
  - Given two hypotheses of one case carrying the same name, when it is validated, then the refusal carries the text «Duas hipóteses deste caso se chamam «{nome}». As avaliações são indexadas pelo nome, então nomes repetidos se sobrepõem em silêncio — renomeie uma delas.», with the name in place.
---

## What it is

An evaluation is identified by the name of the hypothesis it judges, so two hypotheses sharing a name would collide in silence rather than fail.
The comparison is exact, which means two names differing only in letter case are two names — a curator can write a pair a reader takes for one, and nothing here refuses it.
This is also the one case where a position cannot reach a hypothesis by name, so it falls to the ordinal.

## Rules

A position indexes a hypothesis by its name, and by its ordinal only here.
The text a refusal of this rule carries is the text this rule declares.
What the curator reads is written in Portuguese.
