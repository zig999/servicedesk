---
title: The slug matches the file name
summary: A case's slug and the name of the file that holds it are the same name.
ddd: invariant
statement: A case's slug MUST equal the name of the file that holds it.
sources:
  - intake/arquitetura-troubleshooting-v5.md
  - intake/decisoes-onze-perguntas-2026-08-07.md
constrains:
  - definition/knowledge/draft-case
examples:
  - Given a case whose slug is cliente-sem-internet held by a file named of another case, when it is validated, then publication is refused.
gaps:
  - field: examples.refusal-text
    why: The decision states the text a refusal carries for the eight checks the current plan builds, and this check is not among them, so the sentence this rule declares for the curator is not stated.
---

## What it is

The slug is how everything else names a case — an investigation pins it, and the index of published versions is kept by it — and the file is where a curator finds the case.
Two names for one case is one name too many, and the check exists so the second never drifts from the first.

## Rules

A case is one file.
The text a refusal of this rule carries is the text this rule declares.
What the curator reads is written in Portuguese.
