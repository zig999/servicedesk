---
title: A position indexes a hypothesis by name
summary: A refusal's position reaches a hypothesis by the name the curator gave it, and by its ordinal only where that name does not tell two of them apart.
ddd: invariant
statement: A refusal's position MUST index a hypothesis by its name, and by its ordinal only where two hypotheses of the case carry that same name.
expression: the hypothesis segment of a position is the hypothesis name, and an ordinal only where that name is not unique in the case
sources:
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/refusal
examples:
  - Given a hypothesis named bloqueio-financeiro whose collected concept is refused, when the case is validated, then the position reaches that hypothesis by that name and then the collected concept by its name.
  - Given two hypotheses of one case both named onu-offline, when the uniqueness rule refuses, then the position falls to the ordinal, because the name does not tell them apart.
  - Given a case that declares no hypothesis at all, when it is validated, then the position is the hypothesis list itself, which is nameable while it is empty.
---

## What it is

Citations in this system are by name and never by identifier, and a position is read by a person who is about to put a cursor somewhere.
The one case where a name does not identify a hypothesis is the one the uniqueness rule refuses, so the ordinal is the fallback of exactly that case and of no other.

## Rules

Two hypotheses of the same case never share a name.
The same rule refusing at two positions produces two refusals.
